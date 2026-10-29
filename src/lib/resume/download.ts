import type { RenderRequest } from "./schema";

// Demande le PDF au serveur et déclenche le téléchargement. Renvoie un message
// d'erreur lisible, ou null si tout s'est bien passé.
export async function downloadResumePdf(request: RenderRequest): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch("/api/pdf", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    return "Connexion impossible. Vérifiez votre réseau et réessayez.";
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return data?.error ?? "La génération du PDF a échoué.";
  }
  const blob = await res.blob();
  const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "CV.pdf";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return null;
}
