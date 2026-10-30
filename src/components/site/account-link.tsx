"use client";

import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Lien de compte : « Connexion » ou « Mon compte » selon la session.
export function AccountLink({ compact = false }: { compact?: boolean }) {
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const href = loggedIn ? "/compte" : "/connexion";
  const label = loggedIn ? "Mon compte" : "Connexion";

  if (compact) {
    return (
      <Link
        href={href}
        aria-label={label}
        title={label}
        className={`inline-flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-paper-2 hover:text-ink ${status === "loading" ? "opacity-0" : ""}`}
      >
        <CircleUserRound className="size-6" aria-hidden />
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-sm sm:px-3 font-medium text-ink-soft hover:bg-paper-2 hover:text-ink ${status === "loading" ? "invisible" : ""}`}
    >
      <CircleUserRound className="size-4" aria-hidden />
      <span className="max-sm:sr-only">{label}</span>
    </Link>
  );
}
