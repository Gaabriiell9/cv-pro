import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Pages réservées aux comptes. L'éditeur renvoie vers « Créer un compte » (la plupart
// des visiteurs n'en ont pas encore), Mon compte vers la connexion. L'adresse
// d'origine (avec ?modele=...) est gardée pour y revenir après.
export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // Même règle que NextAuth : cookie « __Secure- » dès que le site est en https
    // (toujours le cas en production sur Vercel).
    secureCookie: (process.env.NEXTAUTH_URL ?? "https://").startsWith("https://"),
  });
  if (!token) {
    const { pathname, search } = request.nextUrl;
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/editeur") ? "/inscription" : "/connexion";
    url.search = `?suite=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/compte/:path*", "/editeur/:path*", "/editeur"] };
