"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderResumeDocument } from "@/lib/resume/document";
import type { RenderRequest } from "@/lib/resume/schema";
import { getTemplate } from "@/templates";

const A4_WIDTH_PX = 793.7; // 210 mm à 96 ppp
const A4_HEIGHT_PX = 1122.5; // 297 mm

// Aperçu fidèle : le même HTML que le PDF, dans une iframe sans script, mise à l'échelle.
// Double tampon : le nouveau rendu se charge dans une seconde iframe cachée, puis
// les deux se croisent en fondu. Plus de flash blanc pendant la saisie.
export function ResumePreview({ request, label }: { request: RenderRequest; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frames = [useRef<HTMLIFrameElement>(null), useRef<HTMLIFrameElement>(null)];
  const [scale, setScale] = useState(0.4);
  const [heights, setHeights] = useState([A4_HEIGHT_PX, A4_HEIGHT_PX]);
  const [docs, setDocs] = useState<[string, string]>(["", ""]);
  const [active, setActive] = useState(0);
  const pending = useRef<number | null>(null);

  const doc = useMemo(() => {
    const template = getTemplate(request.templateId);
    if (!template) return "";
    return renderResumeDocument(template, request, (file) => `/fonts/cv/${file}`);
  }, [request]);

  // Chaque nouveau document part dans l'iframe inactive.
  useEffect(() => {
    setDocs((prev) => {
      if (prev[active] === doc) return prev;
      const target = prev[active] === "" ? active : 1 - active;
      pending.current = target;
      const next: [string, string] = [...prev];
      next[target] = doc;
      return next;
    });
    // `active` est volontairement absent : seul un nouveau document déclenche l'échange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / A4_WIDTH_PX));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onLoad(index: number) {
    const body = frames[index].current?.contentDocument?.body;
    const h = body ? Math.max(A4_HEIGHT_PX, body.scrollHeight) : A4_HEIGHT_PX;
    setHeights((prev) => {
      const next = [...prev];
      next[index] = h;
      return next;
    });
    if (pending.current === index) {
      pending.current = null;
      setActive(index);
    }
  }

  const height = heights[active];
  return (
    <div ref={wrapRef} className="w-full">
      <div
        className="relative overflow-hidden rounded-sm bg-white shadow-[0_18px_50px_-18px_rgba(28,27,25,0.35)] transition-[height] duration-300 ease-out"
        style={{ height: height * scale }}
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
            className="absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-200 ease-out"
            style={{
              width: A4_WIDTH_PX,
              height: heights[i],
              transform: `scale(${scale})`,
              opacity: i === active ? 1 : 0,
              zIndex: i === active ? 1 : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
