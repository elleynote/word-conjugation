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
  open: boolean;
  onToggle: () => void;
  onInsert: (character: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

export function ArmenianKeyboard({ language, textCase, open, onToggle, onInsert, onBackspace, onClear }: ArmenianKeyboardProps) {
  const copy = copyFor(language);
  const rendered = textCase === "lower" ? letters : letters.map((letter) => letter.toLocaleUpperCase("hy-AM"));

  return (
    <section className="sidebar-keyboard" aria-label={copy.keyboard} data-open={open ? "true" : "false"}>
      <button type="button" className="sidebar-keyboard__toggle" aria-expanded={open} aria-controls="armenian-keyboard-body" onClick={onToggle}>
        <span aria-hidden="true">⌨</span>
        <span>{open ? copy.hideKeyboard : copy.showKeyboard}</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div id="armenian-keyboard-body" className="sidebar-keyboard__body">
          <div className="sidebar-keyboard__grid">
            {rendered.map((letter) => (
              <button key={letter} type="button" onClick={() => onInsert(letter)} aria-label={`${copy.keyboard}: ${letter}`}>
                {letter}
              </button>
            ))}
          </div>
          <div className="sidebar-keyboard__actions">
            <button type="button" onClick={onBackspace} aria-label="Backspace">⌫</button>
            <button type="button" onClick={onClear}>{copy.erase}</button>
          </div>
        </div>
      )}
    </section>
  );
}
