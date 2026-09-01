"use client";

import type { Dialect, InterfaceLanguage, LegacyDisplayOptions } from "@/types/verb";
import { copyFor } from "@/lib/i18n/copy";
import { getDialectPresentation } from "@/lib/presentation/dialectPresentation";

interface LegacyOptionsProps {
  options: LegacyDisplayOptions;
  dialect: Dialect;
  language: InterfaceLanguage;
  onChange: (next: LegacyDisplayOptions) => void;
}

export function LegacyOptions({ options, dialect, language, onChange }: LegacyOptionsProps) {
  const copy = copyFor(language);
  const labels = {
    transcription: copy.transcription,
    probableFuture: copy.probableFuture,
    continuousForm: copy.continuousForm,
    mediativeForm: copy.mediativeForm,
  } as const;
  const { optionKeys } = getDialectPresentation(dialect);

  return (
    <div className="legacy-options">
      {optionKeys.map((key) => (
        <label key={key} className="legacy-option">
          <input
            type="checkbox"
            checked={options[key]}
            onChange={(event) => onChange({ ...options, [key]: event.target.checked })}
          />
          <span>{labels[key]}</span>
        </label>
      ))}
    </div>
  );
}
