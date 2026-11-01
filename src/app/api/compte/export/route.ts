import { currentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

// Export RGPD : toutes les données du compte au format JSON.
export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Non connecté." }, { status: 401 });

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      name: true,
      emailVerifiedAt: true,
      locale: true,
      createdAt: true,
      resumes: {
        select: { title: true, cvLocale: true, templateId: true, theme: true, content: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: "asc" },
      },
      entitlements: {
        select: { kind: true, startsAt: true, endsAt: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const body = JSON.stringify({ exportéLe: new Date().toISOString(), compte: data }, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cv-pro-mes-donnees.json"',
      "Cache-Control": "no-store",
    },
  });
}
