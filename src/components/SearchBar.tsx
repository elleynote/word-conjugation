"use client";

import type { RefObject } from "react";
import type { Dialect, InterfaceLanguage } from "@/types/verb";
import { copyFor } from "@/lib/i18n/copy";

export type SearchStatus = "idle" | "loading" | "not-found" | "ai";

interface SearchBarProps {
  query: string;
  dialect: Dialect;
  language: InterfaceLanguage;
  status: SearchStatus;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onErase: () => void;
}

function helpText(dialect: Dialect, language: InterfaceLanguage) {
  if (language === "ru") {
    const side = dialect === "western" ? "западноармянском" : "восточноармянском";
    return `Армянский, фонетический армянский, английский или русский. Сейчас: ${side}.`;
  }
  const side = dialect === "western" ? "Western Armenian" : "Eastern Armenian";
  return `Enter Armenian, phonetic Armenian, English or Russian. Current: ${side}.`;
}

export function SearchBar({ query, dialect, language, status, inputRef, onQueryChange, onSubmit, onErase }: SearchBarProps) {
  const copy = copyFor(language);

  return (
    <section className="sidebar-search">
      <label className="sidebar-section-label" htmlFor="verb-search-input">{copy.searchForVerb}</label>
      <div className="sidebar-search__input-wrap">
        <input
          id="verb-search-input"
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
        {query && <button type="button" className="sidebar-search__clear" aria-label={copy.erase} onClick={onErase}>×</button>}
      </div>
      <button type="button" className="sidebar-search__submit" onClick={() => void onSubmit()} disabled={status === "loading"}>
        {status === "loading" ? (language === "ru" ? "Поиск…" : "Searching…") : copy.searchButton}
      </button>
      <p className="sidebar-search__help">{helpText(dialect, language)}</p>
      <div className="sidebar-search__feedback" aria-live="polite">
        {status === "not-found" && <span>{copy.noResults}</span>}
        {status === "ai" && <span className="sidebar-search__warning">{copy.unverifiedAi}</span>}
      </div>
    </section>
  );
}
