"use client";

import type { TextCaseMode } from "@/types/verb";

interface TextCaseToggleProps {
  value: TextCaseMode;
  onChange: (mode: TextCaseMode) => void;
}

const modes: Array<{ value: TextCaseMode; label: string }> = [
  { value: "title", label: "Ab" },
  { value: "lower", label: "ab" },
  { value: "upper", label: "AB" },
];

export function TextCaseToggle({ value, onChange }: TextCaseToggleProps) {
  return (
    <div className="case-toggle" aria-label="Text display mode">
      {modes.map((mode) => (
        <button
          key={mode.value}
          type="button"
          aria-pressed={value === mode.value}
          className={value === mode.value ? "is-active" : ""}
          onClick={() => onChange(mode.value)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
