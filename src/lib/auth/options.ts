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
        const limited = await rateLimit(hashedKey("code-verif", clientIp(headers)), 15, 600);
        if (!limited.ok) throw new Error("limite");

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
