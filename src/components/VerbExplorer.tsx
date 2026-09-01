"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { brand } from "@/config/brand";
import { verbs } from "@/data/verbs";
import { conjugateVerb } from "@/lib/conjugation/conjugate";
import { backspaceAtSelection, insertAtSelection } from "@/lib/keyboard/insertAtSelection";
import { searchVerbs } from "@/lib/search/searchVerbs";
import { getCorpusStats } from "@/lib/corpus/stats";
import { copyFor } from "@/lib/i18n/copy";
import { applyLegacyDisplayOptions } from "@/lib/options/applyLegacyDisplayOptions";
import type { Dialect, InterfaceLanguage, LegacyDisplayOptions, Polarity, Verb } from "@/types/verb";
import { ArmenianKeyboard } from "./ArmenianKeyboard";
import { ConjugationTable } from "./ConjugationTable";
import { CorpusStats } from "./CorpusStats";
import { DialectToggle } from "./DialectToggle";
import { LanguageToggle } from "./LanguageToggle";
import { LegacyOptions } from "./LegacyOptions";
import { PromoPanels } from "./PromoPanels";
import { SearchBar } from "./SearchBar";
import { SentenceConjugation } from "./SentenceConjugation";
import { TextCaseToggle } from "./TextCaseToggle";
import { VerbSummary } from "./VerbSummary";

const initialVerb = verbs.find((verb) => verb.id === "write") ?? verbs[0];

export function VerbExplorer() {
  const [language, setLanguage] = useState<InterfaceLanguage>("en");
  const [dialect, setDialect] = useState<Dialect>("western");
  const [polarity, setPolarity] = useState<Polarity>("affirmative");
  const [options, setOptions] = useState<LegacyDisplayOptions>({
    transcription: true,
    probableFuture: false,
    continuousForm: false,
    mediativeForm: false,
    textCase: "title",
  });
  const [query, setQuery] = useState(initialVerb.dialects.western?.lemma ?? initialVerb.english[0]);
  const [selectedVerb, setSelectedVerb] = useState<Verb>(initialVerb);
  const inputRef = useRef<HTMLInputElement>(null);

  const copy = copyFor(language);
  const suggestions = useMemo(() => searchVerbs(query, dialect), [query, dialect]);
  const stats = useMemo(() => getCorpusStats(verbs), []);
  const selectedData = selectedVerb.dialects[dialect]!;
  const result = useMemo(
    () => applyLegacyDisplayOptions(conjugateVerb(selectedVerb, dialect, polarity), selectedData, dialect, options),
    [selectedVerb, selectedData, dialect, polarity, options],
  );

  const selectVerb = (verb: Verb) => {
    setSelectedVerb(verb);
    setQuery(verb.dialects[dialect]?.lemma ?? verb.english[0]);
  };

  const submitSearch = () => {
    const match = suggestions[0];
    if (match) selectVerb(match);
  };

  const eraseSearch = () => {
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const updateDialect = (nextDialect: Dialect) => {
    setDialect(nextDialect);
    setPolarity("affirmative");
    setOptions((current) => ({
      ...current,
      transcription: true,
      probableFuture: nextDialect === "eastern",
      continuousForm: false,
      mediativeForm: false,
    }));
    const active = selectedVerb.dialects[nextDialect];
    if (active) {
      setQuery(active.lemma);
      return;
    }
    const fallback = searchVerbs(query, nextDialect)[0] ?? verbs.find((verb) => verb.dialects[nextDialect]);
    if (fallback) {
      setSelectedVerb(fallback);
      setQuery(fallback.dialects[nextDialect]?.lemma ?? fallback.english[0]);
    }
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
    <div className="conjugator-page" data-dialect={dialect}>
      <section className="original-hero">
        <div className="original-hero__inner">
          <div className="hero-copy">
            <span className="hero-kicker">Բարի գալուստ</span>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>

          <div className="hero-emblem" aria-label="TUN Armenian learning">
            <div className="hero-emblem__ornament" aria-hidden="true">Ա · Բ · Գ</div>
            <Image src={brand.logoPath} alt="TUN" width={112} height={80} priority />
            <span>Armenian learning tools</span>
          </div>

          <LanguageToggle value={language} onChange={setLanguage} />
        </div>
      </section>

      <main className="tool-shell">
        <section className="main-tool-card">
          <div className="tool-grid">
            <ArmenianKeyboard language={language} textCase={options.textCase} onInsert={insertCharacter} onBackspace={backspace} onClear={eraseSearch} />

            <div className="settings-block">
              <DialectToggle value={dialect} language={language} onChange={updateDialect} />
              <LegacyOptions options={options} dialect={dialect} language={language} onChange={setOptions} />
              <TextCaseToggle value={options.textCase} onChange={(textCase) => setOptions((current) => ({ ...current, textCase }))} />
            </div>

            <CorpusStats stats={stats} language={language} />
          </div>

          <SearchBar
            query={query}
            dialect={dialect}
            language={language}
            selectedVerb={selectedVerb}
            inputRef={inputRef}
            onQueryChange={setQuery}
            onSubmit={submitSearch}
            onErase={eraseSearch}
          />
        </section>

        <VerbSummary verb={selectedVerb} dialect={dialect} showTranscription={options.transcription} textCase={options.textCase} />

        <SentenceConjugation verb={selectedVerb} dialect={dialect} language={language} options={options} />

        <section className="conjugation-section">
          <div className="polarity-tabs" role="tablist" aria-label="Conjugation polarity">
            <button role="tab" aria-selected={polarity === "affirmative"} className={polarity === "affirmative" ? "is-active" : ""} onClick={() => setPolarity("affirmative")}>{copy.affirmative}</button>
            <button role="tab" aria-selected={polarity === "negative"} className={polarity === "negative" ? "is-active" : ""} onClick={() => setPolarity("negative")}>{copy.negative}</button>
          </div>
          <ConjugationTable result={result} language={language} showTranscription={options.transcription} textCase={options.textCase} />
        </section>

        <PromoPanels language={language} />
      </main>
    </div>
  );
}
