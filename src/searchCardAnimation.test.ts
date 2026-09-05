import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./app/translator-consistency.css", import.meta.url), "utf8");

describe("search card attention border", () => {
  it("uses the TUN accent palette for a moving outline", () => {
    expect(css).toContain(".sidebar-search::before");
    expect(css).toContain("var(--tun-accent)");
    expect(css).toContain("var(--tun-accent-hover)");
    expect(css).toContain("animation: search-card-border-travel");
    expect(css).toContain("@keyframes search-card-border-travel");
  });

  it("respects reduced-motion preferences", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation: none");
  });
});
