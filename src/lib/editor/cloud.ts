"use client";

import { useEffect, useRef, useState } from "react";
import { clearLocalDraft, useEditor, type CloudCv } from "./store";

// Synchronisation du CV ouvert avec le compte (plusieurs CV par compte).
// 1. À l'ouverture : le CV demandé (/editeur?cv=<id>, « nouveau » pour un CV vierge,
//    sinon le dernier ouvert ou le plus récent) est chargé depuis le compte. Seule
//    exception : des modifications locales du même CV pas encore enregistrées (réseau
//    coupé) gagnent. Si elles concernent un AUTRE CV, elles sont d'abord envoyées.
// 2. Ensuite : chaque modification est enregistrée après une courte pause. Un CV
//    vierge n'est créé en base qu'à sa première modification.
// 3. Hors ligne : la copie locale garde tout, l'envoi reprend au retour du réseau.

export type SyncStatus = "chargement" | "enregistre" | "enregistrement" | "hors-ligne" | "erreur" | "limite";

const SAVE_DELAY = 1200;
const RETRY_DELAY = 5000;
const KEEPALIVE_MAX = 60_000; // limite des requêtes « keepalive » envoyées à la fermeture

type ServerCv = CloudCv & { id: string; updatedAt: string };

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

/** Met l'identifiant du CV ouvert dans l'adresse, pour qu'un rechargement le rouvre. */
function showInUrl(cvId: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.set("cv", cvId ?? "nouveau");
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}

