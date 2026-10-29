"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderResumeDocument } from "@/lib/resume/document";
import type { RenderRequest } from "@/lib/resume/schema";
import { getTemplate } from "@/templates";

const A4_WIDTH_PX = 793.7; // 210 mm à 96 ppp
const A4_HEIGHT_PX = 1122.5; // 297 mm

// Aperçu fidèle : le même HTML que le PDF, dans une iframe sans script, mise à l'échelle.
export function ResumePreview({ request, label }: { request: RenderRequest; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.4);
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT_PX);

  const doc = useMemo(() => {
    const template = getTemplate(request.templateId);
    if (!template) return "";
    return renderResumeDocument(template, request, (file) => `/fonts/cv/${file}`);
  }, [request]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / A4_WIDTH_PX));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function measure() {
    const body = frameRef.current?.contentDocument?.body;
    if (body) setContentHeight(Math.max(A4_HEIGHT_PX, body.scrollHeight));
  }

  return (
    <div ref={wrapRef} className="w-full">
      <div
        className="relative overflow-hidden rounded-sm bg-white shadow-[0_18px_50px_-18px_rgba(28,27,25,0.35)]"
        style={{ height: contentHeight * scale }}
      >
        <iframe
          ref={frameRef}
          title={label}
          srcDoc={doc}
          sandbox="allow-same-origin"
          onLoad={measure}
          className="absolute left-0 top-0 origin-top-left border-0"
          style={{ width: A4_WIDTH_PX, height: contentHeight, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}
