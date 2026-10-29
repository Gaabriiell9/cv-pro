import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Browser } from "puppeteer-core";
import { CV_FONT_FILES, renderResumeDocument } from "@/lib/resume/document";
import type { RenderRequest } from "@/lib/resume/schema";
import type { TemplateDef } from "@/templates/types";

// Navigateur réutilisé d'une requête à l'autre tant que l'instance reste chaude.
let browserPromise: Promise<Browser> | null = null;

async function launch(): Promise<Browser> {
  const puppeteer = (await import("puppeteer-core")).default;
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }
  // En local : chemin d'un Chromium installé (ex. celui de Playwright).
  const executablePath = process.env.CHROME_PATH;
  if (!executablePath) throw new Error("CHROME_PATH manquant pour générer un PDF en local");
  return puppeteer.launch({ executablePath, headless: "shell", args: ["--no-sandbox", "--font-render-hinting=none"] });
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launch();
    browserPromise
      .then((b) => b.on("disconnected", () => (browserPromise = null)))
      .catch(() => (browserPromise = null));
  }
  return browserPromise;
}

// Polices intégrées au HTML en data URL : aucun appel réseau pendant le rendu.
const fontCache = new Map<string, string>();
async function loadFonts(): Promise<(file: string) => string> {
  for (const file of CV_FONT_FILES) {
    if (!fontCache.has(file)) {
      const buf = await readFile(path.join(process.cwd(), "public", "fonts", "cv", file));
      fontCache.set(file, `data:font/woff2;base64,${buf.toString("base64")}`);
    }
  }
  return (file) => fontCache.get(file) ?? "";
}

export async function generateResumePdf(template: TemplateDef, req: RenderRequest): Promise<Uint8Array> {
  const fonts = await loadFonts();
  const htmlDoc = renderResumeDocument(template, req, fonts);
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // Aucune ressource externe : seul le contenu fourni est rendu.
    await page.setRequestInterception(true);
    page.on("request", (r) => (r.url().startsWith("data:") ? r.continue() : r.abort()));
    await page.setJavaScriptEnabled(false);
    await page.setContent(htmlDoc, { waitUntil: "load", timeout: 15_000 });
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true, // structure accessible, utile aux logiciels de lecture
      timeout: 20_000,
    });
  } finally {
    await page.close().catch(() => {});
  }
}
