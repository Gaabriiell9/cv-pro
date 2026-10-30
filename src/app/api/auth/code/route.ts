import { z } from "zod";
import { createLoginCode, normalizeEmail } from "@/lib/auth/codes";
import { sendLoginCode } from "@/lib/email";
import { clientKey, hashedKey, rateLimit } from "@/lib/rate-limit";

// Demande d'un code de connexion. La réponse est la même que l'adresse ait déjà
// un compte ou non : on ne révèle pas qui est inscrit.

const bodySchema = z.object({ email: z.email().max(254) });

function json(status: number, body: Record<string, unknown>, headers?: HeadersInit) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(400, { error: "Adresse e-mail invalide." });
  const email = normalizeEmail(parsed.data.email);

  // Limites : par visiteur, par adresse, et un plafond global qui protège le quota
  // d'envoi quotidien de Resend (100 e-mails par jour).
  const checks = [
    { key: clientKey(request, "code-ip"), limit: 6, window: 600 },
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

  const code = await createLoginCode(email);
  const sent = await sendLoginCode(email, code);
  if (!sent) return json(502, { error: "L'e-mail n'a pas pu être envoyé. Réessayez dans un instant." });
  return json(200, { ok: true });
}
