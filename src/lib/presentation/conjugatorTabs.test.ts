import { describe, expect, it } from "vitest";
import { CONJUGATOR_VIEWS, labelForConjugatorView } from "./conjugatorTabs";

describe("conjugator tabs", () => {
  it("uses the approved order", () => {
    expect(CONJUGATOR_VIEWS).toEqual(["present", "imperfect", "preterite", "future", "conditional", "presentPerfect", "pluperfect", "fullSentences"]);
  });

  it("uses the approved English labels", () => {
    expect(labelForConjugatorView("preterite", "en")).toBe("Simple Past");
    expect(labelForConjugatorView("pluperfect", "en")).toBe("Past Perfect");
    expect(labelForConjugatorView("fullSentences", "en")).toBe("Full Sentences");
  });
});
