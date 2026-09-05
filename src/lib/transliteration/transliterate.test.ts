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

  it("transliterates ե as ye only at the beginning of a Western Armenian word", () => {
    expect(transliterateArmenian("երազ", "western")).toBe("yeraz");
    expect(transliterateArmenian("սիրել", "western")).toBe("sirel");
  });

  it("transliterates ո as vo only at the beginning of a Western Armenian word", () => {
    expect(transliterateArmenian("որոշել", "western")).toBe("voroshel");
    expect(transliterateArmenian("սովորել", "western")).toBe("sovorel");
  });

  it("keeps եմ as em even though ե normally becomes ye at word start", () => {
    expect(transliterateArmenian("եմ", "western")).toBe("em");
    expect(transliterateArmenian("ես եմ", "western")).toBe("Yes em");
  });

  it("uses yes for sentence-initial ես and es elsewhere", () => {
    expect(transliterateArmenian("ես կը սիրեմ", "western")).toMatch(/^Yes /);
    expect(transliterateArmenian("դուն ես", "western")).toBe("Toun es");
    expect(transliterateArmenian("դուն ես։ ես կը սիրեմ", "western")).toContain("es։ Yes ");
  });

  it("does not apply the new client-specific contextual rules to Eastern Armenian", () => {
    expect(transliterateArmenian("երազ", "eastern")).toBe("eraz");
    expect(transliterateArmenian("որոշել", "eastern")).toBe("oroshel");
  });
});
