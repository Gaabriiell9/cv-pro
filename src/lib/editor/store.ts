"use client";

import { del, get, set } from "idb-keyval";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import {
  DEFAULT_THEME,
  photoDataUrlSchema,
  resumeContentSchema,
  themeSchema,
  type Basics,
  type CvLocale,
  type ResumeContent,
  type Section,
  type SectionType,
  type Theme,
} from "@/lib/resume/schema";

// État de l'éditeur. Le CV est enregistré dans le compte (voir useCloudSync) ; une
// copie locale (IndexedDB), liée au compte, évite toute perte si le réseau coupe.
// Elle est effacée à la déconnexion.

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

type AnyItem = Section["items"][number];

export function emptyItem(type: SectionType): AnyItem {
  const id = newId();
  switch (type) {
    case "experience":
      return { id, role: "", company: "", city: "", start: "", end: "", description: "" };
    case "education":
      return { id, degree: "", school: "", city: "", start: "", end: "", description: "" };
    case "skills":
      return { id, name: "", level: 0 };
    case "languages":
      return { id, name: "", level: "" };
    case "interests":
      return { id, name: "" };
    case "custom":
      return { id, title: "", subtitle: "", period: "", description: "" };
  }
}

export function emptySection(type: SectionType): Section {
  return { id: newId(), type, title: "", visible: true, items: [emptyItem(type)] } as Section;
}

function emptyContent(): ResumeContent {
  return {
    basics: { firstName: "", lastName: "", jobTitle: "", email: "", phone: "", city: "", website: "", linkedin: "", extra: "" },
    summary: "",
    sections: (["experience", "education", "skills", "languages"] as const).map(emptySection),
  };
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

type Data = {
  templateId: string;
  cvLocale: CvLocale;
  theme: Theme;
  content: ResumeContent;
  photo: string | null; // data URL recadrée (JPEG 480 px)
  updatedAt: number; // dernière modification locale
  owner: string | null; // compte auquel appartient cette copie locale
  syncedAt: number; // valeur de updatedAt au dernier enregistrement réussi en base
};

/** CV tel qu'il est stocké en base. */
export type CloudCv = Pick<Data, "templateId" | "cvLocale" | "theme" | "content" | "photo">;

type Actions = {
  setBasics: (field: keyof Basics, value: string) => void;
  setSummary: (value: string) => void;
  addSection: (type: SectionType) => string;
  removeSection: (sectionId: string) => void;
  moveSection: (from: number, to: number) => void;
  setSectionTitle: (sectionId: string, title: string) => void;
  toggleSection: (sectionId: string) => void;
  addItem: (sectionId: string) => void;
  updateItem: (sectionId: string, itemId: string, patch: Record<string, string | number>) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  moveItem: (sectionId: string, from: number, to: number) => void;
  setTheme: (patch: Partial<Theme>) => void;
  setTemplate: (templateId: string) => void;
  setLocale: (locale: CvLocale) => void;
  setPhoto: (photo: string | null) => void;
  reset: () => void;
  /** Remplace le brouillon par le CV du compte. */
  loadCloud: (cv: CloudCv, owner: string) => void;
  /** Marque la copie locale comme appartenant à ce compte. */
  claim: (owner: string) => void;
  /** Note qu'une version a été enregistrée en base. */
  markSynced: (updatedAt: number) => void;
};

export type EditorState = Data & Actions;

function initialData(): Data {
  return {
    templateId: "classique",
    cvLocale: "fr",
    theme: DEFAULT_THEME,
    content: emptyContent(),
    photo: null,
    updatedAt: 0,
    owner: null,
    syncedAt: 0,
  };
}

const idbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => set(name, value),
  removeItem: async (name) => del(name),
};

