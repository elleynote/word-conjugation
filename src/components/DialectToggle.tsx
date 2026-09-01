"use client";

import type { Dialect, InterfaceLanguage } from "@/types/verb";
import { copyFor } from "@/lib/i18n/copy";

interface DialectToggleProps {
  value: Dialect;
  language: InterfaceLanguage;
  onChange: (dialect: Dialect) => void;
}

export function DialectToggle({ value, language, onChange }: DialectToggleProps) {
  const copy = copyFor(language);
  return (
    <div className="dialect-toggle" aria-label="Armenian dialect">
      <button type="button" aria-pressed={value === "western"} className={value === "western" ? "is-active" : ""} onClick={() => onChange("western")}>{copy.western}</button>
      <button type="button" aria-pressed={value === "eastern"} className={value === "eastern" ? "is-active" : ""} onClick={() => onChange("eastern")}>{copy.eastern}</button>
    </div>
  );
}
