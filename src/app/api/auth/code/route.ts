import { z } from "zod";
import { createLoginCode, normalizeEmail, normalizeName } from "@/lib/auth/codes";
import { sendLoginCode } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { clientKey, hashedKey, rateLimit } from "@/lib/rate-limit";
import { rejectForeignRequest } from "@/lib/security/request";

// Demande d'un code : « connexion » pour un compte existant, « inscription » pour
// une nouvelle adresse (avec le nom complet). Les limites de débit passent AVANT
// la vérification de l'existence du compte, ce qui freine l'énumération.

const bodySchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("connexion"), email: z.email().max(254) }),
  z.object({ mode: z.literal("inscription"), email: z.email().max(254), name: z.string().max(200) }),
]);

function json(status: number, body: Record<string, unknown>, headers?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request) {
  const refused = rejectForeignRequest(request);
  if (refused) return refused;
  if (Number(request.headers.get("content-length") ?? 0) > 2_000) return json(413, { error: "Requête trop volumineuse." });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(400, { error: "Adresse e-mail invalide." });
  const email = normalizeEmail(parsed.data.email);
  const name = parsed.data.mode === "inscription" ? normalizeName(parsed.data.name) : null;
  if (parsed.data.mode === "inscription" && (!name || name.length < 2)) {
    return json(400, { error: "Indiquez votre nom complet." });
  }

  // Limites : par visiteur, par adresse, et un plafond global qui protège le quota
  // d'envoi quotidien de Resend (100 e-mails par jour).
  const checks = [
    { key: clientKey(request, "code-ip"), limit: 6, window: 600 },
    { key: clientKey(request, "code-ip-jour"), limit: 20, window: 86_400 },
    { key: hashedKey("code-email", email), limit: 3, window: 900 },
    { key: "code-global", limit: 90, window: 86_400 },
  ];
  for (const c of checks) {
    const r = await rateLimit(c.key, c.limit, c.window);
    if (!r.ok) {
      const global = c.key === "code-global";
      return json(
        429,
        { error: global ? "Le service d'envoi est très demandé aujourd'hui. Réessayez dans quelques heures." : "Trop de demandes. Patientez quelques minutes avant de redemander un code." },
        { "Retry-After": String(r.retryAfter) },
      );
    }
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (parsed.data.mode === "connexion" && !existing) {
    return json(404, { error: "Aucun compte n'utilise cette adresse.", code: "inconnu" });
  }
  if (parsed.data.mode === "inscription" && existing) {
    return json(409, { error: "Un compte existe déjà avec cette adresse.", code: "existe" });
  }

  const code = await createLoginCode(email, { purpose: parsed.data.mode, name });
  const sent = await sendLoginCode(email, code, { name });
  if (!sent) return json(502, { error: "L'e-mail n'a pas pu être envoyé. Réessayez dans un instant." });
  return json(200, { ok: true });
}
