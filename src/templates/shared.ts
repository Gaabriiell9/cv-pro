import { html, type SafeHtml } from "@/lib/resume/html";
import { UI_LABELS } from "@/lib/resume/labels";
import type { Basics, CvLocale } from "@/lib/resume/schema";

// Période lisible : "2020 - 2022", "2022 - Aujourd'hui", "2019".
export function formatPeriod(locale: CvLocale, start: string, end: string): string {
  const s = start.trim();
  const e = end.trim();
  if (!s && !e) return "";
  if (s && !e) return `${s} - ${UI_LABELS[locale].present}`;
  if (!s) return e;
  return `${s} - ${e}`;
}

// Même période, chaque date repérée par son champ (édition directe dans l'aperçu).
// « Aujourd'hui » affiché pour une fin vide se modifie comme la date de fin.
export function periodHtml(locale: CvLocale, start: string, end: string, base: string): SafeHtml {
  const s = start.trim();
  const e = end.trim();
  if (!s && !e) return html``;
  const startTag = html`<span data-f="${base}:start">${s}</span>`;
  const endTag = html`<span data-f="${base}:end"${e ? "" : html` data-ph="1"`}>${e || UI_LABELS[locale].present}</span>`;
  if (!s) return endTag;
  return html`${startTag} - ${endTag}`;
}

export function fullName(b: Basics): string {
  return [b.firstName, b.lastName].map((s) => s.trim()).filter(Boolean).join(" ");
}

// Nom complet, prénom et nom repérés séparément (édition directe dans l'aperçu).
export function nameHtml(b: Basics): SafeHtml {
  const parts = (["firstName", "lastName"] as const).filter((k) => b[k].trim());
  return html`${parts.map((k, i) => html`${i > 0 ? " " : ""}<span data-f="b:${k}">${b[k].trim()}</span>`)}`;
}

const CONTACT_KEYS = ["email", "phone", "city", "linkedin", "website", "extra"] as const;
export type ContactItem = { key: (typeof CONTACT_KEYS)[number]; value: string };

// Coordonnées dans l'ordre de lecture attendu par les ATS, sans icône ni image.
export function contactItems(b: Basics): ContactItem[] {
  return CONTACT_KEYS.map((key) => ({ key, value: b[key].trim() })).filter((c) => c.value);
}

export function joinWith(parts: ContactItem[], sep: string): SafeHtml {
  return html`${parts.map((p, i) => html`${i > 0 ? html`<span class="sep" aria-hidden="true">${sep}</span>` : ""}<span data-f="b:${p.key}">${p.value}</span>`)}`;
}

export function photoTag(photo: string | undefined, shape: "round" | "square" | "none", className = "photo"): SafeHtml {
  if (!photo || shape === "none") return html``;
  // alt vide : la photo est décorative pour les ATS.
  return html`<img class="${className} ${shape}" src="${photo}" alt="" />`;
}

// Éléments réellement remplis : un élément dont tous les textes sont vides n'est pas
// affiché, et une section sans élément rempli disparaît du CV.
export function filledItems<T extends { id: string }>(items: T[]): T[] {
  return items.filter((it) =>
    Object.entries(it).some(([k, v]) => k !== "id" && typeof v === "string" && v.trim() !== ""),
  );
}
