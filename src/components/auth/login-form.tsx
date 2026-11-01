"use client";

import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { authMessage, oauthMessage, safeNext } from "@/lib/auth/messages";

const inputClass =
  "h-12 w-full min-w-0 rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
const buttonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60";

export type AuthMode = "connexion" | "inscription";

// Connexion : l'adresse puis le code. Inscription : nom complet et adresse, puis le
// code. Dans les deux cas, Google est proposé s'il est configuré.
export function LoginForm({ mode = "connexion", googleEnabled = false }: { mode?: AuthMode; googleEnabled?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("suite"));
  const suite = params.get("suite") ? `?suite=${encodeURIComponent(next)}` : "";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [google, setGoogle] = useState(false);
  // Retour d'un échec Google (NextAuth renvoie ?error=... sur cette page).
  const [hint, setHint] = useState<"inconnu" | "existe" | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(() => oauthMessage(params.get("error")));
  const [info, setInfo] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function requestCode(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    setHint(null);
    try {
      const res = await fetch("/api/auth/code", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "inscription" ? { mode, email: email.trim(), name: name.trim() } : { mode, email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      if (!res.ok) {
        setError(data.error ?? "Impossible d'envoyer le code. Réessayez.");
        setHint(data.code === "inconnu" || data.code === "existe" ? data.code : null);
        if (step === "code") setStep("email");
        return;
      }
      setHint(null);
      setCode("");
      setStep("code");
      if (step === "code") setInfo("Un nouveau code vient d'être envoyé.");
    } catch {
      setError("Connexion au serveur impossible. Vérifiez votre réseau.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e?: FormEvent, value = code) {
    e?.preventDefault();
    if (!/^\d{6}$/.test(value) || busy) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await signIn("code", { email: email.trim(), code: value, redirect: false });
      if (res?.ok && !res.error) {
        router.replace(next);
        router.refresh();
        return;
      }
      setError(authMessage(res?.error));
      setCode("");
      codeRef.current?.focus();
    } catch {
      setError("Connexion au serveur impossible. Vérifiez votre réseau.");
    } finally {
      setBusy(false);
    }
  }

  async function withGoogle() {
    setGoogle(true);
    setError(null);
    // Redirection complète vers Google, retour ici en cas d'échec.
    await signIn("google", { callbackUrl: next });
  }

  if (step === "email") {
    const otherHref = `${mode === "inscription" ? "/connexion" : "/inscription"}${suite}`;
    return (
      <div key="email" className="anim-fade-up mt-8 grid grid-cols-1 gap-5">
        {googleEnabled ? (
          <>
            <button
              type="button"
              onClick={() => void withGoogle()}
              disabled={google}
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-6 font-semibold text-ink shadow-sm hover:border-ink-soft/40 hover:shadow disabled:opacity-60"
            >
              {google ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <GoogleMark />}
              Continuer avec Google
            </button>
            <div className="flex items-center gap-3 text-xs text-ink-soft" aria-hidden>
              <span className="h-px flex-1 bg-line" />
              ou avec votre e-mail
              <span className="h-px flex-1 bg-line" />
            </div>
          </>
        ) : null}

        <form onSubmit={requestCode} className="grid grid-cols-1 gap-4">
          {mode === "inscription" ? (
            <label className="grid grid-cols-1 gap-1.5">
              <span className="text-sm font-medium">Nom complet</span>
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                autoCapitalize="words"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </label>
          ) : null}
          <label className="grid grid-cols-1 gap-1.5">
            <span className="text-sm font-medium">Adresse e-mail</span>
            <input
              type="email"
              name="email"
              required
              maxLength={254}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          {error && (
            <p role="alert" className="anim-pop rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}{" "}
              {hint ? (
                <Link href={otherHref} className="font-semibold underline underline-offset-4">
                  {hint === "inconnu" ? "Créer un compte" : "Se connecter"}
                </Link>
              ) : null}
            </p>
          )}
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {mode === "inscription" ? "Créer mon compte" : "Continuer"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft">
          {mode === "inscription" ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <Link href={otherHref} className="font-semibold text-accent underline-offset-4 hover:underline">
            {mode === "inscription" ? "Se connecter" : "Créer un compte"}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form key="code" onSubmit={submitCode} className="anim-fade-up mt-8 grid grid-cols-1 gap-4">
      <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-4">
        <MailCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <p className="min-w-0 text-sm">
          Saisissez le code envoyé à <strong className="break-all">{email.trim()}</strong>.
        </p>
      </div>
      <label className="grid grid-cols-1 gap-1.5">
        <span className="text-sm font-medium">Code à 6 chiffres</span>
        <input
          ref={codeRef}
          name="code"
          required
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(v);
            if (v.length === 6) void submitCode(undefined, v);
          }}
          className={`${inputClass} text-center font-mono text-2xl tracking-[0.4em]`}
        />
      </label>
      {error && (
        <p role="alert" className="anim-pop rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {info && (
        <p role="status" className="anim-pop rounded-xl bg-paper-2 px-4 py-3 text-sm">
          {info}
        </p>
      )}
      <button type="submit" disabled={busy || code.length !== 6} className={buttonClass}>
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Valider
      </button>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setError(null);
            setInfo(null);
          }}
          className="h-10 rounded-full px-2 text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        >
          Changer d&apos;adresse
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void requestCode()}
          className="h-10 rounded-full px-2 text-ink-soft underline-offset-4 hover:text-ink hover:underline disabled:opacity-60"
        >
          Renvoyer un code
        </button>
      </div>
    </form>
  );
}

// Logo « G » de Google, utilisé tel quel pour le bouton de connexion (charte Google).
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
