import { z } from "zod";

// Contenu d'un CV : le même objet est stocké dans le navigateur (copie locale) et dans
// Resume.content (compte). Toute évolution incompatible augmente SCHEMA_VERSION.
export const SCHEMA_VERSION = 1;

const text = (max: number) => z.string().trim().max(max);
const id = z.string().min(1).max(40);

export const cvLocaleSchema = z.enum(["fr", "en", "pt"]);
export type CvLocale = z.infer<typeof cvLocaleSchema>;

// Date libre mais courte : "2024", "09/2023", "Aujourd'hui"... On ne force pas de
// format pour rester simple à saisir sur téléphone.
const period = text(30);

export const basicsSchema = z.object({
  firstName: text(60),
  lastName: text(60),
  jobTitle: text(100),
  email: text(120),
  phone: text(30),
  city: text(80),
  website: text(160),
  linkedin: text(160),
  extra: text(120), // ex. permis B, disponibilité
});

const experienceItem = z.object({
  id,
  role: text(120),
  company: text(120),
  city: text(80),
  start: period,
  end: period,
  description: text(2000),
});

const educationItem = z.object({
  id,
  degree: text(160),
  school: text(160),
  city: text(80),
  start: period,
  end: period,
  description: text(1000),
});

const skillItem = z.object({ id, name: text(80), level: z.number().int().min(0).max(5) });
const languageItem = z.object({ id, name: text(60), level: text(40) });
const interestItem = z.object({ id, name: text(80) });
const customItem = z.object({
  id,
  title: text(160),
  subtitle: text(160),
  period,
  description: text(1500),
});

const sectionBase = { id, title: text(60), visible: z.boolean() };

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({ ...sectionBase, type: z.literal("experience"), items: z.array(experienceItem).max(30) }),
  z.object({ ...sectionBase, type: z.literal("education"), items: z.array(educationItem).max(20) }),
  z.object({ ...sectionBase, type: z.literal("skills"), items: z.array(skillItem).max(40) }),
  z.object({ ...sectionBase, type: z.literal("languages"), items: z.array(languageItem).max(15) }),
  z.object({ ...sectionBase, type: z.literal("interests"), items: z.array(interestItem).max(20) }),
  z.object({ ...sectionBase, type: z.literal("custom"), items: z.array(customItem).max(20) }),
]);

export const resumeContentSchema = z.object({
  basics: basicsSchema,
  summary: text(1500),
  sections: z.array(sectionSchema).max(12),
});

export const themeSchema = z.object({
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  font: z.enum(["instrument", "fraunces"]),
  density: z.enum(["compact", "normal", "aere"]),
  photoShape: z.enum(["round", "square", "none"]),
});

// Photo transmise uniquement au moment du rendu (jamais dans le contenu JSON).
export const photoDataUrlSchema = z
  .string()
  .max(900_000)
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/);

export const renderRequestSchema = z.object({
  templateId: z.string().min(1).max(40),
  cvLocale: cvLocaleSchema,
  theme: themeSchema,
  content: resumeContentSchema,
  photo: photoDataUrlSchema.optional(),
});

export type Basics = z.infer<typeof basicsSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type SectionType = Section["type"];
export type ResumeContent = z.infer<typeof resumeContentSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type RenderRequest = z.infer<typeof renderRequestSchema>;

export const DEFAULT_THEME: Theme = {
  accent: "#1f4d3a",
  font: "instrument",
  density: "normal",
  photoShape: "round",
};
