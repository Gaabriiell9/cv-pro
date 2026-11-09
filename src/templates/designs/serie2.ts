import { defineTemplate } from "../kit";

// Deuxième série de designs (09/11/2026). Mêmes règles que les autres : structure
// HTML commune (kit.ts), aucun texte décoratif, aucune position/opacité/transformation
// sur un élément qui contient du texte, letter-spacing <= 0.04em.
// Les sélecteurs [data-f="b:firstName"] et [data-f="b:lastName"] ciblent le prénom et
// le nom (balises posées par kit.ts pour l'édition directe).

const CLONE = "-webkit-box-decoration-break: clone; box-decoration-break: clone;";

// ---------------------------------------------------------------- Sobres

export const carnet = defineTemplate({
  id: "carnet",
  name: "Carnet",
  family: "sobre",
  free: false,
  atsOptimized: true,
  tagline: "Des titres sur bandeau clair et le nom en deux tons : net et facile à parcourir.",
  description:
    "Carnet range chaque rubrique sous un bandeau clair marqué d'un trait de couleur, pour que le recruteur trouve en un coup d'œil votre expérience ou votre formation. Une colonne, aucun effet superflu : idéal pour les postes administratifs, l'accueil ou le secrétariat.",
  layout: "single",
  css: `
.cv-carnet { --pad-x: 17mm; }
.cv-carnet .name { font-size: 2.4em; }
.cv-carnet .name [data-f="b:lastName"] { color: var(--accent); }
.cv-carnet .job { color: var(--ink); font-weight: 500; }
.cv-carnet .flow { margin-top: calc(7mm * var(--d)); }
.cv-carnet .sec-title { background: var(--tint); color: var(--ink); padding: 1.2mm 3mm; border-left: 1.2mm solid var(--accent); font-size: 0.82em; }
.cv-carnet .item-sub { font-style: normal; color: var(--accent); font-weight: 600; font-size: 0.95em; }
`,
});

export const rigueur = defineTemplate({
  id: "rigueur",
  name: "Rigueur",
  family: "sobre",
  free: false,
  atsOptimized: true,
  tagline: "Un filet épais en tête, le nom en capitales, des dates bien visibles.",
  description:
    "Rigueur pose un filet de couleur en haut de la page, met votre nom de famille en capitales et fait ressortir les dates de chaque expérience. Une mise en page carrée et sérieuse, pensée pour la finance, le juridique, la logistique ou l'industrie.",
  layout: "single",
  css: `
.cv-rigueur .head { border-top: 1.6mm solid var(--accent); padding-top: 6mm; }
.cv-rigueur .name { font-size: 2.3em; font-weight: 400; }
.cv-rigueur .name [data-f="b:lastName"] { font-weight: 700; text-transform: uppercase; }
.cv-rigueur .job { color: var(--muted); font-weight: 600; text-transform: uppercase; font-size: 0.86em; letter-spacing: 0.04em; margin-top: 2mm; }
.cv-rigueur .contact { color: var(--ink); }
.cv-rigueur .sec-title { display: flex; align-items: center; gap: 3mm; color: var(--ink); }
.cv-rigueur .sec-title::before { content: ""; flex: none; width: 6mm; height: 0.8mm; background: var(--accent); }
.cv-rigueur .item-period { color: var(--accent); font-weight: 600; }
.cv-rigueur .item-sub { font-style: normal; }
`,
});

// ---------------------------------------------------------------- Modernes

