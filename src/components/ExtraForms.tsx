import type { Dialect, DialectVerbData, InterfaceLanguage, LegacyDisplayOptions, Person, TextCaseMode } from "@/types/verb";
import { PERSONS } from "@/types/verb";
import { getVisibleExtraSections } from "@/lib/options/displayOptions";
import { copyFor } from "@/lib/i18n/copy";
import { applyTextCase } from "@/lib/presentation/format";
import { transliterateArmenian } from "@/lib/transliteration/transliterate";
import { pronouns } from "@/lib/conjugation/rules";

interface ExtraFormsProps {
  data: DialectVerbData;
  dialect: Dialect;
  language: InterfaceLanguage;
  options: LegacyDisplayOptions;
  textCase: TextCaseMode;
}

const localizedLabels = {
  en: { probableFuture: "Probable future", continuous: "Continuous form", mediative: "Mediative form" },
  fr: { probableFuture: "Futur probable", continuous: "Forme continue", mediative: "Forme médiative" },
};

export function ExtraForms({ data, dialect, language, options, textCase }: ExtraFormsProps) {
  const sections = getVisibleExtraSections(data, options);
  const anyExtraOption = options.probableFuture || options.continuousForm || options.mediativeForm;
  const copy = copyFor(language);
  if (!anyExtraOption) return null;

  if (!sections.length) return <div className="extra-empty">{copy.extraEmpty}</div>;

  return (
    <section className="extra-forms" aria-label="Additional conjugation forms">
      {sections.map((section) => (
        <article key={section.key} className="extra-form-card">
          <h3>{localizedLabels[language][section.key]}</h3>
          <div>
            {PERSONS.map((person: Person) => {
              const form = section.forms[person] ?? "—";
              return (
                <div className="extra-form-row" key={person}>
                  <span>{applyTextCase(pronouns[dialect][person], textCase)}</span>
                  <strong>{applyTextCase(form, textCase)}</strong>
                  {options.transcription && form !== "—" && <small>{transliterateArmenian(form, dialect)}</small>}
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </section>
  );
}
