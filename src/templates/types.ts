import type { SafeHtml } from "@/lib/resume/html";
import type { CvLocale, ResumeContent, Theme } from "@/lib/resume/schema";

export type TemplateInput = {
  content: ResumeContent;
  theme: Theme;
  locale: CvLocale;
  photo?: string; // data URL, déjà validée
};

export type TemplateFamily = "sobre" | "moderne" | "photo" | "elegant" | "creatif";

export type TemplateDef = {
  id: string; // slug utilisé dans l'URL /modeles/<id>
  name: string;
  family: TemplateFamily;
  free: boolean;
  columns: 1 | 2;
  supportsPhoto: boolean;
  atsOptimized: boolean;
  css: string; // styles propres au design (préfixés par .cv)
  body: (input: TemplateInput) => SafeHtml;
};