export const nordique = defineTemplate({
  id: "nordique",
  name: "Nordique",
  family: "moderne",
  free: false,
  atsOptimized: false,
  tagline: "Une colonne gris clair, un liseré de couleur en haut : précis et calme.",
  description:
    "Nordique place vos coordonnées, compétences et langues dans une colonne gris clair à gauche, sous un fin liseré de couleur. Le parcours se lit à droite, avec beaucoup d'air. Un style sobre et technique, très apprécié dans l'informatique, les réseaux et l'ingénierie.",
  layout: "side-left",
  header: "main",
  skills: "list",
  css: `
html { background: linear-gradient(var(--accent), var(--accent)) top / 100% 4mm no-repeat, linear-gradient(to right, #f1f3f5 0 66mm, #fff 66mm); }
.cv-nordique { padding: 0; --side-w: 66mm; }
.cv-nordique .cols { gap: 0; }
/* Colonnes placées sans « order » : le nom (colonne principale) reste lu en premier. */
.cv-nordique .side { grid-column: 1; grid-row: 1; padding: var(--pad-y) 8mm var(--pad-y) 11mm; ${CLONE} }
.cv-nordique .main { grid-column: 2; grid-row: 1; padding: var(--pad-y) var(--pad-x) var(--pad-y) 10mm; ${CLONE} }
.cv-nordique .name { font-size: 2.5em; font-weight: 600; }
.cv-nordique .job { text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.88em; }
.cv-nordique .sec-title { font-size: 0.8em; }
.cv-nordique .side .sec-title { color: var(--ink); padding-bottom: 1mm; border-bottom: 0.3mm solid var(--line); }
.cv-nordique .item-sub { font-style: normal; color: var(--accent); }
`,
});

export const cadran = defineTemplate({
  id: "cadran",
  name: "Cadran",
  family: "moderne",
  free: false,
  atsOptimized: false,
  tagline: "Un trait vertical devant le nom et un encadré pour vos atouts.",
  description:
    "Cadran ouvre sur un grand nom souligné d'un trait vertical de couleur, puis réunit compétences, langues et centres d'intérêt dans un encadré à droite. Un CV structuré et dynamique pour la gestion de projet, le commerce ou la logistique.",
  layout: "side-right",
  skills: "tags",
  css: `
.cv-cadran { --side-w: 60mm; }
.cv-cadran .head { border-left: 2mm solid var(--accent); padding-left: 6mm; }
.cv-cadran .name { font-size: 2.6em; }
.cv-cadran .job { color: var(--ink); font-weight: 500; }
.cv-cadran .cols { margin-top: calc(9mm * var(--d)); }
.cv-cadran .side { background: #f6f5f2; border-top: 1.2mm solid var(--accent); padding: 6mm 5mm; ${CLONE} }
.cv-cadran .sec-title { color: var(--ink); }
.cv-cadran .main .sec-title span { padding-bottom: 0.6mm; border-bottom: 0.6mm solid var(--accent); }
.cv-cadran.S-tags ul.skills li, .cv-cadran.S-tags ul.interests li { background: #fff; }
`,
});

export const ardoise = defineTemplate({
  id: "ardoise",
  name: "Ardoise",
  family: "moderne",
  free: false,
  atsOptimized: false,
  tagline: "Une colonne gris ardoise, des touches de couleur : moderne et solide.",
  description:
    "Ardoise réunit votre nom, votre photo et vos compétences dans une colonne gris foncé sur toute la hauteur, avec des niveaux pour chaque compétence. Le contraste fort donne un CV affirmé, adapté aux métiers techniques, au BTP ou à l'industrie.",
  layout: "side-left",
  header: "side",
  skills: "bars",
  css: `
html { background: linear-gradient(to right, #2b3038 0 72mm, #fff 72mm); }
.cv-ardoise { padding: 0; --side-w: 72mm; --light: color-mix(in srgb, var(--accent) 40%, white); }
.cv-ardoise .cols { gap: 0; }
.cv-ardoise .side { padding: var(--pad-y) 8mm var(--pad-y) 11mm; color: #e9ebee; ${CLONE} }
.cv-ardoise .main { padding: var(--pad-y) var(--pad-x) var(--pad-y) 10mm; ${CLONE} }
.cv-ardoise .side .name { color: #fff; }
.cv-ardoise .side .job, .cv-ardoise .side .sec-title { color: var(--light); }
.cv-ardoise .side .lang-level, .cv-ardoise .side .contact-list { color: #c3c8cf; }
.cv-ardoise .side .photo { width: 32mm; height: 32mm; box-shadow: 0 0 0 1mm #4a515c; }
.cv-ardoise .side .lvl i { background: rgba(255, 255, 255, 0.18); }
.cv-ardoise .side .lvl i.on { background: var(--light); }
.cv-ardoise .main .sec-title { color: var(--ink); }
.cv-ardoise .main .sec-title::after { content: ""; display: block; width: 9mm; height: 0.8mm; margin-top: 1.2mm; background: var(--accent); }
`,
});

