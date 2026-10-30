import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          CV Pro
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-1 sm:gap-2">
          <Link href="/modeles" className="inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-ink-soft hover:bg-paper-2 hover:text-ink">
            Modèles
          </Link>
          <Link
            href="/editeur"
            className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Créer mon CV
          </Link>
        </nav>
      </div>
    </header>
  );
}
