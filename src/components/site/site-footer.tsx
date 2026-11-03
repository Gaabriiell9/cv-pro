import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>CV Pro, créez un beau CV en quelques minutes</p>
        <nav aria-label="Liens du pied de page" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/modeles" className="hover:text-ink">
            Modèles de CV
          </Link>
          <Link href="/editeur" className="hover:text-ink">
            Créer mon CV
          </Link>
          <Link href="/confidentialite" className="hover:text-ink">
            Confidentialité
          </Link>
          <Link href="/conditions" className="hover:text-ink">
            Conditions
          </Link>
        </nav>
      </div>
      {/* Signature, tout en bas du site. */}
      <div className="border-t border-line/60 py-4 text-center text-xs text-ink-soft">
        Par{" "}
        <a href="https://gf-web.fr" target="_blank" rel="noopener" className="font-semibold text-ink hover:text-accent">
          gf-web.fr
        </a>
      </div>
    </footer>
  );
}