export const ruban = defineTemplate({
  id: "ruban",
  name: "Ruban",
  family: "moderne",
  free: false,
  atsOptimized: true,
  tagline: "Chaque rubrique sur un ruban de couleur d'un bord à l'autre.",
  description:
    "Ruban fait courir chaque titre de rubrique sur une bande de couleur qui traverse toute la page. Impossible de se perdre : le recruteur repère tout de suite vos expériences et vos compétences. Un CV clair et énergique pour la restauration, le commerce et les jobs étudiants.",
  layout: "single",
  css: `
.cv-ruban .name { font-size: 2.6em; }
.cv-ruban .job { margin-top: 1.6mm; }
.cv-ruban .flow { margin-top: calc(7mm * var(--d)); }
.cv-ruban .sec-title { margin-left: calc(-1 * var(--pad-x)); margin-right: calc(-1 * var(--pad-x)); padding: 1.6mm var(--pad-x); background: var(--accent); color: #fff; font-size: 0.84em; }
.cv-ruban .item-sub { font-style: normal; color: var(--accent); font-weight: 600; }
`,
});

// ---------------------------------------------------------------- Avec photo

export const profil = defineTemplate({
  id: "profil",
  name: "Profil",
  family: "photo",
  free: false,
  atsOptimized: false,
  tagline: "Une grande photo ronde en haut d'une colonne teintée à droite.",
  description:
    "Profil met votre photo en valeur en haut d'une colonne teintée, à droite de la page, avec votre nom, vos coordonnées et vos compétences en dessous. Le parcours occupe la partie gauche. Un CV chaleureux pour l'accueil, la vente, la relation client ou le service.",
  layout: "side-right",
  header: "side",
  skills: "list",
  css: `
html { background: linear-gradient(to left, color-mix(in srgb, var(--accent) 10%, #fff) 0 70mm, #fff 70mm); }
.cv-profil { padding: 0; --side-w: 70mm; }
.cv-profil .cols { gap: 0; grid-template-columns: minmax(0, 1fr) var(--side-w); }
.cv-profil .side { grid-column: 2; grid-row: 1; padding: var(--pad-y) 11mm var(--pad-y) 8mm; ${CLONE} }
.cv-profil .main { grid-column: 1; grid-row: 1; padding: var(--pad-y) 10mm var(--pad-y) var(--pad-x); ${CLONE} }
.cv-profil .side .head { text-align: center; }
.cv-profil .side .head .photo { width: 40mm; height: 40mm; margin: 0 auto 5mm; box-shadow: 0 0 0 1.2mm #fff; }
.cv-profil .side .name { font-size: 1.8em; }
.cv-profil .side .sec-title { color: var(--ink); }
.cv-profil .main .sec-title { padding-bottom: 1mm; border-bottom: 0.4mm solid var(--accent); }
`,
});

