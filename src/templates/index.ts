import { classique } from "./classique";
import type { TemplateDef } from "./types";

// Catalogue des designs. L'ordre est celui de la galerie.
export const TEMPLATES: TemplateDef[] = [classique];

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
