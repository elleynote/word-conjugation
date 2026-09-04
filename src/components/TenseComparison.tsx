import type { ConjugatedForm, ConjugationResult, Dialect, InterfaceLanguage, Person, Polarity, Tense, TextCaseMode, Verb } from "@/types/verb";
import { copyFor } from "@/lib/i18n/copy";
import { applyTextCase } from "@/lib/presentation/format";
import { buildTenseComparisonRows } from "@/lib/presentation/tenseComparison";
import { englishSentenceFor } from "@/lib/sentences/englishSentence";
import { SpeakButton } from "./SpeakButton";

const personLabels: Record<InterfaceLanguage, Record<Person, string>> = {
  en: {
    firstSingular: "I",
    secondSingular: "you (singular)",
    thirdSingular: "he / she",
    firstPlural: "we",
    secondPlural: "you (plural)",
    thirdPlural: "they",
  },
  ru: {
    firstSingular: "я",
    secondSingular: "ты",
    thirdSingular: "он / она",
    firstPlural: "мы",
    secondPlural: "вы",
    thirdPlural: "они",
  },
};

interface FormCellProps {
  form: ConjugatedForm;
  english: string;
  dialect: Dialect;
  textCase: TextCaseMode;
  showTranscription: boolean;
}

function FormCell({ form, english, dialect, textCase, showTranscription }: FormCellProps) {
  if (form.armenian === "—") return <span className="comparison-form__empty">—</span>;
  const armenian = applyTextCase(form.armenian, textCase);

  return (
    <div className="comparison-form">
      <div className="comparison-form__primary">
        <strong>{armenian}</strong>
        <SpeakButton text={form.armenian} language="hy" dialect={dialect} ariaLabel={`Play ${form.armenian}`} />
      </div>
      {showTranscription && form.transliteration !== "—" && <span className="comparison-form__transliteration">{form.transliteration}</span>}
      {english && <div className="comparison-form__english"><span>{english}</span></div>}
    </div>
  );
}

interface TenseComparisonProps {
  verb: Verb;
  affirmative: ConjugationResult;
  negative: ConjugationResult;
  tense: Tense;
  language: InterfaceLanguage;
  showTranscription: boolean;
  textCase: TextCaseMode;
}

export function TenseComparison({ verb, affirmative, negative, tense, language, showTranscription, textCase }: TenseComparisonProps) {
  const copy = copyFor(language);
  const rows = buildTenseComparisonRows(affirmative, negative, tense);
  const headword = verb.english[0]?.trim() ?? "";
  const sentence = (polarity: Polarity, person: Person) => headword ? englishSentenceFor(headword, tense, polarity, person) : "";

  return (
    <>
      <div className="tense-comparison-desktop">
        <table className="tense-comparison-table">
          <thead>
            <tr>
              <th>{copy.person}</th>
              <th className="is-affirmative">{copy.affirmative}</th>
              <th className="is-negative">{copy.negative}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.person}>
                <th scope="row">
                  <strong>{personLabels[language][row.person]}</strong>
                  <small>{row.pronoun}</small>
                </th>
                <td><FormCell form={row.affirmative} english={sentence("affirmative", row.person)} dialect={affirmative.dialect} textCase={textCase} showTranscription={showTranscription} /></td>
                <td><FormCell form={row.negative} english={sentence("negative", row.person)} dialect={negative.dialect} textCase={textCase} showTranscription={showTranscription} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tense-comparison-mobile">
        {rows.map((row) => (
          <article className="tense-mobile-card" key={row.person}>
            <header>
              <strong>{personLabels[language][row.person]}</strong>
              <span>{row.pronoun}</span>
            </header>
            <div className="tense-mobile-card__form is-affirmative">
              <span className="tense-mobile-card__label">{copy.affirmative}</span>
              <FormCell form={row.affirmative} english={sentence("affirmative", row.person)} dialect={affirmative.dialect} textCase={textCase} showTranscription={showTranscription} />
            </div>
            <div className="tense-mobile-card__form is-negative">
              <span className="tense-mobile-card__label">{copy.negative}</span>
              <FormCell form={row.negative} english={sentence("negative", row.person)} dialect={negative.dialect} textCase={textCase} showTranscription={showTranscription} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
