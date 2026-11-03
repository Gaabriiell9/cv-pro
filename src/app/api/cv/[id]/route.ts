import { currentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { cvIdSchema, cvSelect, json, readSaveBody, toFields } from "@/lib/resume/cv-store";
import { rejectForeignRequest } from "@/lib/security/request";

// Un CV précis de la personne connectée : lecture, enregistrement, suppression.
// Toujours filtré par propriétaire : l'identifiant d'un autre compte donne 404.

type Ctx = { params: Promise<{ id: string }> };

async function cvId(ctx: Ctx): Promise<string | null> {
  const { id } = await ctx.params;
  const parsed = cvIdSchema.safeParse(id);
  return parsed.success ? parsed.data : null;
}

export async function GET(_request: Request, ctx: Ctx) {
  const user = await currentUser();
  if (!user) return json(401, { error: "Non connecté." });
  const id = await cvId(ctx);
  if (!id) return json(404, { error: "CV introuvable." });
  const cv = await prisma.resume.findFirst({ where: { id, userId: user.id }, select: cvSelect });
  if (!cv) return json(404, { error: "CV introuvable." });
  return json(200, { cv });
}

export async function PUT(request: Request, ctx: Ctx) {
  const refused = rejectForeignRequest(request);
  if (refused) return refused;
  const user = await currentUser();
  if (!user) return json(401, { error: "Non connecté." });
  const id = await cvId(ctx);
  if (!id) return json(404, { error: "CV introuvable." });

  // Enregistrement automatique : large, mais borné (un enregistrement par seconde en moyenne).
  if (!(await rateLimit(`cv-save:${user.id}`, 600, 600)).ok) return json(429, { error: "Trop d'enregistrements, patientez un instant." });

  const body = await readSaveBody(request);
  if (body instanceof Response) return body;
  const res = await prisma.resume.updateMany({ where: { id, userId: user.id }, data: toFields(body) });
  if (res.count === 0) return json(404, { error: "CV introuvable." });
  return json(200, { ok: true });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const refused = rejectForeignRequest(request);
  if (refused) return refused;
  const user = await currentUser();
  if (!user) return json(401, { error: "Non connecté." });
  const id = await cvId(ctx);
  if (!id) return json(404, { error: "CV introuvable." });
  const res = await prisma.resume.deleteMany({ where: { id, userId: user.id } });
  if (res.count === 0) return json(404, { error: "CV introuvable." });
  return json(200, { ok: true });
}
