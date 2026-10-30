import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

// Limitation de débit à fenêtre fixe, stockée dans Postgres (table RateLimit).
// L'adresse IP n'est jamais stockée en clair : seule une empreinte est conservée.

/** Clé de limitation pour une valeur sensible (IP, e-mail) : seule une empreinte est gardée. */
export function hashedKey(scope: string, value: string): string {
  const salt = process.env.NEXTAUTH_SECRET ?? "cv-pro";
  const digest = createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
  return `${scope}:${digest}`;
}

/** Adresse IP du visiteur, à partir des en-têtes posés par Vercel. */
export function clientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0]?.trim() || headers.get("x-real-ip") || "inconnue";
}

export function clientKey(request: Request, scope: string): string {
  return hashedKey(scope, clientIp(request.headers));
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; retryAfter: number }> {
  const rows = await prisma.$queryRaw<{ count: number; windowStart: Date }[]>`
    INSERT INTO "RateLimit" ("key", "windowStart", "count")
    VALUES (${key}, now(), 1)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}) THEN now() ELSE "RateLimit"."windowStart" END
    RETURNING "count", "windowStart"`;

  // Ménage occasionnel des anciennes fenêtres.
  if (Math.random() < 0.01) {
    await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "windowStart" < now() - interval '1 day'`.catch(() => {});
  }

  const row = rows[0];
  const elapsed = (Date.now() - new Date(row.windowStart).getTime()) / 1000;
  return { ok: row.count <= limit, retryAfter: Math.max(1, Math.ceil(windowSeconds - elapsed)) };
}