export const useEditor = create<EditorState>()(
  persist(
    (setState) => {
      // Mise à jour d'une section précise, horodatée.
      const patchSection = (sectionId: string, fn: (s: Section) => Section) =>
        setState((st) => ({
          content: { ...st.content, sections: st.content.sections.map((s) => (s.id === sectionId ? fn(s) : s)) },
          updatedAt: Date.now(),
        }));

      return {
        ...initialData(),
        setBasics: (field, value) =>
          setState((st) => ({ content: { ...st.content, basics: { ...st.content.basics, [field]: value } }, updatedAt: Date.now() })),
        setSummary: (value) => setState((st) => ({ content: { ...st.content, summary: value }, updatedAt: Date.now() })),
        addSection: (type) => {
          const section = emptySection(type);
          setState((st) => ({ content: { ...st.content, sections: [...st.content.sections, section] }, updatedAt: Date.now() }));
          return section.id;
        },
        removeSection: (sectionId) =>
          setState((st) => ({
            content: { ...st.content, sections: st.content.sections.filter((s) => s.id !== sectionId) },
            updatedAt: Date.now(),
          })),
        moveSection: (from, to) =>
          setState((st) => ({ content: { ...st.content, sections: move(st.content.sections, from, to) }, updatedAt: Date.now() })),
        setSectionTitle: (sectionId, title) => patchSection(sectionId, (s) => ({ ...s, title })),
        toggleSection: (sectionId) => patchSection(sectionId, (s) => ({ ...s, visible: !s.visible })),
        addItem: (sectionId) =>
          patchSection(sectionId, (s) => ({ ...s, items: [...s.items, emptyItem(s.type)] }) as Section),
        updateItem: (sectionId, itemId, patch) =>
          patchSection(
            sectionId,
            (s) => ({ ...s, items: (s.items as AnyItem[]).map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }) as Section,
          ),
        removeItem: (sectionId, itemId) =>
          patchSection(sectionId, (s) => ({ ...s, items: (s.items as AnyItem[]).filter((it) => it.id !== itemId) }) as Section),
        moveItem: (sectionId, from, to) =>
          patchSection(sectionId, (s) => ({ ...s, items: move(s.items as AnyItem[], from, to) }) as Section),
        setTheme: (patch) => setState((st) => ({ theme: { ...st.theme, ...patch }, updatedAt: Date.now() })),
        setTemplate: (templateId) => setState({ templateId, updatedAt: Date.now() }),
        setLocale: (cvLocale) => setState({ cvLocale, updatedAt: Date.now() }),
        setPhoto: (photo) => setState({ photo, updatedAt: Date.now() }),
        reset: () => setState((st) => ({ ...initialData(), owner: st.owner, syncedAt: st.syncedAt, updatedAt: Date.now() })),
        loadCloud: (cv, owner) => {
          const now = Date.now();
          const content = resumeContentSchema.safeParse(cv.content);
          const theme = themeSchema.safeParse(cv.theme);
          const photo = cv.photo ? photoDataUrlSchema.safeParse(cv.photo) : null;
          setState({
            templateId: cv.templateId,
            cvLocale: cv.cvLocale,
            theme: theme.success ? theme.data : DEFAULT_THEME,
            content: content.success ? content.data : emptyContent(),
            photo: photo?.success ? photo.data : null,
            owner,
            updatedAt: now,
            syncedAt: now,
          });
        },
        claim: (owner) => setState({ owner }),
        markSynced: (updatedAt) => setState({ syncedAt: updatedAt }),
      };
    },
    {
      name: "cv-pro:brouillon",
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      skipHydration: true, // hydraté côté client uniquement (voir useEditorHydration)
      partialize: (st): Data => ({
        templateId: st.templateId,
        cvLocale: st.cvLocale,
        theme: st.theme,
        content: st.content,
        photo: st.photo,
        updatedAt: st.updatedAt,
        owner: st.owner,
        syncedAt: st.syncedAt,
      }),
      // Un brouillon abîmé ou d'un ancien format ne doit jamais casser l'éditeur.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Data>;
        const content = resumeContentSchema.safeParse(p.content);
        const theme = themeSchema.safeParse(p.theme);
        const photo = p.photo ? photoDataUrlSchema.safeParse(p.photo) : null;
        return {
          ...current,
          templateId: typeof p.templateId === "string" ? p.templateId : current.templateId,
          cvLocale: p.cvLocale === "en" || p.cvLocale === "pt" || p.cvLocale === "fr" ? p.cvLocale : current.cvLocale,
          theme: theme.success ? theme.data : current.theme,
          content: content.success ? content.data : current.content,
          photo: photo?.success ? photo.data : null,
          updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : 0,
          owner: typeof p.owner === "string" ? p.owner : null,
          syncedAt: typeof p.syncedAt === "number" ? p.syncedAt : 0,
        };
      },
    },
  ),
);

/** Efface la copie locale du CV (déconnexion, suppression du compte). */
export async function clearLocalDraft(): Promise<void> {
  await useEditor.persist.clearStorage();
  useEditor.setState({ ...initialData() });
}
