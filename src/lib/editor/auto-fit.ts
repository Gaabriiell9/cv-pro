"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { countPages, fitOnePage, ladderIndex, loosen } from "@/lib/resume/fit";
import type { RenderRequest } from "@/lib/resume/schema";
import { useDebounced, useRenderRequest } from "./hooks";
import { useEditor } from "./store";

// Tenir sur une page, automatiquement.
// Le CV est mesuré en arrière-plan (iframe invisible, mêmes règles que le PDF) après
// chaque pause de saisie :
// - il déborde : on resserre l'espacement puis le texte (jusqu'à 85 %, voir fitOnePage),
//   avec une notification et « Annuler » (qui coupe l'ajustement automatique) ;
// - même au plus serré il déborde : une notification prévient la personne, une fois
//   par débordement ;
// - il a raccourci après un resserrement : on lui redonne de l'air.
// Désactivable dans le panneau Design (theme.autoFit = false).

const DELAY = 1200;

/** Ce qui compte pour la mise en page, sans les réglages que l'ajustement modifie. */
function layoutKey(r: RenderRequest): string {
  const t = r.theme;
  return JSON.stringify([r.templateId, r.cvLocale, t.font, t.photoShape, t.autoFit, r.content, r.photo ? r.photo.length : 0]);
}

export function useAutoFit(enabled: boolean) {
  const request = useDebounced(useRenderRequest(), DELAY);
  const lastKey = useRef<string | null>(null);
  const warned = useRef(false);

  useEffect(() => {
    if (!enabled || request.theme.autoFit === false) return;
    const key = layoutKey(request);
    // Rien n'a changé dans le contenu : c'est notre propre réglage qui vient d'être appliqué.
    if (key === lastKey.current) return;
    lastKey.current = key;
    let cancelled = false;
    let done = false;

    void (async () => {
      try {
        const pages = await countPages(request);
        if (cancelled) return;
        const { setTheme } = useEditor.getState();

        if (pages > 1) {
          const before = request.theme;
          const res = await fitOnePage(request);
          if (cancelled) return;
          if (res.ok) {
            warned.current = false;
            setTheme({ density: res.theme.density, scale: res.theme.scale, fitted: true });
            const pct = Math.round((res.theme.scale ?? 1) * 100);
            toast("Votre CV tient sur une page", {
              id: "cv-une-page",
              description: `Espacement resserré${pct < 100 ? `, texte à ${pct} %` : ""}, automatiquement.`,
              action: {
                label: "Annuler",
                onClick: () => setTheme({ density: before.density, scale: before.scale, fitted: before.fitted, autoFit: false }),
              },
            });
          } else if (!warned.current) {
            warned.current = true;
            toast.warning("Votre CV déborde sur une 2e page", {
              id: "cv-deborde",
              description: `Même avec l'espacement et le texte au plus serré, il ferait ${res.pages} pages. Un recruteur lit souvent une seule page : raccourcissez quelques descriptions ou retirez une rubrique moins utile.`,
              duration: 12000,
            });
          }
          return;
        }

        warned.current = false;
        toast.dismiss("cv-deborde");
        // Une page : si le CV avait été resserré, on lui redonne de l'air.
        if (request.theme.fitted && ladderIndex(request.theme) > 0) {
          const looser = await loosen(request);
          if (!cancelled && looser) {
            setTheme({ density: looser.density, scale: looser.scale, fitted: ladderIndex(looser) > 0 });
          }
        }
      } finally {
        done = true;
      }
    })();

    return () => {
      cancelled = true;
      // Mesure interrompue par une nouvelle saisie : elle sera refaite.
      if (!done) lastKey.current = null;
    };
  }, [request, enabled]);
}
