"use client";

import type { InterfaceLanguage, TextCaseMode } from "@/types/verb";
import { copyFor } from "@/lib/i18n/copy";

const letters = [
  "ա", "բ", "գ", "դ", "ե", "զ", "է", "ը", "թ", "ժ", "ի", "լ", "խ", "ծ", "կ", "հ", "ձ", "ղ",
  "ճ", "մ", "յ", "ն", "շ", "ո", "չ", "պ", "ջ", "ռ", "ս", "վ", "տ", "ր", "ց", "ւ", "և", "փ", "ք", "օ", "ֆ",
];

interface ArmenianKeyboardProps {
  language: InterfaceLanguage;
  textCase: TextCaseMode;
  onInsert: (character: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

export function ArmenianKeyboard({ language, textCase, onInsert, onBackspace, onClear }: ArmenianKeyboardProps) {
  const copy = copyFor(language);
  const rendered = textCase === "lower" ? letters : letters.map((letter) => letter.toLocaleUpperCase("hy-AM"));

  return (
    <section className="keyboard-block" aria-label={copy.keyboard}>
      <div className="tool-label">{copy.keyboard}</div>
      <div className="keyboard-grid">
        {rendered.map((letter) => (
          <button key={letter} type="button" className="keyboard-key" onClick={() => onInsert(letter)} aria-label={`${copy.keyboard}: ${letter}`}>
            {letter}
          </button>
        ))}
      </div>
      <div className="keyboard-actions">
        <button type="button" onClick={onBackspace} aria-label="Backspace">⌫ <span>{language === "fr" ? "Retour" : "Backspace"}</span></button>
        <button type="button" onClick={onClear}>{copy.erase}</button>
      </div>
    </section>
  );
}
