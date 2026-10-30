import "server-only";

// Protection CSRF des routes qui modifient quelque chose ou coûtent cher (PDF,
// envoi d'e-mail, suppression) : la requête doit venir de notre propre site.
// Les navigateurs envoient toujours l'en-tête Origin sur un POST ou un DELETE ;
// un site tiers ne peut pas le falsifier.

function allowedOrigins(): string[] {
  const list = ["https://cv-pro.gf-web.fr"];
  if (process.env.VERCEL_URL) list.push(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_BRANCH_URL) list.push(`https://${process.env.VERCEL_BRANCH_URL}`);
  if (process.env.NEXTAUTH_URL) list.push(new URL(process.env.NEXTAUTH_URL).origin);
  if (process.env.NODE_ENV !== "production") list.push("http://localhost:3000");
  return list;
}

/** Renvoie une réponse d'erreur si la requête ne vient pas du site, sinon null. */
export function rejectForeignRequest(request: Request, { json = true }: { json?: boolean } = {}): Response | null {
  const origin = request.headers.get("origin");
  const own = new URL(request.url).origin;
  if (!origin || (origin !== own && !allowedOrigins().includes(origin))) {
    return Response.json({ error: "Requête refusée." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  // Un formulaire d'un autre site ne peut pas envoyer application/json sans
  // déclencher une vérification CORS préalable (qui échoue).
  if (json && !(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Format de requête invalide." }, { status: 415, headers: { "Cache-Control": "no-store" } });
  }
  return null;
}
