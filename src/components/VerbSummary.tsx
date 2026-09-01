import type { Dialect, InterfaceLanguage, TextCaseMode, Verb } from "@/types/verb";
import { getVerbMetadata } from "@/lib/metadata/metadata";
import { applyTextCase } from "@/lib/presentation/format";
import { transliterateArmenian } from "@/lib/transliteration/transliterate";

interface VerbSummaryProps {
  verb: Verb;
  dialect: Dialect;
  language: InterfaceLanguage;
  showTranscription: boolean;
  textCase: TextCaseMode;
}

function hasArmenian(value: string) {
  return /[\u0530-\u058F]/u.test(value);
}

export function VerbSummary({ verb, dialect, language, showTranscription, textCase }: VerbSummaryProps) {
  const fields = getVerbMetadata(verb, dialect, language);

  return (
    <section className="metadata-section" aria-label={language === "ru" ? "Грамматическая информация о глаголе" : "Verb grammatical information"}>
      <div className="metadata-table-wrap">
        <table className="metadata-table">
          <thead><tr>{fields.map((field) => <th key={field.key}>{field.label}</th>)}</tr></thead>
          <tbody>
            <tr>{fields.map((field) => {
              const armenian = hasArmenian(field.value);
              const value = armenian ? applyTextCase(field.value, textCase) : field.value;
              return (
                <td key={field.key}>
                  {field.key === "group" ? <span className="group-badge">{value}</span> : field.key === "irregular" ? <span className="yes-no-badge">{value}</span> : <strong>{value}</strong>}
                  {showTranscription && armenian && field.value !== "—" && <small>{transliterateArmenian(field.value, dialect)}</small>}
                </td>
              );
            })}</tr>
          </tbody>
        </table>
      </div>

      <div className="metadata-cards">
        {fields.map((field) => {
          const armenian = hasArmenian(field.value);
          return (
            <article key={field.key}>
              <span>{field.label}</span>
              <strong>{armenian ? applyTextCase(field.value, textCase) : field.value}</strong>
              {showTranscription && armenian && field.value !== "—" && <small>{transliterateArmenian(field.value, dialect)}</small>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
