// Vignettes de la galerie : rend le CV d'exemple de chaque design et l'enregistre en
// WebP dans public/modeles/<id>.webp (+ une version large pour la page du modèle).
// À relancer après toute modification d'un design :
//   CHROME_PATH=/chemin/chrome npm run thumbs
import { readFileSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { CV_FONT_FILES, renderResumeDocument } from "../src/lib/resume/document";
import { SAMPLE_RESUME } from "../src/lib/resume/sample";
import { DEFAULT_THEME } from "../src/lib/resume/schema";
import { TEMPLATES } from "../src/templates";

const fonts: Record<string, string> = Object.fromEntries(
  CV_FONT_FILES.map((f) => [f, `data:font/woff2;base64,${readFileSync(path.join("public", "fonts", "cv", f)).toString("base64")}`]),
);
const photo = `data:image/jpeg;base64,${readFileSync(path.join("public", "exemple", "photo-fictive.jpg")).toString("base64")}`;
const executablePath = process.env.CHROME_PATH;
if (!executablePath) throw new Error("Définir CHROME_PATH");

const browser = await puppeteer.launch({ executablePath, headless: "shell", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.6 });
for (const t of TEMPLATES) {
  const doc = renderResumeDocument(
    t,
    { templateId: t.id, cvLocale: "fr", theme: DEFAULT_THEME, content: SAMPLE_RESUME, photo: t.samplePhoto ? photo : undefined },
    (f) => fonts[f],
  );
  await page.setContent(doc, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 794, height: 1123 } });
  await sharp(png).resize(1000).webp({ quality: 82 }).toFile(path.join("public", "modeles", `${t.id}-grand.webp`));
  await sharp(png).resize(480).webp({ quality: 80 }).toFile(path.join("public", "modeles", `${t.id}.webp`));
  console.log("vignette", t.id);
}
await browser.close();
