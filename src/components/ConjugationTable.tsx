import type { ConjugationResult, InterfaceLanguage, Person, TextCaseMode, Tense } from "@/types/verb";
import { PERSONS, TENSES } from "@/types/verb";
import { copyFor } from "@/lib/i18n/copy";
import { applyTextCase } from "@/lib/presentation/format";
import { transliterateArmenian } from "@/lib/transliteration/transliterate";

const personLabels: Record<Person, string> = {
  firstSingular: "1st singular",
  secondSingular: "2nd singular",
  thirdSingular: "3rd singular",
  firstPlural: "1st plural",
  secondPlural: "2nd plural",
  thirdPlural: "3rd plural",
};

interface ConjugationTableProps {
  result: ConjugationResult;
  language: InterfaceLanguage;
  showTranscription: boolean;
  textCase: TextCaseMode;
}

function Form({ armenian, transcription, textCase, showTranscription }: { armenian: string; transcription: string; textCase: TextCaseMode; showTranscription: boolean }) {
  return (
    <>
      <strong className="armenian-form">{applyTextCase(armenian, textCase)}</strong>
      {showTranscription && transcription !== "—" && <small>{transcription}</small>}
    </>
  );
}

export function ConjugationTable({ result, language, showTranscription, textCase }: ConjugationTableProps) {
  const copy = copyFor(language);

  return (
    <>
      <div className="conjugation-table-wrap">
        <table className="conjugation-table">
          <thead>
            <tr>
              <th>{copy.pronouns}</th>
              {TENSES.map((tense) => <th key={tense}>{copy.tenses[tense]}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERSONS.map((person) => (
              <tr key={person}>
                <th scope="row">
                  <strong>{applyTextCase(result.pronouns[person], textCase)}</strong>
                  {showTranscription && <small>{transliterateArmenian(result.pronouns[person], result.dialect)}</small>}
                </th>
                {TENSES.map((tense) => {
                  const form = result.tenses[tense].forms[person];
                  return <td key={tense}><Form armenian={form.armenian} transcription={form.transliteration} textCase={textCase} showTranscription={showTranscription} /></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-tense-grid">
        {TENSES.map((tense: Tense) => (
          <article className="mobile-tense-card" key={tense}>
            <h3>{copy.tenses[tense]}</h3>
            {PERSONS.map((person) => {
              const form = result.tenses[tense].forms[person];
              return (
                <div className="mobile-tense-row" key={person}>
                  <div><strong>{applyTextCase(result.pronouns[person], textCase)}</strong><small>{personLabels[person]}</small></div>
                  <div><Form armenian={form.armenian} transcription={form.transliteration} textCase={textCase} showTranscription={showTranscription} /></div>
                </div>
              );
            })}
          </article>
        ))}
      </div>
    </>
  );
}
