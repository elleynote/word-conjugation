import { describe, expect, it } from "vitest";
import { MAX_SPEECH_TEXT_LENGTH, speechInstructions, validateSpeechRequest } from "./speech";

describe("validateSpeechRequest", () => {
  it("accepts Armenian when a dialect is supplied", () => {
    expect(validateSpeechRequest({ text: "կը սիրեմ", language: "hy", dialect: "western" })).toEqual({
      ok: true,
      value: { text: "կը սիրեմ", language: "hy", dialect: "western" },
    });
  });

  it("requires a dialect for Armenian", () => {
    expect(validateSpeechRequest({ text: "սիրել", language: "hy" }).ok).toBe(false);
  });

  it("accepts English and Russian without a dialect", () => {
    expect(validateSpeechRequest({ text: "I love", language: "en" }).ok).toBe(true);
    expect(validateSpeechRequest({ text: "любить", language: "ru" }).ok).toBe(true);
  });

  it("rejects overly long text", () => {
    expect(validateSpeechRequest({ text: "a".repeat(MAX_SPEECH_TEXT_LENGTH + 1), language: "en" }).ok).toBe(false);
  });
});

describe("speechInstructions", () => {
  it("distinguishes Western and Eastern Armenian guidance", () => {
    expect(speechInstructions("hy", "western")).toContain("Western Armenian");
    expect(speechInstructions("hy", "eastern")).toContain("Eastern Armenian");
  });
});
