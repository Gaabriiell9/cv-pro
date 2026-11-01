"use client";

import { Check, CloudOff, Download, Eye, Loader2, Lock, Palette, PenLine, TriangleAlert, X } from "lucide-react";
import { AccountLink } from "@/components/site/account-link";
import { Logo } from "@/components/site/logo";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { type SyncStatus, useCloudSync } from "@/lib/editor/cloud";
import { ResumePreview } from "@/components/resume-preview";
import { useDebounced, useEditorHydration, useRenderRequest } from "@/lib/editor/hooks";
import { useEditor } from "@/lib/editor/store";
import { downloadResumePdf } from "@/lib/resume/download";
import { renderRequestSchema, type ResumeContent } from "@/lib/resume/schema";
import { getTemplate, TEMPLATES } from "@/templates";
import { BasicsForm } from "./basics-form";
import { DesignPanel } from "./design-panel";
import { SectionsEditor } from "./sections-editor";

type Tab = "contenu" | "design" | "apercu";

function isEmpty(c: ResumeContent): boolean {
  const b = c.basics;
  if (b.firstName || b.lastName || b.jobTitle || c.summary) return false;
  return c.sections.every((s) => (s.items as Record<string, unknown>[]).every((it) => Object.entries(it).every(([k, v]) => k === "id" || k === "level" || !v)));
}

function DownloadButton({ compact }: { compact?: boolean }) {
  const request = useRenderRequest();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passInfo, setPassInfo] = useState(false);
  const template = getTemplate(request.templateId);
  const paid = template ? !template.free : false;

  async function onClick() {
    setError(null);
    // Design du Pass : on l'annonce avant toute tentative, jamais de mauvaise surprise.
    if (paid) return setPassInfo((v) => !v);
    const parsed = renderRequestSchema.safeParse(request);
    if (!parsed.success) return setError("Un champ dépasse la longueur autorisée.");
    setBusy(true);
    const err = await downloadResumePdf(parsed.data);
    setBusy(false);
    setError(err);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-expanded={paid ? passInfo : undefined}
        className={`inline-flex h-11 items-center gap-2 rounded-full font-semibold transition-opacity disabled:opacity-70 ${
          paid ? "bg-ink text-paper" : "bg-accent text-accent-ink"
        } ${compact ? "px-4 text-sm" : "px-5"}`}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : paid ? (
          <Lock className="size-4" aria-hidden />
        ) : (
          <Download className="size-4" aria-hidden />
        )}
        {busy ? "Préparation..." : compact ? "PDF" : "Télécharger le PDF"}
      </button>
      {error ? (
        <p role="alert" className="anim-pop absolute right-0 top-full z-20 mt-2 w-64 rounded-xl bg-red-50 p-3 text-sm text-red-900 shadow-lg">
          {error}
        </p>
      ) : null}
      {passInfo ? <PassInfo templateName={template?.name ?? ""} onClose={() => setPassInfo(false)} /> : null}
    </div>
  );
}

