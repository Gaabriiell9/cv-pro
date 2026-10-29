"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { useEditor } from "@/lib/editor/store";
import type { Section } from "@/lib/resume/schema";
import { IconButton, TextArea, TextField } from "./fields";

type Props<T extends Section> = { section: T };

const DESC_HINT = "Une ligne par réalisation : chaque ligne devient une puce.";

// Carte repliable pour un élément long (expérience, formation, personnalisé).
function ItemCard({
  title,
  index,
  count,
  defaultOpen,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  count: number;
  defaultOpen: boolean;
  onMove: (to: number) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-line bg-paper/60">
      <div className="flex items-center gap-1 pl-3 pr-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-2 text-left text-[15px] font-medium"
        >
          <ChevronDown className={`size-4 shrink-0 text-ink-soft transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
          <span className="truncate">{title}</span>
        </button>
        <IconButton label="Monter" onClick={() => onMove(index - 1)} disabled={index === 0}>
          <ChevronUp className="size-4" aria-hidden />
        </IconButton>
        <IconButton label="Descendre" onClick={() => onMove(index + 1)} disabled={index === count - 1}>
          <ChevronDown className="size-4" aria-hidden />
        </IconButton>
        <IconButton label="Supprimer" tone="danger" onClick={onRemove}>
          <Trash2 className="size-4" aria-hidden />
        </IconButton>
      </div>
      {open ? <div className="grid grid-cols-1 gap-3 border-t border-line px-3 pb-4 pt-3">{children}</div> : null}
    </div>
  );
}

function PeriodFields({ start, end, onStart, onEnd }: { start: string; end: string; onStart: (v: string) => void; onEnd: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TextField label="Début" value={start} onChange={onStart} maxLength={30} />
      <TextField label="Fin" value={end} onChange={onEnd} maxLength={30} hint="Vide = en cours" />
    </div>
  );
}

export function ExperienceItems({ section }: Props<Extract<Section, { type: "experience" }>>) {
  const { updateItem, removeItem, moveItem } = useEditor.getState();
  return (
    <>
      {section.items.map((it, i) => {
        const up = (patch: Record<string, string>) => updateItem(section.id, it.id, patch);
        return (
          <ItemCard
            key={it.id}
            title={it.role || it.company || "Nouvelle expérience"}
            index={i}
            count={section.items.length}
            defaultOpen={!it.role && !it.company}
            onMove={(to) => moveItem(section.id, i, to)}
            onRemove={() => removeItem(section.id, it.id)}
          >
            <TextField label="Poste" value={it.role} onChange={(v) => up({ role: v })} maxLength={120} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField label="Entreprise" value={it.company} onChange={(v) => up({ company: v })} maxLength={120} />
              <TextField label="Ville" value={it.city} onChange={(v) => up({ city: v })} maxLength={80} />
            </div>
            <PeriodFields start={it.start} end={it.end} onStart={(v) => up({ start: v })} onEnd={(v) => up({ end: v })} />
            <TextArea label="Missions et réalisations" value={it.description} onChange={(v) => up({ description: v })} maxLength={2000} hint={DESC_HINT} />
          </ItemCard>
        );
      })}
    </>
  );
}

export function EducationItems({ section }: Props<Extract<Section, { type: "education" }>>) {
  const { updateItem, removeItem, moveItem } = useEditor.getState();
  return (
    <>
      {section.items.map((it, i) => {
        const up = (patch: Record<string, string>) => updateItem(section.id, it.id, patch);
        return (
          <ItemCard
            key={it.id}
            title={it.degree || it.school || "Nouvelle formation"}
            index={i}
            count={section.items.length}
            defaultOpen={!it.degree && !it.school}
            onMove={(to) => moveItem(section.id, i, to)}
            onRemove={() => removeItem(section.id, it.id)}
          >
            <TextField label="Diplôme ou formation" value={it.degree} onChange={(v) => up({ degree: v })} maxLength={160} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField label="Établissement" value={it.school} onChange={(v) => up({ school: v })} maxLength={160} />
              <TextField label="Ville" value={it.city} onChange={(v) => up({ city: v })} maxLength={80} />
            </div>
            <PeriodFields start={it.start} end={it.end} onStart={(v) => up({ start: v })} onEnd={(v) => up({ end: v })} />
            <TextArea label="Détails (facultatif)" value={it.description} onChange={(v) => up({ description: v })} maxLength={1000} />
          </ItemCard>
        );
      })}
    </>
  );
}

export function CustomItems({ section }: Props<Extract<Section, { type: "custom" }>>) {
  const { updateItem, removeItem, moveItem } = useEditor.getState();
  return (
    <>
      {section.items.map((it, i) => {
        const up = (patch: Record<string, string>) => updateItem(section.id, it.id, patch);
        return (
          <ItemCard
            key={it.id}
            title={it.title || "Nouvel élément"}
            index={i}
            count={section.items.length}
            defaultOpen={!it.title}
            onMove={(to) => moveItem(section.id, i, to)}
            onRemove={() => removeItem(section.id, it.id)}
          >
            <TextField label="Intitulé" value={it.title} onChange={(v) => up({ title: v })} maxLength={160} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField label="Précision (facultatif)" value={it.subtitle} onChange={(v) => up({ subtitle: v })} maxLength={160} />
              <TextField label="Date ou période" value={it.period} onChange={(v) => up({ period: v })} maxLength={30} />
            </div>
            <TextArea label="Description (facultatif)" value={it.description} onChange={(v) => up({ description: v })} maxLength={1500} hint={DESC_HINT} />
          </ItemCard>
        );
      })}
    </>
  );
}

// Listes courtes (compétences, langues, centres d'intérêt) : une ligne par élément.
function RowControls({ sectionId, itemId, index, count }: { sectionId: string; itemId: string; index: number; count: number }) {
  const { removeItem, moveItem } = useEditor.getState();
  return (
    <div className="flex shrink-0 items-end pb-0.5">
      <IconButton label="Monter" onClick={() => moveItem(sectionId, index, index - 1)} disabled={index === 0}>
        <ChevronUp className="size-4" aria-hidden />
      </IconButton>
      <IconButton label="Descendre" onClick={() => moveItem(sectionId, index, index + 1)} disabled={index === count - 1}>
        <ChevronDown className="size-4" aria-hidden />
      </IconButton>
      <IconButton label="Supprimer" tone="danger" onClick={() => removeItem(sectionId, itemId)}>
        <Trash2 className="size-4" aria-hidden />
      </IconButton>
    </div>
  );
}

export function SkillItems({ section }: Props<Extract<Section, { type: "skills" }>>) {
  const { updateItem } = useEditor.getState();
  return (
    <>
      {section.items.map((it, i) => (
        <div key={it.id} className="flex items-end gap-1">
          <TextField
            className="min-w-0 flex-1"
            label={`Compétence ${i + 1}`}
            value={it.name}
            onChange={(v) => updateItem(section.id, it.id, { name: v })}
            maxLength={80}
          />
          <RowControls sectionId={section.id} itemId={it.id} index={i} count={section.items.length} />
        </div>
      ))}
    </>
  );
}

export function LanguageItems({ section }: Props<Extract<Section, { type: "languages" }>>) {
  const { updateItem } = useEditor.getState();
  return (
    <>
      {section.items.map((it, i) => (
        <div key={it.id} className="flex items-end gap-1">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            <TextField label={`Langue ${i + 1}`} value={it.name} onChange={(v) => updateItem(section.id, it.id, { name: v })} maxLength={60} />
            <TextField label="Niveau" value={it.level} onChange={(v) => updateItem(section.id, it.id, { level: v })} maxLength={40} />
          </div>
          <RowControls sectionId={section.id} itemId={it.id} index={i} count={section.items.length} />
        </div>
      ))}
    </>
  );
}

export function InterestItems({ section }: Props<Extract<Section, { type: "interests" }>>) {
  const { updateItem } = useEditor.getState();
  return (
    <>
      {section.items.map((it, i) => (
        <div key={it.id} className="flex items-end gap-1">
          <TextField
            className="min-w-0 flex-1"
            label={`Centre d'intérêt ${i + 1}`}
            value={it.name}
            onChange={(v) => updateItem(section.id, it.id, { name: v })}
            maxLength={80}
          />
          <RowControls sectionId={section.id} itemId={it.id} index={i} count={section.items.length} />
        </div>
      ))}
    </>
  );
}
