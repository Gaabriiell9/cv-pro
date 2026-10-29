# CV Pro (cv-pro.gf-web.fr)

Site pour créer un beau CV en quelques minutes, sans inscription, avec de nombreux designs.
Projet de GF Web (Gabriel), indépendant de QuickDevis.

## Règles d'écriture

- Toujours répondre et écrire en français (code commenté en français, textes du site en français).
- **Ne jamais utiliser le tiret cadratin (le caractère U+2014)** : ni dans le code, ni dans les textes, ni dans les commits. Utiliser la virgule, le deux-points, le point ou les parenthèses. `AGENTS.md` (généré par Next) en contient : il est ignoré par git.
- Commits : `git -c user.name=Gaabriiell9 -c user.email=joaofarias20@icloud.com commit ...` (sinon Vercel refuse de déployer ce dépôt privé).
- Travail sur des branches, PR, fusion en squash quand les vérifications Vercel sont vertes.
- Ne jamais écrire de secret dans le code ou les messages. Variables d'environnement dans Vercel (voir `.env.example`).

## Décisions produit (validées le 29/10/2026)

- **Parcours** : CV commencé sans compte, enregistré dans le navigateur (IndexedDB). Compte facultatif pour sauvegarder, dupliquer, adapter.
- **Designs** : 18 au lancement, 6 gratuits. Badge « payant » visible dès le choix du design (jamais de mur payant surprise).
- **Offres** : paiement unique, **aucun renouvellement** :
  - Gratuit : 6 designs, export PDF illimité sans filigrane, 2 CV dans le compte.
  - Pass 30 jours : 5,90 €. Pass 1 an : 19,90 €. Tous les designs, couleur et police libres, CV illimités.
  - À la fin d'un pass, rien n'est perdu (CV modifiables et exportables avec les designs gratuits).
  - Checkout Stripe en mode paiement, case de renoncement au droit de rétractation (contenu numérique).
- **Langues** : interface en français ; contenu du CV en français, anglais ou portugais (titres de section traduits).
- **Comptes** : e-mail + mot de passe, code à 6 chiffres (15 min, haché) uniquement à l'inscription, pour économiser le quota Resend.
- **Bouton « Tenir sur une page »** : réduit espacements puis taille du texte, dans des limites lisibles.

## Architecture

- Next.js 16 (App Router, `src/`), TypeScript, Tailwind v4 + shadcn/ui, Prisma 5, NextAuth v4 (JWT), TanStack Query v5, react-hook-form + Zod v4 (formulaires de compte), Zustand (état de l'éditeur), @dnd-kit (glisser-déposer tactile), Framer Motion, Sonner.
- **Contenu du CV** : une colonne JSON `Resume.content` validée par Zod (`schemaVersion`). Même objet en local et en base.
- **Designs** : un composant React par design (`src/templates/<slug>/`), page A4 210 x 297 mm. La même source sert à l'aperçu (iframe mise à l'échelle) et au PDF.
- **PDF** : `POST /api/pdf` (Node, cdg1) imprime le HTML avec puppeteer-core + @sparticuz/chromium (`src/lib/pdf/generate.ts`). Polices intégrées en data URL, JavaScript désactivé, toute requête réseau bloquée. Rien n'est stocké. Limite : 20 PDF par 10 minutes et par visiteur. `GET /api/pdf` renvoie le CV fictif sur les prévisualisations Vercel uniquement (test).
- **En local** : les binaires Prisma ne se téléchargent pas dans le bac à sable ; un bouchon non versionné dans `src/generated/prisma` permet `tsc` et `next build`. Le vrai client est généré sur Vercel.
- **Gabarits** : chaque design est un module TS (`src/templates/<slug>/index.ts`) qui produit du HTML via le tag `html` de `src/lib/resume/html.ts` (échappement automatique). Pas de React dans les designs : le même code tourne dans l'aperçu (navigateur) et le PDF (serveur). Document A4 commun : `src/lib/resume/document.ts`.
- **Règles pour un design** (vérifiées par `npm run ats`) :
  - pas de `letter-spacing` au-delà de 0.04em sur du texte (sinon les ATS lisent « E X P É R I E N C E ») ;
  - ordre du HTML = ordre de lecture ; titres de section standards ; aucun texte en image ;
  - `break-inside: avoid` sur les blocs, `break-after: avoid` sur les titres.
