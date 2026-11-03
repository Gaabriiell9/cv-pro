"use client";

import { renderResumeDocument } from "./document";
import { paginateResume } from "./paginate";
import { TEXT_SCALES, type RenderRequest, type Theme } from "./schema";
import { getTemplate } from "@/templates";

// « Tenir sur une page » : on essaie, du plus doux au plus serré, d'abord un
// espacement plus court, puis un texte plus petit (jamais sous 85 %), et on garde le
// premier réglage qui fait tenir le CV sur une page. Chaque essai est mesuré dans une
// iframe invisible, avec la même mise en pages que l'aperçu et le PDF.

// Marge de sécurité : un CV « juste à la limite » dans ce navigateur peut déborder d'un
// pixel dans un autre (Firefox, Safari mesurent le texte un peu différemment de
// Chromium, qui fabrique le PDF) et passer à 2 pages. On garde donc une ligne de jeu.
const SAFETY_PX = 16;

async function countPages(request: RenderRequest): Promise<number> {
  const template = getTemplate(request.templateId);
  if (!template) return 1;
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-same-origin");
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:793.7px;height:1123px;border:0;visibility:hidden;";
  const loaded = new Promise<void>((resolve) => frame.addEventListener("load", () => resolve(), { once: true }));
  frame.srcdoc = renderResumeDocument(template, request, (file) => `/fonts/cv/${file}`);
  document.body.appendChild(frame);
  try {
    await loaded;
    const d = frame.contentDocument!;
    await d.fonts.ready;
    const { pages, pageHeight, end } = paginateResume(d);
    // Une seule page, mais sans la marge de sécurité : compté comme deux.
    return pages === 1 && end > pageHeight - SAFETY_PX ? 2 : pages;
  } finally {
    frame.remove();
  }
}

export type FitResult = { ok: true; theme: Theme } | { ok: false; pages: number };

export async function fitOnePage(request: RenderRequest): Promise<FitResult> {
  const steps: Pick<Theme, "density" | "scale">[] = [];
  if (request.theme.density === "aere") steps.push({ density: "normal", scale: 1 });
  // On ne grossit jamais un texte déjà réduit à la main.
  for (const scale of TEXT_SCALES) if (scale <= (request.theme.scale ?? 1)) steps.push({ density: "compact", scale });

  let last = Infinity;
  for (const step of steps) {
    const theme: Theme = { ...request.theme, ...step };
    const pages = await countPages({ ...request, theme });
    if (pages === 1) return { ok: true, theme };
    last = pages;
  }
  return { ok: false, pages: last };
}
