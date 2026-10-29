"use client";

import { useState } from "react";
import { ResumePreview } from "@/components/resume-preview";
import { downloadResumePdf } from "@/lib/resume/download";
import { SAMPLE_RESUME } from "@/lib/resume/sample";
import { DEFAULT_THEME, type RenderRequest } from "@/lib/resume/schema";

const REQUEST: RenderRequest = {
  templateId: "classique",
  cvLocale: "fr",
  theme: DEFAULT_THEME,
  content: SAMPLE_RESUME,
};

export function ApercuClient() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onDownload() {
    setBusy(true);
    setMessage(null);
    const err = await downloadResumePdf(REQUEST);
    setBusy(false);
    setMessage(err);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          disabled={busy}
          className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink transition-opacity disabled:opacity-60"
        >
          {busy ? "Préparation du PDF..." : "Télécharger le PDF"}
        </button>
        {message ? (
          <p role="alert" className="text-sm text-red-800">
            {message}
          </p>
        ) : null}
      </div>
      <ResumePreview request={REQUEST} label="Aperçu du CV d'exemple" />
    </div>
  );
}
