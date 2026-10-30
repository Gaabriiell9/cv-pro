import { defineTemplate } from "../kit";

// Famille « avec photo » : la photo est au centre de la composition (elle reste
// facultative : sans photo, la mise en page s'adapte).

export const portrait = defineTemplate({
  id: "portrait",
  name: "Portrait",
  family: "photo",
  free: true,
  atsOptimized: false,
  tagline: "Une grande photo dans un encadré teinté, le reste en une colonne.",
  description:
    "Portrait met votre photo en valeur dans un en-tête teinté, à côté de votre nom et de vos coordonnées. Le reste du CV suit une colonne simple et lisible. Idéal pour les métiers en contact avec le public : accueil, vente, santé, hôtellerie.",
  layout: "single",
  css: `
.cv-portrait .head { background: var(--tint); border-radius: 3mm; padding: 6mm 7mm; gap: 7mm; }
.cv-portrait .photo { width: 34mm; height: 34mm; }
.cv-portrait .sec-title { border-left: 1mm solid var(--accent); padding-left: 2.5mm; line-height: 1.25; }
`,
});

export const medaillon = defineTemplate({
  id: "medaillon",
  name: "Médaillon",
  family: "photo",
  free: false,
  atsOptimized: false,
  tagline: "Photo ronde cerclée, nom centré, titres encadrés de filets.",
  description:
    "Médaillon centre votre photo, cerclée d'un fin anneau de couleur, au-dessus de votre nom. Les titres de section sont encadrés de filets pour une allure soignée et symétrique. Un modèle chaleureux et professionnel à la fois.",
  layout: "single",
  css: `
.cv-medaillon .head { flex-direction: column; text-align: center; gap: 4mm; }
.cv-medaillon .photo { width: 32mm; height: 32mm; box-shadow: 0 0 0 1.2mm #fff, 0 0 0 1.7mm var(--accent); }
.cv-medaillon .name { font-weight: 600; font-size: 2.4em; }
.cv-medaillon .sec-title { display: flex; align-items: center; gap: 3mm; }
.cv-medaillon .sec-title::before, .cv-medaillon .sec-title::after { content: ""; flex: 1; height: 0.2mm; background: var(--line); }
`,
});

export const banniere = defineTemplate({
  id: "banniere",
  name: "Bannière",
  family: "photo",
  free: false,
  atsOptimized: false,
  tagline: "Un bandeau de couleur coupé en biais, la photo en avant.",
  description:
    "Bannière ouvre sur un bandeau de couleur franche, découpé en biais, où votre photo et votre nom ressortent en blanc. Les titres de section prennent la forme d'étiquettes. Un modèle affirmé pour sortir du lot.",
  layout: "single",
  skills: "tags",
  css: `
.cv-banniere .head { margin: calc(-1 * var(--pad-y)) calc(-1 * var(--pad-x)) 0; padding: 12mm var(--pad-x) 15mm; color: #fff; background: linear-gradient(var(--accent), var(--accent)) top / 100% calc(100% - 9mm) no-repeat, linear-gradient(to bottom right, var(--accent) 50%, transparent 50.5%) bottom / 100% 9mm no-repeat; }
.cv-banniere .name { color: #fff; }
.cv-banniere .job { color: rgba(255, 255, 255, 0.88); font-weight: 500; }
.cv-banniere .contact { color: rgba(255, 255, 255, 0.82); }
.cv-banniere .contact .sep { color: rgba(255, 255, 255, 0.4); }
.cv-banniere .photo { width: 30mm; height: 30mm; box-shadow: 0 0 0 1mm rgba(255, 255, 255, 0.9); }
.cv-banniere .flow { margin-top: calc(4mm * var(--d)); }
.cv-banniere .sec-title span { display: inline-block; padding: 0.7mm 2.6mm; border-radius: 1mm; background: var(--tint); }
`,
});
