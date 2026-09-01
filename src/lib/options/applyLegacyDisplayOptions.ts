import type { ConjugatedForm, ConjugationResult, Dialect, DialectVerbData, LegacyDisplayOptions, Person, Tense } from "../../types/verb";
import { PERSONS } from "../../types/verb";
import { transliterateArmenian } from "../transliteration/transliterate";

function replaceTenseForms(
  result: ConjugationResult,
  tense: Tense,
  forms: Partial<Record<Person, string>> | undefined,
  dialect: Dialect,
): ConjugationResult {
  if (!forms) return result;

  const nextForms = { ...result.tenses[tense].forms };
  for (const person of PERSONS) {
    const armenian = forms[person];
    if (!armenian) continue;
    const form: ConjugatedForm = {
      armenian,
      transliteration: transliterateArmenian(armenian, dialect),
    };
    nextForms[person] = form;
  }

  return {
    ...result,
    tenses: {
      ...result.tenses,
      [tense]: {
        ...result.tenses[tense],
        forms: nextForms,
      },
    },
  };
}

export function applyLegacyDisplayOptions(
  result: ConjugationResult,
  data: DialectVerbData,
  dialect: Dialect,
  options: LegacyDisplayOptions,
): ConjugationResult {
  if (result.polarity !== "affirmative") return result;

  let next = result;
  if (dialect === "eastern" && options.probableFuture) {
    next = replaceTenseForms(next, "future", data.probableFuture, dialect);
  }
  if (dialect === "western" && options.continuousForm) {
    next = replaceTenseForms(next, "present", data.continuousForms, dialect);
  }
  if (dialect === "western" && options.mediativeForm) {
    next = replaceTenseForms(next, "presentPerfect", data.mediativeForms, dialect);
  }
  return next;
}
