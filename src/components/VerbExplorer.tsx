"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { brand } from "@/config/brand";
import { verbs } from "@/data/verbs";
import { conjugateVerb } from "@/lib/conjugation/conjugate";
import { backspaceAtSelection, insertAtSelection } from "@/lib/keyboard/insertAtSelection";
import { searchVerbs } from "@/lib/search/searchVerbs";
import { copyFor } from "@/lib/i18n/copy";
import { applyLegacyDisplayOptions } from "@/lib/options/applyLegacyDisplayOptions";
import { RECENT_VERBS_STORAGE_KEY, pushRecentVerb, type RecentVerbEntry } from "@/lib/recent/recentVerbs";
import type { ConjugatorView } from "@/lib/presentation/conjugatorTabs";
import type { Dialect, InterfaceLanguage, LegacyDisplayOptions, Verb } from "@/types/verb";
import { ConjugatorSidebar } from "./ConjugatorSidebar";
import { LanguageToggle } from "./LanguageToggle";
import { PromoPanels } from "./PromoPanels";
import { type SearchStatus } from "./SearchBar";
import { SentenceConjugation } from "./SentenceConjugation";
import { TenseComparison } from "./TenseComparison";
import { TenseTabs } from "./TenseTabs";
import { VerbSummary } from "./VerbSummary";

const initialVerb = verbs.find((verb) => verb.id === "write") ?? verbs[0];

interface SearchApiResponse {
  verb: Verb | null;
  source: "supabase" | "local" | "ai" | null;
  verified: boolean;
}

