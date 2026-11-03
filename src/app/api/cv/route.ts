import { z } from "zod";
import { currentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { cvIdSchema, cvSelect, json, MAX_CVS, readSaveBody, toData } from "@/lib/resume/cv-store";
import { rejectForeignRequest } from "@/lib/security/request";

// CV de la personne connectée (plusieurs par compte).
// GET : la liste, du plus récent au plus ancien.
// POST : un nouveau CV, à partir du contenu envoyé ({ cv }) ou d'une copie ({ copyOf }).
// PUT : ancien format (un seul CV par compte), gardé pour les onglets ouverts avant la
//       mise à jour : il ne modifie le CV que si le compte n'en a qu'un.
// Chaque requête est filtrée par propriétaire (userId).

export async function GET() {
  const user = await currentUser();
  if (!user) return json(401, { error: "Non connecté." });
  const cvs = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: MAX_CVS,
    select: cvSelect,
  });
  return json(200, { cvs });
}

const copySchema = z.object({ copyOf: cvIdSchema });

export async function POST(request: Request) {
  const refused = rejectForeignRequest(request);
  if (refused) return refused;
  const user = await currentUser();
  if (!user) return json(401, { error: "Non connecté." });
  if (!(await rateLimit(`cv-create:${user.id}`, 30, 3600)).ok) return json(429, { error: "Trop de CV créés d'un coup, patientez un peu." });

  const count = await prisma.resume.count({ where: { userId: user.id } });
  if (count >= MAX_CVS) return json(409, { error: `Vous avez déjà ${MAX_CVS} CV. Supprimez-en un pour en créer un nouveau.`, code: "limite" });

  // Copie d'un CV existant : lu en base, jamais depuis le navigateur.
  const copy = copySchema.safeParse(await request.clone().json().catch(() => null));
  if (copy.success) {
    const source = await prisma.resume.findFirst({
      where: { id: copy.data.copyOf, userId: user.id },
      select: { title: true, templateId: true, cvLocale: true, theme: true, content: true, photo: true, schemaVersion: true },
    });
    if (!source) return json(404, { error: "CV introuvable." });
    const created = await prisma.resume.create({
      data: { ...source, theme: source.theme ?? {}, content: source.content ?? {}, title: `${source.title} (copie)`.slice(0, 120), userId: user.id },
      select: cvSelect,
    });
    return json(201, { cv: created });
  }

  const body = await readSaveBody(request);
  if (body instanceof Response) return body;
  const created = await prisma.resume.create({ data: { ...toData(body), userId: user.id }, select: cvSelect });
  return json(201, { cv: created });
}

export async function PUT(request: Request) {
  const refused = rejectForeignRequest(request);
  if (refused) return refused;
  const user = await currentUser();
  if (!user) return json(401, { error: "Non connecté." });
  if (!(await rateLimit(`cv-save:${user.id}`, 600, 600)).ok) return json(429, { error: "Trop d'enregistrements, patientez un instant." });

  const body = await readSaveBody(request);
  if (body instanceof Response) return body;
  const existing = await prisma.resume.findMany({ where: { userId: user.id }, select: { id: true }, take: 2 });
  // Plusieurs CV : impossible de savoir lequel modifier, la page doit être rechargée.
  if (existing.length > 1) return json(409, { error: "Rechargez la page pour continuer.", code: "recharger" });
  const data = toData(body);
  const saved = existing[0]
    ? await prisma.resume.update({ where: { id: existing[0].id, userId: user.id }, data, select: { updatedAt: true } })
    : await prisma.resume.create({ data: { ...data, userId: user.id }, select: { updatedAt: true } });
  return json(200, { ok: true, updatedAt: saved.updatedAt });
}
