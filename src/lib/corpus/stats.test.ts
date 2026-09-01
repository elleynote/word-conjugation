import { describe, expect, it } from "vitest";
import { verbs } from "../../data/verbs";
import { getCorpusStats } from "./stats";

describe("getCorpusStats", () => {
  it("derives counters from the actual bundled corpus", () => {
    const stats = getCorpusStats(verbs);
    expect(stats.western).toBe(verbs.filter((verb) => verb.dialects.western).length);
    expect(stats.eastern).toBe(verbs.filter((verb) => verb.dialects.eastern).length);
    expect(stats.english).toBe(verbs.reduce((total, verb) => total + verb.english.length, 0));
  });
});
