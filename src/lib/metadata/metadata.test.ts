import { describe, expect, it } from "vitest";
import { getVerbSummaryMetadata } from "./metadata";
import type { Verb } from "@/types/verb";

const verb: Verb = {
  id: "hyw-test",
  english: ["love"],
  russian: [],
  aliases: [],
  dialects: {
    western: {
      lemma: "սիրել",
      transliteration: "sirel",
      group: "E-Class",
      root: "սիր",
      class: "el",
      isIrregular: false,
      participles: {},
      classNumber: 2,
      regularity: "Regular",
      transitivity: "Transitive",
    },
  },
};

describe("getVerbSummaryMetadata", () => {
  it("uses verified source metadata when available", () => {
    expect(getVerbSummaryMetadata(verb, "western", "en")).toEqual([
      { key: "dialect", label: "Dialect", value: "Western" },
      { key: "class", label: "Conjugation class", value: "E-Class" },
      { key: "type", label: "Verb type", value: "Regular" },
      { key: "transitivity", label: "Transitivity", value: "Transitive" },
    ]);
  });
});
