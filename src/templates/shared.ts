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

export function fullName(b: Basics): string {
  return [b.firstName, b.lastName].map((s) => s.trim()).filter(Boolean).join(" ");
}

// Coordonnées dans l'ordre de lecture attendu par les ATS, sans icône ni image.
export function contactItems(b: Basics): string[] {
  return [b.email, b.phone, b.city, b.linkedin, b.website, b.extra].map((s) => s.trim()).filter(Boolean);
}

export function joinWith(parts: string[], sep: string): SafeHtml {
  return html`${parts.map((p, i) => html`${i > 0 ? html`<span class="sep" aria-hidden="true">${sep}</span>` : ""}<span>${p}</span>`)}`;
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
