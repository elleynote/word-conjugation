import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const footerCss = readFileSync(
  new URL("./components/Footer.module.css", import.meta.url),
  "utf8",
);

describe("footer artwork background consistency", () => {
  it("uses the shared page background without the old gray ellipse", () => {
    expect(footerCss.match(/background: var\(--brand-bg\);/g)?.length).toBeGreaterThanOrEqual(3);
    expect(footerCss).not.toContain("#e9e9e9");
    expect(footerCss).not.toContain("clip-path: ellipse");

    for (const selector of ["root", "curve", "scene"]) {
      const block = footerCss.match(new RegExp(`\\.${selector}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
      expect(block).not.toContain("background: #ffffff;");
    }
  });
});
