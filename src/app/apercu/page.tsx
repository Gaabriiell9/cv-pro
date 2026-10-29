import type { Metadata } from "next";
import { ApercuClient } from "./apercu-client";

// Page technique de l'étape 2 : vérifie la chaîne aperçu + PDF avec un CV fictif.
// Elle sera remplacée par l'éditeur.
export const metadata: Metadata = {
  title: "Aperçu du design Classique",
  robots: { index: false, follow: false },
};

export default function ApercuPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Design Classique</h1>
      <p className="mt-2 text-ink-soft">CV d&apos;exemple fictif. L&apos;aperçu et le PDF viennent du même modèle.</p>
      <div className="mt-6">
        <ApercuClient />
      </div>
    </main>
  );
}