export function VerbExplorer() {
  const [language, setLanguage] = useState<InterfaceLanguage>("en");
  const [dialect, setDialect] = useState<Dialect>("western");
  const [activeView, setActiveView] = useState<ConjugatorView>("present");
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [recentVerbs, setRecentVerbs] = useState<RecentVerbEntry[]>([]);
  const [options, setOptions] = useState<LegacyDisplayOptions>({
    transcription: true,
    probableFuture: false,
    continuousForm: false,
    mediativeForm: false,
    textCase: "title",
  });
  const [query, setQuery] = useState(initialVerb.dialects.western?.lemma ?? initialVerb.english[0]);
  const [selectedVerb, setSelectedVerb] = useState<Verb | null>({ ...initialVerb, source: "local", verified: true });
  const inputRef = useRef<HTMLInputElement>(null);

  const copy = copyFor(language);
  const suggestions = useMemo(() => searchVerbs(query, dialect), [query, dialect]);
  const selectedData = selectedVerb?.dialects[dialect] ?? null;
  const affirmativeResult = useMemo(
    () => selectedVerb && selectedData
      ? applyLegacyDisplayOptions(conjugateVerb(selectedVerb, dialect, "affirmative"), selectedData, dialect, options)
      : null,
    [selectedVerb, selectedData, dialect, options],
  );
  const negativeResult = useMemo(
    () => selectedVerb && selectedData
      ? applyLegacyDisplayOptions(conjugateVerb(selectedVerb, dialect, "negative"), selectedData, dialect, options)
      : null,
    [selectedVerb, selectedData, dialect, options],
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_VERBS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as RecentVerbEntry[];
      if (Array.isArray(parsed)) setRecentVerbs(parsed.slice(0, 5));
    } catch {
      setRecentVerbs([]);
    }
  }, []);

  const rememberVerb = (verb: Verb, targetDialect: Dialect) => {
    const data = verb.dialects[targetDialect];
    if (!data) return;
    const entry: RecentVerbEntry = { id: verb.id, lemma: data.lemma, dialect: targetDialect, label: data.lemma };
    setRecentVerbs((current) => {
      const next = pushRecentVerb(current, entry);
      try { window.localStorage.setItem(RECENT_VERBS_STORAGE_KEY, JSON.stringify(next)); } catch { /* browser storage is optional */ }
      return next;
    });
  };

  const selectVerb = (verb: Verb, targetDialect: Dialect = dialect) => {
    const data = verb.dialects[targetDialect];
    setSelectedVerb(verb);
    setQuery(data?.lemma ?? verb.english[0] ?? "");
    setSearchStatus(verb.verified === false || verb.source === "ai" ? "ai" : "idle");
    rememberVerb(verb, targetDialect);
  };

  const searchForVerb = async (searchQuery: string, targetDialect: Dialect): Promise<void> => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) {
      setSelectedVerb(null);
      setSearchStatus("not-found");
      return;
    }

    setSearchStatus("loading");
    try {
      const response = await fetch(`/api/verbs/search?q=${encodeURIComponent(cleanQuery)}&dialect=${targetDialect}`, { cache: "no-store" });
      if (response.ok) {
        const payload = await response.json() as SearchApiResponse;
        if (payload.verb) {
          selectVerb(payload.verb, targetDialect);
          return;
        }
      }
      if (response.status === 404) {
        setSelectedVerb(null);
        setSearchStatus("not-found");
        return;
      }
    } catch (error) {
      console.error("Server verb search failed; trying local fallback.", error);
    }

    const local = searchVerbs(cleanQuery, targetDialect)[0];
    if (local) {
      selectVerb({ ...local, source: "local", verified: true }, targetDialect);
      return;
    }

    setSelectedVerb(null);
    setSearchStatus("not-found");
  };

  const submitSearch = async () => {
    await searchForVerb(query, dialect);
  };

  const eraseSearch = () => {
    setQuery("");
    setSelectedVerb(null);
    setSearchStatus("idle");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const updateDialect = (nextDialect: Dialect) => {
    setDialect(nextDialect);
    setActiveView("present");
    setSearchStatus("idle");
    setOptions((current) => ({
      ...current,
      transcription: true,
      probableFuture: nextDialect === "eastern",
      continuousForm: false,
      mediativeForm: false,
    }));

    const active = selectedVerb?.dialects[nextDialect];
    if (selectedVerb && active) {
      selectVerb(selectedVerb, nextDialect);
      return;
    }

    void searchForVerb(query, nextDialect);
  };

  const selectRecent = async (entry: RecentVerbEntry) => {
    setDialect(entry.dialect);
    setActiveView("present");
    setQuery(entry.lemma);
    await searchForVerb(entry.lemma, entry.dialect);
  };

  const restoreCaret = (caret: number) => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(caret, caret);
    });
  };

  const insertCharacter = (character: string) => {
    const start = inputRef.current?.selectionStart ?? query.length;
    const end = inputRef.current?.selectionEnd ?? start;
    const next = insertAtSelection(query, character, start, end);
    setQuery(next.value);
    restoreCaret(next.caret);
  };

  const backspace = () => {
    const start = inputRef.current?.selectionStart ?? query.length;
    const end = inputRef.current?.selectionEnd ?? start;
    const next = backspaceAtSelection(query, start, end);
    setQuery(next.value);
    restoreCaret(next.caret);
  };

  return (
    <div className="conjugator-page conjugator-redesign" data-dialect={dialect}>
      <header className="conjugator-topbar">
        <div className="conjugator-topbar__inner">
          <div className="conjugator-brand">
            <Image src={brand.logoPath} alt="TUN" width={58} height={42} priority />
            <div><strong>{copy.title}</strong><span>{copy.subtitle}</span></div>
          </div>
          <LanguageToggle value={language} onChange={setLanguage} />
        </div>
      </header>

      <main className="conjugator-workspace">
        <ConjugatorSidebar
          query={query}
          dialect={dialect}
          language={language}
          selectedVerb={selectedVerb}
          status={searchStatus}
          inputRef={inputRef}
          keyboardOpen={keyboardOpen}
          textCase={options.textCase}
          showTranscription={options.transcription}
          recentVerbs={recentVerbs}
          onQueryChange={(value) => { setQuery(value); if (searchStatus !== "idle") setSearchStatus("idle"); }}
          onSubmit={submitSearch}
          onErase={eraseSearch}
          onDialectChange={updateDialect}
          onKeyboardToggle={() => setKeyboardOpen((open) => !open)}
          onInsert={insertCharacter}
          onBackspace={backspace}
          onClearKeyboard={eraseSearch}
          onTranscriptionChange={(transcription) => setOptions((current) => ({ ...current, transcription }))}
          onSelectRecent={selectRecent}
        />

        <section className="conjugator-main">
          {selectedVerb && selectedData && affirmativeResult && negativeResult ? (
            <>
              <VerbSummary verb={selectedVerb} dialect={dialect} language={language} showTranscription={options.transcription} textCase={options.textCase} />
              <section className="conjugation-workspace-card">
                <TenseTabs value={activeView} language={language} onChange={setActiveView} />
                {activeView === "fullSentences" ? (
                  <SentenceConjugation verb={selectedVerb} dialect={dialect} language={language} options={options} />
                ) : (
                  <TenseComparison
                    verb={selectedVerb}
                    affirmative={affirmativeResult}
                    negative={negativeResult}
                    tense={activeView}
                    language={language}
                    showTranscription={options.transcription}
                    textCase={options.textCase}
                  />
                )}
                <p className="speaker-help">ⓘ {copy.speakerTip}</p>
              </section>
            </>
          ) : (
            <section className="conjugator-empty-state">
              <strong>{searchStatus === "not-found" ? copy.noResults : copy.searchForVerb}</strong>
              <span>{copy.searchHelp}</span>
            </section>
          )}
        </section>

        <aside className="conjugator-resources">
          <PromoPanels language={language} />
        </aside>
      </main>
    </div>
  );
}
