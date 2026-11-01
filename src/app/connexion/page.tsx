import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { GOOGLE_ENABLED } from "@/lib/auth/options";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte CV Pro.",
  alternates: { canonical: "/connexion" },
};

export default function ConnexionPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-16 pt-10 sm:pt-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Connexion</h1>
        <Suspense fallback={<div className="mt-8 h-40" />}>
          <LoginForm mode="connexion" googleEnabled={GOOGLE_ENABLED} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
