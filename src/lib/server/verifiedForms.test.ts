import { describe, expect, it } from "vitest";
import { verifiedFormsToOverrides } from "./verifiedForms";

describe("verifiedFormsToOverrides", () => {
  it("maps source-derived tense/person forms into conjugation overrides", () => {
    const overrides = verifiedFormsToOverrides({
      affirmative: {
        present: { firstSingular: "կը սիրեմ", secondSingular: "կը սիրես" },
        future: { firstSingular: "պիտի սիրեմ" },
      },
      negative: {
        present: { firstSingular: "չեմ սիրեր" },
      },
    });

    expect(overrides.affirmative?.present?.firstSingular).toBe("կը սիրեմ");
    expect(overrides.affirmative?.future?.firstSingular).toBe("պիտի սիրեմ");
    expect(overrides.negative?.present?.firstSingular).toBe("չեմ սիրեր");
  });

  it("ignores unknown keys and empty values", () => {
    const overrides = verifiedFormsToOverrides({
      affirmative: { present: { firstSingular: "", unknownPerson: "bad" } },
      unknownPolarity: { present: { firstSingular: "bad" } },
    });
    expect(overrides).toEqual({});
  });
});