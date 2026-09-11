import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routeUrl = new URL("./app/api/newsletter/route.ts", import.meta.url);

describe("verb newsletter API contract", () => {
  it("uses the protected local newsletter route and fixed source attribution", () => {
    expect(existsSync(routeUrl)).toBe(true);
    const routeSource = readFileSync(routeUrl, "utf8");

    expect(routeSource).toContain('const NEWSLETTER_SOURCE_TAG = "Verb Conjugator"');
    expect(routeSource).toContain('const EXPECTED_TURNSTILE_HOSTNAME = "armenianverbs.com"');
    expect(routeSource).toContain('formData.get("cf-turnstile-response")');
    expect(routeSource).toContain("verifyTurnstileToken");
    expect(routeSource).toContain("subscribeAndTagMailchimp");
    expect(routeSource).not.toContain("list-manage.com/subscribe/post");
  });
});