export const vitrine = defineTemplate({
  id: "vitrine",
  name: "Vitrine",
  family: "photo",
  free: false,
  atsOptimized: false,
  tagline: "Un grand bandeau de couleur avec votre photo encadrée de blanc.",
  description:
    "Vitrine ouvre sur un bandeau de couleur pleine où votre photo, votre nom et vos coordonnées ressortent en blanc. Le reste du CV, en une colonne, reste sobre et lisible. Idéal pour les métiers commerciaux, le marketing ou tout poste où l'on vous voit d'abord.",
  layout: "single",
  skills: "tags",
  css: `
.cv-vitrine .head { margin: calc(-1 * var(--pad-y)) calc(-1 * var(--pad-x)) 0; padding: 12mm var(--pad-x); background: var(--accent); color: #fff; gap: 8mm; }
.cv-vitrine .name { color: #fff; font-size: 2.6em; }
.cv-vitrine .job { color: rgba(255, 255, 255, 0.9); font-weight: 500; }
.cv-vitrine .contact { color: rgba(255, 255, 255, 0.82); }
.cv-vitrine .contact .sep { color: rgba(255, 255, 255, 0.4); }
.cv-vitrine .photo { width: 36mm; height: 36mm; box-shadow: 0 0 0 1.2mm rgba(255, 255, 255, 0.92); }
.cv-vitrine .flow { margin-top: calc(9mm * var(--d)); }
.cv-vitrine .sec-title { color: var(--ink); }
.cv-vitrine .sec-title::after { content: ""; display: block; width: 10mm; height: 0.8mm; margin-top: 1.2mm; background: var(--accent); }
`,
});

// ---------------------------------------------------------------- Élégants

export const opera = defineTemplate({
  id: "opera",
  name: "Opéra",
  family: "elegant",
  free: false,
  atsOptimized: false,
  tagline: "Deux colonnes séparées d'un filet, des titres en italique.",
  description:
    "Opéra associe la typographie à empattements à une mise en page en deux colonnes séparées par un filet fin. Les titres en italique et les dates en couleur donnent un ton raffiné, parfait pour la culture, le luxe, l'hôtellerie ou la communication.",
  layout: "side-right",
  header: "main",
  css: `
.cv-opera { --font-title: "CV Fraunces"; --side-w: 58mm; }
.cv-opera .name { font-weight: 400; font-size: 2.8em; }
.cv-opera .job { font-family: "CV Fraunces"; font-style: italic; font-weight: 400; font-size: 1.25em; }
.cv-opera .main > .head { padding-bottom: calc(5mm * var(--d)); border-bottom: 0.2mm solid var(--ink); }
.cv-opera .side { border-left: 0.2mm solid var(--line); padding-left: 6mm; ${CLONE} }
.cv-opera .sec-title { text-transform: none; letter-spacing: 0; font-weight: 400; font-style: italic; font-size: 1.25em; color: var(--ink); }
.cv-opera .item-title { font-family: "CV Fraunces"; font-weight: 600; font-size: 1.08em; }
.cv-opera .item-period { font-family: "CV Fraunces"; font-style: italic; color: var(--accent); }
.cv-opera .item-sub { font-style: normal; }
`,
});

export const signature = defineTemplate({
  id: "signature",
  name: "Signature",
  family: "elegant",
  free: false,
  atsOptimized: true,
  tagline: "Le prénom en italique de couleur, comme une signature.",
  description:
    "Signature écrit votre prénom en italique de couleur et votre nom en grand, la photo à droite, puis déroule le parcours en une colonne aux titres soulignés d'un trait. Un CV élégant et sûr de lui pour le management, le conseil ou les postes à responsabilité.",
  layout: "single",
  css: `
.cv-signature { --font-title: "CV Fraunces"; --pad-x: 19mm; }
.cv-signature .head { flex-direction: row-reverse; }
.cv-signature .name { font-size: 3em; font-weight: 400; line-height: 1; }
.cv-signature .name [data-f="b:firstName"] { font-style: italic; color: var(--accent); }
.cv-signature .job { color: var(--ink); font-weight: 500; margin-top: 2.6mm; }
.cv-signature .contact { border-top: 0.2mm solid var(--line); padding-top: 2.4mm; margin-top: 3.5mm; }
.cv-signature .sec-title { text-transform: none; letter-spacing: 0; font-size: 1.25em; font-weight: 600; color: var(--ink); }
.cv-signature .sec-title::after { content: ""; display: block; width: 12mm; height: 0.5mm; margin-top: 1.4mm; background: var(--accent); }
.cv-signature .item-title { font-family: "CV Fraunces"; font-weight: 600; }
.cv-signature .item-sub { font-style: normal; color: var(--accent); }
`,
});