function toLogin(): never {
  // Session expirée : rechargement complet vers la connexion (voulu).
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/connexion?suite=${encodeURIComponent("/compte")}`);
  throw new Error("redirection");
}

class Offline extends Error {}

async function api(path: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(path, { credentials: "include", cache: "no-store", ...init });
  } catch {
    throw new Offline();
  }
  if (res.status === 401) toLogin();
  return res;
}

const jsonInit = (method: string, body: string): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, body });

/** Le CV ouvert vient de l'adresse : /editeur?cv=<id>, ?cv=nouveau, ou rien (dernier ouvert). */
export function useCloudSync(uid: string | null, ready: boolean): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>("chargement");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!ready || !uid) return;
    let cancelled = false;
    let limited = false; // limite de CV atteinte : inutile de réessayer en boucle
    let unsubscribe: (() => void) | null = null;

    const pending = () => {
      const st = useEditor.getState();
      return st.owner === uid && st.updatedAt > st.syncedAt;
    };

    /** Envoie la copie locale vers son CV (en le créant au besoin). Lève Offline si le réseau manque. */
    async function push(): Promise<void> {
      const snap = snapshot();
      const { cvId } = useEditor.getState();
      if (cvId) {
        const res = await api(`/api/cv/${cvId}`, jsonInit("PUT", snap.body));
        if (res.status === 404) {
          // CV supprimé depuis un autre appareil : on le recrée plutôt que perdre la saisie.
          useEditor.setState({ cvId: null });
          return push();
        }
        if (!res.ok) throw new Error(String(res.status));
      } else {
        const res = await api("/api/cv", jsonInit("POST", snap.body));
        if (res.status === 409) throw new Error("limite");
        if (!res.ok) throw new Error(String(res.status));
        const { cv } = (await res.json()) as { cv: ServerCv };
        useEditor.getState().setCvId(cv.id);
        if (!cancelled) showInUrl(cv.id);
      }
      useEditor.getState().markSynced(snap.updatedAt);
    }

    async function save(): Promise<void> {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      if (cancelled || inFlight.current || !pending()) return;
      if (limited && !useEditor.getState().cvId) return; // ce CV ne peut pas être créé (limite)
      inFlight.current = true;
      setStatus("enregistrement");
      try {
        await push();
        if (!cancelled) setStatus(pending() ? "enregistrement" : "enregistre");
      } catch (e) {
        if (!cancelled) {
          if (e instanceof Error && e.message === "limite") {
            limited = true;
            setStatus("limite");
          } else {
            setStatus(e instanceof Offline || !navigator.onLine ? "hors-ligne" : "erreur");
            timer.current = setTimeout(() => void save(), RETRY_DELAY);
          }
        }
      } finally {
        inFlight.current = false;
      }
      // Des modifications sont arrivées pendant l'envoi : on repart.
      if (!cancelled && pending() && !timer.current && !limited) timer.current = setTimeout(() => void save(), SAVE_DELAY);
    }

    function schedule() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void save(), SAVE_DELAY);
    }

    // Fermeture de l'onglet ou passage en arrière-plan : on envoie tout de suite.
    function flush() {
      if (!pending()) return;
      const snap = snapshot();
      const { cvId } = useEditor.getState();
      if (cvId && snap.body.length <= KEEPALIVE_MAX) {
        void fetch(`/api/cv/${cvId}`, { credentials: "include", keepalive: true, ...jsonInit("PUT", snap.body) }).then(
          (r) => r.ok && useEditor.getState().markSynced(snap.updatedAt),
        );
      } else {
        void save();
      }
    }
    const onVisibility = () => document.visibilityState === "hidden" && flush();
    const onOnline = () => void save();

    async function fetchCv(id: string): Promise<ServerCv | null> {
      const res = await api(`/api/cv/${id}`);
      if (!res.ok) return null;
      return ((await res.json()) as { cv: ServerCv }).cv;
    }

    async function init() {
      const asked = new URL(window.location.href).searchParams.get("cv");
      const target = asked === "nouveau" || (asked && /^[a-z0-9]{20,32}$/.test(asked)) ? asked : null;
      const local = useEditor.getState();
      const mine = local.owner === uid;
      // Brouillon d'avant l'obligation de compte (sans propriétaire) : repris une seule fois.
      const legacy = local.owner === null && local.updatedAt > 0 && hasContent();
      if (local.owner !== null && !mine) await clearLocalDraft(); // copie d'un autre compte : jamais montrée
      if (legacy) useEditor.setState({ owner: uid, cvId: null, syncedAt: 0, updatedAt: Math.max(Date.now(), local.updatedAt) });

      try {
        // Copie locale d'avant les CV multiples (un seul CV par compte) : elle
        // correspond au CV le plus récent du compte.
        if (mine && !local.cvId && local.syncedAt > 0) {
          const res = await api("/api/cv");
          const list = res.ok ? ((await res.json()) as { cvs: ServerCv[] }).cvs : [];
          if (list[0]) useEditor.getState().setCvId(list[0].id);
        }

        const st = useEditor.getState();
        const localId = st.owner === uid ? st.cvId : null;
        const unsent = pending() && (hasContent() || st.cvId !== null);

        // Modifications locales non envoyées d'un autre CV que celui demandé : d'abord les envoyer.
        if (unsent && target !== null && target !== localId) await push();

        let wanted = target ?? localId;
        if (wanted === "nouveau") {
          useEditor.getState().startNew(uid!);
          showInUrl(null);
          setStatus("enregistre");
        } else if (unsent && wanted === localId) {
          // Même CV avec des modifications non envoyées : elles gagnent.
          showInUrl(localId);
          setStatus("enregistrement");
          void save();
        } else {
          let cv = wanted ? await fetchCv(wanted) : null;
          if (!cv) {
            // CV demandé introuvable (supprimé) ou rien de demandé : le plus récent.
            const res = await api("/api/cv");
            const list = res.ok ? ((await res.json()) as { cvs: ServerCv[] }).cvs : [];
            cv = list[0] ?? null;
            wanted = cv?.id ?? null;
          }
          if (cancelled) return;
          if (cv) {
            useEditor.getState().loadCloud(cv, uid!, cv.id);
            showInUrl(cv.id);
          } else {
            useEditor.getState().startNew(uid!);
            showInUrl(null);
          }
          setStatus("enregistre");
        }
      } catch (e) {
        if (cancelled) return;
        if (!(e instanceof Offline)) throw e;
        // Hors ligne : on ne montre que la copie locale de CE compte.
        if (useEditor.getState().owner !== uid) useEditor.getState().startNew(uid!);
        showInUrl(useEditor.getState().cvId);
        setStatus("hors-ligne");
      }
      if (cancelled) return;

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

    void init().catch(() => {
      if (!cancelled) setStatus("erreur");
    });
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
