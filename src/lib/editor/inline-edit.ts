import { textLines } from "@/lib/resume/html";
import type { Basics, ResumeContent, Section } from "@/lib/resume/schema";

// Édition directe dans l'aperçu : chaque texte du CV porte data-f (champ d'origine)
// et, pour les textes à plusieurs lignes, data-l (numéro de ligne affichée).
// Formats de data-f (produits par src/templates/kit.ts et shared.ts) :
//   b:<champ>                         coordonnées et nom (basics)
//   summary                           présentation
//   s:<section>:title                 titre de rubrique
//   s:<section>:<élément>:<champ>     champ d'un élément

// Longueurs maximales, identiques au schéma (src/lib/resume/schema.ts).
const BASICS_MAX: Record<keyof Basics, number> = {
  firstName: 60,
  lastName: 60,
  jobTitle: 100,
  email: 120,
  phone: 30,
  city: 80,
  website: 160,
  linkedin: 160,
  extra: 120,
};

const ITEM_MAX: Record<string, Record<string, number>> = {
  experience: { role: 120, company: 120, city: 80, start: 30, end: 30, description: 2000 },
  education: { degree: 160, school: 160, city: 80, start: 30, end: 30, description: 1000 },
  custom: { title: 160, subtitle: 160, period: 30, description: 1500 },
  skills: { name: 80 },
  languages: { name: 60, level: 40 },
  interests: { name: 80 },
};

const MULTILINE = new Set(["summary", "description"]);

/** Le texte saisi, sur une ligne, sans espaces superflus, à la bonne longueur. */
function clean(value: string, max: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

/** Remplace la ligne `line` d'un texte à plusieurs lignes (vide : la ligne disparaît). */
function replaceLine(text: string, line: number, value: string, max: number): string {
  const lines = textLines(text);
  if (line < 0 || line >= lines.length) return text;
  const next = lines.slice();
  if (value) next[line] = value;
  else next.splice(line, 1);
  return next.join("\n").slice(0, max);
}

/**
 * Applique une modification faite dans l'aperçu. Renvoie le nouveau contenu, ou null
 * si le champ est inconnu ou inchangé.
 */
export function applyInlineEdit(content: ResumeContent, field: string, line: number | null, raw: string): ResumeContent | null {
  const parts = field.split(":");

  if (parts[0] === "b" && parts.length === 2 && parts[1] in BASICS_MAX) {
    const key = parts[1] as keyof Basics;
    const value = clean(raw, BASICS_MAX[key]);
    if (value === content.basics[key]) return null;
    return { ...content, basics: { ...content.basics, [key]: value } };
  }

  if (field === "summary") {
    const value = clean(raw, 1500);
    const next = line === null ? value : replaceLine(content.summary, line, value, 1500);
    return next === content.summary ? null : { ...content, summary: next };
  }

  if (parts[0] !== "s") return null;
  const section = content.sections.find((s) => s.id === parts[1]);
  if (!section) return null;

  const withSection = (fn: (s: Section) => Section): ResumeContent => ({
    ...content,
    sections: content.sections.map((s) => (s.id === section.id ? fn(s) : s)),
  });

  if (parts.length === 3 && parts[2] === "title") {
    const value = clean(raw, 60);
    if (value === section.title) return null;
    return withSection((s) => ({ ...s, title: value }));
  }

  if (parts.length !== 4) return null;
  const [, , itemId, key] = parts;
  const max = ITEM_MAX[section.type]?.[key];
  if (!max) return null;
  const items = section.items as unknown as Record<string, unknown>[];
  const item = items.find((it) => it.id === itemId);
  if (!item || typeof item[key] !== "string") return null;
  const current = item[key] as string;
  const value = clean(raw, max);
  const next = MULTILINE.has(key) && line !== null ? replaceLine(current, line, value, max) : value;
  if (next === current) return null;
  return withSection((s) => ({ ...s, items: items.map((it) => (it.id === itemId ? { ...it, [key]: next } : it)) }) as unknown as Section);
}
