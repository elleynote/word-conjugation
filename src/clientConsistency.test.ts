import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brand } from "@/config/brand";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("translator ecosystem consistency", () => {
  it("uses the translator typography and light-theme tokens", () => {
    expect(brand.fonts.primary).toContain("Nunito");
    expect(brand.fonts.armenian).toContain("Noto Sans Armenian");
    expect(brand.colors.primary).toBe("#DB182B");
    expect(brand.colors.primaryDark).toBe("#BF1324");
    expect(brand.colors.ink).toBe("#171717");
    expect(brand.colors.muted).toBe("#666666");
    expect(brand.colors.background).toBe("#F8F8F8");
    expect(brand.colors.surface).toBe("#FFFFFF");
    expect(brand.colors.border).toBe("#E8E5E2");
  });

  it("loads the same translator fonts and local TUN favicon", () => {
    const layout = read("./app/layout.tsx");
    expect(layout).toContain("Nunito:wght@400;500;600;700;800");
    expect(layout).toContain("Noto+Sans+Armenian:wght@400;500;600;700");
    expect(layout).toContain('const tunFavicon = "/favicon-32.png";');
  });

  it("shows pronunciation controls only for Armenian text", () => {
    const sources = [
      read("./components/TenseComparison.tsx"),
      read("./components/VerbSummary.tsx"),
      read("./components/SentenceConjugation.tsx"),
    ].join("\n");

    expect(sources).not.toContain('language="en"');
    expect(sources).not.toContain('language="ru"');
    expect(sources).not.toContain("language={meaningLanguage}");
    expect(sources).toContain('language="hy"');
  });
});
