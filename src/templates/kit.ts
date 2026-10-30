import { html, paragraphs, type SafeHtml } from "@/lib/resume/html";
import { sectionTitle, UI_LABELS } from "@/lib/resume/labels";
import type { Section, SectionType } from "@/lib/resume/schema";
import { contactItems, filledItems, formatPeriod, fullName, joinWith, photoTag } from "./shared";
import type { TemplateDef, TemplateFamily, TemplateInput } from "./types";

// Moteur commun des designs. Tous produisent la MÊME structure HTML, sémantique et
// dans l'ordre de lecture ; un design ne choisit que sa disposition et son CSS.
// Règles ATS : ordre du DOM = ordre de lecture, aucun texte décoratif, pas de
// letter-spacing > 0.04em (voir CLAUDE.md et `npm run ats`).

export type KitLayout = "single" | "side-left" | "side-right";

export type KitConfig = {
  id: string;
  name: string;
  family: TemplateFamily;
  free: boolean;
  atsOptimized: boolean;
  tagline: string;
  description: string;
  layout: KitLayout;
  // "top" : en-tête au-dessus de tout ; "main" : en haut de la colonne principale ;
  // "side" : nom et photo en haut de la colonne latérale (qui passe alors en premier
  // dans le DOM, pour que le nom reste la première chose lue).
  header?: "top" | "main" | "side";
  // Coordonnées : sous le nom, ou en liste dans la colonne latérale.
  contact?: "inline" | "side";
  // Sections placées dans la colonne latérale (mises en page 2 colonnes).
  sideTypes?: SectionType[];
  // Rendu des compétences et centres d'intérêt.
  skills?: "inline" | "list" | "bars" | "tags";
  supportsPhoto?: boolean;
  // Photo sur la vignette de la galerie (par défaut : familles moderne, photo, créatif).
  samplePhoto?: boolean;
  css: string;
};

const DEFAULT_SIDE: SectionType[] = ["skills", "languages", "interests"];

function itemBlock(title: string, period: string, sub: string, desc: string): SafeHtml {
  return html`<article class="item">
    <div class="item-head"><h3 class="item-title">${title}</h3>${period ? html`<span class="item-period">${period}</span>` : ""}</div>
    ${sub ? html`<p class="item-sub">${sub}</p>` : ""}
    ${paragraphs(desc)}
  </article>`;
}

function levelMeter(level: number): SafeHtml {
  if (!level) return html``;
  // Décoratif uniquement : aucun texte, ignoré par les logiciels de recrutement.
  return html`<span class="lvl" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => html`<i class="${n <= level ? "on" : ""}"></i>`)}</span>`;
}

export function renderSection(input: TemplateInput, raw: Section): SafeHtml {
  const { locale } = input;
  const s = { ...raw, items: filledItems(raw.items as { id: string }[]) } as Section;
  if (!s.visible || s.items.length === 0) return html``;
  const title = html`<h2 class="sec-title"><span>${sectionTitle(locale, s.type, s.title)}</span></h2>`;
  const cls = `sec sec-${s.type}`;

  switch (s.type) {
    case "experience":
      return html`<section class="${cls}">${title}${s.items.map((it) =>
        itemBlock(it.role, formatPeriod(locale, it.start, it.end), [it.company, it.city].filter(Boolean).join(", "), it.description),
      )}</section>`;
    case "education":
      return html`<section class="${cls}">${title}${s.items.map((it) =>
        itemBlock(it.degree, formatPeriod(locale, it.start, it.end), [it.school, it.city].filter(Boolean).join(", "), it.description),
      )}</section>`;
    case "custom":
      return html`<section class="${cls}">${title}${s.items.map((it) => itemBlock(it.title, it.period, it.subtitle, it.description))}</section>`;
    case "skills":
      return html`<section class="${cls}">${title}<ul class="chips skills">${s.items.map(
        (it) => html`<li><span class="chip-name">${it.name}</span>${levelMeter(it.level)}</li>`,
      )}</ul></section>`;
    case "interests":
      return html`<section class="${cls}">${title}<ul class="chips interests">${s.items.map(
        (it) => html`<li><span class="chip-name">${it.name}</span></li>`,
      )}</ul></section>`;
    case "languages":
      return html`<section class="${cls}">${title}<ul class="chips langs">${s.items.map(
        (it) =>
          html`<li><span class="chip-name">${it.name}</span>${it.level ? html`<span class="lang-sep"> : </span><span class="lang-level">${it.level}</span>` : ""}</li>`,
      )}</ul></section>`;
  }
}

