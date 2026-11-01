// Messages d'erreur de connexion, partagés entre le serveur et le navigateur.
export const AUTH_MESSAGES: Record<string, string> = {
  invalide: "Code incorrect. Vérifiez-le ou demandez-en un nouveau.",
  expire: "Ce code a expiré. Demandez-en un nouveau.",
  essais: "Trop d'essais pour ce code. Demandez-en un nouveau.",
  limite: "Trop de tentatives. Patientez quelques minutes.",
};

export function authMessage(code: string | null | undefined): string {
  return (code && AUTH_MESSAGES[code]) || "La connexion a échoué. Réessayez.";
}

/** Message lisible pour un échec de connexion Google (paramètre ?error de NextAuth). */
export function oauthMessage(error: string | null | undefined): string | null {
  if (!error) return null;
  if (error === "AccessDenied") return "Connexion Google refusée : l'adresse de ce compte Google n'est pas vérifiée.";
  if (["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "Callback", "OAuthAccountNotLinked"].includes(error)) {
    return "La connexion avec Google n'a pas abouti. Réessayez ou utilisez votre e-mail.";
  }
  return null;
}

/**
 * Adresse de retour après connexion : uniquement un chemin du site.
 * On résout l'URL comme le ferait le navigateur (qui supprime tabulations et
 * retours à la ligne, et lit « /\\ » comme « // ») puis on exige la même origine.
 */
export function safeNext(value: string | null | undefined, fallback = "/compte"): string {
  if (!value || value.length > 512 || !value.startsWith("/")) return fallback;
  const base = "https://cv-pro.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    // « /.//site.fr » se résout en « //site.fr » : à refuser aussi.
    if (url.pathname.startsWith("//") || url.pathname.startsWith("/\\")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
