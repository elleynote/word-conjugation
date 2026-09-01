import { describe, expect, it } from "vitest";
import { verbs } from "../../data/verbs";
import { conjugateVerb } from "../conjugation/conjugate";
import { applyLegacyDisplayOptions } from "./applyLegacyDisplayOptions";

const write = verbs.find((verb) => verb.id === "write")!;

const baseOptions = {
  transcription: true,
  probableFuture: false,
  continuousForm: false,
  mediativeForm: false,
  textCase: "title" as const,
};

describe("applyLegacyDisplayOptions", () => {
  it("uses stored Eastern probable-future forms in the main Future column", () => {
    const data = write.dialects.eastern!;
    const result = applyLegacyDisplayOptions(
      conjugateVerb(write, "eastern", "affirmative"),
      data,
      "eastern",
      { ...baseOptions, probableFuture: true },
    );
    expect(result.tenses.future.forms.firstSingular.armenian).toBe(data.probableFuture?.firstSingular);
  });

  it("uses Western continuous forms in the main Present column", () => {
    const data = write.dialects.western!;
    const result = applyLegacyDisplayOptions(
      conjugateVerb(write, "western", "affirmative"),
      data,
      "western",
      { ...baseOptions, continuousForm: true },
    );
    expect(result.tenses.present.forms.firstSingular.armenian).toBe(data.continuousForms?.firstSingular);
  });

  it("uses Western mediative forms in the main Present Perfect column", () => {
    const data = write.dialects.western!;
    const result = applyLegacyDisplayOptions(
      conjugateVerb(write, "western", "affirmative"),
      data,
      "western",
      { ...baseOptions, mediativeForm: true },
    );
    expect(result.tenses.presentPerfect.forms.firstSingular.armenian).toBe(data.mediativeForms?.firstSingular);
  });
});
