import "server-only";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, hashedKey, rateLimit } from "@/lib/rate-limit";
import { normalizeEmail, verifyLoginCode } from "./codes";

const credentialsSchema = z.object({
  email: z.email().max(254),
  code: z.string().regex(/^\d{6}$/),
});

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

        // Le compte est créé à la première connexion réussie.
        const user = await prisma.user.upsert({
          where: { email },
          create: { email, emailVerifiedAt: new Date() },
          update: {},
          select: { id: true, email: true },
        });
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
};
