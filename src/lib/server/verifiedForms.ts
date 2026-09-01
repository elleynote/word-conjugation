import type { IrregularOverrides, Person, Polarity, Tense } from "@/types/verb";

const polarities = new Set<Polarity>(["affirmative", "negative"]);
const tenses = new Set<Tense>(["present", "imperfect", "preterite", "imperative", "presentPerfect", "pluperfect", "future", "conditional"]);
const persons = new Set<Person>(["firstSingular", "secondSingular", "thirdSingular", "firstPlural", "secondPlural", "thirdPlural"]);

export function verifiedFormsToOverrides(value: unknown): IrregularOverrides {
  const result: IrregularOverrides = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;

  for (const [polarityKey, tenseMap] of Object.entries(value)) {
    const polarity = polarityKey as Polarity;
    if (!polarities.has(polarity) || !tenseMap || typeof tenseMap !== "object" || Array.isArray(tenseMap)) continue;

    for (const [tenseKey, personMap] of Object.entries(tenseMap)) {
      const tense = tenseKey as Tense;
      if (!tenses.has(tense) || !personMap || typeof personMap !== "object" || Array.isArray(personMap)) continue;

      for (const [personKey, form] of Object.entries(personMap)) {
        const person = personKey as Person;
        if (!persons.has(person) || typeof form !== "string" || !form.trim()) continue;
        result[polarity] ??= {};
        result[polarity]![tense] ??= {};
        result[polarity]![tense]![person] = form.trim();
      }
    }
  }

  return result;
}