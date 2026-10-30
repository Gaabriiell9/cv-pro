// Logo CV Pro : la même icône que l'onglet du navigateur (src/app/icon.svg).
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1f4d3a" />
      <path d="M19 12h19l10 10v30a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3z" fill="#f7f4ee" />
      <path d="M38 12v7a3 3 0 0 0 3 3h7z" fill="#cfd9d3" />
      <circle cx="26" cy="27" r="4.5" fill="#1f4d3a" />
      <rect x="22" y="36" width="20" height="3.2" rx="1.6" fill="#1f4d3a" />
      <rect x="22" y="42.5" width="15" height="3.2" rx="1.6" fill="#9fb3a9" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className="size-8" />
      <span className="font-display text-lg font-semibold sm:text-xl tracking-tight">CV Pro</span>
    </span>
  );
}
