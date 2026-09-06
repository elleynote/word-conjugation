import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const header = readFileSync(new URL("./components/Header.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("./components/Footer.tsx", import.meta.url), "utf8");
const promoPanels = readFileSync(new URL("./components/PromoPanels.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("./app/layout.tsx", import.meta.url), "utf8");
const redirects = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");

const referenceFaviconUrl =
  "https://raw.githubusercontent.com/elleynote/Western-Armenian-Translator/main/public/favicon-32.png";

describe("Tun brand assets", () => {
  it("uses the same translator logo route, favicon asset and promo-card icon", () => {
    expect(header).toContain('const TUN_LOGO_URL = "/tun-logo.png";');
    expect(redirects).toContain(
      "/tun-logo.png https://tunapp.com/wp-content/uploads/2020/09/Tun-Logo_Web-Black_80.png 200",
    );
    expect(promoPanels).toContain(referenceFaviconUrl);
    expect(layout).toContain(referenceFaviconUrl);
    expect(existsSync(new URL("../public/tun-logo.png", import.meta.url))).toBe(false);
    expect(existsSync(new URL("../public/favicon-32.png", import.meta.url))).toBe(false);
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
