import Image from "next/image";
import Link from "next/link";
import { PAID_ENABLED } from "@/lib/site";
import type { TemplateDef } from "@/templates/types";

export function TemplateBadges({ t, className = "" }: { t: TemplateDef; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {PAID_ENABLED ? (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.free ? "bg-accent text-accent-ink" : "bg-ink text-paper"}`}>
          {t.free ? "Gratuit" : "Pass"}
        </span>
      ) : null}
      <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-xs text-ink-soft">{t.columns === 1 ? "1 colonne" : "2 colonnes"}</span>
      {t.atsOptimized ? <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-xs text-ink-soft">Optimisé ATS</span> : null}
    </div>
  );
}

export function TemplateCard({ t, priority = false }: { t: TemplateDef; priority?: boolean }) {
  return (
    <Link href={`/modeles/${t.id}`} className="group block min-w-0">
      <div className="overflow-hidden rounded-md bg-white shadow-[0_10px_30px_-14px_rgba(28,27,25,0.35)] ring-1 ring-line/60 transition-transform duration-200 group-hover:-translate-y-1">
        <Image
          src={`/modeles/${t.id}.webp`}
          alt={`Aperçu du modèle de CV ${t.name}`}
          width={480}
          height={679}
          priority={priority}
          sizes="(min-width: 1024px) 260px, (min-width: 640px) 30vw, 45vw"
          className="h-auto w-full"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">{t.name}</h3>
      </div>
      <TemplateBadges t={t} className="mt-1.5" />
      <p className="mt-2 text-sm text-ink-soft text-pretty">{t.tagline}</p>
    </Link>
  );
}
