import { describe, expect, it } from "vitest";
import { verbs } from "../../data/verbs";
import { conjugateVerb } from "./conjugate";

const write = verbs.find((verb) => verb.id === "write")!;
const be = verbs.find((verb) => verb.id === "be")!;

describe("conjugateVerb", () => {
  it("generates an Eastern Armenian present paradigm", () => {
    const result = conjugateVerb(write, "eastern", "affirmative");
    expect(result.tenses.present.forms.firstSingular.armenian).toBe("գրում եմ");
    expect(result.tenses.present.forms.thirdPlural.armenian).toBe("գրում են");
  });

  it("keeps Western Armenian rules separate", () => {
    const result = conjugateVerb(write, "western", "affirmative");
    expect(result.tenses.present.forms.firstSingular.armenian).toBe("կը գրեմ");
  });

  it("routes present forms through negative rules", () => {
    const result = conjugateVerb(write, "eastern", "negative");
    expect(result.tenses.present.forms.firstSingular.armenian).toBe("չեմ գրում");
  });

  it("uses irregular overrides before generated rules", () => {
    const result = conjugateVerb(be, "eastern", "affirmative");
    expect(result.tenses.present.forms.firstSingular.armenian).toBe("եմ");
    expect(result.tenses.present.forms.thirdSingular.armenian).toBe("է");
  });

  it("marks non-applicable imperative persons as unavailable", () => {
    const result = conjugateVerb(write, "eastern", "affirmative");
    expect(result.tenses.imperative.forms.firstSingular.armenian).toBe("—");
    expect(result.tenses.imperative.forms.secondPlural.armenian).not.toBe("—");
  });
});
