import { PERSONS, type ConjugatedForm, type ConjugationResult, type Person, type Tense } from "@/types/verb";

export interface TenseComparisonRow {
  person: Person;
  pronoun: string;
  affirmative: ConjugatedForm;
  negative: ConjugatedForm;
}

export function buildTenseComparisonRows(
  affirmative: ConjugationResult,
  negative: ConjugationResult,
  tense: Tense,
): TenseComparisonRow[] {
  return PERSONS.map((person) => ({
    person,
    pronoun: affirmative.pronouns[person],
    affirmative: affirmative.tenses[tense].forms[person],
    negative: negative.tenses[tense].forms[person],
  }));
}
