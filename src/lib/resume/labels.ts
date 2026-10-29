import type { CvLocale, SectionType } from "./schema";

// Titres de section par défaut, traduits selon la langue du CV.
// Titres standards : les logiciels de recrutement (ATS) les reconnaissent.
export const SECTION_LABELS: Record<CvLocale, Record<SectionType, string>> = {
  fr: {
    experience: "Expérience professionnelle",
    education: "Formation",
    skills: "Compétences",
    languages: "Langues",
    interests: "Centres d'intérêt",
    custom: "Autres informations",
  },
  en: {
    experience: "Work experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    interests: "Interests",
    custom: "Additional information",
  },
  pt: {
    experience: "Experiência profissional",
    education: "Formação",
    skills: "Competências",
    languages: "Idiomas",
    interests: "Interesses",
    custom: "Outras informações",
  },
};

export const UI_LABELS: Record<CvLocale, { profile: string; contact: string; present: string }> = {
  fr: { profile: "Profil", contact: "Contact", present: "Aujourd'hui" },
  en: { profile: "Profile", contact: "Contact", present: "Present" },
  pt: { profile: "Perfil", contact: "Contato", present: "Atual" },
};

export function sectionTitle(locale: CvLocale, type: SectionType, custom: string): string {
  return custom.trim() || SECTION_LABELS[locale][type];
}
