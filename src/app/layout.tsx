import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import "./globals.css";

// Polices libres (OFL) stockées dans le dépôt et servies depuis notre domaine :
// aucun appel à un service tiers depuis le navigateur des visiteurs.
const display = localFont({
  src: "../../public/fonts/fraunces.woff2",
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
});

const sans = localFont({
  src: "../../public/fonts/instrument-sans.woff2",
  variable: "--font-sans",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cv-pro.gf-web.fr"),
  title: {
    default: "CV Pro : créez un beau CV en 5 minutes",
    template: "%s | CV Pro",
  },
  description:
    "Créez un CV professionnel en quelques minutes, sans inscription. Des designs variés, un export PDF lisible par les logiciels de recrutement, entièrement gratuit.",
  // Retiré au lancement public.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
