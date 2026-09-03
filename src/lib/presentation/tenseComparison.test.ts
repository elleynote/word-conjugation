import { describe, expect, it } from "vitest";
import { PERSONS, TENSES, type ConjugatedForm, type ConjugationResult, type Person, type Tense, type TenseResult } from "@/types/verb";
import { buildTenseComparisonRows } from "./tenseComparison";

function makeResult(value: string, polarity: "affirmative" | "negative"): ConjugationResult {
  const forms = Object.fromEntries(PERSONS.map((person) => [person, { armenian: value, transliteration: value }])) as Record<Person, ConjugatedForm>;
  const tenses = Object.fromEntries(TENSES.map((tense) => [tense, { tense, label: tense, forms }])) as Record<Tense, TenseResult>;
  return {
    verbId: "test",
    dialect: "western",
    polarity,
    pronouns: {
      firstSingular: "ես", secondSingular: "դուն", thirdSingular: "ան",
      firstPlural: "մենք", secondPlural: "դուք", thirdPlural: "անոնք",
    },
    tenses,
  };
}

describe("buildTenseComparisonRows", () => {
  it("pairs affirmative and negative forms by person", () => {
    const rows = buildTenseComparisonRows(makeResult("կը սիրեմ", "affirmative"), makeResult("չեմ սիրեր", "negative"), "present");
    expect(rows[0]).toMatchObject({ person: "firstSingular", pronoun: "ես", affirmative: { armenian: "կը սիրեմ" }, negative: { armenian: "չեմ սիրեր" } });
  });
});