function PassInfo({ templateName, onClose }: { templateName: string; onClose: () => void }) {
  const setTemplate = useEditor((s) => s.setTemplate);
  const freeOnes = TEMPLATES.filter((t) => t.free);
  return (
    <div role="dialog" aria-label="Design du Pass" className="absolute right-0 top-full z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-4 text-sm shadow-xl">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold">« {templateName} » est inclus dans le Pass</p>
        <button type="button" onClick={onClose} aria-label="Fermer" className="-mr-2 -mt-2 inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-paper-2">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <p className="mt-2 text-ink-soft">
        Le Pass arrive bientôt : un paiement unique, jamais d&apos;abonnement. En attendant, passez sur un design gratuit pour télécharger votre
        CV tout de suite, votre contenu est conservé.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {freeOnes.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTemplate(t.id);
              onClose();
            }}
            className="h-9 rounded-full border border-line px-3 font-medium hover:border-accent hover:text-accent"
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Preview() {
  const request = useDebounced(useRenderRequest());
  const empty = isEmpty(request.content);
  return (
    <div className="relative">
      <ResumePreview request={request} label="Aperçu de votre CV" />
      {empty ? (
        <div className="anim-fade pointer-events-none absolute inset-x-6 top-16 rounded-xl bg-paper/95 p-4 text-center text-sm text-ink-soft shadow-sm">
          Votre CV apparaîtra ici au fur et à mesure de la saisie.
        </div>
      ) : null}
    </div>
  );
}

function ResetButton() {
  const reset = useEditor((s) => s.reset);
  const [confirm, setConfirm] = useState(false);
  if (!confirm)
    return (
      <button type="button" onClick={() => setConfirm(true)} className="mx-auto h-10 rounded-lg px-3 text-sm text-ink-soft hover:bg-paper-2 hover:text-red-800">
        Tout effacer et recommencer
      </button>
    );
  return (
    <div role="alertdialog" aria-label="Confirmer l'effacement" className="anim-pop flex flex-wrap items-center gap-2 rounded-xl bg-red-50 p-3 text-sm">
      <span className="flex-1">Effacer tout le contenu de votre CV ? C&apos;est définitif.</span>
      <button type="button" onClick={() => setConfirm(false)} className="h-10 rounded-lg px-3 font-medium hover:bg-white">
        Annuler
      </button>
      <button
        type="button"
        onClick={() => {
          reset();
          setConfirm(false);
          window.scrollTo({ top: 0 });
        }}
        className="h-10 rounded-lg bg-red-800 px-3 font-medium text-white"
      >
        Effacer
      </button>
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: typeof PenLine; mobileOnly?: boolean }[] = [
  { id: "contenu", label: "Contenu", icon: PenLine },
  { id: "design", label: "Design", icon: Palette },
  { id: "apercu", label: "Aperçu", icon: Eye, mobileOnly: true },
];

// État de l'enregistrement dans le compte, affiché dans l'en-tête.
function SaveStatus({ status }: { status: SyncStatus }) {
  const map: Record<SyncStatus, { icon: React.ReactNode; text: string; tone: string }> = {
    chargement: { icon: <Loader2 className="size-3.5 animate-spin" aria-hidden />, text: "Chargement…", tone: "text-ink-soft" },
    enregistrement: { icon: <Loader2 className="size-3.5 animate-spin" aria-hidden />, text: "Enregistrement…", tone: "text-ink-soft" },
    enregistre: { icon: <Check className="size-3.5" aria-hidden />, text: "Enregistré dans votre compte", tone: "text-accent" },
    "hors-ligne": { icon: <CloudOff className="size-3.5" aria-hidden />, text: "Hors connexion : gardé sur cet appareil", tone: "text-amber-800" },
    erreur: { icon: <TriangleAlert className="size-3.5" aria-hidden />, text: "Échec de l'enregistrement, nouvel essai…", tone: "text-red-800" },
  };
  const s = map[status];
  return (
    <p role="status" aria-live="polite" className={`flex min-w-0 items-center gap-1.5 text-xs ${s.tone}`}>
      {s.icon}
      <span className="truncate max-sm:sr-only">{s.text}</span>
    </p>
  );
}

export function EditorApp() {
  const hydrated = useEditorHydration();
  const { data: session, status: authStatus } = useSession();
  const uid = authStatus === "authenticated" ? session.user.id : null;
  const sync = useCloudSync(uid, hydrated);
  // L'éditeur s'affiche une fois le CV du compte chargé (ou la copie locale si hors ligne).
  const ready = hydrated && uid !== null && sync !== "chargement";
  const [tab, setTab] = useState<Tab>("contenu");

  // Filet de sécurité (le proxy protège déjà /editeur) : sans session, direction l'inscription.
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      const suite = window.location.pathname + window.location.search;
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/inscription?suite=${encodeURIComponent(suite)}`);
    }
  }, [authStatus]);

  // Arrivée depuis la galerie (/editeur?modele=<id>) : on applique le design une fois
  // le CV chargé, puis on nettoie l'adresse.
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    const id = url.searchParams.get("modele");
    if (!id) return;
    if (getTemplate(id)) useEditor.getState().setTemplate(id);
    url.searchParams.delete("modele");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [ready]);
  // Sur ordinateur l'aperçu est toujours visible : l'onglet « Aperçu » ramène au contenu.
  const desktopTab: Tab = tab === "apercu" ? "contenu" : tab;

  function go(next: Tab) {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) {
    return (
      <div className="anim-fade flex min-h-dvh items-center justify-center text-ink-soft">
        <Loader2 className="size-5 animate-spin" aria-label="Chargement de votre CV" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-24 lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="CV Pro, accueil" className="shrink-0">
            <Logo />
          </Link>
          <div className="flex min-w-0 items-center gap-1">
            <SaveStatus status={sync} />
            <AccountLink compact />
            <div className="lg:hidden">
              <DownloadButton compact />
            </div>
            <div className="hidden lg:block">
              <DownloadButton />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-8 px-4 pt-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pt-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="min-w-0">
          {/* Onglets ordinateur */}
          <div role="tablist" aria-label="Partie de l'éditeur" className="mb-4 hidden gap-1 rounded-full bg-paper-2 p-1 lg:inline-flex">
            {TABS.filter((t) => !t.mobileOnly).map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={desktopTab === t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium ${desktopTab === t.id ? "bg-white shadow-sm" : "text-ink-soft"}`}
              >
                <t.icon className="size-4" aria-hidden />
                {t.label}
              </button>
            ))}
          </div>

          <div className={`anim-fade grid grid-cols-1 gap-3 ${tab === "contenu" ? "" : "hidden"} ${desktopTab === "contenu" ? "lg:grid" : "lg:hidden"}`}>
            <BasicsForm />
            <SectionsEditor />
            <ResetButton />
          </div>
          <div className={`anim-fade ${tab === "design" ? "" : "hidden"} ${desktopTab === "design" ? "lg:block" : "lg:hidden"}`}>
            <DesignPanel />
          </div>
          <div className={`anim-fade ${tab === "apercu" ? "" : "hidden"} lg:hidden`}>
            {tab === "apercu" ? <Preview /> : null}
          </div>
        </div>

        {/* Aperçu permanent sur ordinateur */}
        <aside className="hidden lg:block" aria-label="Aperçu">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pb-6">
            <Preview />
          </div>
        </aside>
      </div>

      {/* Onglets téléphone */}
      <nav
        aria-label="Partie de l'éditeur"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${tab === t.id ? "text-accent" : "text-ink-soft"}`}
            >
              <t.icon className="size-5" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
