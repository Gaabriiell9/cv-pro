import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Quelles données CV Pro utilise, pourquoi, combien de temps, et comment exercer vos droits.",
  alternates: { canonical: "/confidentialite" },
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

export default function ConfidentialitePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-10 sm:px-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Confidentialité</h1>
        <p className="mt-3 text-sm text-ink-soft">Dernière mise à jour : {MISE_A_JOUR}</p>
        <p className="mt-6 text-lg text-ink-soft text-pretty">
          CV Pro collecte le moins de données possible : votre compte et votre CV, pour que vous puissiez le retrouver. Rien d&apos;autre.
        </p>

        <Section title="Qui est responsable">
          <p>
            CV Pro est édité par GF Web (gf-web.fr). Pour toute question sur vos données :{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-accent underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="Votre CV">
          <ul>
            <li>
              Le contenu de votre CV, le design choisi et votre photo (si vous en ajoutez une) sont <strong>enregistrés dans votre compte</strong>,
              pour que vous puissiez le reprendre sur n&apos;importe quel appareil. Une copie est aussi gardée dans votre navigateur, effacée à
              la déconnexion.
            </li>
            <li>Votre CV n&apos;est visible que par vous. Il n&apos;est jamais publié, partagé ni réutilisé.</li>
            <li>
              Le fichier PDF, lui, n&apos;est pas conservé : il est fabriqué à la demande puis aussitôt oublié par notre serveur.
            </li>
            <li>Base légale : l&apos;exécution du service que vous demandez. Le CV est supprimé avec votre compte.</li>
          </ul>
        </Section>

        <Section title="Votre compte">
          <p>Un compte gratuit est nécessaire pour créer un CV. Nous conservons :</p>
          <ul>
            <li>votre adresse e-mail et votre nom, pour vous connecter et vous reconnaître ;</li>
            <li>la date de création du compte.</li>
          </ul>
          <p>
            Base légale : l&apos;exécution du service que vous demandez. Ces données sont gardées tant que le compte existe et supprimées
            immédiatement quand vous le supprimez.
          </p>
          <p>
            <strong>Connexion avec Google</strong> : si vous choisissez cette option, Google nous transmet uniquement votre adresse e-mail
            (vérifiée), votre nom et un identifiant technique. Nous ne recevons ni votre mot de passe, ni vos contacts, ni vos fichiers, et
            nous ne conservons pas votre photo de profil.
          </p>
        </Section>

        <Section title="Codes de connexion et sécurité">
          <ul>
            <li>Les codes à 6 chiffres envoyés par e-mail sont stockés chiffrés (hachés), valables 15 minutes, puis effacés sous 24 heures.</li>
            <li>
              Pour bloquer les abus, nous comptons les tentatives par adresse IP et par adresse e-mail. Seule une empreinte irréversible est
              conservée, jamais l&apos;adresse elle-même, et elle est effacée au bout d&apos;un jour.
            </li>
          </ul>
        </Section>

        <Section title="Cookies et mesure d'audience">
          <ul>
            <li>Un seul cookie de session, pour vous garder connecté. Il est indispensable et ne sert à rien d&apos;autre.</li>
            <li>
              La mesure d&apos;audience (Vercel Web Analytics) fonctionne <strong>sans cookie</strong> et sans vous identifier.
            </li>
            <li>Aucune publicité, aucun traceur, aucune revente de données.</li>
          </ul>
        </Section>

        <Section title="Nos prestataires">
          <ul>
            <li>
              <strong>Vercel</strong> : hébergement du site (serveurs à Paris).
            </li>
            <li>
              <strong>Supabase</strong> : base de données des comptes et des CV (Irlande, Union européenne).
            </li>
            <li>
              <strong>Resend</strong> : envoi des e-mails de connexion (Irlande, Union européenne).
            </li>
            <li>
              <strong>Google</strong> : uniquement si vous choisissez « Continuer avec Google ».
            </li>
          </ul>
          <p>
            Certains de ces prestataires sont des sociétés américaines. Les transferts éventuels hors de l&apos;Union européenne sont encadrés
            par les clauses contractuelles types de la Commission européenne.
          </p>
        </Section>

        <Section title="Vos droits">
          <p>
            Vous pouvez à tout moment consulter et supprimer vos données depuis la page{" "}
            <Link href="/compte" className="font-medium text-accent underline underline-offset-4">
              Mon compte
            </Link>{" "}
            : vous y modifiez votre CV, le téléchargez en PDF ou supprimez votre compte. Pour recevoir une copie de toutes vos données ou
            exercer un autre droit (rectification, opposition, limitation), écrivez-nous à l&apos;adresse ci-dessus : nous répondons sous un
            mois.
          </p>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL (
            <a href="https://www.cnil.fr" className="font-medium text-accent underline underline-offset-4" rel="noopener noreferrer">
              cnil.fr
            </a>
            ).
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
