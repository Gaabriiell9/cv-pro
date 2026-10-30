import { atelier, contraste, geo, pastel } from "./designs/creatif";
import { galerie, ivoire, serif } from "./designs/elegant";
import { bloc, colonne, dune, horizon } from "./designs/moderne";
import { banniere, medaillon, portrait } from "./designs/photo";
import { classique, epure, ligne, notaire } from "./designs/sobre";
import { PAID_ENABLED } from "@/lib/site";
import type { TemplateDef } from "./types";

// Catalogue des designs, dans l'ordre de la galerie. `free` dans chaque design
// décrit l'offre future ; tant que PAID_ENABLED est faux, tous sont gratuits.
const ALL: TemplateDef[] = [
  classique,
  epure,
  notaire,
  ligne,
  horizon,
  colonne,
  bloc,
  dune,
  portrait,
  medaillon,
  banniere,
  serif,
  galerie,
  ivoire,
  atelier,
  pastel,
  geo,
  contraste,
];

export const TEMPLATES: TemplateDef[] = PAID_ENABLED ? ALL : ALL.map((t) => ({ ...t, free: true }));

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
