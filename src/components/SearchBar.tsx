"use client";

import type { RefObject } from "react";
import type { Dialect, InterfaceLanguage, Verb } from "@/types/verb";
import { copyFor, localizedVerbTranslation } from "@/lib/i18n/copy";

export type SearchStatus = "idle" | "loading" | "not-found" | "ai";

interface SearchBarProps {
  query: string;
  dialect: Dialect;
  language: InterfaceLanguage;
  selectedVerb: Verb | null;
  status: SearchStatus;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onErase: () => void;
}

function originalHelpText(dialect: Dialect, language: InterfaceLanguage) {
  if (language === "ru") {
    const side = dialect === "western" ? "западноармянском" : "восточноармянском";
    return `Введите глагол на ${side} (например: սիրել), фонетическом армянском (sirel), английском или русском (например: любить).`;
  }
  const side = dialect === "western" ? "western armenian" : "eastern armenian";
  return `Write below a verb in ${side} (eg: սիրել), in phonetic armenian (eg: sirel), english (eg: to be) or russian (eg: любить).`;
}

export function SearchBar({ query, dialect, language, selectedVerb, status, inputRef, onQueryChange, onSubmit, onErase }: SearchBarProps) {
  const copy = copyFor(language);
  const selectedData = selectedVerb?.dialects[dialect];
  const translation = selectedVerb ? localizedVerbTranslation(selectedVerb, language) : "";

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
                void onSubmit();
              }
            }}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchHelp}
            autoComplete="off"
          />
          {query && <button type="button" className="input-clear" aria-label={copy.erase} onClick={onErase}>×</button>}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => void onSubmit()} disabled={status === "loading"}>{status === "loading" ? "…" : copy.searchButton}</button>
        <button type="button" className="btn btn-secondary" onClick={onErase}>{copy.erase}</button>
        {selectedData && selectedVerb && (
          <div className="selected-verb" aria-live="polite">
            <strong>{selectedData.lemma}</strong>
            <span>•</span>
            <span>{language === "en" ? `to ${translation}` : translation}</span>
          </div>
        )}
      </div>

      <div className="search-feedback" aria-live="polite">
        {status === "loading" && <span>{language === "ru" ? "Поиск…" : "Searching…"}</span>}
        {status === "not-found" && <span>{copy.noResults}</span>}
        {status === "ai" && <span className="search-feedback--warning">{copy.unverifiedAi}</span>}
      </div>
    </section>
  );
}
