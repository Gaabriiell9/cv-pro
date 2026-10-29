// Test ATS : pour chaque design, génère le PDF du CV d'exemple, extrait le texte avec
// pdftotext et vérifie que les informations sortent dans le bon ordre de lecture.
// Usage : CHROME_PATH=/chemin/chrome npx tsx scripts/ats-check.mts [dossier-de-sortie]

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { CV_FONT_FILES, renderResumeDocument } from "../src/lib/resume/document";
import { SAMPLE_RESUME } from "../src/lib/resume/sample";
import { DEFAULT_THEME, type RenderRequest } from "../src/lib/resume/schema";
import { TEMPLATES } from "../src/templates";

const outDir = process.argv[2] ?? path.join(process.cwd(), ".ats");
mkdirSync(outDir, { recursive: true });

const fonts: Record<string, string> = Object.fromEntries(
  CV_FONT_FILES.map((file) => [
    file,
    `data:font/woff2;base64,${readFileSync(path.join("public", "fonts", "cv", file)).toString("base64")}`,
  ]),
);

// Ordre attendu dans le texte extrait.
const EXPECTED = [
  "Camille Exemple",
  "Chargée de communication",
  "camille@exemple.fr",
  "Profil",
  "Expérience professionnelle",
  "Agence Fictive",
  "Gestion des réseaux sociaux",
  "Mairie Imaginaire",
  "Formation",
  "Master Communication des organisations",
  "Compétences",
  "Rédaction web",
  "Langues",
  "Anglais",
  "Centres d'intérêt",
  "Photographie",
];

const executablePath = process.env.CHROME_PATH;
if (!executablePath) throw new Error("Définir CHROME_PATH");

const browser = await puppeteer.launch({ executablePath, headless: "shell", args: ["--no-sandbox"] });
let failures = 0;
for (const t of TEMPLATES) {
  const req: RenderRequest = { templateId: t.id, cvLocale: "fr", theme: DEFAULT_THEME, content: SAMPLE_RESUME };
  const page = await browser.newPage();
  await page.setContent(renderResumeDocument(t, req, (f) => fonts[f]), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const pdfPath = path.join(outDir, `${t.id}.pdf`);
  writeFileSync(pdfPath, await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true }));
  await page.close();

  const text = execFileSync("pdftotext", ["-enc", "UTF-8", pdfPath, "-"]).toString().replace(/\s+/g, " ").toLocaleLowerCase("fr");
  const pages = Number(/Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [pdfPath]).toString())?.[1] ?? 0);
  let cursor = 0;
  const problems: string[] = [];
  for (const expected of EXPECTED) {
    const needle = expected.toLocaleLowerCase("fr");
    const at = text.indexOf(needle, cursor);
    if (at === -1) problems.push(text.includes(needle) ? `ordre : « ${needle} »` : `absent : « ${needle} »`);
    else cursor = at + needle.length;
  }
  if (problems.length) failures++;
  console.log(`${problems.length ? "ÉCHEC" : "OK   "} ${t.id} (${pages} page${pages > 1 ? "s" : ""})${problems.length ? "\n  " + problems.join("\n  ") : ""}`);
}
await browser.close();
process.exit(failures ? 1 : 0);
