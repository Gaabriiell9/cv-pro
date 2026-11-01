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

- **Parcours** (changé le 01/11/2026) : **compte obligatoire** pour créer un CV. `/editeur` est protégé par `src/proxy.ts` (sans session : `/inscription?suite=<adresse d'origine>`). Le CV est enregistré dans le compte (table `Resume`, un CV par compte pour l'instant) et retrouvé à chaque connexion, sur tout appareil.
- **Gratuit pour l'instant** (décision du 30/10/2026) : tout le site est gratuit, les 18 designs compris. Interrupteur `PAID_ENABLED = false` dans `src/lib/site.ts` : tant qu'il est faux, `TEMPLATES` marque chaque design `free: true` et l'interface n'affiche ni Pass ni badge « Gratuit ». Le champ `free` de chaque design décrit l'offre future (6 gratuits) ; les offres ci-dessous restent le plan si le payant est réactivé.
- **Designs** : 18 au lancement. Si le payant revient : 6 gratuits, badge « payant » visible dès le choix du design (jamais de mur payant surprise).
- **Offres** : paiement unique, **aucun renouvellement** :
  - Gratuit : 6 designs, export PDF illimité sans filigrane, 2 CV dans le compte.
  - Pass 30 jours : 5,90 €. Pass 1 an : 19,90 €. Tous les designs, couleur et police libres, CV illimités.
  - À la fin d'un pass, rien n'est perdu (CV modifiables et exportables avec les designs gratuits).
  - Checkout Stripe en mode paiement, case de renoncement au droit de rétractation (contenu numérique).
- **Langues** : interface en français ; contenu du CV en français, anglais ou portugais (titres de section traduits).
- **Comptes** (30/10 et 01/11/2026) : sans mot de passe. Code à 6 chiffres envoyé par e-mail à **chaque** connexion (15 min, 5 essais, haché en HMAC avec `NEXTAUTH_SECRET`, usage unique). Session JWT de 30 jours.
  - **Inscription** (`/inscription`) : nom complet + e-mail, puis code. Le nom est gardé sur le code (`EmailCode.name`, `purpose = "inscription"`) et recopié sur `User.name` à la validation. Adresse déjà inscrite : 409 avec lien « Se connecter ».
  - **Connexion** (`/connexion`) : réservée aux comptes existants (adresse inconnue : 404 avec lien « Créer un compte »). Choix assumé : on dit si une adresse a un compte (les limites de débit passent avant ce contrôle).
  - **Google** : `GoogleProvider` (PKCE + state, `prompt=select_account`), actif seulement si `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont réglés dans Vercel (le bouton n'apparaît qu'alors, valeur lue au build : redéployer après les avoir ajoutés). Seule une adresse vérifiée par Google est acceptée ; même adresse = même compte que le code e-mail. Nom repris de Google si vide, aucune photo conservée. URI de redirection : `https://cv-pro.gf-web.fr/api/auth/callback/google`.
  - L'e-mail d'inscription ne reprend que les lettres du prénom (aucun lien injectable).
- **Bouton « Tenir sur une page »** : réduit espacements puis taille du texte, dans des limites lisibles.

## Architecture

- Next.js 16 (App Router, `src/`), TypeScript, Tailwind v4 + shadcn/ui, Prisma 5, NextAuth v4 (JWT), TanStack Query v5, react-hook-form + Zod v4 (formulaires de compte), Zustand (état de l'éditeur), @dnd-kit (glisser-déposer tactile), Framer Motion, Sonner.
- **Contenu du CV** : une colonne JSON `Resume.content` validée par Zod (`schemaVersion`). Même objet en local et en base.
- **Designs** : 18 designs déclarés avec `defineTemplate` (`src/templates/kit.ts`) dans `src/templates/designs/<famille>.ts`, catalogue dans `src/templates/index.ts`. Tous partagent la même structure HTML (en-tête, `.flow` ou `.cols` > `.main` + `.side`) ; un design choisit sa disposition (`single`, `side-left`, `side-right`), la place de l'en-tête (`top`, `main`, `side`), le rendu des compétences (`inline`, `list`, `bars`, `tags`) et son CSS préfixé `.cv-<id>`. La même source sert à l'aperçu (iframe) et au PDF.
- **Page A4** : `@page { margin: 0 }`. Les marges sont le rembourrage de `.cv` (ou des colonnes) avec `box-decoration-break: clone`, répété en haut et en bas de chaque page. Les fonds pleine page (colonne colorée, papier crème, triangles) se posent sur `html { background }` : Chromium les répète sur chaque page.
- **Gratuits** : tous tant que `PAID_ENABLED` est faux. Sinon 6 (classique, epure, horizon, colonne, portrait, serif) ; les autres demandent un Pass : aperçu libre, l'éditeur l'annonce au clic sur PDF, et `/api/pdf` renvoie 402.
- **PDF** : `POST /api/pdf` (Node, cdg1) imprime le HTML avec puppeteer-core + @sparticuz/chromium (`src/lib/pdf/generate.ts`). Polices intégrées en data URL, JavaScript désactivé, toute requête réseau bloquée. Rien n'est stocké. Limite : 20 PDF par 10 minutes et par visiteur. `GET /api/pdf` renvoie le CV fictif sur les prévisualisations Vercel uniquement (test).
- **En local** : les binaires Prisma ne se téléchargent pas dans le bac à sable ; un bouchon non versionné dans `src/generated/prisma` permet `tsc` et `next build`. Le vrai client est généré sur Vercel.
- **Gabarits** : chaque design est un module TS (`src/templates/<slug>/index.ts`) qui produit du HTML via le tag `html` de `src/lib/resume/html.ts` (échappement automatique). Pas de React dans les designs : le même code tourne dans l'aperçu (navigateur) et le PDF (serveur). Document A4 commun : `src/lib/resume/document.ts`.
- **Règles pour un design** (vérifiées par `npm run ats`) :
  - pas de `letter-spacing` au-delà de 0.04em sur du texte (sinon les ATS lisent « E X P É R I E N C E »), ni négatif sur les grands titres (« CamilleExemple ») ;
  - **jamais** `position` (relative, absolute), `opacity`, `clip-path`, `transform` ou `filter` sur un élément qui contient du texte : Chromium écrit alors ce texte ailleurs dans le PDF et l'ordre de lecture casse. Décors : fonds (`background`, dégradés), bordures, pseudo-éléments en `inline-block` ou en flux, `box-shadow` ;
  - ordre du HTML = ordre de lecture ; titres de section standards ; aucun texte en image ;
  - `break-inside: avoid` sur les blocs, `break-after: avoid` sur les titres.
- **Polices** : uniquement des polices libres auto-hébergées. Le site utilise les fichiers variables (`public/fonts/*.woff2` via `next/font/local`). Les CV utilisent des fichiers **statiques par graisse** (`public/fonts/cv/`, 400, 400 italique, 600, 700) : les polices variables seraient intégrées au PDF en Type 3, mal lu par les ATS. Jamais de CDN Google Fonts.
- **Test ATS** : `CHROME_PATH=<chrome> npm run ats` génère le PDF du CV fictif (avec photo) pour chaque design et vérifie : nom lu en premier, chaque bloc dans l'ordre, blocs non mélangés, 1 page, aucune police Type 3. Lecture « flux » (`pdftotext -raw`) obligatoire pour tous ; lecture « par position » obligatoire seulement pour les designs `atsOptimized` (les 2 colonnes y mélangent les colonnes : limite connue, d'où l'absence de badge). Le badge « Optimisé ATS » n'est donné qu'aux designs qui passent les deux.
- **Vignettes** : `CHROME_PATH=<chrome> npm run thumbs` régénère `public/modeles/<id>.webp` (480 px) et `<id>-grand.webp` (1000 px). À relancer après toute modification d'un design. Photo d'exemple : `public/exemple/photo-fictive.jpg` (illustration, aucune vraie personne), montrée sur les familles moderne, photo et créatif.
- **Photos** : enregistrées avec le CV dans `Resume.photo` (data URL JPEG 480 px recadrée dans le navigateur, environ 50 Ko, validée par `photoDataUrlSchema`), supprimées avec le CV ou le compte. `photoKey` est réservé à un éventuel passage vers un bucket privé.
- **Enregistrement du CV** : `GET/PUT /api/cv` (propriétaire uniquement, `rejectForeignRequest`, 1,2 Mo maximum, 600 enregistrements par 10 min et par compte). Côté client, `useCloudSync` (`src/lib/editor/cloud.ts`) : charge le CV du compte à l'ouverture, enregistre 1,2 s après chaque modification, renvoie à la fermeture de l'onglet (`keepalive`), réessaie hors ligne. La copie locale IndexedDB porte `owner` (compte) et `syncedAt` : une copie d'un autre compte n'est jamais affichée ni envoyée, et `clearLocalDraft()` l'efface à la déconnexion et à la suppression du compte. Modifications locales non envoyées du même compte : elles gagnent sur la base (dernier enregistrement l'emporte).
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
- E-mails : Resend, compte dédié à CV Pro, domaine `cv-pro.gf-web.fr` vérifié (région eu-west-1), expéditeur `CV Pro <connexion@cv-pro.gf-web.fr>`. Clé en envoi seul limitée à ce domaine (`RESEND_API_KEY` dans Vercel). Quota de 100/jour : plafond global de 90 codes par jour dans `/api/auth/code`, plus 6 par 10 min par visiteur et 3 par 15 min par adresse. Toujours une version texte, toujours vérifier `error` dans la réponse (le SDK ne lève pas d'exception), `escapeHtml()` sur tout contenu dynamique.
- Paiement : Stripe (compte GF Web), checkout + portail client (factures) + webhook idempotent (`StripeEvent`).

## Règles techniques (apprises sur QuickDevis)

- Next 16 : l'aiguillage se fait dans `src/proxy.ts` (fonction `export function proxy`). Pas de `middleware.ts`. En production, `getToken({ ..., secureCookie: true })`.
- Zod v4 : `z.email()`, `error.issues[0]`, jamais `z.nativeEnum`, jamais `.default()` avec zodResolver.
- Route handlers : `params` est une Promise, toujours `await params`.
- Fetch côté client : toujours `credentials: "include"`.
- Chaque requête filtre par propriétaire (`where: { id, userId }`), jamais de `?? undefined` dans un filtre.
- Jetons et codes stockés hachés. Limitation de débit sur les routes sensibles et publiques.

## Sécurité (audit du 30/10/2026)

- **En-têtes** (`next.config.ts`) : CSP stricte (tout en `'self'`, `frame-ancestors 'none'`, `object-src 'none'`), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `poweredByHeader: false`. Les scripts en ligne restent permis (pages statiques de Next). Tout nouveau domaine externe doit être ajouté à la CSP.
- **Document du CV** : sa propre CSP (`default-src 'none'`, polices et images en `data:` ou du site), en plus de l'iframe sans script et du PDF sans JavaScript ni réseau.
- **CSRF** : toute route qui modifie ou coûte (`/api/auth/code`, `/api/pdf`, `DELETE /api/compte`) appelle `rejectForeignRequest` (`src/lib/security/request.ts`) : en-tête `Origin` du site obligatoire et corps `application/json`. À reprendre sur chaque nouvelle route POST, PUT, PATCH ou DELETE.
- **Redirection après connexion** : `safeNext` résout l'URL et exige la même origine (bloque `/\t/site.fr`, `/.//site.fr`, etc.). Ne jamais rediriger vers une valeur venue de l'URL sans elle.
- **Codes** : l'essai est réservé atomiquement avant la comparaison (5 essais maximum même en parallèle). Limites de vérification : 15 par 10 min par visiteur, 10 par heure et 30 par jour par adresse. Envoi : 6 par 10 min et 20 par jour par visiteur, 3 par 15 min par adresse, 90 par jour au total.
- **IP** : `x-forwarded-for` est réécrit par Vercel (pas d'usurpation possible tant que Cloudflare reste en « DNS only »).
- **Base** : RLS sans politique **et** aucun droit pour `anon` et `authenticated` (migration `20261030_revoquer_roles_publics`, droits par défaut compris).
- **Dépendances** : `npm audit` à zéro. Vérifié : Next 16.4.3 (corrige le contournement du proxy CVE-2026-44575), next-auth 4.24.15 (corrige CVE-2026-73418 et CVE-2026-73420), React 19.3.1. Relancer `npm audit` et vérifier les avis Next, React et next-auth avant chaque mise en production importante.

## RGPD et CNIL

- Ne stocker que le nécessaire : compte (e-mail, nom) et CV (photo comprise). Le PDF n'est jamais conservé.
- Export des données et suppression complète du compte (CV, photos, droits) depuis `/compte`.
- Aucun cookie non essentiel. Mesure d'audience sans cookie (Vercel Web Analytics).
- Pages : mentions légales, CGU/CGV, confidentialité.

## Interface

- Mobile d'abord. Vérifier chaque écran avec de vraies captures Playwright (téléphone et ordinateur) avant de dire que c'est fini.
- Débordement horizontal : tester avec `isMobile: true` et comparer `innerWidth` à la largeur de l'écran (`visualViewport.width`), pas seulement `scrollWidth > innerWidth` (sur mobile la mise en page s'élargit et le test naïf ne voit rien).
- Grilles : toujours `grid-cols-1` (ou `grid-cols-[minmax(0,1fr)]`), jamais `grid` seul : une colonne implicite grandit avec la largeur minimale des champs. Les `<input>` ont `min-w-0`, et tout élément `truncate` dans un flex a un parent `min-w-0`.
- Designs : les éléments vides et les sections sans contenu ne s'affichent pas (`filledItems` dans `src/templates/shared.ts`).
- Direction « papeterie » : fond papier chaud, encre, un accent vert sapin (`globals.css`), titres Fraunces, texte Instrument Sans.
- Aucune fausse donnée dans les champs de formulaire (pas de placeholder « Jean Dupont »). Les exemples de la galerie sont des CV clairement fictifs.
- **Mouvement** (`globals.css`, section « Mouvement ») : durées courtes (`--dur-fast` 160 ms, `--dur` 260 ms, `--dur-slow` 420 ms), courbe `--ease-out`. Classes `anim-fade`, `anim-fade-up` (cascade avec la variable `--i`), `anim-pop` à poser sur ce qui apparaît. Blocs repliables : composant `Collapse` (`src/components/ui/collapse.tsx`, classe `cv-collapse`, jamais `collapse` qui est une classe Tailwind). Pages : `<ViewTransition>` de React autour des pages (layout), en-tête nommé `site-header` (immobile), vignette de modèle et grande image liées par `name="modele-<id>"` (`share="morph"`). Aperçu : deux iframes en fondu croisé (plus de flash). Tout est coupé si l'appareil demande de réduire les animations. Ne jamais animer un élément des designs de CV (règles ATS), seulement l'interface du site.
- Référencement : titres, descriptions, sitemap, pages « modèle de CV », « CV gratuit », etc. (le site est en `noindex` jusqu'au lancement).

## État

- Étape 1 (faite) : squelette, schéma Prisma, base Supabase, projet Vercel, domaine.
- Étape 2 (faite) : schéma Zod du contenu (`src/lib/resume/schema.ts`), design Classique, aperçu (`/apercu`, page technique) et PDF de bout en bout, test ATS.
- Étape 3 (faite) : éditeur `/editeur` (`src/components/editor/`, store `src/lib/editor/store.ts`). Brouillon dans IndexedDB (clé `cv-pro:brouillon`, validé par Zod au chargement), sections réordonnables (@dnd-kit, poignée, appui maintenu sur tactile), éléments repliables avec monter/descendre, photo recadrée dans le navigateur (react-easy-crop, JPEG 480 px), panneau Design (couleur, police, espacement, forme de photo, langue du CV). Téléphone : onglets en bas (Contenu, Design, Aperçu) ; ordinateur : aperçu permanent à droite.
- Étape 4 (faite) : 18 designs, galerie `/modeles` (par famille), pages `/modeles/<id>` statiques (description, badges, grande vignette, « Utiliser ce modèle » vers `/editeur?modele=<id>`), en-tête et pied communs (`src/components/site/`), `sitemap.ts`, `robots.ts` (fermé tant que `LAUNCHED` est faux dans `src/lib/site.ts`). Éditeur : vignettes dans le panneau Design, niveau facultatif des compétences.
- Étape 5a (faite) : connexion par code (`/connexion`, `src/lib/auth/`, `/api/auth/code`, NextAuth fournisseur `code`), `/compte` (déconnexion, export JSON `/api/compte/export`, suppression `DELETE /api/compte` avec saisie de l'e-mail), `src/proxy.ts` protège `/compte`. Logo (`src/app/icon.svg`, `favicon.ico`, `apple-icon.png`, composant `src/components/site/logo.tsx`) dans les en-têtes et l'onglet.
  - `secureCookie` du proxy : vrai dès que `NEXTAUTH_URL` est en https (ou absent, cas des prévisualisations Vercel), comme NextAuth.
- Connexion épurée (30/10/2026) : `/connexion` ne montre que l'adresse e-mail et un lien « Créer un compte » vers `/inscription` (même composant `LoginForm`, `mode="inscription"`). Aucune explication du mécanisme par code à l'écran.
- Étape 5b (faite le 01/11/2026) : compte obligatoire, CV enregistré dans le compte et rechargé à la connexion, statut d'enregistrement dans l'en-tête de l'éditeur, « Mon CV » dans `/compte`. Pages `/confidentialite` et `/conditions`. Connexion Google configurée (projet Google Cloud `cv-pro`, application publiée sans logo pour éviter la validation).
- Suite possible : plusieurs CV par compte (dupliquer, adapter), pré-remplir le nom du CV avec celui du compte.
