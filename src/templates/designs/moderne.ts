import { defineTemplate } from "../kit";

// Famille « moderne » : deux colonnes. Les compétences, langues et centres
// d'intérêt vont dans la colonne latérale.

export const horizon = defineTemplate({
  id: "horizon",
  name: "Horizon",
  family: "moderne",
  free: true,
  atsOptimized: false,
  tagline: "Un bandeau teinté, deux colonnes : moderne sans en faire trop.",
  description:
    "Horizon ouvre sur un large bandeau teinté qui met votre nom en avant, puis répartit le contenu en deux colonnes : le parcours à gauche, les compétences et langues à droite. Un format moderne qui tient beaucoup d'informations sur une page.",
  layout: "side-right",
  skills: "bars",
  css: `
.cv-horizon .head { margin: calc(-1 * var(--pad-y)) calc(-1 * var(--pad-x)) 0; padding: 12mm var(--pad-x) 9mm; background: var(--tint); }
.cv-horizon .name { color: var(--accent); }
.cv-horizon .job { color: var(--ink); font-weight: 500; }
.cv-horizon .photo { box-shadow: 0 0 0 1mm #fff; }
.cv-horizon .cols { margin-top: calc(8mm * var(--d)); }
.cv-horizon .sec-title::after { content: ""; display: block; width: 8mm; height: 0.8mm; margin-top: 1.2mm; border-radius: 1mm; background: var(--accent); }
.cv-horizon .side { border-left: 0.3mm solid var(--line); padding-left: 6mm; }
`,
});

export const colonne = defineTemplate({
  id: "colonne",
  name: "Colonne",
  family: "moderne",
  free: true,
  atsOptimized: false,
  tagline: "Une colonne claire à gauche pour l'essentiel, le parcours à droite.",
  description:
    "Colonne réunit votre nom, vos coordonnées et vos compétences dans une bande claire sur toute la hauteur de la page. Le parcours se lit à droite, sans distraction. Un classique des CV modernes, apprécié pour sa lisibilité.",
  layout: "side-left",
  header: "side",
  skills: "list",
  css: `
html { background: linear-gradient(to right, color-mix(in srgb, var(--accent) 8%, #fff) 0 74mm, #fff 74mm); }
.cv-colonne { padding: 0; --side-w: 74mm; }
.cv-colonne .cols { gap: 0; }
.cv-colonne .side { padding: var(--pad-y) 8mm var(--pad-y) 12mm; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.cv-colonne .main { padding: var(--pad-y) var(--pad-x) var(--pad-y) 10mm; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.cv-colonne .side .photo { width: 30mm; height: 30mm; }
`,
});

export const bloc = defineTemplate({
  id: "bloc",
  name: "Bloc",
  family: "moderne",
  free: false,
  atsOptimized: false,
  tagline: "Une colonne pleine couleur qui ne passe pas inaperçue.",
  description:
    "Bloc affiche votre photo, vos coordonnées et vos compétences dans une colonne de couleur franche, avec des niveaux visuels pour chaque compétence. Parfait pour les métiers commerciaux, du marketing ou du numérique, où il faut marquer les esprits.",
  layout: "side-left",
  header: "side",
  skills: "bars",
  css: `
html { background: linear-gradient(to right, var(--accent) 0 70mm, #fff 70mm); }
.cv-bloc { padding: 0; --side-w: 70mm; }
.cv-bloc .cols { gap: 0; }
.cv-bloc .side { padding: var(--pad-y) 8mm var(--pad-y) 11mm; color: #fff; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.cv-bloc .main { padding: var(--pad-y) var(--pad-x) var(--pad-y) 10mm; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.cv-bloc .side .name, .cv-bloc .side .sec-title { color: #fff; }
.cv-bloc .side .job { color: rgba(255, 255, 255, 0.85); font-weight: 500; }
.cv-bloc .side .lang-level, .cv-bloc .side .contact-list { color: rgba(255, 255, 255, 0.85); }
.cv-bloc .side .photo { width: 32mm; height: 32mm; box-shadow: 0 0 0 1mm rgba(255, 255, 255, 0.85); }
.cv-bloc .side .sec-title { padding-bottom: 1mm; border-bottom: 0.2mm solid rgba(255, 255, 255, 0.4); }
.cv-bloc .side .lvl i { background: rgba(255, 255, 255, 0.3); }
.cv-bloc .side .lvl i.on { background: #fff; }
.cv-bloc .main .sec-title { padding-bottom: 1mm; border-bottom: 0.4mm solid var(--accent); }
`,
});

export const dune = defineTemplate({
  id: "dune",
  name: "Dune",
  family: "moderne",
  free: false,
  atsOptimized: false,
  tagline: "Une colonne sable à droite et des étiquettes douces.",
  description:
    "Dune associe un parcours aéré à gauche et une colonne couleur sable à droite, où vos coordonnées, compétences et langues prennent la forme d'étiquettes. Un style chaleureux, adapté aux métiers du service, de l'éducation ou du social.",
  layout: "side-right",
  header: "main",
  skills: "tags",
  css: `
html { background: linear-gradient(to left, #f2ebdf 0 68mm, #fff 68mm); }
.cv-dune { padding: 0; --side-w: 68mm; }
.cv-dune .cols { gap: 0; }
.cv-dune .main { padding: var(--pad-y) 11mm var(--pad-y) var(--pad-x); -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.cv-dune .side { padding: var(--pad-y) 12mm var(--pad-y) 8mm; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.cv-dune .name { font-size: 2.6em; }
.cv-dune.S-tags ul.skills li, .cv-dune.S-tags ul.interests li { background: #fff; }
.cv-dune .side .sec-title { color: var(--ink); }
`,
});
