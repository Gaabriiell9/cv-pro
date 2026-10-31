import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TemplateBadges, TemplateCard } from "@/components/site/template-card";
import { getTemplate, TEMPLATES } from "@/templates";
import { FAMILY_LABELS } from "@/templates/types";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return {
    title: `Modèle de CV ${t.name} (gratuit)`,
    description: `${t.tagline} ${t.description}`.slice(0, 158),
    alternates: { canonical: `/modeles/${t.id}` },
    openGraph: { images: [{ url: `/modeles/${t.id}-grand.webp`, width: 1000, height: 1414 }] },
  };
}

export default async function ModelePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) notFound();
  const others = TEMPLATES.filter((o) => o.family === t.family && o.id !== t.id).concat(TEMPLATES.filter((o) => o.family !== t.family && o.free));
  const suggestions = others.filter((o, i) => others.findIndex((x) => x.id === o.id) === i).slice(0, 4);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
          <Link href="/modeles" className="hover:text-ink">
            Modèles
          </Link>
          <span aria-hidden> / </span>
          <Link href={`/modeles#${t.family}`} className="hover:text-ink">
            {FAMILY_LABELS[t.family]}
          </Link>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="lg:sticky lg:top-8">
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Modèle de CV {t.name}</h1>
            <TemplateBadges t={t} className="mt-4" />
            <p className="mt-5 text-lg text-ink-soft text-pretty">{t.description}</p>
            <ul className="mt-6 space-y-2 text-sm text-ink-soft">
              <li>Format A4, PDF au texte sélectionnable</li>
              <li>{t.columns === 1 ? "Une colonne : lecture parfaite par les logiciels de recrutement" : "Deux colonnes : idéal pour un envoi direct"}</li>
              <li>Couleur, police, espacement et photo réglables</li>
              <li>Gratuit, sans filigrane, sans inscription</li>
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/editeur?modele=${t.id}`}
                className="inline-flex h-12 items-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90"
              >
                Utiliser ce modèle
              </Link>
              <Link href="/modeles" className="inline-flex h-12 items-center rounded-full px-4 font-medium text-ink-soft hover:bg-paper-2 hover:text-ink">
                Voir tous les modèles
              </Link>
            </div>
          </div>

          <ViewTransition name={`modele-${t.id}`} share="morph" default="none">
          <div className="overflow-hidden rounded-md bg-white shadow-[0_24px_60px_-24px_rgba(28,27,25,0.4)] ring-1 ring-line/60">
            <Image
              src={`/modeles/${t.id}-grand.webp`}
              alt={`Exemple de CV réalisé avec le modèle ${t.name} (profil fictif)`}
              width={1000}
              height={1414}
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </div>
          </ViewTransition>
        </div>

        <section aria-labelledby="titre-autres" className="mt-20">
          <h2 id="titre-autres" className="font-display text-2xl font-semibold">
            Autres modèles
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-x-6">
            {suggestions.map((o) => (
              <TemplateCard key={o.id} t={o} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
