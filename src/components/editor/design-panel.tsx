"use client";

import { Check } from "lucide-react";
import { useEditor } from "@/lib/editor/store";
import type { CvLocale, Theme } from "@/lib/resume/schema";
import { TEMPLATES } from "@/templates";

// Couleurs proposées : toutes assez foncées pour rester lisibles sur fond blanc.
const ACCENTS = [
  { hex: "#1f4d3a", name: "Vert sapin" },
  { hex: "#1d3c6e", name: "Bleu marine" },
  { hex: "#2f5d8a", name: "Bleu acier" },
  { hex: "#6b2d3e", name: "Bordeaux" },
  { hex: "#8a4b14", name: "Cuivre" },
  { hex: "#4b3a6b", name: "Prune" },
  { hex: "#0f5f61", name: "Pétrole" },
  { hex: "#2b2b2b", name: "Anthracite" },
];

function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium text-ink-soft">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-xl border px-3.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${
              value === o.value ? "border-accent bg-accent/8 font-semibold text-accent" : "border-line bg-white hover:border-ink-soft/50"
            }`}
          >
            <input type="radio" className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function DesignPanel() {
  const templateId = useEditor((s) => s.templateId);
  const theme = useEditor((s) => s.theme);
  const locale = useEditor((s) => s.cvLocale);
  const { setTemplate, setTheme, setLocale } = useEditor.getState();
  const set = <K extends keyof Theme>(k: K) => (v: Theme[K]) => setTheme({ [k]: v } as Partial<Theme>);

  return (
    <div className="grid grid-cols-1 gap-3">
      <section className="rounded-2xl border border-line bg-white p-4" aria-labelledby="titre-designs">
        <h2 id="titre-designs" className="mb-3 font-display text-lg font-semibold">
          Design
        </h2>
        <p className="mb-3 text-xs text-ink-soft">
          Votre contenu est conservé quand vous changez de design. Les designs « Pass » se prévisualisent librement ; leur téléchargement
          demande un Pass (paiement unique).
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
          {TEMPLATES.map((t) => {
            const selected = templateId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                aria-pressed={selected}
                aria-label={`${t.name}, ${t.free ? "gratuit" : "inclus dans le Pass"}, ${t.columns === 1 ? "une colonne" : "deux colonnes"}`}
                className="group min-w-0 text-left"
              >
                <span
                  className={`relative block overflow-hidden rounded-md bg-white ring-1 transition ${
                    selected ? "ring-[3px] ring-accent" : "ring-line group-hover:ring-ink-soft/50"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/modeles/${t.id}.webp`} alt="" width={480} height={679} loading="lazy" className="block h-auto w-full" />
                  <span
                    className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      t.free ? "bg-accent text-accent-ink" : "bg-ink text-paper"
                    }`}
                  >
                    {t.free ? "Gratuit" : "Pass"}
                  </span>
                  {selected ? (
                    <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-accent text-accent-ink">
                      <Check className="size-4" aria-hidden />
                    </span>
                  ) : null}
                </span>
                <span className="mt-1.5 block truncate text-sm font-medium">{t.name}</span>
                <span className="block text-xs text-ink-soft">
                  {t.columns === 1 ? "1 colonne" : "2 colonnes"}
                  {t.atsOptimized ? " · ATS" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 rounded-2xl border border-line bg-white p-4" aria-labelledby="titre-reglages">
        <h2 id="titre-reglages" className="font-display text-lg font-semibold">
          Réglages
        </h2>
        <fieldset>
          <legend className="mb-2 text-[13px] font-medium text-ink-soft">Couleur</legend>
          <div className="flex flex-wrap gap-2.5">
            {ACCENTS.map((c) => (
              <label key={c.hex} title={c.name} className="relative cursor-pointer rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink has-[:focus-visible]:ring-offset-2">
                <input type="radio" className="sr-only" checked={theme.accent === c.hex} onChange={() => set("accent")(c.hex)} aria-label={c.name} />
                <span className="flex size-11 items-center justify-center rounded-full" style={{ backgroundColor: c.hex }}>
                  {theme.accent === c.hex ? <Check className="size-5 text-white" aria-hidden /> : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Choice
          legend="Police"
          value={theme.font}
          onChange={set("font")}
          options={[
            { value: "instrument", label: "Moderne" },
            { value: "fraunces", label: "Classique (serif)" },
          ]}
        />
        <Choice
          legend="Espacement"
          value={theme.density}
          onChange={set("density")}
          options={[
            { value: "compact", label: "Compact" },
            { value: "normal", label: "Normal" },
            { value: "aere", label: "Aéré" },
          ]}
        />
        <Choice
          legend="Forme de la photo"
          value={theme.photoShape}
          onChange={set("photoShape")}
          options={[
            { value: "round", label: "Ronde" },
            { value: "square", label: "Carrée" },
            { value: "none", label: "Sans photo" },
          ]}
        />
        <Choice<CvLocale>
          legend="Langue du CV"
          value={locale}
          onChange={setLocale}
          options={[
            { value: "fr", label: "Français" },
            { value: "en", label: "Anglais" },
            { value: "pt", label: "Portugais" },
          ]}
        />
        <p className="-mt-3 text-xs text-ink-soft">Change les titres des sections. Le texte saisi reste tel quel.</p>
      </section>
    </div>
  );
}
