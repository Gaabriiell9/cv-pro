import { cssColor, html } from "./html";
import type { RenderRequest } from "./schema";
import type { TemplateDef } from "@/templates/types";

// Polices disponibles dans les CV : libres (OFL), servies par nous, en fichiers
// STATIQUES par graisse (public/fonts/cv). Les polices variables seraient intégrées
// au PDF en « Type 3 », mal lu par certains logiciels de recrutement.
const STYLES = [
  { suffix: "400-normal", weight: 400, style: "normal" },
  { suffix: "400-italic", weight: 400, style: "italic" },
  { suffix: "600-normal", weight: 600, style: "normal" },
  { suffix: "700-normal", weight: 700, style: "normal" },
] as const;

export const CV_FONTS = {
  instrument: { family: "CV Instrument", slug: "instrument-sans" },
  fraunces: { family: "CV Fraunces", slug: "fraunces" },
} as const;

// Liste des fichiers de police (chemins relatifs à public/fonts/cv).
export const CV_FONT_FILES = Object.values(CV_FONTS).flatMap((f) =>
  STYLES.map((s) => `${f.slug}-latin-${s.suffix}.woff2`),
);

// `src` d'une police : URL publique (aperçu) ou data URL (PDF, sans réseau).
export type FontSource = (file: string) => string;

export function fontFaceCss(source: FontSource): string {
  return Object.values(CV_FONTS)
    .flatMap((f) =>
      STYLES.map(
        (s) =>
          `@font-face{font-family:"${f.family}";src:url("${source(`${f.slug}-latin-${s.suffix}.woff2`)}") format("woff2");font-weight:${s.weight};font-style:${s.style};font-display:block}`,
      ),
    )
    .join("\n");
}

const DENSITY = { compact: { d: 0.75, size: "9.4pt" }, normal: { d: 1, size: "10pt" }, aere: { d: 1.25, size: "10.5pt" } };

// CSS commun : format A4, marge d'impression NULLE. Chaque design gère ses marges
// intérieures avec `box-decoration-break: clone`, ce qui les répète en haut et en bas
// de chaque page, et permet des fonds pleine page (colonne colorée, bandeau) répétés
// sur toutes les pages via le fond de <html> (vérifié avec Chromium).
const BASE_CSS = `
@page { size: A4; margin: 0; }
*, *::before, *::after { box-sizing: border-box; }
html { background: var(--page-bg, #fff); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; color: var(--ink); font-family: var(--font-body), Arial, sans-serif; font-size: var(--size); line-height: 1.42; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
@media screen { body { width: 210mm; min-height: 297mm; margin: 0 auto; } }
h1, h2, h3, p, ul { margin: 0; }
img { display: block; }
`;

export function renderResumeDocument(template: TemplateDef, req: RenderRequest, fonts: FontSource): string {
  const density = DENSITY[req.theme.density];
  const font = CV_FONTS[req.theme.font];
  const vars = `:root{--accent:${cssColor(req.theme.accent)};--ink:#1d1d1b;--muted:#55534d;--line:#cfcac0;--d:${density.d};--size:${density.size};--font-body:"${font.family}";--font-title:"${font.family}"}`;
  const body = template.body({
    content: req.content,
    theme: req.theme,
    locale: req.cvLocale,
    photo: req.photo,
  });
  const lang = req.cvLocale === "pt" ? "pt-BR" : req.cvLocale;
  const title = [req.content.basics.firstName, req.content.basics.lastName].filter(Boolean).join(" ") || "CV";
  // Le CSS ne contient aucune donnée saisie (couleur validée), il n'est donc pas échappé.
  const style = `${fontFaceCss(fonts)}\n${vars}\n${BASE_CSS}\n${template.css}`.replace(/<\//g, "<\\/");
  // Défense en profondeur : le document du CV ne peut rien charger d'externe ni
  // exécuter de script, dans l'aperçu comme dans le générateur de PDF.
  const csp = "default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data: 'self'";
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}">${html`<title>${title}</title>`}<style>${style}</style></head><body>${body}</body></html>`;
}
