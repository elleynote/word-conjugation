import { describe, expect, it } from "vitest";
import { transliterateArmenian } from "./transliterate";

describe("Western Armenian transliteration", () => {
  it("uses the client preferred pronoun spellings", () => {
    expect(transliterateArmenian("ես", "western")).toBe("Yes");
    expect(transliterateArmenian("դուն", "western")).toBe("Toun");
    expect(transliterateArmenian("դուք", "western")).toBe("Touk");
  });

  it("renders Armenian ու as ou inside words", () => {
    expect(transliterateArmenian("սիրում", "western")).toContain("ou");
    expect(transliterateArmenian("ուտել", "western")).toMatch(/^ou/i);
  });

  it("keeps the preferred pronoun spelling inside a full sentence", () => {
    expect(transliterateArmenian("դուն կը սիրես", "western")).toMatch(/^Toun /);
  });
});
