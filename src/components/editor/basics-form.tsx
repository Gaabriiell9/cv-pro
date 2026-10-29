"use client";

import { useEditor } from "@/lib/editor/store";
import { TextArea, TextField } from "./fields";
import { PhotoField } from "./photo-field";

export function BasicsForm() {
  const b = useEditor((s) => s.content.basics);
  const summary = useEditor((s) => s.content.summary);
  const { setBasics, setSummary } = useEditor.getState();

  return (
    <div className="grid grid-cols-1 gap-3">
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-white p-4" aria-labelledby="titre-infos">
        <h2 id="titre-infos" className="font-display text-lg font-semibold">
          Vos informations
        </h2>
        <PhotoField />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Prénom" value={b.firstName} onChange={(v) => setBasics("firstName", v)} maxLength={60} autoComplete="given-name" />
          <TextField label="Nom" value={b.lastName} onChange={(v) => setBasics("lastName", v)} maxLength={60} autoComplete="family-name" />
        </div>
        <TextField
          label="Poste recherché"
          value={b.jobTitle}
          onChange={(v) => setBasics("jobTitle", v)}
          maxLength={100}
          hint="Le titre affiché sous votre nom."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="E-mail" type="email" inputMode="email" value={b.email} onChange={(v) => setBasics("email", v)} maxLength={120} autoComplete="email" />
          <TextField label="Téléphone" type="tel" inputMode="tel" value={b.phone} onChange={(v) => setBasics("phone", v)} maxLength={30} autoComplete="tel" />
        </div>
        <TextField
          label="Ville"
          value={b.city}
          onChange={(v) => setBasics("city", v)}
          maxLength={80}
          autoComplete="address-level2"
          hint="La ville suffit : l'adresse complète n'est pas utile sur un CV."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="LinkedIn (facultatif)" type="url" inputMode="url" value={b.linkedin} onChange={(v) => setBasics("linkedin", v)} maxLength={160} />
          <TextField label="Site web (facultatif)" type="url" inputMode="url" value={b.website} onChange={(v) => setBasics("website", v)} maxLength={160} />
        </div>
        <TextField
          label="Autre information (facultatif)"
          value={b.extra}
          onChange={(v) => setBasics("extra", v)}
          maxLength={120}
          hint="Par exemple un permis ou une disponibilité."
        />
      </section>

      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-white p-4" aria-labelledby="titre-profil">
        <h2 id="titre-profil" className="font-display text-lg font-semibold">
          Profil
        </h2>
        <TextArea
          label="Présentation en quelques phrases"
          value={summary}
          onChange={setSummary}
          maxLength={1500}
          rows={4}
          hint="Ce que vous savez faire et ce que vous cherchez. Trois ou quatre phrases suffisent."
        />
      </section>
    </div>
  );
}
