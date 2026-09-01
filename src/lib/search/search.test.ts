import { describe, expect, it } from "vitest";
import { normalizeSearchQuery } from "./normalize";
import { searchVerbs } from "./searchVerbs";

describe("normalizeSearchQuery", () => {
  it("normalizes English infinitive prefixes and case", () => {
    expect(normalizeSearchQuery("  TO Read  ")).toBe("read");
  });

  it("normalizes unicode and punctuation spacing", () => {
    expect(normalizeSearchQuery("  գրել... ")).toBe("գրել");
  });
});

describe("searchVerbs", () => {
  it("finds verbs by transliteration", () => {
    expect(searchVerbs("grel")[0]?.id).toBe("write");
  });

  it("finds aliases and partial translations", () => {
    expect(searchVerbs("study").some((verb) => verb.id === "learn")).toBe(true);
  });

  it("finds Russian translations", () => {
    expect(searchVerbs("любить")[0]?.id).toBe("love");
    expect(searchVerbs("писать")[0]?.id).toBe("write");
  });

  it("filters results to verbs available in a dialect", () => {
    expect(searchVerbs("to be", "western")[0]?.dialects.western?.lemma).toBe("ըլլալ");
  });
});
