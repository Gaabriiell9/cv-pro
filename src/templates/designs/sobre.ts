import { defineTemplate } from "../kit";

// Famille « sobre » : une colonne, peu d'effets, pensée d'abord pour les logiciels
// de recrutement et les secteurs classiques.

export const classique = defineTemplate({
  id: "classique",
  name: "Classique",
  family: "sobre",
  free: true,
  atsOptimized: true,
  tagline: "Une colonne nette, des filets fins : le CV qui passe partout.",
  description:
    "Le modèle Classique va droit au but : une seule colonne, des titres de section clairs et une hiérarchie qui se lit en quelques secondes. C'est le choix le plus sûr pour une candidature en ligne, car les logiciels de recrutement le lisent sans erreur.",
  layout: "single",
  css: `
.cv-classique .head { padding-bottom: calc(4mm * var(--d)); border-bottom: 0.4mm solid var(--accent); }
.cv-classique .sec-title { padding-bottom: 1mm; border-bottom: 0.2mm solid var(--line); }
`,
});

export const epure = defineTemplate({
  id: "epure",
  name: "Épure",
  family: "sobre",
  free: true,
  atsOptimized: true,
  tagline: "Centré, aéré, presque sans couleur : tout l'espace pour votre parcours.",
  description:
    "Épure mise sur le blanc et la typographie : un en-tête centré, de grands espaces et des filets discrets. Il convient aux profils qui veulent un CV calme et élégant, sans renoncer à une lecture parfaite par les logiciels de recrutement.",
  layout: "single",
  css: `
.cv-epure { --pad-x: 20mm; }
.cv-epure .head { flex-direction: column; text-align: center; gap: 4mm; }
.cv-epure .photo { width: 24mm; height: 24mm; }
.cv-epure .name { font-weight: 400; font-size: 2.6em; }
.cv-epure .job { color: var(--ink); font-weight: 400; text-transform: uppercase; font-size: 0.86em; letter-spacing: 0.04em; margin-top: 2.4mm; }
.cv-epure .contact { margin-top: 3mm; }
.cv-epure .flow { margin-top: calc(9mm * var(--d)); }
.cv-epure .sec { margin-top: calc(7mm * var(--d)); }
.cv-epure .sec-title { display: flex; align-items: center; gap: 3mm; color: var(--ink); font-weight: 600; font-size: 0.8em; }
.cv-epure .sec-title::after { content: ""; flex: 1; height: 0.2mm; background: var(--line); }
.cv-epure .item-title { font-weight: 600; }
.cv-epure .item-sub { font-style: normal; color: var(--accent); }
`,
});

export const notaire = defineTemplate({
  id: "notaire",
  name: "Notaire",
  family: "sobre",
  free: false,
  atsOptimized: true,
  tagline: "Dates dans la marge, titres à empattements : rigueur et tradition.",
  description:
    "Notaire reprend les codes des CV traditionnels : les dates alignées dans une marge à gauche, des titres à empattements et un double filet sous le nom. Idéal pour le droit, la finance, l'administration ou tout poste où la rigueur se voit dès la mise en page.",
  layout: "single",
  css: `
.cv-notaire { --font-title: "CV Fraunces"; }
.cv-notaire .head { padding-bottom: calc(4mm * var(--d)); border-bottom: 0.9mm double var(--accent); }
.cv-notaire .name { font-weight: 600; font-size: 2.4em; }
.cv-notaire .job { font-family: "CV Fraunces"; font-style: italic; font-weight: 400; }
.cv-notaire .sec-title { text-transform: none; letter-spacing: 0; font-size: 1.15em; font-weight: 600; color: var(--ink); padding-bottom: 1mm; border-bottom: 0.2mm solid var(--line); }
.cv-notaire .item { display: grid; grid-template-columns: 30mm minmax(0, 1fr); column-gap: 5mm; }
.cv-notaire .item-head { display: contents; }
.cv-notaire .item-period { grid-column: 1; grid-row: 1 / span 3; white-space: normal; padding-top: 0.2mm; }
.cv-notaire .item-title, .cv-notaire .item-sub, .cv-notaire .item .desc { grid-column: 2; }
.cv-notaire .sec > .summary, .cv-notaire .sec > ul.chips { margin-left: 35mm; }
`,
});

export const ligne = defineTemplate({
  id: "ligne",
  name: "Ligne",
  family: "sobre",
  free: false,
  atsOptimized: true,
  tagline: "Un fil de couleur le long de la page relie chaque étape.",
  description:
    "Ligne trace un fil vertical sur toute la hauteur de la page, ponctué d'un repère à chaque section. La structure reste celle d'un CV classique, avec juste ce qu'il faut de caractère pour qu'on s'en souvienne.",
  layout: "single",
  css: `
html { background: linear-gradient(to right, #fff 0 9mm, var(--accent) 9mm 9.8mm, #fff 9.8mm); }
.cv-ligne { --pad-x: 18mm; }
.cv-ligne .name { color: var(--accent); font-size: 2.5em; }
.cv-ligne .job { color: var(--ink); font-weight: 400; }
.cv-ligne .sec-title { color: var(--ink); }
.cv-ligne .sec-title::before { content: ""; display: inline-block; width: 3.4mm; height: 3.4mm; margin: 0 7.5mm 0 -10.9mm; border-radius: 50%; background: #fff; border: 0.7mm solid var(--accent); vertical-align: -0.6mm; }
.cv-ligne .item-sub { font-style: normal; color: var(--accent); }
`,
});
