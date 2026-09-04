import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("top promotional bar", () => {
  it("matches the TUN translator promo copy and external link behavior", () => {
    const page = read("./app/page.tsx");

    expect(page).toContain("Try 4 Armenian lessons for $1 →");
    expect(page).toContain('href="https://tunapp.com/get-started/"');
    expect(page).toContain('target="_blank"');
    expect(page).toContain('rel="noopener noreferrer"');
    expect(page).toContain('className="conjugator-promo-bar"');
  });

  it("uses the translator promo strip styling", () => {
    const css = read("./app/top-promo-bar.css");

    expect(css).toContain(".conjugator-promo-bar");
    expect(css).toContain("background: #db3f4f");
    expect(css).toContain("color: #ffffff");
    expect(css).toContain("min-height: 34px");
  });
});
