import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { GOOGLE_ENABLED } from "@/lib/auth/options";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte CV Pro avec votre adresse e-mail.",
  alternates: { canonical: "/inscription" },
};

export default function InscriptionPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-16 pt-10 sm:pt-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Créer un compte</h1>
        <Suspense fallback={<div className="mt-8 h-40" />}>
          <LoginForm mode="inscription" googleEnabled={GOOGLE_ENABLED} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
