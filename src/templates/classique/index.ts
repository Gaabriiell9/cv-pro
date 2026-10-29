import { html, paragraphs } from "@/lib/resume/html";
import { sectionTitle, UI_LABELS } from "@/lib/resume/labels";
import type { Section } from "@/lib/resume/schema";
import type { TemplateDef, TemplateInput } from "../types";
import { contactItems, formatPeriod, fullName, joinWith, photoTag } from "../shared";

// « Classique » : une colonne, sobre, pensé d'abord pour les logiciels de recrutement.

function section(input: TemplateInput, s: Section) {
  const { locale } = input;
  if (!s.visible || s.items.length === 0) return html``;
  const title = html`<h2 class="sec-title">${sectionTitle(locale, s.type, s.title)}</h2>`;

  switch (s.type) {
    case "experience":
      return html`<section class="sec">${title}${s.items.map(
        (it) => html`<article class="item">
          <div class="item-head">
            <h3 class="item-title">${it.role}</h3>
            <span class="item-period">${formatPeriod(locale, it.start, it.end)}</span>
          </div>
          <p class="item-sub">${[it.company, it.city].filter(Boolean).join(", ")}</p>
          ${paragraphs(it.description)}
        </article>`,
      )}</section>`;
    case "education":
      return html`<section class="sec">${title}${s.items.map(
        (it) => html`<article class="item">
          <div class="item-head">
            <h3 class="item-title">${it.degree}</h3>
            <span class="item-period">${formatPeriod(locale, it.start, it.end)}</span>
          </div>
          <p class="item-sub">${[it.school, it.city].filter(Boolean).join(", ")}</p>
          ${paragraphs(it.description)}
        </article>`,
      )}</section>`;
    case "skills":
      return html`<section class="sec">${title}<p class="inline-list">${joinWith(
        s.items.map((i) => i.name).filter(Boolean),
        " · ",
      )}</p></section>`;
    case "interests":
      return html`<section class="sec">${title}<p class="inline-list">${joinWith(
        s.items.map((i) => i.name).filter(Boolean),
        " · ",
      )}</p></section>`;
    case "languages":
      return html`<section class="sec">${title}<p class="inline-list">${joinWith(
        s.items.filter((i) => i.name).map((i) => (i.level ? `${i.name} : ${i.level}` : i.name)),
        " · ",
      )}</p></section>`;
    case "custom":
      return html`<section class="sec">${title}${s.items.map(
        (it) => html`<article class="item">
          <div class="item-head">
            <h3 class="item-title">${it.title}</h3>
            <span class="item-period">${it.period}</span>
          </div>
          ${it.subtitle ? html`<p class="item-sub">${it.subtitle}</p>` : ""}
          ${paragraphs(it.description)}
        </article>`,
      )}</section>`;
  }
}

export const classique: TemplateDef = {
  id: "classique",
  name: "Classique",
  family: "sobre",
  free: true,
  columns: 1,
  supportsPhoto: true,
  atsOptimized: true,
  body: (input) => {
    const { content, theme, locale, photo } = input;
    const b = content.basics;
    return html`<main class="cv cv-classique">
      <header class="head">
        <div class="head-text">
          <h1 class="name">${fullName(b)}</h1>
          ${b.jobTitle ? html`<p class="job">${b.jobTitle}</p>` : ""}
          <p class="contact">${joinWith(contactItems(b), " | ")}</p>
        </div>
        ${photoTag(photo, theme.photoShape)}
      </header>
      ${content.summary
        ? html`<section class="sec"><h2 class="sec-title">${UI_LABELS[locale].profile}</h2>${paragraphs(content.summary, "summary")}</section>`
        : ""}
      ${content.sections.map((s) => section(input, s))}
    </main>`;
  },
  css: `
.cv-classique .head { display: flex; align-items: center; gap: 6mm; padding-bottom: calc(4mm * var(--d)); border-bottom: 0.4mm solid var(--accent); }
.cv-classique .head-text { flex: 1; min-width: 0; }
.cv-classique .name { font-family: var(--font-title); font-size: 2.3em; line-height: 1.05; font-weight: 700; letter-spacing: -0.01em; margin: 0; }
.cv-classique .job { color: var(--accent); font-size: 1.15em; font-weight: 600; margin: 1.2mm 0 0; }
.cv-classique .contact { margin: 2.2mm 0 0; color: var(--muted); font-size: 0.92em; }
.cv-classique .contact .sep { color: var(--line); }
.cv-classique .photo { width: 28mm; height: 28mm; object-fit: cover; flex: none; }
.cv-classique .photo.round { border-radius: 50%; }
.cv-classique .photo.square { border-radius: 1.5mm; }
.cv-classique .sec { margin-top: calc(5.5mm * var(--d)); }
.cv-classique .sec-title { font-size: 0.86em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--accent); margin: 0 0 calc(2.2mm * var(--d)); padding-bottom: 1mm; border-bottom: 0.2mm solid var(--line); break-after: avoid; }
.cv-classique .item { break-inside: avoid; margin-top: calc(3mm * var(--d)); }
.cv-classique .item:first-of-type { margin-top: 0; }
.cv-classique .item-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.cv-classique .item-title { font-size: 1.04em; font-weight: 700; margin: 0; }
.cv-classique .item-period { color: var(--muted); font-size: 0.9em; white-space: nowrap; }
.cv-classique .item-sub { margin: 0.6mm 0 0; color: var(--muted); font-style: italic; }
.cv-classique .desc, .cv-classique .summary { margin: 1.4mm 0 0; }
.cv-classique ul.desc { padding-left: 4.5mm; }
.cv-classique ul.desc li { margin-top: 0.6mm; }
.cv-classique .inline-list { margin: 0; }
.cv-classique .inline-list .sep { color: var(--accent); margin: 0 0.6mm; }
`,
};
