"use client";

import type { InterfaceLanguage } from "@/types/verb";
import { CONJUGATOR_VIEWS, labelForConjugatorView, type ConjugatorView } from "@/lib/presentation/conjugatorTabs";

interface TenseTabsProps {
  value: ConjugatorView;
  language: InterfaceLanguage;
  onChange: (view: ConjugatorView) => void;
}

export function TenseTabs({ value, language, onChange }: TenseTabsProps) {
  return (
    <div className="tense-tabs" role="tablist" aria-label={language === "ru" ? "Время спряжения" : "Conjugation tense"}>
      {CONJUGATOR_VIEWS.map((view) => (
        <button
          key={view}
          type="button"
          role="tab"
          aria-selected={value === view}
          className={value === view ? "is-active" : ""}
          onClick={() => onChange(view)}
        >
          {labelForConjugatorView(view, language)}
        </button>
      ))}
    </div>
  );
}
