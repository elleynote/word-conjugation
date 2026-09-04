import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("top promotional bar", () => {
  it("matches the TUN translator promo copy and external link behavior", () => {
    const explorer = read("./components/VerbExplorer.tsx");

    expect(explorer).toContain("Try 4 Armenian lessons for $1 →");
    expect(explorer).toContain('href="https://tunapp.com/get-started/"');
    expect(explorer).toContain('target="_blank"');
    expect(explorer).toContain('rel="noopener noreferrer"');
    expect(explorer).toContain('className="conjugator-promo-bar"');
  });

  it("uses the translator promo strip styling", () => {
    const css = read("./app/translator-consistency.css");

    expect(css).toContain(".conjugator-promo-bar");
    expect(css).toContain("background: #db3f4f");
    expect(css).toContain("color: #ffffff");
    expect(css).toContain("min-height: 34px");
  });
});
