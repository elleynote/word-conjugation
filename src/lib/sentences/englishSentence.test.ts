import { describe, expect, it } from "vitest";
import { englishSentenceFor } from "./englishSentence";

describe("englishSentenceFor", () => {
  it("creates present affirmative sentences for love", () => {
    expect(englishSentenceFor("love", "present", "affirmative", "firstSingular")).toBe("I love");
    expect(englishSentenceFor("love", "present", "affirmative", "thirdSingular")).toBe("He/She loves");
    expect(englishSentenceFor("love", "present", "affirmative", "firstPlural")).toBe("We love");
  });

  it("creates present negative sentences", () => {
    expect(englishSentenceFor("love", "present", "negative", "firstSingular")).toBe("I do not love");
    expect(englishSentenceFor("love", "present", "negative", "thirdSingular")).toBe("He/She does not love");
  });

  it("handles common irregular past forms", () => {
    expect(englishSentenceFor("go", "preterite", "affirmative", "firstSingular")).toBe("I went");
    expect(englishSentenceFor("be", "preterite", "affirmative", "thirdSingular")).toBe("He/She was");
  });

  it("creates future and conditional sentences", () => {
    expect(englishSentenceFor("write", "future", "affirmative", "secondSingular")).toBe("You will write");
    expect(englishSentenceFor("write", "conditional", "negative", "thirdPlural")).toBe("They would not write");
  });
});
