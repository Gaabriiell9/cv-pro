import { currentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectForeignRequest } from "@/lib/security/request";

// Suppression complète du compte : CV et droits partent avec lui (onDelete: Cascade).
export async function DELETE(request: Request) {
  const refused = rejectForeignRequest(request);
  if (refused) return refused;
  const user = await currentUser();
  if (!user) return Response.json({ error: "Non connecté." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { confirmation?: string } | null;
  if (body?.confirmation?.trim().toLowerCase() !== user.email.toLowerCase()) {
    return Response.json({ error: "Saisissez votre adresse e-mail pour confirmer." }, { status: 400 });
  }

  // Les photos du stockage seront supprimées ici quand l'enregistrement en ligne des CV existera.
  await prisma.$transaction([
    prisma.emailCode.deleteMany({ where: { email: user.email } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
