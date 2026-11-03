// Vérifie que la mise en pages de l'aperçu (paginateResume) annonce le même nombre de
// pages que le PDF réel, pour chaque design et plusieurs longueurs de CV.
// Usage : CHROME_PATH=/chemin/chrome npx tsx scripts/pages-check.mts [dossier]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { CV_FONT_FILES, renderResumeDocument } from "../src/lib/resume/document";
import { paginateResume } from "../src/lib/resume/paginate";
import { SAMPLE_RESUME } from "../src/lib/resume/sample";
import { DEFAULT_THEME, type ResumeContent } from "../src/lib/resume/schema";
import { TEMPLATES } from "../src/templates";

const out = process.argv[2] ?? path.join(process.cwd(), ".pages");
mkdirSync(out, { recursive: true });
const fonts = Object.fromEntries(CV_FONT_FILES.map((f) => [f, `data:font/woff2;base64,${readFileSync(path.join("public/fonts/cv", f)).toString("base64")}`]));
const photo = `data:image/jpeg;base64,${readFileSync("public/exemple/photo-fictive.jpg").toString("base64")}`;

function longer(n: number, skills: number): ResumeContent {
  const c = structuredClone(SAMPLE_RESUME) as ResumeContent;
  const exp = c.sections.find((s) => s.type === "experience")!;
  const one = exp.items[0] as Record<string, string>;
  exp.items = Array.from({ length: n }, (_, i) => ({
    ...one,
    id: "e" + i,
    role: `${one.role} ${i + 1}`,
    description: Array.from({ length: 2 + (i % 4) }, (_, k) => `Réalisation ${k + 1} : pilotage, suivi et coordination avec plusieurs équipes.`).join("\n"),
  })) as never;
  const sk = c.sections.find((s) => s.type === "skills")!;
  sk.items = Array.from({ length: skills }, (_, i) => ({ id: "s" + i, name: "Compétence " + (i + 1), level: (i % 5) + 1 })) as never;
  return c;
}
const CASES: [string, ResumeContent][] = [
  ["court", SAMPLE_RESUME],
  ["long", longer(7, 14)],
  ["tres-long", longer(13, 22)],
];

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: "shell", args: ["--no-sandbox"] });
let bad = 0;
for (const t of TEMPLATES) {
  const row: string[] = [];
  for (const [name, content] of CASES) {
    const html = renderResumeDocument(t, { templateId: t.id, cvLocale: "fr", theme: DEFAULT_THEME, content, photo }, (f) => fonts[f]);
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const pdfPath = path.join(out, `${t.id}-${name}.pdf`);
    writeFileSync(pdfPath, await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true }));
    const real = Number(/Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [pdfPath]).toString())![1]);
    await page.evaluate("globalThis.__name = (f) => f");
    const est = (await page.evaluate(paginateResume as unknown as (d: Document) => { pages: number }, await page.evaluateHandle(() => document) as never)) as { pages: number };
    if (name !== "court") {
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewport({ width: 794, height: Math.min(h, 4000) });
      await page.screenshot({ path: path.join(out, `${t.id}-${name}-apercu.png`) });
    }
    const ok = real === est.pages;
    if (!ok) bad++;
    row.push(`${name} ${ok ? "OK" : "ÉCART"} (PDF ${real}, aperçu ${est.pages})`);
    await page.close();
  }
  console.log(t.id.padEnd(10), row.join(" | "));
}
await browser.close();
console.log(bad ? `\n${bad} écart(s)` : "\nTout concorde");
process.exit(bad ? 1 : 0);
