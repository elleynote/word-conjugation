"use client";

import { useMemo, useState } from "react";
import { applyLegacyDisplayOptions } from "@/lib/options/applyLegacyDisplayOptions";
import { conjugateVerb } from "@/lib/conjugation/conjugate";
import { copyFor } from "@/lib/i18n/copy";
import { englishSentenceFor } from "@/lib/sentences/englishSentence";
import { applyTextCase } from "@/lib/presentation/format";
import { transliterateArmenian } from "@/lib/transliteration/transliterate";
import { PERSONS, TENSES, type Dialect, type InterfaceLanguage, type LegacyDisplayOptions, type Polarity, type Tense, type Verb } from "@/types/verb";
import { SpeakButton } from "./SpeakButton";

interface SentenceConjugationProps {
  verb: Verb;
  dialect: Dialect;
  language: InterfaceLanguage;
  options: LegacyDisplayOptions;
}

export function SentenceConjugation({ verb, dialect, language, options }: SentenceConjugationProps) {
  const copy = copyFor(language);
  const [tense, setTense] = useState<Tense>("present");
  const [polarity, setPolarity] = useState<Polarity>("affirmative");
  const [expanded, setExpanded] = useState(false);
  const dialectData = verb.dialects[dialect]!;
  const englishHeadword = verb.english[0]?.trim() ?? "";

  const result = useMemo(
    () => applyLegacyDisplayOptions(conjugateVerb(verb, dialect, polarity), dialectData, dialect, options),
    [verb, dialect, polarity, dialectData, options],
  );

  const rows = PERSONS.map((person) => {
    const form = result.tenses[tense].forms[person];
    const armenian = form.armenian === "—" ? "—" : `${result.pronouns[person]} ${form.armenian}`;
    return {
      person,
      armenian,
      transcription: armenian === "—" ? "—" : transliterateArmenian(armenian, dialect),
      english: englishHeadword ? englishSentenceFor(englishHeadword, tense, polarity, person) : "",
    };
  }).filter((row) => row.armenian !== "—");

  return (
    <section className="full-sentences" data-expanded={expanded ? "true" : "false"}>
      <div className="full-sentences__header">
        <div>
          <h2>{copy.sentenceTitle}</h2>
          <p>{copy.sentenceHelp}</p>
        </div>
        <div className="full-sentences__controls">
          <label>
            <span>{copy.tense}</span>
            <select value={tense} onChange={(event) => setTense(event.target.value as Tense)}>
              {TENSES.map((value) => <option key={value} value={value}>{copy.tenses[value]}</option>)}
            </select>
          </label>
          <div className="full-sentences__polarity" aria-label={copy.polarity}>
            <button type="button" className={polarity === "affirmative" ? "is-active" : ""} onClick={() => setPolarity("affirmative")}>{copy.affirmative}</button>
            <button type="button" className={polarity === "negative" ? "is-active" : ""} onClick={() => setPolarity("negative")}>{copy.negative}</button>
          </div>
        </div>
      </div>

      <div className="full-sentences__grid">
        {rows.map((row, index) => (
          <article className="full-sentence-card" key={row.person} data-mobile-hidden={!expanded && index >= 3 ? "true" : "false"}>
            <div className="full-sentence-card__armenian">
              <strong>{applyTextCase(row.armenian, options.textCase)}</strong>
              <SpeakButton text={row.armenian} language="hy" dialect={dialect} ariaLabel={`Play ${row.armenian}`} />
            </div>
            {options.transcription && <span className="full-sentence-card__transcription">{row.transcription}</span>}
            {row.english && <div className="full-sentence-card__english"><span>{row.english}</span></div>}
          </article>
        ))}
      </div>

      {rows.length > 3 && (
        <button type="button" className="full-sentences__expand" onClick={() => setExpanded((value) => !value)}>
          {expanded ? copy.collapse : copy.showAll}
        </button>
      )}
    </section>
  );
}
