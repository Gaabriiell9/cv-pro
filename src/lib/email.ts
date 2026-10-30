import "server-only";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/resume/html";
import { SITE_URL } from "@/lib/site";

// Envoi d'e-mails via Resend (domaine cv-pro.gf-web.fr, région UE).
// Le SDK ne lève pas d'exception : on vérifie toujours `error`.

const FROM = process.env.EMAIL_FROM ?? "CV Pro <connexion@cv-pro.gf-web.fr>";

export async function sendLoginCode(to: string, code: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // En développement uniquement : le code s'affiche dans le terminal.
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] code de connexion pour ${to} : ${code}`);
      return true;
    }
    console.error("[email] RESEND_API_KEY manquante");
    return false;
  }

  const safeCode = escapeHtml(code);
  const text = [
    `Votre code de connexion CV Pro : ${code}`,
    "",
    "Il est valable 15 minutes et ne peut servir qu'une fois.",
    "Si vous n'avez pas demandé ce code, ignorez simplement cet e-mail : personne ne pourra se connecter sans lui.",
    "",
    `CV Pro, un service GF Web : ${SITE_URL}`,
  ].join("\n");

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f7f4ee;font-family:Arial,Helvetica,sans-serif;color:#1c1b19">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td>
<img src="${SITE_URL}/logo-email.png" width="48" height="48" alt="CV Pro" style="display:block;border-radius:12px">
<h1 style="font-size:22px;margin:24px 0 8px">Votre code de connexion</h1>
<p style="font-size:15px;line-height:1.5;color:#5b5850;margin:0 0 24px">Saisissez ce code sur CV Pro pour vous connecter.</p>
<p style="font-size:34px;letter-spacing:8px;font-weight:bold;font-family:'Courier New',monospace;background:#f7f4ee;border-radius:12px;padding:16px;text-align:center;margin:0 0 24px">${safeCode}</p>
<p style="font-size:13px;line-height:1.5;color:#5b5850;margin:0">Il est valable 15 minutes et ne peut servir qu'une fois. Si vous n'avez pas demandé ce code, ignorez cet e-mail : personne ne pourra se connecter sans lui.</p>
</td></tr></table>
<p style="font-size:12px;color:#5b5850;margin:16px 0 0">CV Pro, un service GF Web</p>
</td></tr></table></body></html>`;

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `${code} est votre code de connexion CV Pro`,
    text,
    html,
  });
  if (error) {
    console.error("[email] échec Resend", error.name, error.message);
    return false;
  }
  return true;
}
