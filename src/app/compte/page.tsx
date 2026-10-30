import type { Metadata } from "next";
import { AccountPanel } from "@/components/auth/account-panel";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default function ComptePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Mon compte</h1>
        <AccountPanel />
      </main>
      <SiteFooter />
    </div>
  );
}
