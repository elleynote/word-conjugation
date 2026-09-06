import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const header = readFileSync(new URL("./components/Header.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("./components/Footer.tsx", import.meta.url), "utf8");
const promoPanels = readFileSync(new URL("./components/PromoPanels.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("./app/layout.tsx", import.meta.url), "utf8");
const redirects = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");

describe("Tun brand assets", () => {
  it("uses the same local logo and favicon contract as the translator app", () => {
    expect(header).toContain('const TUN_LOGO_URL = "/tun-logo.png";');
    expect(promoPanels).toContain('const tunFavicon = "/favicon-32.png";');
    expect(layout).toContain('const tunFavicon = "/favicon-32.png";');
    expect(existsSync(new URL("../public/favicon-32.png", import.meta.url))).toBe(true);
  });

  it("uses the same translator footer artwork route and community signup", () => {
    expect(footer).toContain('src="/tun-footer-translate.png"');
    expect(redirects).toContain(
      "/tun-footer-translate.png https://tunapp.com/wp-content/uploads/2026/09/Tun-Footer-Translate__.png 200",
    );
    expect(footer).toContain("Enter your email here");
    expect(footer).toContain("Join the community");
    expect(footer).toContain("Copyright © 2026, Tun Online Armenian School. All rights reserved. For every Armenian who loves their home.");
  });
});
