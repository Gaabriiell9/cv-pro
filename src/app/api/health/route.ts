import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

// Vérifie que l'application joint la base. Ne renvoie aucun détail technique.
export async function GET() {
  await connection();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[health] base injoignable", error);
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
