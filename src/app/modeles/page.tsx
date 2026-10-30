import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TemplateCard } from "@/components/site/template-card";
import { TEMPLATES } from "@/templates";
import { FAMILY_LABELS, type TemplateFamily } from "@/templates/types";

export const metadata: Metadata = {
  title: "Modèles de CV : 18 designs gratuits",
  description:
    "Choisissez parmi 18 modèles de CV modernes, sobres, élégants ou créatifs, tous gratuits. Remplissez-le en ligne et téléchargez un PDF prêt à envoyer.",
  alternates: { canonical: "/modeles" },
};

const FAMILIES = Object.keys(FAMILY_LABELS) as TemplateFamily[];

export default function ModelesPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">Modèles de CV</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft text-pretty">
          {TEMPLATES.length} designs, tous gratuits et sans filigrane. Votre contenu est conservé quand vous changez de modèle : essayez-en
          autant que vous voulez.
        </p>
        <nav aria-label="Familles de modèles" className="mt-6 flex flex-wrap gap-2">
          {FAMILIES.map((f) => (
            <a key={f} href={`#${f}`} className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-medium hover:border-accent">
              {FAMILY_LABELS[f]}
            </a>
          ))}
        </nav>

        {FAMILIES.map((f, fi) => (
          <section key={f} id={f} aria-labelledby={`titre-${f}`} className="mt-14 scroll-mt-6">
            <h2 id={`titre-${f}`} className="font-display text-2xl font-semibold">
              {FAMILY_LABELS[f]}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {TEMPLATES.filter((t) => t.family === f).map((t, i) => (
                <TemplateCard key={t.id} t={t} priority={fi === 0 && i < 2} />
              ))}
            </div>
          </section>
        ))}

        <section className="mt-16 rounded-2xl border border-line bg-white p-6 sm:p-8" aria-labelledby="titre-ats">
          <h2 id="titre-ats" className="font-display text-xl font-semibold">
            Une ou deux colonnes ?
          </h2>
          <p className="mt-3 max-w-3xl text-ink-soft text-pretty">
            Tous nos modèles produisent un PDF au texte sélectionnable, que les logiciels de recrutement savent lire. Les modèles marqués
            « Optimisé ATS » sont les plus sûrs pour une candidature déposée sur un site d&apos;offres d&apos;emploi : leur texte se lit dans le bon
            ordre quelle que soit la méthode d&apos;extraction. Les modèles à deux colonnes sont idéaux pour un envoi direct par e-mail ou en main propre.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
