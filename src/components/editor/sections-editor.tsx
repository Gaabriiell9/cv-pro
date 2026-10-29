"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Eye, EyeOff, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useEditor } from "@/lib/editor/store";
import { SECTION_LABELS } from "@/lib/resume/labels";
import type { Section, SectionType } from "@/lib/resume/schema";
import { IconButton, TextField } from "./fields";
import { CustomItems, EducationItems, ExperienceItems, InterestItems, LanguageItems, SkillItems } from "./item-forms";

const ADD_ITEM_LABEL: Record<SectionType, string> = {
  experience: "Ajouter une expérience",
  education: "Ajouter une formation",
  skills: "Ajouter une compétence",
  languages: "Ajouter une langue",
  interests: "Ajouter un centre d'intérêt",
  custom: "Ajouter un élément",
};

const MAX_ITEMS: Record<SectionType, number> = { experience: 30, education: 20, skills: 40, languages: 15, interests: 20, custom: 20 };

function SectionBody({ section }: { section: Section }) {
  switch (section.type) {
    case "experience":
      return <ExperienceItems section={section} />;
    case "education":
      return <EducationItems section={section} />;
    case "skills":
      return <SkillItems section={section} />;
    case "languages":
      return <LanguageItems section={section} />;
    case "interests":
      return <InterestItems section={section} />;
    case "custom":
      return <CustomItems section={section} />;
  }
}

function SortableSection({ section, defaultTitle }: { section: Section; defaultTitle: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const [open, setOpen] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const { toggleSection, removeSection, addItem, setSectionTitle } = useEditor.getState();
  const label = section.title.trim() || defaultTitle;

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`rounded-2xl border border-line bg-white ${isDragging ? "relative z-10 shadow-xl" : ""} ${section.visible ? "" : "opacity-70"}`}
      aria-label={label}
    >
      <div className="flex items-center gap-0.5 py-1 pl-1 pr-1">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Déplacer la section ${label}`}
          className="inline-flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-ink-soft hover:bg-paper-2 active:cursor-grabbing"
        >
          <GripVertical className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="truncate font-display text-lg font-semibold">{label}</span>
          <ChevronDown className={`size-4 shrink-0 text-ink-soft transition-transform ${open ? "" : "-rotate-90"}`} aria-hidden />
        </button>
        <IconButton label={section.visible ? "Masquer dans le CV" : "Afficher dans le CV"} onClick={() => toggleSection(section.id)}>
          {section.visible ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
        </IconButton>
        <IconButton label="Supprimer la section" tone="danger" onClick={() => setConfirm(true)}>
          <Trash2 className="size-4" aria-hidden />
        </IconButton>
      </div>

      {confirm ? (
        <div role="alertdialog" aria-label="Confirmer la suppression" className="mx-3 mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-red-50 p-3 text-sm">
          <span className="flex-1">Supprimer « {label} » et son contenu ?</span>
          <button type="button" onClick={() => setConfirm(false)} className="h-10 rounded-lg px-3 font-medium hover:bg-white">
            Annuler
          </button>
          <button type="button" onClick={() => removeSection(section.id)} className="h-10 rounded-lg bg-red-800 px-3 font-medium text-white">
            Supprimer
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="grid grid-cols-1 gap-3 px-3 pb-4">
          <TextField
            label="Titre affiché"
            value={section.title}
            onChange={(v) => setSectionTitle(section.id, v)}
            maxLength={60}
            hint={`Laisser vide pour « ${defaultTitle} »`}
          />
          <SectionBody section={section} />
          {section.items.length < MAX_ITEMS[section.type] ? (
            <button
              type="button"
              onClick={() => addItem(section.id)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm font-medium text-accent hover:border-accent hover:bg-accent/5"
            >
              <Plus className="size-4" aria-hidden />
              {ADD_ITEM_LABEL[section.type]}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

const ADDABLE: SectionType[] = ["experience", "education", "skills", "languages", "interests", "custom"];

export function SectionsEditor() {
  const sections = useEditor((s) => s.content.sections);
  const locale = useEditor((s) => s.cvLocale);
  const { moveSection, addSection } = useEditor.getState();
  const [adding, setAdding] = useState(false);

  // Tactile : appui maintenu court avant de déplacer, pour ne pas gêner le défilement.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const from = sections.findIndex((s) => s.id === e.active.id);
    const to = sections.findIndex((s) => s.id === e.over!.id);
    moveSection(from, to);
  }

  const present = new Set(sections.map((s) => s.type));

  return (
    <div className="grid grid-cols-1 gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((s) => (
            <SortableSection key={s.id} section={s} defaultTitle={SECTION_LABELS[locale][s.type]} />
          ))}
        </SortableContext>
      </DndContext>

      {sections.length < 12 ? (
        adding ? (
          <div className="rounded-2xl border border-line bg-white p-3">
            <p className="mb-2 text-sm font-medium">Quelle section ajouter ?</p>
            <div className="grid grid-cols-2 gap-2">
              {ADDABLE.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    addSection(type);
                    setAdding(false);
                  }}
                  className="min-h-11 rounded-xl border border-line px-3 py-2 text-left text-sm hover:border-accent hover:bg-accent/5"
                >
                  {type === "custom" ? "Section libre" : SECTION_LABELS.fr[type]}
                  {present.has(type) && type !== "custom" ? <span className="block text-xs text-ink-soft">déjà présente</span> : null}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setAdding(false)} className="mt-2 h-10 w-full rounded-lg text-sm text-ink-soft hover:bg-paper-2">
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-soft/40 font-medium text-ink hover:border-accent hover:text-accent"
          >
            <Plus className="size-4" aria-hidden />
            Ajouter une section
          </button>
        )
      ) : null}
    </div>
  );
}
