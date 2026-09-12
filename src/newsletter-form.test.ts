import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const formUrl = new URL("./components/FooterNewsletterForm.tsx", import.meta.url);
const footerUrl = new URL("./components/Footer.tsx", import.meta.url);

describe("verb footer newsletter form contract", () => {
  it("posts locally with Turnstile while preserving the shared footer shell", () => {
    expect(existsSync(formUrl)).toBe(true);
    const formSource = readFileSync(formUrl, "utf8");
    const footerSource = readFileSync(footerUrl, "utf8");

    expect(formSource).toContain('action="/api/newsletter"');
    expect(formSource).toContain('name="EMAIL"');
    expect(formSource).toContain('name="_newsletter_started_at"');
    expect(formSource).toContain("NEXT_PUBLIC_TURNSTILE_SITE_KEY");
    expect(formSource).toContain("interaction-only");
    expect(formSource).toContain("challenges.cloudflare.com/turnstile/v0/api.js");
    expect(footerSource).toContain("<FooterNewsletterForm />");
    expect(footerSource).not.toContain("list-manage.com/subscribe/post");
  });
});
