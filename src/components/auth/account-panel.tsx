"use client";

import { ArrowRight, Download, LayoutTemplate, Loader2, LogOut, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ResumePreview } from "@/components/resume-preview";
import { Collapse } from "@/components/ui/collapse";
import { clearLocalDraft } from "@/lib/editor/store";
import { downloadResumePdf } from "@/lib/resume/download";
import { renderRequestSchema, type RenderRequest, type ResumeContent } from "@/lib/resume/schema";
import { getTemplate, TEMPLATES } from "@/templates";

type StoredCv = Omit<RenderRequest, "photo"> & { photo: string | null; updatedAt: string };

const primary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink hover:opacity-90 disabled:opacity-60";
const secondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold hover:border-accent disabled:opacity-60";

// « il y a 5 minutes », « hier », « le 12 octobre »...
function since(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86_400) return rtf.format(-Math.round(diff / 3600), "hour");
  if (diff < 7 * 86_400) return rtf.format(-Math.round(diff / 86_400), "day");
  return `le ${new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
}

// Part de rubriques remplies, pour un petit indicateur de progression.
function completion(c: ResumeContent): { done: number; total: number } {
  const b = c.basics;
  const checks = [
    Boolean(b.firstName && b.lastName),
    Boolean(b.jobTitle),
    Boolean(b.email || b.phone),
    Boolean(c.summary.trim()),
    ...(["experience", "education", "skills"] as const).map((type) =>
      c.sections.some(
        (s) =>
          s.type === type &&
          s.visible &&
          (s.items as Record<string, unknown>[]).some((it) => Object.entries(it).some(([k, v]) => k !== "id" && typeof v === "string" && v.trim())),
      ),
    ),
  ];
  return { done: checks.filter(Boolean).length, total: checks.length };
}

export function AccountPanel() {
  const { data, status } = useSession();
  const email = data?.user?.email ?? "";
  const name = data?.user?.name ?? "";
  const firstName = name.split(" ")[0];
  // undefined : chargement ; null : aucun CV.
  const [cv, setCv] = useState<StoredCv | null | undefined>(undefined);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/cv", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { cv: null }))
      .then((d: { cv: StoredCv | null }) => setCv(d.cv))
      .catch(() => setCv(null));
  }, [status]);

  async function logout() {
    // La copie locale du CV est effacée de cet appareil.
    await clearLocalDraft().catch(() => {});
    await signOut({ callbackUrl: "/" });
  }

  if (status === "loading") {
    return (
      <div className="mt-16 flex justify-center">
        <Loader2 className="size-5 animate-spin" aria-label="Chargement" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <header className="anim-fade-up flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {firstName ? `Bonjour ${firstName}` : "Bonjour"}
          </h1>
          <p className="mt-1 truncate text-ink-soft">{email}</p>
        </div>
        <button type="button" onClick={() => void logout()} className={secondary}>
          <LogOut className="size-4" aria-hidden />
          Me déconnecter
        </button>
      </header>

      {cv === undefined ? (
        <div className="flex h-72 items-center justify-center rounded-3xl border border-line bg-white">
          <Loader2 className="size-5 animate-spin text-ink-soft" aria-label="Chargement de votre CV" />
        </div>
      ) : cv ? (
        <CvCard cv={cv} />
      ) : (
        <EmptyCard />
      )}

      <DangerZone email={email} onDeleted={logout} />
    </div>
  );
}

function CvCard({ cv }: { cv: StoredCv }) {
  const request = useMemo<RenderRequest>(
    () => ({ templateId: cv.templateId, cvLocale: cv.cvLocale, theme: cv.theme, content: cv.content, photo: cv.photo ?? undefined }),
    [cv],
  );
  const template = getTemplate(cv.templateId);
  const fullName = [cv.content.basics.firstName, cv.content.basics.lastName].filter(Boolean).join(" ");
  const { done, total } = completion(cv.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setError(null);
    const parsed = renderRequestSchema.safeParse(request);
    if (!parsed.success) return setError("Ouvrez votre CV pour corriger un champ trop long.");
    setBusy(true);
    setError(await downloadResumePdf(parsed.data));
    setBusy(false);
  }

  return (
    <section
      aria-labelledby="titre-cv"
      className="anim-fade-up grid grid-cols-1 gap-6 rounded-3xl border border-line bg-white p-5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:p-7"
      style={{ "--i": 1 } as React.CSSProperties}
    >
      <Link
        href="/editeur"
        aria-label="Ouvrir mon CV"
        className="group mx-auto block w-full max-w-[11rem] overflow-hidden sm:max-w-[13rem] rounded-md shadow-[0_14px_40px_-16px_rgba(28,27,25,0.4)] ring-1 ring-line/70 transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="pointer-events-none">
          <ResumePreview request={request} label="Miniature de votre CV" />
        </div>
      </Link>

      <div className="flex min-w-0 flex-col">
        <p className="text-xs font-semibold uppercase text-accent">Mon CV</p>
        <h2 id="titre-cv" className="mt-1 truncate font-display text-2xl font-semibold">
          {fullName || "CV sans nom"}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {cv.content.basics.jobTitle ? `${cv.content.basics.jobTitle} · ` : ""}
          Modèle {template?.name ?? cv.templateId} · modifié {since(cv.updatedAt)}
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>{done === total ? "CV complet" : "Rubriques remplies"}</span>
            <span>
              {done}/{total}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-2">
            <div className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out" style={{ width: `${(done / total) * 100}%` }} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/editeur" className={primary}>
            <PenLine className="size-4" aria-hidden />
            Reprendre mon CV
          </Link>
          <button type="button" onClick={() => void download()} disabled={busy} className={secondary}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Download className="size-4" aria-hidden />}
            Télécharger le PDF
          </button>
        </div>
        {error ? (
          <p role="alert" className="anim-pop mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <Link href="/modeles" className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-ink-soft hover:text-accent">
          <LayoutTemplate className="size-4" aria-hidden />
          Essayer un autre modèle
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function EmptyCard() {
  const picks = ["classique", "colonne", "portrait"].map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean);
  return (
    <section
      aria-labelledby="titre-vide"
      className="anim-fade-up overflow-hidden rounded-3xl border border-line bg-white"
      style={{ "--i": 1 } as React.CSSProperties}
    >
      <div className="flex justify-center gap-3 bg-paper-2/60 px-6 pt-8">
        {picks.map((t, i) => (
          <div
            key={t!.id}
            className={`w-24 overflow-hidden rounded-t-md shadow-[0_10px_30px_-14px_rgba(28,27,25,0.4)] ring-1 ring-line/60 sm:w-28 ${i === 1 ? "translate-y-0" : "translate-y-3"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/modeles/${t!.id}.webp`} alt="" width={480} height={679} className="block h-auto w-full" />
          </div>
        ))}
      </div>
      <div className="p-6 text-center sm:p-8">
        <Sparkles className="mx-auto size-5 text-accent" aria-hidden />
        <h2 id="titre-vide" className="mt-2 font-display text-2xl font-semibold">
          Créez votre premier CV
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft text-pretty">
          Quelques minutes suffisent. Il sera enregistré dans votre compte, et vous pourrez changer de modèle à tout moment.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/editeur" className={primary}>
            <PenLine className="size-4" aria-hidden />
            Créer mon CV
          </Link>
          <Link href="/modeles" className={secondary}>
            <LayoutTemplate className="size-4" aria-hidden />
            Voir les modèles
          </Link>
        </div>
      </div>
    </section>
  );
}

// Suppression du compte : discrète, en bas, dépliée seulement à la demande.
function DangerZone({ email, onDeleted }: { email: string; onDeleted: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/compte", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "La suppression a échoué. Réessayez.");
        return;
      }
      await onDeleted();
    } catch {
      setError("Connexion au serveur impossible. Vérifiez votre réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Supprimer mon compte" className="anim-fade-up border-t border-line pt-6" style={{ "--i": 2 } as React.CSSProperties}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="text-sm text-ink-soft underline-offset-4 hover:text-red-800 hover:underline"
      >
        Supprimer mon compte
      </button>
      <Collapse open={open}>
        <form
          className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void remove();
          }}
        >
          <p className="text-sm text-ink-soft text-pretty">
            Votre compte et votre CV (photo comprise) seront effacés définitivement. Pensez à télécharger votre PDF avant.
          </p>
          <label className="grid grid-cols-1 gap-1.5">
            <span className="text-sm font-medium">Pour confirmer, saisissez votre adresse e-mail</span>
            <input
              type="email"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="h-12 w-full min-w-0 rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-red-400"
            />
          </label>
          {error && (
            <p role="alert" className="anim-pop rounded-xl bg-red-100 px-4 py-3 text-sm text-red-900">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy || confirmation.trim().toLowerCase() !== email.toLowerCase()}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Supprimer définitivement
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmation("");
                setError(null);
              }}
              className={secondary}
            >
              Annuler
            </button>
          </div>
        </form>
      </Collapse>
    </section>
  );
}
