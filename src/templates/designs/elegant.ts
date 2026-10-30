import { defineTemplate } from "../kit";

// Famille « élégant » : titres à empattements (Fraunces), rythme typographique.

export const serif = defineTemplate({
  id: "serif",
  name: "Serif",
  family: "elegant",
  free: true,
  atsOptimized: true,
  tagline: "Des titres à empattements et de l'italique : l'élégance éditoriale.",
  description:
    "Serif emprunte aux magazines leurs titres à empattements, leur italique et leurs filets fins. Le résultat est élégant et très lisible, sur une seule colonne. Un bon choix pour la communication, l'édition, la culture ou le conseil.",
  layout: "single",
  css: `
.cv-serif { --font-title: "CV Fraunces"; --pad-x: 19mm; }
.cv-serif .head { padding-bottom: calc(5mm * var(--d)); border-bottom: 0.2mm solid var(--ink); }
.cv-serif .name { font-weight: 400; font-size: 2.7em; }
.cv-serif .job { font-family: "CV Fraunces"; font-style: italic; font-weight: 400; color: var(--muted); font-size: 1.2em; }
.cv-serif .sec-title { text-transform: none; letter-spacing: 0; font-size: 1.2em; font-weight: 400; font-style: italic; }
.cv-serif .item-title { font-weight: 600; }
.cv-serif .item-sub { font-style: normal; }
`,
});

export const galerie = defineTemplate({
  id: "galerie",
  name: "Galerie",
  family: "elegant",
  free: false,
  atsOptimized: false,
  tagline: "Les titres dans la marge, le contenu aligné comme dans un catalogue.",
  description:
    "Galerie place chaque titre de section dans une marge à gauche, comme les légendes d'un catalogue d'exposition. Le contenu s'aligne sur une seule colonne à droite, ce qui donne un CV très structuré et facile à parcourir.",
  layout: "single",
  css: `
.cv-galerie { --font-title: "CV Fraunces"; }
.cv-galerie .head { display: grid; grid-template-columns: 36mm minmax(0, 1fr); column-gap: 7mm; align-items: center; }
.cv-galerie .head .photo { grid-column: 1; justify-self: end; }
.cv-galerie .head-text { grid-column: 2; }
.cv-galerie .name { font-weight: 600; font-size: 2.5em; }
.cv-galerie .sec { display: grid; grid-template-columns: 36mm minmax(0, 1fr); column-gap: 7mm; }
.cv-galerie .sec-title { grid-column: 1; grid-row: 1 / span 40; text-align: right; text-transform: none; letter-spacing: 0; font-size: 1.05em; font-weight: 600; padding-top: 0.2mm; margin: 0; }
.cv-galerie .sec > :not(.sec-title) { grid-column: 2; }
.cv-galerie .flow { padding-top: calc(5mm * var(--d)); border-top: 0.2mm solid var(--line); }
`,
});

export const ivoire = defineTemplate({
  id: "ivoire",
  name: "Ivoire",
  family: "elegant",
  free: false,
  atsOptimized: false,
  tagline: "Un papier ivoire, un en-tête centré, une touche de raffinement.",
  description:
    "Ivoire imprime votre CV sur un fond crème, avec un en-tête centré à empattements et des titres soulignés d'un trait de couleur. Une présentation raffinée, pensée pour le luxe, l'hôtellerie haut de gamme, l'art ou les métiers de la relation client.",
  layout: "single",
  css: `
html { background: #faf6ee; }
.cv-ivoire { --font-title: "CV Fraunces"; --pad-x: 20mm; }
.cv-ivoire .head { flex-direction: column; text-align: center; gap: 3mm; padding-bottom: calc(6mm * var(--d)); border-bottom: 0.3mm solid var(--accent); }
.cv-ivoire .name { font-weight: 400; font-size: 2.6em; }
.cv-ivoire .job { font-family: "CV Fraunces"; font-style: italic; font-weight: 400; }
.cv-ivoire .sec-title { text-align: center; color: var(--ink); font-size: 0.82em; letter-spacing: 0.04em; }
.cv-ivoire .sec-title::after { content: ""; display: block; width: 10mm; height: 0.4mm; margin: 1.6mm auto 0; background: var(--accent); }
.cv-ivoire .item-sub { font-style: normal; color: var(--accent); }
`,
});
