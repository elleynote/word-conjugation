import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VerbExplorer } from "./VerbExplorer";

const links = [
  ["Lessons", "https://tunapp.com/get-started"],
  ["Translate", "https://translatearmenian.com"],
  ["Tutoring", "https://tunapp.com/western-armenian-tutoring"],
  ["Workbooks and Flashcards", "https://tunapp.com/shop"],
  ["Speaking Practice", "https://armeniansocialnetwork.com"],
  ["Contact Us", "mailto:hello@tunapp.com"],
] as const;

describe("conjugator translator-style navbar", () => {
  it("renders the local TUN logo and requested navigation without auth links", () => {
    const html = renderToStaticMarkup(<VerbExplorer />);

    expect(html).toContain('src="/tun-logo.png"');

    for (const [label, href] of links) {
      expect(html).toContain(`href=\"${href}\"`);
      expect(html).toContain(`>${label}</a>`);
    }

    expect(html).toContain('aria-controls="site-main-navigation"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(">Log in<");
    expect(html).not.toContain(">Log out<");
    expect(html).not.toContain(">Pricing<");
    expect(html).not.toContain(">Dashboard<");
  });

  it("opens every navbar destination in a new tab safely", () => {
    const html = renderToStaticMarkup(<VerbExplorer />);

    for (const [, href] of links) {
      const anchor = html.match(new RegExp(`<a[^>]*href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`))?.[0] ?? "";
      expect(anchor).toContain('target="_blank"');
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
  });
});
