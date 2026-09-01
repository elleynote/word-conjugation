import { describe, expect, it } from "vitest";
import { verbs } from "../../data/verbs";
import { copyFor, localizedVerbTranslation } from "./copy";

const write = verbs.find((verb) => verb.id === "write")!;

describe("interface copy", () => {
  it("returns French UI labels", () => {
    expect(copyFor("fr").searchHelp).toContain("verbe");
  });
  it("uses the selected language translation", () => {
    expect(localizedVerbTranslation(write, "fr")).toBe("écrire");
    expect(localizedVerbTranslation(write, "en")).toBe("write");
  });
});
