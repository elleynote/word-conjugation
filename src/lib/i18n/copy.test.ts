import { describe, expect, it } from "vitest";
import { verbs } from "../../data/verbs";
import { copyFor, localizedVerbTranslation } from "./copy";

const write = verbs.find((verb) => verb.id === "write")!;

describe("interface copy", () => {
  it("returns Russian UI labels", () => {
    expect(copyFor("ru").searchHelp).toContain("глагол");
    expect(copyFor("ru").title).toContain("армянских");
  });

  it("uses the selected language translation", () => {
    expect(localizedVerbTranslation(write, "ru")).toBe("писать");
    expect(localizedVerbTranslation(write, "en")).toBe("write");
  });
});
