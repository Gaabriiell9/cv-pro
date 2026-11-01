import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Les règles d'utilisation de CV Pro, le service gratuit de création de CV.",
  alternates: { canonical: "/conditions" },
};

const MISE_A_JOUR = "1er novembre 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-ink-soft [&_strong]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">{children}</div>
    </section>
  );
}

export default function ConditionsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-10 sm:px-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Conditions d&apos;utilisation</h1>
        <p className="mt-3 text-sm text-ink-soft">Dernière mise à jour : {MISE_A_JOUR}</p>
        <p className="mt-6 text-lg text-ink-soft text-pretty">
          En utilisant CV Pro, vous acceptez les règles simples ci-dessous. Elles sont écrites pour être lues.
        </p>

        <Section title="Le service">
          <p>
            CV Pro, édité par GF Web (gf-web.fr), permet de rédiger un CV en ligne, de choisir un modèle et de le télécharger en PDF. Le service
            est <strong>gratuit</strong>, sans abonnement et sans publicité. Un compte gratuit est nécessaire pour créer et enregistrer votre CV.
          </p>
        </Section>

        <Section title="Votre compte">
          <ul>
            <li>Le compte se crée avec votre nom et votre adresse e-mail (puis un code de connexion), ou avec un compte Google.</li>
            <li>Vous êtes responsable de l&apos;accès à votre adresse e-mail, qui sert à vous connecter.</li>
            <li>
              Vous pouvez supprimer votre compte à tout moment depuis la page{" "}
              <Link href="/compte" className="font-medium text-accent underline underline-offset-4">
                Mon compte
              </Link>
              .
            </li>
          </ul>
        </Section>

        <Section title="Votre contenu">
          <ul>
            <li>
              Votre CV vous appartient. Nous ne le réutilisons pas, ne le publions pas et ne le revendons pas (voir la page{" "}
              <Link href="/confidentialite" className="font-medium text-accent underline underline-offset-4">
                Confidentialité
              </Link>
              ).
            </li>
            <li>
              Vous êtes seul responsable de ce que vous écrivez : les informations doivent être exactes et ne pas porter atteinte aux droits
              d&apos;autrui (pas de contenu illégal, injurieux ou utilisant l&apos;identité d&apos;une autre personne).
            </li>
            <li>Les modèles de CV peuvent être utilisés librement pour vos propres candidatures, y compris à titre professionnel.</li>
          </ul>
        </Section>

        <Section title="Bon usage">
          <p>
            Il est interdit de chercher à perturber le service : envoi massif de requêtes, contournement des limites, tentative d&apos;accès aux
            comptes d&apos;autres personnes, usage automatisé pour générer des documents en masse. En cas d&apos;abus, l&apos;accès peut être
            limité ou un compte supprimé.
          </p>
        </Section>

        <Section title="Disponibilité et responsabilité">
          <ul>
            <li>
              Nous faisons de notre mieux pour que le service fonctionne bien, mais il est fourni tel quel, sans garantie de disponibilité
              permanente.
            </li>
            <li>
              Votre CV est enregistré automatiquement dans votre compte. Gardez tout de même une copie de votre PDF pour vos candidatures.
            </li>
            <li>CV Pro ne garantit pas l&apos;obtention d&apos;un entretien ou d&apos;un emploi.</li>
          </ul>
        </Section>

        <Section title="Évolutions">
          <p>
            Ces conditions peuvent évoluer, par exemple si des options payantes apparaissent un jour. Elles seraient alors annoncées clairement
            à l&apos;avance, et ce qui est gratuit aujourd&apos;hui ne deviendrait pas payant sans prévenir.
          </p>
        </Section>

        <Section title="Contact et droit applicable">
          <p>
            Pour toute question :{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-accent underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
            . Ces conditions sont soumises au droit français. En cas de litige, une solution amiable est recherchée en priorité ; vous pouvez
            aussi recourir gratuitement à un médiateur de la consommation.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
