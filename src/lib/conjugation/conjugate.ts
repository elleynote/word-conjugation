import { transliterateArmenian } from "../transliteration/transliterate";
import { PERSONS, TENSES, type ConjugationResult, type Dialect, type Person, type Polarity, type Tense, type Verb } from "../../types/verb";
import { generatedForm, pronouns, tenseLabels } from "./rules";

function overrideFor(verb: Verb, dialect: Dialect, polarity: Polarity, tense: Tense, person: Person): string | undefined {
  return verb.dialects[dialect]?.irregularOverrides?.[polarity]?.[tense]?.[person];
}

export function conjugateVerb(verb: Verb, dialect: Dialect, polarity: Polarity): ConjugationResult {
  const data = verb.dialects[dialect];
  if (!data) throw new Error(`Verb ${verb.id} is not available in ${dialect} Armenian.`);

  const tenses = Object.fromEntries(
    TENSES.map((tense) => {
      const forms = Object.fromEntries(
        PERSONS.map((person) => {
          const armenian = overrideFor(verb, dialect, polarity, tense, person)
            ?? generatedForm(data, dialect, polarity, tense, person);
          return [person, { armenian, transliteration: armenian === "—" ? "—" : transliterateArmenian(armenian, dialect) }];
        }),
      ) as ConjugationResult["tenses"][Tense]["forms"];

      return [tense, { tense, label: tenseLabels[tense], forms }];
    }),
  ) as ConjugationResult["tenses"];

  return {
    verbId: verb.id,
    dialect,
    polarity,
    pronouns: pronouns[dialect],
    tenses,
  };
}
