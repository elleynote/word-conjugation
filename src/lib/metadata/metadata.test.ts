import { describe, expect, it } from "vitest";
import { verbs } from "../../data/verbs";
import { getVerbMetadata } from "./metadata";

const write = verbs.find((verb) => verb.id === "write")!;

describe("getVerbMetadata", () => {
  it("uses the original Western metadata columns", () => {
    expect(getVerbMetadata(write, "western").map((field) => field.label)).toEqual([
      "Name", "Base", "Group", "Irregular", "Root", "Particule", "Past.P", "Mediative.P", "Negative.P", "Imperfect.NP", "Subject.P", "Future.P",
    ]);
  });

  it("uses the original Eastern metadata columns", () => {
    expect(getVerbMetadata(write, "eastern").map((field) => field.label)).toEqual([
      "Name", "Base", "Group", "Irregular", "Root", "Past.P", "Negative.P", "Imperfect.NP", "Subject.P", "Future.P",
    ]);
  });

  it("uses the selected dialect data", () => {
    expect(getVerbMetadata(write, "eastern")[1].value).toBe("գրել");
    expect(getVerbMetadata(write, "western")[1].value).toBe("գրել");
  });
});
