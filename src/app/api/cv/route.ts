import { z } from "zod";
import { currentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { cvLocaleSchema, photoDataUrlSchema, resumeContentSchema, SCHEMA_VERSION, themeSchema } from "@/lib/resume/schema";
import { rejectForeignRequest } from "@/lib/security/request";
import { getTemplate } from "@/templates";

// CV de la personne connectée : un seul CV par compte pour l'instant.
// Chaque requête est filtrée par propriétaire (userId).

const MAX_BODY_BYTES = 1_200_000; // photo comprise

const saveSchema = z.object({
  templateId: z.string().min(1).max(40),
  cvLocale: cvLocaleSchema,
  theme: themeSchema,
  content: resumeContentSchema,
  photo: photoDataUrlSchema.nullable(),
});

function json(status: number, body: unknown) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const user = await currentUser();
  if (!user) return json(401, { error: "Non connecté." });
  const cv = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { templateId: true, cvLocale: true, theme: true, content: true, photo: true, updatedAt: true },
  });
  return json(200, { cv });
}

export async function PUT(request: Request) {
  const refused = rejectForeignRequest(request);
  if (refused) return refused;
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return json(413, { error: "CV trop volumineux." });

  const user = await currentUser();
  if (!user) return json(401, { error: "Non connecté." });

  // Enregistrement automatique : large, mais borné (un enregistrement par seconde en moyenne).
  if (!(await rateLimit(`cv-save:${user.id}`, 600, 600)).ok) return json(429, { error: "Trop d'enregistrements, patientez un instant." });

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

  const { basics } = parsed.data.content;
  const title = ["CV", basics.firstName, basics.lastName].filter(Boolean).join(" ").slice(0, 120);
  const data = {
    title,
    templateId: parsed.data.templateId,
    cvLocale: parsed.data.cvLocale,
    theme: parsed.data.theme,
    content: parsed.data.content,
    photo: parsed.data.photo,
    schemaVersion: SCHEMA_VERSION,
  };

  const existing = await prisma.resume.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { id: true } });
  const saved = existing
    ? await prisma.resume.update({ where: { id: existing.id, userId: user.id }, data, select: { updatedAt: true } })
    : await prisma.resume.create({ data: { ...data, userId: user.id }, select: { updatedAt: true } });
  return json(200, { ok: true, updatedAt: saved.updatedAt });
}
