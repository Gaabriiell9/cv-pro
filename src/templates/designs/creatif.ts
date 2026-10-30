import { defineTemplate } from "../kit";

// Famille « créatif » : formes, frise, contrastes. La structure HTML reste la même
// que les autres designs, donc la lecture par les logiciels de recrutement aussi.

const TIMELINE = ["experience", "education", "custom"]
  .map((t) => `.cv-atelier .sec-${t} .item`)
  .join(", ");

export const atelier = defineTemplate({
  id: "atelier",
  name: "Atelier",
  family: "creatif",
  free: false,
  atsOptimized: false,
  tagline: "Un grand nom en couleur et un parcours en frise.",
  description:
    "Atelier affiche votre nom en très grand et présente expériences et formations sous forme de frise, avec un repère à chaque étape. Les compétences deviennent des étiquettes. Pour les profils créatifs qui veulent un CV qui leur ressemble.",
  layout: "single",
  skills: "tags",
  css: `
.cv-atelier .name { font-size: 3.2em; line-height: 0.95; color: var(--accent); }
.cv-atelier .job { color: var(--ink); margin-top: 2.4mm; }
.cv-atelier .sec-title { text-transform: none; letter-spacing: 0; font-size: 1.15em; color: var(--ink); }
.cv-atelier .sec-title::before { content: ""; display: inline-block; width: 2.4mm; height: 2.4mm; margin-right: 2.2mm; border-radius: 0.6mm; background: var(--accent); vertical-align: 0.3mm; }
${TIMELINE} { margin: 0; padding: 0 0 calc(3mm * var(--d)) 7mm; background: radial-gradient(circle at 1.4mm 2.1mm, var(--accent) 0 1.4mm, transparent 1.5mm) no-repeat, linear-gradient(var(--line), var(--line)) 1.2mm 0 / 0.4mm 100% no-repeat; }
.cv-atelier .item-head { flex-direction: column-reverse; align-items: flex-start; gap: 0.4mm; }
.cv-atelier .item-period { color: var(--accent); font-weight: 600; font-size: 0.86em; }
`,
});

export const pastel = defineTemplate({
  id: "pastel",
  name: "Pastel",
  family: "creatif",
  free: false,
  atsOptimized: false,
  tagline: "Des encadrés arrondis aux couleurs douces.",
  description:
    "Pastel réunit votre en-tête et votre colonne de compétences dans des encadrés arrondis aux teintes douces. Le parcours reste à gauche, simple et lisible. Un style accueillant pour l'animation, la petite enfance, le bien-être ou la communication.",
  layout: "side-right",
  skills: "tags",
  css: `
.cv-pastel { --side-w: 62mm; }
.cv-pastel .head { background: color-mix(in srgb, var(--accent) 14%, white); border-radius: 5mm; padding: 7mm 8mm; }
.cv-pastel .side { background: var(--tint); border-radius: 5mm; padding: 6mm; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.cv-pastel .sec-title { text-transform: none; letter-spacing: 0; font-size: 1.05em; }
.cv-pastel.S-tags ul.skills li, .cv-pastel.S-tags ul.interests li { background: #fff; }
`,
});

export const geo = defineTemplate({
  id: "geo",
  name: "Géo",
  family: "creatif",
  free: false,
  atsOptimized: false,
  tagline: "Des triangles en coin et des losanges : graphique et précis.",
  description:
    "Géo joue avec les formes : deux triangles superposés dans le coin de la page, des losanges devant chaque titre et des niveaux visuels pour les compétences. Un CV graphique et structuré, pour le design, l'architecture, l'ingénierie ou le numérique.",
  layout: "side-left",
  skills: "bars",
  css: `
html { background: linear-gradient(225deg, var(--accent) 0 26mm, transparent 26mm) right top / 70mm 70mm no-repeat, linear-gradient(225deg, color-mix(in srgb, var(--accent) 22%, white) 0 42mm, transparent 42mm) right top / 70mm 70mm no-repeat, #fff; }
.cv-geo { --side-w: 56mm; }
.cv-geo .head { padding-right: 26mm; }
.cv-geo .name { text-transform: uppercase; letter-spacing: 0.02em; font-size: 2.2em; }
.cv-geo .sec-title::before { content: ""; display: inline-block; width: 2.2mm; height: 2.2mm; margin-right: 2.6mm; background: var(--accent); transform: rotate(45deg); vertical-align: 0.4mm; }
.cv-geo .side { border-right: 0.3mm solid var(--line); padding-right: 6mm; }
`,
});

export const contraste = defineTemplate({
  id: "contraste",
  name: "Contraste",
  family: "creatif",
  free: false,
  atsOptimized: false,
  tagline: "Un en-tête noir profond et des titres en étiquettes de couleur.",
  description:
    "Contraste ouvre sur un bandeau presque noir où votre nom ressort en blanc, puis organise le contenu en deux colonnes avec des titres en étiquettes de couleur. Un CV percutant, qui reste parfaitement lisible à l'impression.",
  layout: "side-right",
  skills: "bars",
  css: `
.cv-contraste .head { margin: calc(-1 * var(--pad-y)) calc(-1 * var(--pad-x)) 0; padding: 13mm var(--pad-x) 11mm; background: #1d1d1b; color: #fff; }
.cv-contraste .name { color: #fff; font-size: 2.6em; }
.cv-contraste .job { color: color-mix(in srgb, var(--accent) 40%, white); }
.cv-contraste .contact { color: rgba(255, 255, 255, 0.78); }
.cv-contraste .contact .sep { color: rgba(255, 255, 255, 0.35); }
.cv-contraste .photo { box-shadow: 0 0 0 1mm rgba(255, 255, 255, 0.9); }
.cv-contraste .cols { margin-top: calc(8mm * var(--d)); }
.cv-contraste .sec-title span { display: inline-block; padding: 0.8mm 2.6mm; border-radius: 0.8mm; background: var(--accent); color: #fff; }
`,
});
