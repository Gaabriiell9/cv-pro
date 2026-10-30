"use client";

import { Loader2, MailCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { authMessage, safeNext } from "@/lib/auth/messages";

const inputClass =
  "h-12 w-full min-w-0 rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
const buttonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("suite"));

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    try {
      const res = await fetch("/api/auth/code", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Impossible d'envoyer le code. Réessayez.");
        return;
      }
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

  if (step === "email") {
    return (
      <form onSubmit={requestCode} className="mt-8 grid grid-cols-1 gap-4" noValidate={false}>
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
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={buttonClass}>
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Recevoir mon code
        </button>
        <p className="text-xs text-ink-soft">
          Votre adresse sert uniquement à vous connecter. Aucune lettre d&apos;information, aucun partage.
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={submitCode} className="mt-8 grid grid-cols-1 gap-4">
      <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-4">
        <MailCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <p className="min-w-0 text-sm">
          Code envoyé à <strong className="break-all">{email.trim()}</strong>. Il est valable 15 minutes. Pensez à regarder dans les indésirables.
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
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {info && (
        <p role="status" className="rounded-xl bg-paper-2 px-4 py-3 text-sm">
          {info}
        </p>
      )}
      <button type="submit" disabled={busy || code.length !== 6} className={buttonClass}>
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Me connecter
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
