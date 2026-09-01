import { describe, expect, it } from "vitest";
import { getDialectPresentation } from "./dialectPresentation";

describe("getDialectPresentation", () => {
  it("matches the original Western control set", () => {
    const policy = getDialectPresentation("western");
    expect(policy.optionKeys).toEqual(["transcription", "continuousForm", "mediativeForm"]);
    expect(policy.theme).toBe("navy");
  });

  it("matches the original Eastern control set", () => {
    const policy = getDialectPresentation("eastern");
    expect(policy.optionKeys).toEqual(["transcription", "probableFuture"]);
    expect(policy.theme).toBe("burgundy");
  });
});
