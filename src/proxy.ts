import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Pages réservées aux visiteurs connectés : redirection vers la connexion.
export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // Même règle que NextAuth : cookie « __Secure- » dès que le site est en https
    // (toujours le cas en production sur Vercel).
    secureCookie: (process.env.NEXTAUTH_URL ?? "https://").startsWith("https://"),
  });
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?suite=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/compte/:path*"] };
