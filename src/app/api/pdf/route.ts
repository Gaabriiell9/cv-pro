import { generateResumePdf } from "@/lib/pdf/generate";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { rejectForeignRequest } from "@/lib/security/request";
import { renderRequestSchema } from "@/lib/resume/schema";
import { getTemplate } from "@/templates";

// Génère le PDF d'un CV. Ne stocke rien : le contenu arrive, le PDF repart.
export const maxDuration = 30;

const MAX_BODY_BYTES = 1_200_000; // photo comprise
const LIMIT = 20; // PDF par fenêtre et par visiteur
const WINDOW_SECONDS = 600;

function error(status: number, message: string, headers?: HeadersInit) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function fileName(first: string, last: string): string {
  const base = ["CV", first, last]
    .filter(Boolean)
    .join("-")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "CV"}.pdf`;
}

// Test de bout en bout sur les prévisualisations Vercel uniquement (CV fictif).
// Inexistant en production.
export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== "preview") return error(404, "Introuvable.");
  const id = new URL(request.url).searchParams.get("modele") ?? "classique";
  const { SAMPLE_RESUME } = await import("@/lib/resume/sample");
  const { DEFAULT_THEME } = await import("@/lib/resume/schema");
  const template = getTemplate(id);
  if (!template) return error(404, "Design introuvable.");
  const started = Date.now();
  const pdf = await generateResumePdf(template, {
    templateId: template.id,
    cvLocale: "fr",
    theme: DEFAULT_THEME,
    content: SAMPLE_RESUME,
  });
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
      "X-Generation-Ms": String(Date.now() - started),
    },
  });
}

export async function POST(request: Request) {
  const refused = rejectForeignRequest(request);
  if (refused) return refused;
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return error(413, "Le CV est trop volumineux (photo trop lourde ?).");

  const limited = await rateLimit(clientKey(request, "pdf"), LIMIT, WINDOW_SECONDS);
  if (!limited.ok) {
    return error(429, "Trop de téléchargements en peu de temps. Réessayez dans quelques minutes.", {
      "Retry-After": String(limited.retryAfter),
    });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return error(413, "Le CV est trop volumineux (photo trop lourde ?).");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return error(400, "Requête invalide.");
  }
  const parsed = renderRequestSchema.safeParse(json);
  if (!parsed.success) return error(400, parsed.error.issues[0]?.message ?? "Requête invalide.");

  const template = getTemplate(parsed.data.templateId);
  if (!template) return error(404, "Design introuvable.");
  // Les designs payants seront débloqués par un pass (étape paiement).
  if (!template.free) return error(402, "Ce design fait partie de l'offre payante.");

  try {
    const pdf = await generateResumePdf(template, parsed.data);
    const name = fileName(parsed.data.content.basics.firstName, parsed.data.content.basics.lastName);
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[pdf] échec de génération", e);
    return error(500, "La génération du PDF a échoué. Réessayez dans un instant.");
  }
}
