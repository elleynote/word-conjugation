"use client";

import type { InterfaceLanguage } from "@/types/verb";

interface LanguageToggleProps {
  value: InterfaceLanguage;
  onChange: (language: InterfaceLanguage) => void;
}

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <div className="language-toggle" aria-label="Interface language">
      <button type="button" aria-pressed={value === "en"} className={value === "en" ? "is-active" : ""} onClick={() => onChange("en")}>🇬🇧 EN</button>
      <button type="button" aria-pressed={value === "fr"} className={value === "fr" ? "is-active" : ""} onClick={() => onChange("fr")}>🇫🇷 FR</button>
    </div>
  );
}
