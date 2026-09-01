"use client";

import { useMemo, useState } from "react";
import { applyLegacyDisplayOptions } from "@/lib/options/applyLegacyDisplayOptions";
import { conjugateVerb } from "@/lib/conjugation/conjugate";
import { copyFor } from "@/lib/i18n/copy";
import { englishSentenceFor } from "@/lib/sentences/englishSentence";
import { applyTextCase } from "@/lib/presentation/format";
import { transliterateArmenian } from "@/lib/transliteration/transliterate";
import { PERSONS, TENSES, type Dialect, type InterfaceLanguage, type LegacyDisplayOptions, type Polarity, type Tense, type Verb } from "@/types/verb";

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
      english: englishSentenceFor(verb.english[0], tense, polarity, person),
    };
  }).filter((row) => row.armenian !== "—");

  return (
    <section className="sentence-conjugation" data-expanded={expanded ? "true" : "false"}>
      <div className="sentence-conjugation__header">
        <div>
          <span className="section-eyebrow">{copy.sentenceTitle}</span>
          <h2>{copy.sentenceTitle}</h2>
          <p>{copy.sentenceHelp}</p>
        </div>

        <div className="sentence-controls">
          <label>
            <span>{copy.tense}</span>
            <select value={tense} onChange={(event) => setTense(event.target.value as Tense)}>
              {TENSES.map((value) => <option key={value} value={value}>{copy.tenses[value]}</option>)}
            </select>
          </label>

          <div className="sentence-polarity" aria-label={copy.polarity}>
            <button type="button" className={polarity === "affirmative" ? "is-active" : ""} onClick={() => setPolarity("affirmative")}>{copy.affirmative}</button>
            <button type="button" className={polarity === "negative" ? "is-active" : ""} onClick={() => setPolarity("negative")}>{copy.negative}</button>
          </div>
        </div>
      </div>

      <div className="sentence-grid">
        {rows.map((row, index) => (
          <article className="sentence-card" key={row.person} data-mobile-hidden={!expanded && index >= 3 ? "true" : "false"}>
            <strong className="sentence-card__armenian">{applyTextCase(row.armenian, options.textCase)}</strong>
            {options.transcription && <span className="sentence-card__transcription">{row.transcription}</span>}
            <span className="sentence-card__english">{row.english}</span>
          </article>
        ))}
      </div>

      {rows.length > 3 && (
        <button type="button" className="sentence-expand" onClick={() => setExpanded((value) => !value)}>
          {expanded ? copy.collapse : copy.showAll}
        </button>
      )}
    </section>
  );
}
