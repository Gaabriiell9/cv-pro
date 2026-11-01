import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, hashedKey, rateLimit } from "@/lib/rate-limit";
import { normalizeEmail, normalizeName, verifyLoginCode } from "./codes";

const credentialsSchema = z.object({
  email: z.email().max(254),
  code: z.string().regex(/^\d{6}$/),
});

/** Google n'est proposé que si ses identifiants sont réglés dans Vercel. */
export const GOOGLE_ENABLED = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 3600 },
  pages: { signIn: "/connexion", error: "/connexion" },
  providers: [
    CredentialsProvider({
      id: "code",
      name: "Code par e-mail",
      credentials: { email: { type: "email" }, code: { type: "text" } },
      async authorize(raw, req) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) throw new Error("invalide");
        const email = normalizeEmail(parsed.data.email);

        const headers = new Headers((req?.headers ?? {}) as Record<string, string>);
        // Par visiteur, puis par adresse visée : une attaque répartie sur de
        // nombreuses IP reste plafonnée à 10 essais par heure et 30 par jour.
        const checks = [
          { key: hashedKey("code-verif", clientIp(headers)), limit: 15, window: 600 },
          { key: hashedKey("code-verif-h", email), limit: 10, window: 3_600 },
          { key: hashedKey("code-verif-j", email), limit: 30, window: 86_400 },
        ];
        for (const c of checks) {
          if (!(await rateLimit(c.key, c.limit, c.window)).ok) throw new Error("limite");
        }

        const result = await verifyLoginCode(email, parsed.data.code);
        if (!result.ok) throw new Error(result.reason);

        if (result.purpose === "inscription") {
          // Création du compte avec le nom saisi. Si l'adresse a été inscrite entre
          // temps (autre onglet, Google), on connecte simplement le compte existant.
          const user = await prisma.user.upsert({
            where: { email },
            create: { email, name: result.name, emailVerifiedAt: new Date() },
            update: {},
            select: { id: true, email: true, name: true },
          });
          return { id: user.id, email: user.email, name: user.name };
        }

        const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });
        if (!user) throw new Error("invalide");
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    ...(GOOGLE_ENABLED
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // PKCE et état : protègent l'échange contre l'interception et le CSRF.
            checks: ["pkce", "state"],
            authorization: { params: { prompt: "select_account", scope: "openid email profile" } },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // Seule une adresse vérifiée par Google peut ouvrir (ou rejoindre) un compte.
        const p = profile as { email?: string; email_verified?: boolean } | undefined;
        return Boolean(p?.email && p.email_verified === true);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        // Compte unique par adresse : Google et code e-mail mènent au même compte.
        const email = normalizeEmail(user.email);
        const googleName = user.name ? normalizeName(user.name) : null;
        const dbUser = await prisma.user.upsert({
          where: { email },
          create: { email, name: googleName, emailVerifiedAt: new Date() },
          update: {},
          select: { id: true, name: true },
        });
        if (!dbUser.name && googleName) {
          await prisma.user.update({ where: { id: dbUser.id }, data: { name: googleName } });
        }
        token.uid = dbUser.id;
        token.email = email;
        token.name = dbUser.name ?? googleName;
        delete token.picture; // aucune photo Google conservée
      } else if (user) {
        token.uid = user.id;
        token.name = user.name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.uid === "string") {
        session.user.id = token.uid;
        session.user.name = typeof token.name === "string" ? token.name : null;
      }
      return session;
    },
  },
};