function profile(input: TemplateInput): SafeHtml {
  if (!input.content.summary.trim()) return html``;
  return html`<section class="sec sec-profile"><h2 class="sec-title"><span>${UI_LABELS[input.locale].profile}</span></h2>${paragraphs(input.content.summary, "summary")}</section>`;
}

function identity(input: TemplateInput, withContact: boolean): SafeHtml {
  const b = input.content.basics;
  return html`<header class="head">
    ${photoTag(input.photo, input.theme.photoShape)}
    <div class="head-text">
      <h1 class="name">${fullName(b)}</h1>
      ${b.jobTitle ? html`<p class="job">${b.jobTitle}</p>` : ""}
      ${withContact && contactItems(b).length ? html`<p class="contact">${joinWith(contactItems(b), "|")}</p>` : ""}
    </div>
  </header>`;
}

function contactBlock(input: TemplateInput): SafeHtml {
  const items = contactItems(input.content.basics);
  if (!items.length) return html``;
  return html`<section class="sec sec-contact"><h2 class="sec-title"><span>${UI_LABELS[input.locale].contact}</span></h2><ul class="contact-list">${items.map(
    (c) => html`<li>${c}</li>`,
  )}</ul></section>`;
}

export function defineTemplate(cfg: KitConfig): TemplateDef {
  const header = cfg.header ?? "top";
  const contact = cfg.contact ?? (cfg.layout === "single" || header === "top" ? "inline" : "side");
  const sideTypes = cfg.sideTypes ?? DEFAULT_SIDE;
  const classes = `cv cv-${cfg.id} L-${cfg.layout} H-${header} S-${cfg.skills ?? "inline"}`;

  return {
    id: cfg.id,
    name: cfg.name,
    family: cfg.family,
    free: cfg.free,
    columns: cfg.layout === "single" ? 1 : 2,
    supportsPhoto: cfg.supportsPhoto ?? true,
    samplePhoto: cfg.samplePhoto ?? ["moderne", "photo", "creatif"].includes(cfg.family),
    atsOptimized: cfg.atsOptimized,
    tagline: cfg.tagline,
    description: cfg.description,
    css: KIT_CSS + cfg.css,
    body: (input) => {
      const sections = input.content.sections;
      if (cfg.layout === "single") {
        return html`<main class="${classes}">${identity(input, true)}<div class="flow">${profile(input)}${sections.map((s) => renderSection(input, s))}</div></main>`;
      }
      const main = sections.filter((s) => !sideTypes.includes(s.type));
      const side = sections.filter((s) => sideTypes.includes(s.type));
      const mainCol = html`<div class="main">${header === "main" ? identity(input, contact === "inline") : ""}${profile(input)}${main.map((s) =>
        renderSection(input, s),
      )}</div>`;
      const sideCol = html`<aside class="side">${header === "side" ? identity(input, false) : ""}${contact === "side" ? contactBlock(input) : ""}${side.map((s) =>
        renderSection(input, s),
      )}</aside>`;
      if (header === "side") return html`<main class="${classes}"><div class="cols">${sideCol}${mainCol}</div></main>`;
      if (header === "main") return html`<main class="${classes}"><div class="cols">${mainCol}${sideCol}</div></main>`;
      return html`<main class="${classes}">${identity(input, contact === "inline")}<div class="cols">${mainCol}${sideCol}</div></main>`;
    },
  };
}

