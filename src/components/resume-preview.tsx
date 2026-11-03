"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderResumeDocument } from "@/lib/resume/document";
import { paginateResume } from "@/lib/resume/paginate";
import type { RenderRequest } from "@/lib/resume/schema";
import { getTemplate } from "@/templates";

const A4_WIDTH_PX = 793.7; // 210 mm à 96 ppp
const A4_HEIGHT_PX = (297 / 25.4) * 96; // 297 mm
const GAP_PX = 12; // bande entre deux feuilles, à l'écran (posée sur les marges vides)

// Aperçu fidèle : le même HTML que le PDF, dans une iframe sans script, mise à l'échelle,
// et découpé en pages comme le PDF (voir paginateResume). Entre deux pages, une bande
// couleur papier sépare les feuilles.
// Double tampon : le nouveau rendu se charge dans une seconde iframe cachée, puis
// les deux se croisent en fondu. Plus de flash blanc pendant la saisie.
export function ResumePreview({
  request,
  label,
  maxPages,
  onPages,
}: {
  request: RenderRequest;
  label: string;
  /** Limite l'affichage aux premières pages (miniature du tableau de bord). */
  maxPages?: number;
  /** Nombre de pages du CV affiché, à chaque changement. */
  onPages?: (pages: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frames = [useRef<HTMLIFrameElement>(null), useRef<HTMLIFrameElement>(null)];
  const [scale, setScale] = useState(0.4);
  const [pageCounts, setPageCounts] = useState([1, 1]);
  const [docs, setDocs] = useState<[string, string]>(["", ""]);
  const [active, setActive] = useState(0);
  const [pending, setPending] = useState<number | null>(null);

  const doc = useMemo(() => {
    const template = getTemplate(request.templateId);
    if (!template) return "";
    return renderResumeDocument(template, request, (file) => `/fonts/cv/${file}`);
  }, [request]);

  // Chaque nouveau document part dans l'iframe inactive. Ajustement pendant le rendu
  // (motif recommandé par React) plutôt que dans un effet.
  const [lastDoc, setLastDoc] = useState("");
  if (doc !== lastDoc) {
    setLastDoc(doc);
    const other = 1 - active;
    if (docs[active] === doc) {
      setPending(null); // retour au document affiché : on annule l'échange en cours
    } else if (docs[active] === "") {
      setPending(active); // premier affichage : directement dans l'iframe active
      setDocs((prev) => (active === 0 ? [doc, prev[1]] : [prev[0], doc]));
    } else if (docs[other] === doc) {
      // L'iframe cachée contient déjà ce document (retour à un design vu juste avant) :
      // son srcDoc ne change pas, elle ne se rechargerait jamais. On l'affiche tout de
      // suite, sauf si elle est encore en train de le charger (onLoad s'en chargera).
      if (pending !== other) setActive(other);
    } else {
      setPending(other);
      setDocs((prev) => (other === 0 ? [doc, prev[1]] : [prev[0], doc]));
    }
  }

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / A4_WIDTH_PX));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pages = pageCounts[active];
  useEffect(() => {
    onPages?.(pages);
  }, [pages, onPages]);

  function measure(index: number) {
    const d = frames[index].current?.contentDocument;
    if (!d?.body) return;
    const { pages: n } = paginateResume(d);
    setPageCounts((prev) => (prev[index] === n ? prev : index === 0 ? [n, prev[1]] : [prev[0], n]));
  }

  function onLoad(index: number) {
    measure(index);
    // Les polices peuvent finir de charger après l'événement : on remesure alors.
    void frames[index].current?.contentDocument?.fonts?.ready.then(() => measure(index));
    if (pending === index) {
      setPending(null);
      setActive(index);
    }
  }

  const shown = maxPages ? Math.min(pages, maxPages) : pages;
  const docHeight = (n: number) => n * A4_HEIGHT_PX;
  const pageH = A4_HEIGHT_PX * scale;
  const height = shown * pageH;

  return (
    <div ref={wrapRef} className="w-full">
      <div
        className="relative overflow-hidden rounded-sm shadow-[0_18px_50px_-18px_rgba(28,27,25,0.35)] transition-[height] duration-300 ease-out"
        style={{ height }}
      >
        {[0, 1].map((i) => (
          <iframe
            key={i}
            ref={frames[i]}
            title={i === active ? label : `${label} (mise à jour)`}
            aria-hidden={i !== active}
            tabIndex={-1}
            srcDoc={docs[i]}
            sandbox="allow-same-origin"
            onLoad={() => onLoad(i)}
            className="absolute left-0 top-0 origin-top-left border-0 bg-white transition-opacity duration-200 ease-out"
            style={{
              width: A4_WIDTH_PX,
              height: docHeight(pageCounts[i]),
              transform: `scale(${scale})`,
              opacity: i === active ? 1 : 0,
              zIndex: i === active ? 1 : 0,
            }}
          />
        ))}
        {/* Feuilles : ombre de chaque page, et bande papier entre deux pages. Les marges
            basse et haute des pages sont vides à cet endroit (voir paginateResume). */}
        {Array.from({ length: shown }, (_, k) => {
          const top = k * pageH + (k > 0 ? GAP_PX / 2 : 0);
          const bottom = (k + 1) * pageH - (k < shown - 1 ? GAP_PX / 2 : 0);
          return (
            <div key={k} aria-hidden="true">
              <div className="pointer-events-none absolute inset-x-0 z-[2] rounded-sm ring-1 ring-line/60" style={{ top, height: bottom - top }} />
              {k > 0 ? (
                <div
                  className="pointer-events-none absolute -inset-x-px z-[3] flex items-center justify-end bg-paper pr-1 text-[9px] font-medium leading-none text-ink-soft"
                  style={{ top: k * pageH - GAP_PX / 2, height: GAP_PX }}
                >
                  Page {k + 1}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
