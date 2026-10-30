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

/** Adresse de retour après connexion : uniquement un chemin interne. */
export function safeNext(value: string | null | undefined, fallback = "/compte"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
