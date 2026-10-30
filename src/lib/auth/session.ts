import "server-only";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "./options";

/** Utilisateur connecté, vérifié en base (un compte supprimé n'est plus reconnu). */
export async function currentUser(): Promise<{ id: string; email: string } | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
}
