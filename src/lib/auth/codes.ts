import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

// Codes de connexion à 6 chiffres : valables 15 minutes, 5 essais, usage unique,
// stockés hachés (HMAC avec le secret de l'application, lié à l'adresse).

export const CODE_TTL_MINUTES = 15;
export const MAX_ATTEMPTS = 5;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET manquant");
  return s;
}

export function hashCode(email: string, code: string): string {
  return createHmac("sha256", secret()).update(`${email}:${code}`).digest("hex");
}

/** Crée un nouveau code et invalide les précédents non utilisés. */
export async function createLoginCode(email: string): Promise<string> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await prisma.$transaction([
    prisma.emailCode.deleteMany({ where: { email, usedAt: null } }),
    prisma.emailCode.create({
      data: { email, codeHash: hashCode(email, code), expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60_000) },
    }),
  ]);
  // Ménage occasionnel des vieux codes.
  if (Math.random() < 0.05) {
    await prisma.emailCode.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3_600_000) } } }).catch(() => {});
  }
  return code;
}

export type VerifyResult = { ok: true } | { ok: false; reason: "invalide" | "expire" | "essais" };

/** Vérifie le dernier code envoyé à cette adresse et le consomme s'il est bon. */
export async function verifyLoginCode(email: string, code: string): Promise<VerifyResult> {
  const row = await prisma.emailCode.findFirst({
    where: { email, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return { ok: false, reason: "invalide" };
  if (row.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expire" };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "essais" };

  const expected = Buffer.from(row.codeHash, "hex");
  const given = Buffer.from(hashCode(email, code), "hex");
  const match = expected.length === given.length && timingSafeEqual(expected, given);
  if (!match) {
    const updated = await prisma.emailCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: updated.attempts >= MAX_ATTEMPTS ? "essais" : "invalide" };
  }
  // Consommation atomique : si deux requêtes arrivent en même temps, une seule passe.
  const consumed = await prisma.emailCode.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  return consumed.count === 1 ? { ok: true } : { ok: false, reason: "invalide" };
}
