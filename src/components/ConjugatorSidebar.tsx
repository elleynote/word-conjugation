"use client";

import type { RefObject } from "react";
import type { Dialect, InterfaceLanguage, TextCaseMode, Verb } from "@/types/verb";
import { copyFor } from "@/lib/i18n/copy";
import type { RecentVerbEntry } from "@/lib/recent/recentVerbs";
import { ArmenianKeyboard } from "./ArmenianKeyboard";
import { DialectToggle } from "./DialectToggle";
import { RecentVerbs } from "./RecentVerbs";
import { SearchBar, type SearchStatus } from "./SearchBar";
import { SpeakButton } from "./SpeakButton";

interface ConjugatorSidebarProps {
  query: string;
  dialect: Dialect;
  language: InterfaceLanguage;
  selectedVerb: Verb | null;
  status: SearchStatus;
  inputRef: RefObject<HTMLInputElement | null>;
  keyboardOpen: boolean;
  textCase: TextCaseMode;
  showTranscription: boolean;
  recentVerbs: RecentVerbEntry[];
  onQueryChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onErase: () => void;
  onDialectChange: (dialect: Dialect) => void;
  onKeyboardToggle: () => void;
  onInsert: (character: string) => void;
  onBackspace: () => void;
  onClearKeyboard: () => void;
  onTranscriptionChange: (value: boolean) => void;
  onSelectRecent: (entry: RecentVerbEntry) => void | Promise<void>;
}

export function ConjugatorSidebar(props: ConjugatorSidebarProps) {
  const copy = copyFor(props.language);
  const data = props.selectedVerb?.dialects[props.dialect];
  const russianMeaning = props.selectedVerb?.russian[0];
  const englishMeaning = props.selectedVerb?.english[0];
  const meaning = props.language === "ru" && russianMeaning ? russianMeaning : englishMeaning ?? russianMeaning ?? "";
  const regularity = data?.regularity ?? (data?.isIrregular ? (props.language === "ru" ? "Неправильный" : "Irregular") : (props.language === "ru" ? "Правильный" : "Regular"));

  return (
    <aside className="conjugator-sidebar">
      <SearchBar
        query={props.query}
        dialect={props.dialect}
        language={props.language}
        status={props.status}
        inputRef={props.inputRef}
        onQueryChange={props.onQueryChange}
        onSubmit={props.onSubmit}
        onErase={props.onErase}
      />

      {props.selectedVerb && data && (
        <section className="sidebar-selected-card" aria-label={copy.selectedVerb}>
          <div className="sidebar-selected-card__armenian">
            <strong>{data.lemma}</strong>
            <SpeakButton text={data.lemma} language="hy" dialect={props.dialect} ariaLabel={`Play ${data.lemma}`} />
          </div>
          <span className="sidebar-selected-card__transliteration">{data.transliteration}</span>
          {meaning && <div className="sidebar-selected-card__meaning"><span>{meaning}</span></div>}
          <span className="sidebar-selected-card__badge">{regularity}{data.group ? ` · ${data.group}` : ""}</span>
        </section>
      )}

      <section className="sidebar-dialect">
        <span className="sidebar-section-label">{copy.chooseDialect}</span>
        <DialectToggle value={props.dialect} language={props.language} onChange={props.onDialectChange} />
      </section>

      <label className="sidebar-transcription-toggle">
        <input type="checkbox" checked={props.showTranscription} onChange={(event) => props.onTranscriptionChange(event.target.checked)} />
        <span>{copy.transcription}</span>
      </label>

      <RecentVerbs entries={props.recentVerbs} language={props.language} onSelect={props.onSelectRecent} />

      <ArmenianKeyboard
        language={props.language}
        textCase={props.textCase}
        open={props.keyboardOpen}
        onToggle={props.onKeyboardToggle}
        onInsert={props.onInsert}
        onBackspace={props.onBackspace}
        onClear={props.onClearKeyboard}
      />
    </aside>
  );
}
