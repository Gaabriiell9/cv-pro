import Link from "next/link";
import { AccountLink } from "./account-link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="border-b border-line/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-1 px-4 sm:px-6">
        <Link href="/" aria-label="CV Pro, accueil" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-0.5 sm:gap-2">
          <Link href="/modeles" className="inline-flex h-10 items-center rounded-full px-2 sm:px-3 text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink">
            Modèles
          </Link>
          <AccountLink />
          <Link
            href="/editeur"
            className="inline-flex h-10 items-center whitespace-nowrap rounded-full bg-accent px-3 sm:px-4 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            <span className="max-[440px]:hidden">Créer mon CV</span>
            <span className="hidden max-[440px]:inline">Créer</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
