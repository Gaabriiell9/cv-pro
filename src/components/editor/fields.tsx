"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

// Champs de saisie de l'éditeur. Pas de placeholder inventé (règle du projet) :
// seulement des libellés et, au besoin, une aide sous le champ.

const inputClass =
  "w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2.5 text-[16px] text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]";

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  type?: "text" | "email" | "tel" | "url";
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "url";
  hint?: string;
  className?: string;
};

export function TextField({ label, value, onChange, maxLength, type = "text", autoComplete, inputMode, hint, className }: FieldProps) {
  const id = useId();
  return (
    <div className={`min-w-0 ${className ?? ""}`}>
      <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete ?? "off"}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  maxLength,
  hint,
  rows = 3,
}: Omit<FieldProps, "type" | "autoComplete" | "inputMode" | "className"> & { rows?: number }) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  // Hauteur qui suit le contenu : plus confortable sur téléphone.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-none leading-relaxed`}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      <div className="mt-1 flex justify-between gap-3 text-xs text-ink-soft">
        <span id={`${id}-hint`}>{hint}</span>
        {value.length > maxLength * 0.8 ? (
          <span>
            {value.length} / {maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  children,
  disabled,
  tone = "default",
  ...rest
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  tone?: "default" | "danger";
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-paper-2 disabled:opacity-30 ${
        tone === "danger" ? "hover:text-red-800" : "hover:text-ink"
      } ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}
