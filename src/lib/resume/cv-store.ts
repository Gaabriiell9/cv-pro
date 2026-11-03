import "server-only";
import { z } from "zod";
import { PAID_ENABLED } from "@/lib/site";
import { cvLocaleSchema, photoDataUrlSchema, resumeContentSchema, SCHEMA_VERSION, themeSchema } from "@/lib/resume/schema";
import { getTemplate } from "@/templates";

// Outils communs aux routes /api/cv et /api/cv/[id] (CV de la personne connectée).

export const MAX_BODY_BYTES = 1_200_000; // photo comprise

/** Nombre de CV par compte. Tant que tout est gratuit : 10. Plan payant : 2 sans Pass. */
export const MAX_CVS = PAID_ENABLED ? 2 : 10;

export const saveSchema = z.object({
  templateId: z.string().min(1).max(40),
  cvLocale: cvLocaleSchema,
  theme: themeSchema,
  content: resumeContentSchema,
  photo: photoDataUrlSchema.nullable(),
});
export type SaveBody = z.infer<typeof saveSchema>;

/** Champs renvoyés au navigateur pour un CV. */
export const cvSelect = {
  id: true,
  templateId: true,
  cvLocale: true,
  theme: true,
  content: true,
  photo: true,
  updatedAt: true,
} as const;

export function json(status: number, body: unknown) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Lit et valide le corps d'un enregistrement. Renvoie une réponse d'erreur ou les données. */
export async function readSaveBody(request: Request): Promise<Response | SaveBody> {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return json(413, { error: "CV trop volumineux." });
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: "CV trop volumineux." });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "Requête invalide." });
  }
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return json(400, { error: parsed.error.issues[0]?.message ?? "Requête invalide." });
  if (!getTemplate(parsed.data.templateId)) return json(400, { error: "Design inconnu." });
  return parsed.data;
}

/** Titre interne d'un CV (non affiché sur le CV lui-même). */
export function cvTitle(content: SaveBody["content"]): string {
  const b = content.basics;
  return (b.jobTitle || ["CV", b.firstName, b.lastName].filter(Boolean).join(" ")).slice(0, 120);
}

/** Champs enregistrés à chaque modification (le titre n'est fixé qu'à la création). */
export function toFields(body: SaveBody) {
  return {
    templateId: body.templateId,
    cvLocale: body.cvLocale,
    theme: body.theme,
    content: body.content,
    photo: body.photo,
    schemaVersion: SCHEMA_VERSION,
  };
}

export function toData(body: SaveBody) {
  return { ...toFields(body), title: cvTitle(body.content) };
}

/** Identifiant de CV venu de l'URL : forme d'un cuid, rien d'autre. */
export const cvIdSchema = z.string().regex(/^[a-z0-9]{20,32}$/);
