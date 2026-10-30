// Test ATS : pour chaque design, génère le PDF du CV d'exemple (avec photo), extrait
// le texte avec pdftotext de deux façons et vérifie la lecture :
// - « flux » (pdftotext -raw, ordre du fichier, utilisé par beaucoup de logiciels) :
//   OBLIGATOIRE pour tous les designs ;
// - « position » (pdftotext par défaut, reconstruit les colonnes d'après la page) :
//   OBLIGATOIRE pour les designs marqués atsOptimized, simple information sinon
//   (les designs à deux colonnes y mélangent souvent les colonnes : limite connue).
// Vérifications : le nom est lu en premier, chaque bloc se lit dans l'ordre, les
// blocs ne se mélangent pas, et pour une colonne l'ordre global est respecté.
// Usage : CHROME_PATH=/chemin/chrome npm run ats [dossier-de-sortie]

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
const photo = `data:image/jpeg;base64,${readFileSync(path.join("public", "exemple", "photo-fictive.jpg")).toString("base64")}`;

const GROUPS: Record<string, string[]> = {
  entete: ["Camille Exemple", "Chargée de communication"],
  contact: ["camille@exemple.fr"],
  parcours: [
    "Profil fictif de démonstration",
    "Expérience professionnelle",
    "Agence Fictive",
    "Gestion des réseaux sociaux",
    "Mairie Imaginaire",
    "Formation",
    "Master Communication des organisations",
  ],
  lateral: ["Compétences", "Rédaction web", "Langues", "Anglais", "Centres d'intérêt", "Photographie"],
};

const norm = (s: string) => s.replace(/\s+/g, " ").toLocaleLowerCase("fr");

function check(text: string, columns: 1 | 2): string[] {
  const problems: string[] = [];
  const spans: { name: string; start: number; end: number }[] = [];
  for (const [name, needles] of Object.entries(GROUPS)) {
    let cursor = -1;
    let start = -1;
    for (const raw of needles) {
      const needle = norm(raw);
      const at = cursor < 0 ? text.indexOf(needle) : text.indexOf(needle, cursor);
      if (at === -1) {
        problems.push(text.includes(needle) ? `ordre dans « ${name} » : ${raw}` : `absent : ${raw}`);
        continue;
      }
      if (start < 0) start = at;
      cursor = at + needle.length;
    }
    if (start >= 0) spans.push({ name, start, end: cursor });
  }
  const head = spans.find((s) => s.name === "entete");
  if (head && spans.some((s) => s !== head && s.start < head.start)) problems.push("le nom n'est pas lu en premier");
  for (const a of spans)
    for (const b of spans)
      if (a !== b && a.start < b.start && b.start < a.end) problems.push(`blocs mélangés : « ${a.name} » et « ${b.name} »`);
  if (columns === 1) {
    const order = spans.map((s) => s.name).join(" > ");
    if (order !== "entete > contact > parcours > lateral") problems.push(`ordre global : ${order}`);
  }
  return problems;
}

const executablePath = process.env.CHROME_PATH;
if (!executablePath) throw new Error("Définir CHROME_PATH");

const browser = await puppeteer.launch({ executablePath, headless: "shell", args: ["--no-sandbox"] });
let failures = 0;
for (const t of TEMPLATES) {
  const req: RenderRequest = { templateId: t.id, cvLocale: "fr", theme: DEFAULT_THEME, content: SAMPLE_RESUME, photo };
  const page = await browser.newPage();
  await page.setContent(renderResumeDocument(t, req, (f) => fonts[f]), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const pdfPath = path.join(outDir, `${t.id}.pdf`);
  writeFileSync(pdfPath, await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true }));
  await page.close();

  const read = (args: string[]) => norm(execFileSync("pdftotext", [...args, "-enc", "UTF-8", pdfPath, "-"]).toString());
  const pages = Number(/Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [pdfPath]).toString())?.[1] ?? 0);
  const fontsInfo = execFileSync("pdffonts", [pdfPath]).toString();
  const problems = check(read(["-raw"]), t.columns).map((p) => `flux : ${p}`);
  const positional = check(read([]), t.columns).map((p) => `position : ${p}`);
  if (t.atsOptimized) problems.push(...positional);
  if (/Type 3/.test(fontsInfo)) problems.push("police intégrée en Type 3");
  if (pages !== 1) problems.push(`${pages} pages pour le CV d'exemple (1 attendue)`);
  const note = !t.atsOptimized && positional.length ? " (lecture par position imparfaite : pas de badge ATS)" : "";
  if (problems.length) failures++;
  console.log(`${problems.length ? "ÉCHEC" : "OK   "} ${t.id.padEnd(10)} ${t.columns} col.${note}${problems.length ? "\n  " + problems.join("\n  ") : ""}`);
}
await browser.close();
console.log(failures ? `\n${failures} design(s) en échec` : `\n${TEMPLATES.length} designs OK`);
process.exit(failures ? 1 : 0);