// ---------------------------------------------------------------- Créatifs

export const neon = defineTemplate({
  id: "neon",
  name: "Néon",
  family: "creatif",
  free: false,
  atsOptimized: true,
  tagline: "Un CV sur fond sombre, avec des touches de couleur lumineuses.",
  description:
    "Néon renverse les codes : texte clair sur fond presque noir, titres et dates dans une version lumineuse de votre couleur. Un CV qui se remarque à l'écran, idéal pour le numérique, le jeu vidéo, le design ou l'événementiel. À envoyer en PDF plutôt qu'à imprimer.",
  layout: "single",
  skills: "tags",
  css: `
html { background: #14161b; }
.cv-neon { --ink: #eceef2; --muted: #a3a9b4; --line: #3a3f49; --glow: color-mix(in srgb, var(--accent) 45%, white); --tint: color-mix(in srgb, var(--accent) 28%, #14161b); color: var(--ink); }
.cv-neon .name { font-size: 2.8em; color: #fff; }
.cv-neon .job, .cv-neon .sec-title, .cv-neon .item-period { color: var(--glow); }
.cv-neon .sec-title { padding-bottom: 1.2mm; border-bottom: 0.3mm solid var(--line); }
.cv-neon .photo { box-shadow: 0 0 0 1mm var(--glow); }
.cv-neon ul.chips li + li::before { color: var(--glow); }
.cv-neon.S-tags ul.skills li, .cv-neon.S-tags ul.interests li { color: #fff; }
`,
});

export const mosaique = defineTemplate({
  id: "mosaique",
  name: "Mosaïque",
  family: "creatif",
  free: false,
  atsOptimized: false,
  tagline: "Le parcours en pleine largeur, vos atouts en cartes côte à côte.",
  description:
    "Mosaïque déroule l'expérience et la formation sur toute la largeur, puis présente compétences, langues et centres d'intérêt en cartes colorées côte à côte. Moderne et compact, il convient bien aux étudiants et aux premiers emplois, quand on veut tout montrer sur une page.",
  layout: "single",
  skills: "tags",
  css: `
.cv-mosaique .head { padding-bottom: calc(5mm * var(--d)); border-bottom: 1.2mm solid var(--accent); }
.cv-mosaique .name { font-size: 2.6em; }
.cv-mosaique .flow { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 5mm; row-gap: calc(5mm * var(--d)); align-items: start; }
.cv-mosaique .flow > .sec { margin: 0; }
.cv-mosaique .sec-profile, .cv-mosaique .sec-experience, .cv-mosaique .sec-education, .cv-mosaique .sec-custom { grid-column: 1 / -1; }
.cv-mosaique .sec-skills, .cv-mosaique .sec-languages, .cv-mosaique .sec-interests { background: var(--tint); border-radius: 3mm; padding: 4mm 5mm; break-inside: avoid; }
.cv-mosaique .sec-title::before { content: ""; display: inline-block; width: 2.4mm; height: 2.4mm; margin-right: 2.2mm; border-radius: 50%; background: var(--accent); vertical-align: 0.2mm; }
.cv-mosaique.S-tags ul.skills li, .cv-mosaique.S-tags ul.interests li { background: #fff; }
.cv-mosaique ul.langs { display: block; }
.cv-mosaique ul.langs li + li::before { content: none; }
.cv-mosaique ul.langs li + li { margin-top: 1.2mm; }
`,
});
