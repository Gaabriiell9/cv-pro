import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TEMPLATES } from "@/templates";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/modeles`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/editeur`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/conditions`, changeFrequency: "yearly", priority: 0.2 },
    ...TEMPLATES.map((t) => ({ url: `${SITE_URL}/modeles/${t.id}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
