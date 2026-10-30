import { atelier, contraste, geo, pastel } from "./designs/creatif";
import { galerie, ivoire, serif } from "./designs/elegant";
import { bloc, colonne, dune, horizon } from "./designs/moderne";
import { banniere, medaillon, portrait } from "./designs/photo";
import { classique, epure, ligne, notaire } from "./designs/sobre";
import type { TemplateDef } from "./types";

// Catalogue des designs, dans l'ordre de la galerie. 6 gratuits (free: true).
export const TEMPLATES: TemplateDef[] = [
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

export function getTemplate(id: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