- **Polices** : uniquement des polices libres auto-hébergées. Le site utilise les fichiers variables (`public/fonts/*.woff2` via `next/font/local`). Les CV utilisent des fichiers **statiques par graisse** (`public/fonts/cv/`, 400, 400 italique, 600, 700) : les polices variables seraient intégrées au PDF en Type 3, mal lu par les ATS. Jamais de CDN Google Fonts.
- **Test ATS** : `CHROME_PATH=<chrome> npm run ats` génère le PDF du CV fictif pour chaque design, l'extrait avec `pdftotext` et vérifie l'ordre du texte. À lancer après toute modification d'un design.
- **Photos** : bucket Supabase Storage privé, URL signées courtes, supprimées avec le CV ou le compte.
- **Limitation de débit** : table `RateLimit` (fenêtre fixe) dans Postgres.

## Infrastructure

- GitHub : `Gaabriiell9/cv-pro` (privé).
- Vercel : équipe « gaabriiell9's projects », déploiement auto sur main, région cdg1 (`vercel.json`).
- Domaine : cv-pro.gf-web.fr, CNAME `cv-pro` vers `cname.vercel-dns.com` chez Cloudflare en « DNS only » (nuage gris).
- Base : Supabase PostgreSQL, projet `cv-pro` (ref `yxtapammnrbigfuvdzww`, organisation Supabase « cv-pro »), région **eu-west-1 (Irlande)** : choix assumé, reste dans l'UE. Pooler en mode transaction (port 6543, `?pgbouncer=true&connection_limit=1`), utilisateur dédié `prisma` (BYPASSRLS). `DIRECT_URL` (port 5432) pour les migrations.
- Migrations : le SQL est écrit au format Prisma dans `prisma/migrations/<date>_<nom>/migration.sql`, puis appliqué en production via l'outil Supabase (`apply_migration`) **avant** la fusion. On n'utilise pas `prisma migrate deploy` (pas de table `_prisma_migrations`).
- RLS activée **sans politique** sur toutes les tables : l'API publique Supabase ne voit rien, seul l'utilisateur `prisma` lit et écrit. Toute nouvelle table doit faire de même.
- `/api/health` : vérifie la connexion à la base (renvoie seulement `ok`).
- Client Prisma généré dans `src/generated/prisma`, importé depuis `@/generated/prisma` (`src/lib/prisma.ts`).
- E-mails : Resend, domaine gf-web.fr. Quota de 100/jour partagé avec QuickDevis et gf-web.fr : envoyer le moins possible. Toujours une version texte, toujours vérifier `error` dans la réponse (le SDK ne lève pas d'exception), `escapeHtml()` sur tout contenu dynamique.
- Paiement : Stripe (compte GF Web), checkout + portail client (factures) + webhook idempotent (`StripeEvent`).

## Règles techniques (apprises sur QuickDevis)

- Next 16 : l'aiguillage se fait dans `src/proxy.ts` (fonction `export function proxy`). Pas de `middleware.ts`. En production, `getToken({ ..., secureCookie: true })`.
- Zod v4 : `z.email()`, `error.issues[0]`, jamais `z.nativeEnum`, jamais `.default()` avec zodResolver.
- Route handlers : `params` est une Promise, toujours `await params`.
- Fetch côté client : toujours `credentials: "include"`.
- Chaque requête filtre par propriétaire (`where: { id, userId }`), jamais de `?? undefined` dans un filtre.
- Jetons et codes stockés hachés. Limitation de débit sur les routes sensibles et publiques.

## RGPD et CNIL

- Ne stocker que le nécessaire. Rien côté serveur pour les visiteurs anonymes.
- Export des données et suppression complète du compte (CV, photos, droits) depuis `/compte`.
- Aucun cookie non essentiel. Mesure d'audience sans cookie (Vercel Web Analytics).
- Pages : mentions légales, CGU/CGV, confidentialité.

## Interface

- Mobile d'abord. Vérifier chaque écran avec de vraies captures Playwright (téléphone et ordinateur) avant de dire que c'est fini.
- Direction « papeterie » : fond papier chaud, encre, un accent vert sapin (`globals.css`), titres Fraunces, texte Instrument Sans.
- Aucune fausse donnée dans les champs de formulaire (pas de placeholder « Jean Dupont »). Les exemples de la galerie sont des CV clairement fictifs.
- Référencement : titres, descriptions, sitemap, pages « modèle de CV », « CV gratuit », etc. (le site est en `noindex` jusqu'au lancement).

## État

- Étape 1 (faite) : squelette, schéma Prisma, base Supabase, projet Vercel, domaine.
- Étape 2 (faite) : schéma Zod du contenu (`src/lib/resume/schema.ts`), design Classique, aperçu (`/apercu`, page technique) et PDF de bout en bout, test ATS.
- Étape 3 : l'éditeur (sections, glisser-déposer, enregistrement local, photo).
