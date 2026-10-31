"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { useEditor } from "@/lib/editor/store";

const OUTPUT_SIZE = 480; // px : net à l'impression pour une photo de 28 mm
const MAX_FILE_BYTES = 15 * 1024 * 1024;

// Recadre l'image dans le navigateur. La photo d'origine n'est jamais envoyée :
// seul le carré recadré (JPEG léger) est gardé dans le brouillon local.
async function cropToDataUrl(src: string, area: Area): Promise<string> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponible");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function CropDialog({ src, onCancel, onDone }: { src: string; onCancel: () => void; onDone: (dataUrl: string) => void }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  async function confirm() {
    if (!area) return;
    setBusy(true);
    try {
      onDone(await cropToDataUrl(src, area));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="anim-fade fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-6">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-recadrage"
        className="anim-pop flex h-[100dvh] w-full flex-col bg-white outline-none sm:h-auto sm:max-w-md sm:rounded-2xl"
      >
        <h2 id="titre-recadrage" className="px-4 pb-2 pt-4 font-display text-lg font-semibold">
          Recadrer la photo
        </h2>
        <div className="relative min-h-0 flex-1 bg-ink sm:h-80 sm:flex-none">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, px) => setArea(px)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <label className="grid grid-cols-1 gap-1 text-sm text-ink-soft">
            Zoom
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="accent-accent" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onCancel} className="h-12 rounded-xl border border-line font-medium">
              Annuler
            </button>
            <button type="button" onClick={confirm} disabled={busy || !area} className="h-12 rounded-xl bg-accent font-semibold text-accent-ink disabled:opacity-60">
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PhotoField() {
  const photo = useEditor((s) => s.photo);
  const setPhoto = useEditor((s) => s.setPhoto);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (source) URL.revokeObjectURL(source);
  }, [source]);

  function onFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Formats acceptés : JPEG, PNG ou WebP.");
    if (file.size > MAX_FILE_BYTES) return setError("Cette image est trop lourde (15 Mo maximum).");
    setSource(URL.createObjectURL(file));
  }

  return (
    <div className="flex items-center gap-3">
      <div className="size-16 shrink-0 overflow-hidden rounded-full border border-line bg-paper-2">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Votre photo" className="size-full object-cover" />
        ) : (
          <ImagePlus className="m-auto mt-[22px] size-5 text-ink-soft" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} className="h-10 rounded-lg border border-line px-3 text-sm font-medium hover:border-accent">
            {photo ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {photo ? (
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-ink-soft hover:bg-paper-2 hover:text-red-800"
            >
              <Trash2 className="size-4" aria-hidden />
              Retirer
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-ink-soft">Facultative. Elle reste sur votre appareil.</p>
        {error ? (
          <p role="alert" className="mt-1 text-xs text-red-800">
            {error}
          </p>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {source ? (
        <CropDialog
          src={source}
          onCancel={() => setSource(null)}
          onDone={(dataUrl) => {
            setPhoto(dataUrl);
            setSource(null);
          }}
        />
      ) : null}
    </div>
  );
}
