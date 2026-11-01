import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TemplateCard } from "@/components/site/template-card";
import { getTemplate, TEMPLATES } from "@/templates";

// Page d'accueil provisoire (avant lancement). Les CV montrés sont des exemples fictifs.

const SHOWCASE = ["classique", "colonne", "portrait", "serif"].map((id) => getTemplate(id)!);

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:pt-16">
          <div>
            <h1 style={{ "--i": 0 } as React.CSSProperties} className="anim-fade-up font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Un beau CV en cinq minutes.
            </h1>
            <p style={{ "--i": 1 } as React.CSSProperties} className="anim-fade-up mt-5 max-w-md text-lg text-ink-soft text-pretty">
              Sur téléphone comme sur ordinateur. Gratuit, sans filigrane et sans abonnement caché.
            </p>
            <div style={{ "--i": 2 } as React.CSSProperties} className="anim-fade-up mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/editeur"
                className="inline-flex h-12 items-center rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90"
              >
                Créer mon CV
              </Link>
              <Link href="/modeles" className="inline-flex h-12 items-center rounded-full px-4 font-medium text-ink-soft hover:bg-paper-2 hover:text-ink">
                Voir les {TEMPLATES.length} modèles
              </Link>
            </div>
            <ul style={{ "--i": 3 } as React.CSSProperties} className="anim-fade-up mt-8 space-y-2 text-sm text-ink-soft">
              <li>{TEMPLATES.length} modèles gratuits, sans filigrane</li>
              <li>Un PDF A4 lisible par les logiciels de recrutement</li>
              <li>Votre CV enregistré dans votre compte, sur tous vos appareils</li>
            </ul>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-[420px]">
            <div style={{ animation: "cv-float-in 700ms var(--ease-out) 200ms both" }} className="absolute left-[-6%] top-[8%] w-[62%] -rotate-6 overflow-hidden rounded-sm shadow-[0_24px_60px_-20px_rgba(28,27,25,0.35)]">
              <Image src="/modeles/bloc.webp" alt="" width={480} height={679} className="h-auto w-full" />
            </div>
            <div style={{ animation: "cv-float-in 700ms var(--ease-out) 80ms both" }} className="relative ml-auto w-[78%] rotate-2 overflow-hidden rounded-sm shadow-[0_30px_70px_-20px_rgba(28,27,25,0.45)]">
              <Image src="/modeles/horizon-grand.webp" alt="" width={1000} height={1414} priority className="h-auto w-full" />
            </div>
          </div>
        </section>

        <section aria-labelledby="titre-modeles" className="border-t border-line/70 bg-paper-2/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="titre-modeles" className="font-display text-3xl font-semibold tracking-tight">
                Des modèles pour chaque candidature
              </h2>
              <Link href="/modeles" className="text-sm font-semibold text-accent hover:underline">
                Tous les modèles
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-x-6">
              {SHOWCASE.map((t) => (
                <TemplateCard key={t.id} t={t} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
