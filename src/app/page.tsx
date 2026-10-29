// Page d'accueil provisoire (avant lancement). Le CV affiché est un exemple fictif.

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="font-display text-xl font-semibold tracking-tight">CV Pro</span>
        <span className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft">
          Bientôt disponible
        </span>
      </header>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-2 lg:pt-12">
        <div>
          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Un beau CV en cinq minutes.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft text-pretty">
            Sans inscription, sur téléphone comme sur ordinateur. Le gratuit est vraiment gratuit,
            et le payant n&apos;est jamais un abonnement caché.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-ink-soft">
            <li>Des designs variés, à changer en un clic</li>
            <li>Un PDF A4 lisible par les logiciels de recrutement</li>
            <li>Vos données restent les vôtres</li>
          </ul>
        </div>

        <div aria-hidden="true" className="flex justify-center lg:justify-end">
          <div className="aspect-[210/297] w-full max-w-[340px] rotate-[1.5deg] rounded-sm bg-sheet p-7 shadow-[0_24px_60px_-20px_rgba(28,27,25,0.35)]">
            <div className="border-b border-line pb-4">
              <div className="font-display text-2xl font-semibold">Camille Exemple</div>
              <div className="mt-1 text-xs tracking-[0.18em] text-accent uppercase">
                Profil fictif
              </div>
            </div>
            {[0, 1, 2].map((section) => (
              <div key={section} className="mt-5">
                <div className="h-2 w-20 rounded bg-accent/80" />
                <div className="mt-3 space-y-1.5">
                  <div className="h-1.5 w-full rounded bg-paper-2" />
                  <div className="h-1.5 w-11/12 rounded bg-paper-2" />
                  <div className="h-1.5 w-3/4 rounded bg-paper-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-5 text-center text-xs text-ink-soft">
        Un service GF Web
      </footer>
    </main>
  );
}