// Styles communs à tous les designs. Les designs surchargent avec `.cv-<id> ...`.
// Variables utiles : --accent, --ink, --muted, --line, --d (densité), --font-title.
export const KIT_CSS = `
.cv { --pad-y: 14mm; --pad-x: 16mm; --side-w: 60mm; --tint: color-mix(in srgb, var(--accent) 9%, white); padding: var(--pad-y) var(--pad-x); -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.cv .head { display: flex; align-items: center; gap: 6mm; }
.cv .head-text { flex: 1; min-width: 0; }
.cv .name { font-family: var(--font-title); font-size: 2.3em; line-height: 1.05; font-weight: 700; }
.cv .job { color: var(--accent); font-size: 1.12em; font-weight: 600; margin-top: 1.2mm; }
.cv .contact { margin-top: 2.2mm; color: var(--muted); font-size: 0.92em; }
.cv .contact .sep { color: var(--line); margin: 0 1.4mm; }
.cv .photo { width: 28mm; height: 28mm; object-fit: cover; flex: none; }
.cv .photo.round { border-radius: 50%; }
.cv .photo.square { border-radius: 1.5mm; }
.cv .flow, .cv .cols { margin-top: calc(6mm * var(--d)); }
.cv .sec { margin-top: calc(5.5mm * var(--d)); }
.cv .flow > .sec:first-child, .cv .main > .sec:first-child, .cv .side > .sec:first-child, .cv .side > .head + .sec { margin-top: 0; }
.cv .sec-title { font-family: var(--font-title); font-size: 0.86em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--accent); margin: 0 0 calc(2.2mm * var(--d)); break-after: avoid; }
.cv .item { break-inside: avoid; margin-top: calc(3mm * var(--d)); }
.cv .sec-title + .item { margin-top: 0; }
.cv .item-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.cv .item-title { font-size: 1.04em; font-weight: 700; }
.cv .item-period { color: var(--muted); font-size: 0.9em; white-space: nowrap; }
.cv .item-sub { margin-top: 0.6mm; color: var(--muted); font-style: italic; }
.cv .desc, .cv .summary { margin-top: 1.4mm; }
.cv ul.desc { padding-left: 4.5mm; }
.cv ul.desc li { margin-top: 0.6mm; }
.cv ul.chips, .cv ul.contact-list { list-style: none; padding: 0; margin: 0; }
.cv ul.chips { display: flex; flex-wrap: wrap; row-gap: 1mm; }
.cv ul.chips li + li::before { content: "·"; color: var(--accent); margin: 0 1.8mm; }
.cv .lvl { display: none; }
.cv .contact-list li { margin-top: 1.2mm; overflow-wrap: anywhere; }
.cv .contact-list li:first-child { margin-top: 0; }

/* Deux colonnes */
.cv .cols { display: grid; gap: 9mm; grid-template-columns: minmax(0, 1fr) var(--side-w); align-items: start; }
.cv.L-side-left .cols { grid-template-columns: var(--side-w) minmax(0, 1fr); }
.cv.L-side-left.H-top .side { order: -1; }
.cv .side ul.chips { display: block; }
.cv .side ul.chips li + li::before { content: none; }
.cv .side ul.chips li { margin-top: 1.4mm; }
.cv .side ul.chips li:first-child { margin-top: 0; }
.cv .side .lang-sep { display: none; }
.cv .side .lang-level { display: block; color: var(--muted); font-size: 0.9em; }
.cv .side .head { display: block; margin-bottom: calc(7mm * var(--d)); }
.cv .main > .head { margin-bottom: calc(7mm * var(--d)); }
.cv.H-main .cols, .cv.H-side .cols { margin-top: 0; }
.cv .main > .head + .sec { margin-top: 0; }
.cv .side .head .photo { margin-bottom: 5mm; }
.cv .side .name { font-size: 1.9em; }

/* Compétences : liste, barres, étiquettes */
.cv.S-list ul.skills, .cv.S-bars ul.skills { display: block; }
.cv.S-list ul.skills li + li::before, .cv.S-bars ul.skills li + li::before { content: none; }
.cv.S-list ul.skills li, .cv.S-bars ul.skills li { margin-top: 1.4mm; }
.cv.S-bars ul.skills li { display: flex; align-items: center; justify-content: space-between; gap: 3mm; }
.cv.S-bars .lvl { display: inline-flex; gap: 0.8mm; flex: none; }
.cv.S-bars .lvl i { display: block; width: 3.2mm; height: 1.4mm; border-radius: 0.7mm; background: color-mix(in srgb, currentColor 18%, transparent); }
.cv.S-bars .lvl i.on { background: var(--accent); }
.cv.S-tags ul.skills, .cv.S-tags ul.interests { display: flex; flex-wrap: wrap; gap: 1.6mm; }
.cv.S-tags ul.skills li + li::before, .cv.S-tags ul.interests li + li::before { content: none; }
.cv.S-tags ul.skills li, .cv.S-tags ul.interests li { margin: 0; padding: 0.8mm 2.4mm; border-radius: 99px; background: var(--tint); color: var(--ink); font-size: 0.92em; }
`;
