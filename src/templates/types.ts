import type { SafeHtml } from "@/lib/resume/html";
import type { CvLocale, ResumeContent, Theme } from "@/lib/resume/schema";

export type TemplateInput = {
  content: ResumeContent;
  theme: Theme;
  locale: CvLocale;
  photo?: string; // data URL déjà validée, ou URL publique (exemples de la galerie)
};

export type TemplateFamily = "sobre" | "moderne" | "photo" | "elegant" | "creatif";

export const FAMILY_LABELS: Record<TemplateFamily, string> = {
  sobre: "Sobres",
  moderne: "Modernes",
  photo: "Avec photo",
  elegant: "Élégants",
  creatif: "Créatifs",
};

export type TemplateDef = {
  id: string; // slug utilisé dans l'URL /modeles/<id>
  name: string;
  family: TemplateFamily;
  free: boolean;
  columns: 1 | 2;
  supportsPhoto: boolean;
  samplePhoto: boolean; // la vignette de la galerie montre-t-elle une photo ?
  atsOptimized: boolean;
  tagline: string; // une phrase, affichée sur la carte de la galerie
  description: string; // deux ou trois phrases, page /modeles/<id>
  css: string; // styles propres au design (préfixés par .cv-<id>)
  body: (input: TemplateInput) => SafeHtml;
};
