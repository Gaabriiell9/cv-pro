// Réglages du site public.
export const SITE_URL = "https://cv-pro.gf-web.fr";
export const SITE_NAME = "CV Pro";

// Tant que le site n'est pas lancé : noindex partout et robots.txt fermé.
// Passer à true le jour du lancement (et retirer `robots` du layout racine).
export const LAUNCHED = false;

// Offre payante (Pass) : désactivée pour l'instant, tout le site est gratuit.
// Tant que c'est faux, chaque design est traité comme gratuit (téléchargement
// compris) et l'interface ne parle ni de Pass ni de badge « Gratuit ».
export const PAID_ENABLED = false;
