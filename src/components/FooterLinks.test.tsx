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

const socialLinks = [
  ["Instagram", "https://instagram.com/tun.armenian"],
  ["TikTok", "https://www.tiktok.com/@tun.armenian"],
  ["YouTube", "https://www.youtube.com/@TunOnlineArmenianSchool"],
] as const;

const mailchimpAction =
  "https://tunapp.us5.list-manage.com/subscribe/post?u=cf919aa58fa15934e1e2a04a0&id=3feeed30f4&f_id=00a043edf0";

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

  it("renders the three requested social links below the Company menu", () => {
    const html = renderToStaticMarkup(<Footer />);

    for (const [label, href] of socialLinks) {
      const escapedHref = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const anchor = html.match(new RegExp(`<a[^>]*href=\"${escapedHref}\"[^>]*>`))?.[0] ?? "";
      expect(anchor).toContain(`aria-label="${label}"`);
      expect(anchor).toContain('target="_blank"');
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
  });

  it("renders only the requested Mailchimp newsletter form below the social links", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain(`action="${mailchimpAction.replaceAll("&", "&amp;")}"`);
    expect(html).toContain('method="post"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('type="email"');
    expect(html).toContain('name="EMAIL"');
    expect(html).toContain('placeholder="Enter your email here"');
    expect(html).toContain('value="Join the community"');
    expect(html).toContain('name="b_cf919aa58fa15934e1e2a04a0_3feeed30f4"');
  });

  it("keeps the existing artwork and renders the exact 2026 copyright text", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain("Tun-Footer-Translate__.png");
    expect(html).toContain(
      "Copyright © 2026, Tun Online Armenian School. All rights reserved. For every Armenian who loves their home.",
    );
  });
});
