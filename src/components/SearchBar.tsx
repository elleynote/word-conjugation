"use client";

import type { RefObject } from "react";
import type { Dialect, InterfaceLanguage, Verb } from "@/types/verb";
import { copyFor, localizedVerbTranslation } from "@/lib/i18n/copy";

interface SearchBarProps {
  query: string;
  dialect: Dialect;
  language: InterfaceLanguage;
  selectedVerb: Verb;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onErase: () => void;
}

function originalHelpText(dialect: Dialect, language: InterfaceLanguage) {
  const side = dialect === "western" ? (language === "fr" ? "arménien occidental" : "western armenian") : (language === "fr" ? "arménien oriental" : "eastern armenian");
  if (language === "fr") {
    return `Écrivez ci-dessous un verbe en ${side} (ex : սիրել), en arménien phonétique (ex : sirel) ou en français (ex : être).`;
  }
  return `Write below a verb in ${side} (eg: սիրել), in phonetic armenian (eg: sirel) or in english (eg: to be).`;
}

export function SearchBar({ query, dialect, language, selectedVerb, inputRef, onQueryChange, onSubmit, onErase }: SearchBarProps) {
  const copy = copyFor(language);
  const selectedData = selectedVerb.dialects[dialect];
  const translation = localizedVerbTranslation(selectedVerb, language);

  return (
    <section className="search-section">
      <div className="search-help">{originalHelpText(dialect, language)}</div>
      <div className="search-row">
        <div className="search-input-wrap">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSubmit();
              }
            }}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchHelp}
            autoComplete="off"
          />
          {query && <button type="button" className="input-clear" aria-label={copy.erase} onClick={onErase}>×</button>}
        </div>
        <button type="button" className="btn btn-primary" onClick={onSubmit}>{copy.searchButton}</button>
        <button type="button" className="btn btn-secondary" onClick={onErase}>{copy.erase}</button>
        {selectedData && (
          <div className="selected-verb" aria-live="polite">
            <strong>{selectedData.lemma}</strong>
            <span>•</span>
            <span>{language === "en" ? `to ${translation}` : translation}</span>
          </div>
        )}
      </div>
    </section>
  );
}
