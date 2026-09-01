import { describe, expect, it } from "vitest";
import { applyTextCase, visibleTranscription } from "./format";

describe("presentation format helpers", () => {
  it("supports the legacy case modes", () => {
    expect(applyTextCase("գրել", "upper")).toBe("ԳՐԵԼ");
    expect(applyTextCase("ԳՐԵԼ", "lower")).toBe("գրել");
  });
  it("hides transcription without changing the source form", () => {
    expect(visibleTranscription("grel", false)).toBe("");
    expect(visibleTranscription("grel", true)).toBe("grel");
  });
});
