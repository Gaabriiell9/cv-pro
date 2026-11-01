"use client";

import { useEffect, useRef, useState } from "react";
import { clearLocalDraft, useEditor, type CloudCv } from "./store";

// Synchronisation du CV avec le compte.
// 1. À l'ouverture : le CV du compte est chargé. Seule exception, des modifications
//    locales du même compte pas encore enregistrées (réseau coupé) : elles gagnent.
// 2. Ensuite : chaque modification est enregistrée en base après une courte pause.
// 3. Hors ligne : la copie locale garde tout, l'envoi reprend au retour du réseau.

export type SyncStatus = "chargement" | "enregistre" | "enregistrement" | "hors-ligne" | "erreur";

const SAVE_DELAY = 1200;
const RETRY_DELAY = 5000;
const KEEPALIVE_MAX = 60_000; // limite des requêtes « keepalive » envoyées à la fermeture

function snapshot(): { body: string; updatedAt: number } {
  const st = useEditor.getState();
  const cv: CloudCv = { templateId: st.templateId, cvLocale: st.cvLocale, theme: st.theme, content: st.content, photo: st.photo };
  return { body: JSON.stringify(cv), updatedAt: st.updatedAt };
}

function hasContent(): boolean {
  const { content, photo } = useEditor.getState();
  if (photo) return true;
  const b = content.basics;
  if (Object.values(b).some((v) => v.trim())) return true;
  if (content.summary.trim()) return true;
  return content.sections.some((s) => (s.items as Record<string, unknown>[]).some((it) => Object.entries(it).some(([k, v]) => k !== "id" && typeof v === "string" && v.trim())));
}

export function useCloudSync(uid: string | null, ready: boolean): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>("chargement");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!ready || !uid) return;
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const pending = () => {
      const st = useEditor.getState();
      return st.owner === uid && st.updatedAt > st.syncedAt;
    };

    async function save(): Promise<void> {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      if (cancelled || inFlight.current || !pending()) return;
      inFlight.current = true;
      const snap = snapshot();
      setStatus("enregistrement");
      try {
        const res = await fetch("/api/cv", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: snap.body,
        });
        if (res.status === 401) {
          // Session expirée : rechargement complet vers la connexion (voulu).
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign(`/connexion?suite=${encodeURIComponent("/editeur")}`);
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        useEditor.getState().markSynced(snap.updatedAt);
        if (!cancelled) setStatus(pending() ? "enregistrement" : "enregistre");
      } catch {
        if (!cancelled) {
          setStatus(navigator.onLine ? "erreur" : "hors-ligne");
          timer.current = setTimeout(() => void save(), RETRY_DELAY);
        }
      } finally {
        inFlight.current = false;
      }
      // Des modifications sont arrivées pendant l'envoi : on repart.
      if (!cancelled && pending() && !timer.current) timer.current = setTimeout(() => void save(), SAVE_DELAY);
    }

    function schedule() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void save(), SAVE_DELAY);
    }

    // Fermeture de l'onglet ou passage en arrière-plan : on envoie tout de suite.
    function flush() {
      if (!pending()) return;
      const snap = snapshot();
      if (snap.body.length <= KEEPALIVE_MAX) {
        void fetch("/api/cv", {
          method: "PUT",
          credentials: "include",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: snap.body,
        }).then((r) => r.ok && useEditor.getState().markSynced(snap.updatedAt));
      } else {
        void save();
      }
    }
    const onVisibility = () => document.visibilityState === "hidden" && flush();
    const onOnline = () => void save();

    async function init() {
      const local = useEditor.getState();
      const mine = local.owner === uid;
      const unsynced = mine && local.updatedAt > local.syncedAt;
      // Brouillon d'avant l'obligation de compte (sans propriétaire) : repris une seule fois.
      const legacy = local.owner === null && local.updatedAt > 0 && hasContent();

      let cloud: CloudCv | null = null;
      let reached = false;
      try {
        const res = await fetch("/api/cv", { credentials: "include", cache: "no-store" });
        if (res.status === 401) {
          // Session expirée : rechargement complet vers la connexion (voulu).
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign(`/connexion?suite=${encodeURIComponent("/editeur")}`);
          return;
        }
        if (res.ok) {
          reached = true;
          cloud = ((await res.json()) as { cv: CloudCv | null }).cv;
        }
      } catch {
        reached = false;
      }
      if (cancelled) return;

      if (!reached) {
        // Hors ligne : on ne montre que la copie locale de CE compte.
        if (!mine) {
          await clearLocalDraft();
          useEditor.getState().claim(uid!);
        }
        setStatus("hors-ligne");
      } else if (cloud && !unsynced) {
        useEditor.getState().loadCloud(cloud, uid!);
        setStatus("enregistre");
      } else if (cloud || mine || legacy) {
        // Modifications locales non envoyées, ou premier enregistrement d'un brouillon.
        if (!mine && !legacy) await clearLocalDraft();
        useEditor.setState({ owner: uid, updatedAt: Math.max(Date.now(), useEditor.getState().updatedAt), syncedAt: 0 });
        setStatus("enregistrement");
        void save();
      } else {
        // Nouveau compte sans CV, copie locale d'un autre compte : on repart de zéro.
        await clearLocalDraft();
        useEditor.getState().claim(uid!);
        setStatus("enregistre");
      }

      unsubscribe = useEditor.subscribe((st, prev) => {
        if (st.updatedAt !== prev.updatedAt && st.updatedAt > st.syncedAt) {
          setStatus("enregistrement");
          schedule();
        }
      });
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pagehide", flush);
      window.addEventListener("online", onOnline);
    }

    void init();
    return () => {
      cancelled = true;
      unsubscribe?.();
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("online", onOnline);
      flush();
    };
  }, [uid, ready]);

  return status;
}
