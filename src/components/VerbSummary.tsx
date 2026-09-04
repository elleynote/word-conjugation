import type { Dialect, InterfaceLanguage, TextCaseMode, Verb } from "@/types/verb";
import { getVerbSummaryMetadata } from "@/lib/metadata/metadata";
import { applyTextCase } from "@/lib/presentation/format";
import { SpeakButton } from "./SpeakButton";

interface VerbSummaryProps {
  verb: Verb;
  dialect: Dialect;
  language: InterfaceLanguage;
  showTranscription: boolean;
  textCase: TextCaseMode;
}

export function VerbSummary({ verb, dialect, language, showTranscription, textCase }: VerbSummaryProps) {
  const data = verb.dialects[dialect];
  if (!data) return null;

  const fields = getVerbSummaryMetadata(verb, dialect, language);
  const russianMeaning = verb.russian[0];
  const englishMeaning = verb.english[0];
  const meaning = language === "ru" && russianMeaning ? russianMeaning : englishMeaning ?? russianMeaning ?? "";
  const lemma = applyTextCase(data.lemma, textCase);

  return (
    <section className="verb-summary-card" aria-label={language === "ru" ? "Информация о глаголе" : "Verb information"}>
      <div className="verb-summary-card__mark" aria-hidden="true">{data.lemma.trim().slice(0, 1)}</div>
      <div className="verb-summary-card__identity">
        <div className="verb-summary-card__title-row">
          <strong className="verb-summary-card__lemma">{lemma}</strong>
          <SpeakButton text={data.lemma} language="hy" dialect={dialect} ariaLabel={`Play ${data.lemma}`} />
        </div>
        {showTranscription && <span className="verb-summary-card__transliteration">{data.transliteration}</span>}
        {meaning && <div className="verb-summary-card__meaning"><span>{meaning}</span></div>}
      </div>
      <dl className="verb-summary-card__facts">
        {fields.map((field) => (
          <div key={field.key}>
            <dt>{field.label}</dt>
            <dd>{field.value || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
