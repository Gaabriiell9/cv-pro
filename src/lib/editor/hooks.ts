"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { RenderRequest } from "@/lib/resume/schema";
import { useEditor } from "./store";

// Charge le brouillon depuis IndexedDB une fois le composant monté.
export function useEditorHydration(): boolean {
  const ready = useSyncExternalStore(
    (notify) => useEditor.persist.onFinishHydration(notify),
    () => useEditor.persist.hasHydrated(),
    () => false,
  );
  useEffect(() => {
    if (!useEditor.persist.hasHydrated()) void useEditor.persist.rehydrate();
  }, []);
  return ready;
}

// Requête de rendu (aperçu et PDF) construite à partir du brouillon.
export function useRenderRequest(): RenderRequest {
  const templateId = useEditor((s) => s.templateId);
  const cvLocale = useEditor((s) => s.cvLocale);
  const theme = useEditor((s) => s.theme);
  const content = useEditor((s) => s.content);
  const photo = useEditor((s) => s.photo);
  return useMemo(
    () => ({ templateId, cvLocale, theme, content, photo: photo ?? undefined }),
    [templateId, cvLocale, theme, content, photo],
  );
}

// Retarde une valeur : l'aperçu se met à jour après une courte pause de frappe.
export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
