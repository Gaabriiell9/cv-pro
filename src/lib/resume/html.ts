// Petit moteur de gabarits HTML sans dépendance, utilisable côté navigateur (aperçu)
// et côté serveur (PDF). Toute valeur interpolée est échappée, sauf si elle provient
// elle-même de `html` (type SafeHtml) : impossible d'injecter du HTML via un CV.

export class SafeHtml {
  constructor(readonly value: string) {}
  toString() {
    return this.value;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Value = SafeHtml | string | number | null | undefined | false | Value[];

function render(value: Value): string {
  if (value === null || value === undefined || value === false) return "";
  if (Array.isArray(value)) return value.map(render).join("");
  if (value instanceof SafeHtml) return value.value;
  return escapeHtml(String(value));
}

export function html(strings: TemplateStringsArray, ...values: Value[]): SafeHtml {
  let out = strings[0];
  values.forEach((v, i) => {
    out += render(v) + strings[i + 1];
  });
  return new SafeHtml(out);
}

// Texte multiligne : chaque ligne non vide devient un élément de liste si le texte
// en contient plusieurs, sinon un paragraphe.
export function paragraphs(text: string, className = "desc"): SafeHtml {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (lines.length === 0) return html``;
  if (lines.length === 1) return html`<p class="${className}">${lines[0]}</p>`;
  return html`<ul class="${className}">${lines.map((l) => html`<li>${l}</li>`)}</ul>`;
}

// Valeur CSS sûre pour une couleur déjà validée par Zod (#rrggbb).
export function cssColor(hex: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#1f4d3a";
}
