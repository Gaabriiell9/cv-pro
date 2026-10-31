"use client";

import { Download, FileText, Loader2, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const card = "rounded-2xl border border-line bg-white p-5 sm:p-6";
const ghostButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold hover:border-accent disabled:opacity-60";

export function AccountPanel() {
  const { data, status } = useSession();
  const email = data?.user?.email ?? "";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="mt-10 flex justify-center">
        <Loader2 className="size-5 animate-spin" aria-label="Chargement" />
      </div>
    );
  }

  async function deleteAccount() {
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
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Connexion au serveur impossible. Vérifiez votre réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-5">
      <section className={`anim-fade-up ${card}`} style={{ "--i": 0 } as React.CSSProperties} aria-labelledby="titre-identite">
        <h2 id="titre-identite" className="text-sm font-medium text-ink-soft">
          Connecté avec
        </h2>
        <p className="mt-1 break-all text-lg font-semibold">{email}</p>
        <button type="button" onClick={() => void signOut({ callbackUrl: "/" })} className={`${ghostButton} mt-4`}>
          <LogOut className="size-4" aria-hidden />
          Me déconnecter
        </button>
      </section>

      <section className={`anim-fade-up ${card}`} style={{ "--i": 1 } as React.CSSProperties} aria-labelledby="titre-cv">
        <h2 id="titre-cv" className="font-display text-xl font-semibold">
          Mes CV
        </h2>
        <p className="mt-2 text-sm text-ink-soft text-pretty">
          L&apos;enregistrement de vos CV dans votre compte arrive bientôt. En attendant, votre CV en cours reste enregistré sur cet appareil.
        </p>
        <Link
          href="/editeur"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink hover:opacity-90"
        >
          <FileText className="size-4" aria-hidden />
          Ouvrir l&apos;éditeur
        </Link>
      </section>

      <section className={`anim-fade-up ${card}`} style={{ "--i": 2 } as React.CSSProperties} aria-labelledby="titre-donnees">
        <h2 id="titre-donnees" className="font-display text-xl font-semibold">
          Mes données
        </h2>
        <p className="mt-2 text-sm text-ink-soft text-pretty">
          Téléchargez une copie de toutes les données liées à votre compte (format JSON).
        </p>
        <a href="/api/compte/export" download className={`${ghostButton} mt-4`}>
          <Download className="size-4" aria-hidden />
          Exporter mes données
        </a>
      </section>

      <section className="anim-fade-up rounded-2xl border border-red-200 bg-red-50/40 p-5 sm:p-6" style={{ "--i": 3 } as React.CSSProperties} aria-labelledby="titre-suppression">
        <h2 id="titre-suppression" className="font-display text-xl font-semibold">
          Supprimer mon compte
        </h2>
        <p className="mt-2 text-sm text-ink-soft text-pretty">
          Votre compte, vos CV enregistrés et vos droits sont effacés définitivement.
        </p>
        {!confirmOpen ? (
          <button type="button" onClick={() => setConfirmOpen(true)} className={`${ghostButton} mt-4 text-red-800 hover:border-red-400`}>
            <Trash2 className="size-4" aria-hidden />
            Supprimer mon compte
          </button>
        ) : (
          <form
            className="anim-pop mt-4 grid grid-cols-1 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void deleteAccount();
            }}
          >
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
                  setConfirmOpen(false);
                  setConfirmation("");
                  setError(null);
                }}
                className={ghostButton}
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
