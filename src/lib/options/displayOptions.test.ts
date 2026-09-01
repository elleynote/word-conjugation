import { describe, expect, it } from "vitest";
import { verbs } from "../../data/verbs";
import { getVisibleExtraSections } from "./displayOptions";

const write = verbs.find((verb) => verb.id === "write")!;
const eastern = write.dialects.eastern!;

describe("getVisibleExtraSections", () => {
  it("returns no optional sections when all legacy options are disabled", () => {
    expect(getVisibleExtraSections(eastern, {
      transcription: true,
      probableFuture: false,
      continuousForm: false,
      mediativeForm: false,
      textCase: "title",
    })).toEqual([]);
  });

  it("returns enabled sections only when source data exists", () => {
    const sections = getVisibleExtraSections(eastern, {
      transcription: true,
      probableFuture: true,
      continuousForm: true,
      mediativeForm: true,
      textCase: "title",
    });
    expect(sections.map((section) => section.key)).toEqual(["probableFuture", "continuous", "mediative"]);
  });
});
