import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

const footerLinks = [
  ["My Lessons", "https://tunapp.com/lessons"],
  ["Learn Armenian Online", "https://tunapp.com/get-started"],
  ["Courses, Flashcards and Workbooks", "https://tunapp.com/shop"],
  ["Armenian Social Network", "https://armeniansocialnetwork.com"],
  ["Western Armenian Tutors", "https://tunapp.com/western-armenian-tutoring"],
  ["Armenian Translation Tool", "https://translatearmenian.com"],
  ["Armenian Verb Conjugations", "https://armenianverbs.com"],
  ["Armenian Keyboard", "https://armeniankeyboard.com"],
  ["Armenian ChatGPT", "https://tunapp.com/chatbot"],
  ["My Account", "https://tunapp.com/my-account/"],
  ["Downloads", "https://tunapp.com/my-account/downloads/"],
  ["Subscriptions", "https://tunapp.com/my-account/subscriptions/"],
  ["Payment Methods", "https://tunapp.com/my-account/payment-methods/"],
  ["Password Recovery", "https://tunapp.com/login/"],
  ["Privacy Policy", "https://tunapp.com/privacy-policy/"],
  ["Website Terms", "https://tunapp.com/website-terms/"],
  ["Affiliate Program", "https://tunapp.com/ambassadors/"],
  ["Blog", "https://tunapp.com/blog"],
  ["Contact Us", "mailto:hello@tunapp.com"],
] as const;

describe("Footer link directory", () => {
  it("renders the Learn, Account and Company groups", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain(">Learn</h3>");
    expect(html).toContain(">Account</h3>");
    expect(html).toContain(">Company</h3>");

    for (const [label, href] of footerLinks) {
      expect(html).toContain(`href=\"${href}\"`);
      expect(html).toContain(`>${label}</a>`);
    }
  });

  it("opens every footer link in a new tab safely", () => {
    const html = renderToStaticMarkup(<Footer />);

    for (const [, href] of footerLinks) {
      const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const anchor = html.match(new RegExp(`<a[^>]*href=\"${escapedHref}\"[^>]*>`))?.[0] ?? "";
      expect(anchor).toContain('target="_blank"');
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
  });

  it("keeps the existing artwork and copyright message", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain("Tun-Footer-Translate__.png");
    expect(html).toContain("For every Armenian who loves their home.");
  });
});
