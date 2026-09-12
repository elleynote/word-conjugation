import { describe, expect, it } from "vitest";
import {
  NewsletterRateLimiter,
  hasMailExchange,
  isDisposableEmailDomain,
  normalizeNewsletterEmail,
  validateNewsletterSubmission,
} from "@/lib/newsletter-spam";
import { verifyTurnstileToken } from "@/lib/newsletter-turnstile";
import {
  mailchimpSubscriberHash,
  subscribeAndTagMailchimp,
} from "@/lib/newsletter-mailchimp";

describe("newsletter protection services", () => {
  it("normalizes and validates newsletter emails", () => {
    const now = 1_800_000_000_000;

    expect(normalizeNewsletterEmail(" Learner@Example.COM ")).toBe(
      "learner@example.com",
    );
    expect(
      validateNewsletterSubmission({
        email: "not-an-email",
        honeypot: "",
        startedAt: String(now - 5_000),
        now,
      }),
    ).toEqual({ ok: false, reason: "invalid_email" });
    expect(
      validateNewsletterSubmission({
        email: "person@gmail.com",
        honeypot: "bot-filled",
        startedAt: String(now - 5_000),
        now,
      }),
    ).toEqual({ ok: false, reason: "honeypot" });
    expect(
      validateNewsletterSubmission({
        email: "person@gmail.com",
        honeypot: "",
        startedAt: String(now - 200),
        now,
      }),
    ).toEqual({ ok: false, reason: "too_fast" });
    expect(
      validateNewsletterSubmission({
        email: "person@mailinator.com",
        honeypot: "",
        startedAt: String(now - 5_000),
        now,
      }),
    ).toEqual({ ok: false, reason: "disposable_domain" });
  });

  it("blocks known disposable domains without blocking common providers", () => {
    expect(isDisposableEmailDomain("mailinator.com")).toBe(true);
    expect(isDisposableEmailDomain("sub.mailinator.com")).toBe(true);
    expect(isDisposableEmailDomain("gmail.com")).toBe(false);
  });

  it("handles MX lookup outcomes conservatively", async () => {
    expect(
      await hasMailExchange("example.com", async () => [
        { exchange: "mx.example.com", priority: 10 },
      ]),
    ).toBe(true);
    expect(await hasMailExchange("example.invalid", async () => [])).toBe(false);
    expect(
      await hasMailExchange("missing.invalid", async () => {
        const error = Object.assign(new Error("not found"), { code: "ENOTFOUND" });
        throw error;
      }),
    ).toBe(false);
    expect(
      await hasMailExchange("temporary.example", async () => {
        const error = Object.assign(new Error("temporary"), { code: "EAI_AGAIN" });
        throw error;
      }),
    ).toBe(true);
  });

  it("rate-limits repeated attempts and resets after the window", () => {
    const limiter = new NewsletterRateLimiter();
    const now = 1_800_000_000_000;

    expect(limiter.allow("ip:203.0.113.10", 2, 60_000, now)).toBe(true);
    expect(limiter.allow("ip:203.0.113.10", 2, 60_000, now + 100)).toBe(true);
    expect(limiter.allow("ip:203.0.113.10", 2, 60_000, now + 200)).toBe(false);
    expect(limiter.allow("ip:203.0.113.10", 2, 60_000, now + 60_001)).toBe(true);
  });

  it("accepts Turnstile only for the expected production hostname", async () => {
    expect(
      await verifyTurnstileToken({
        token: "test-token",
        secret: "test-secret",
        remoteIp: "203.0.113.10",
        expectedHostname: "armenianverbs.com",
        fetchImpl: async () =>
          new Response(
            JSON.stringify({ success: true, hostname: "armenianverbs.com" }),
            { status: 200 },
          ),
      }),
    ).toBe(true);

    expect(
      await verifyTurnstileToken({
        token: "test-token",
        secret: "test-secret",
        remoteIp: "203.0.113.10",
        expectedHostname: "armenianverbs.com",
        fetchImpl: async () =>
          new Response(
            JSON.stringify({ success: true, hostname: "wrong.example" }),
            { status: 200 },
          ),
      }),
    ).toBe(false);
  });

  it("upserts the subscriber and adds only the Verb Conjugator source tag", async () => {
    expect(mailchimpSubscriberHash(" Learner@Example.COM ")).toBe(
      "d62f0f9be3b74a18cd1e01044d91c5d7",
    );

    const calls: Array<{ url: string; init: RequestInit }> = [];
    const result = await subscribeAndTagMailchimp({
      email: "learner@example.com",
      apiKey: "key-us5",
      serverPrefix: "us5",
      audienceId: "3feeed30f4",
      sourceTag: "Verb Conjugator",
      fetchImpl: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return new Response("{}", { status: 200 });
      },
    });

    expect(result).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
    expect(calls[0].init.method).toBe("PUT");
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({
      email_address: "learner@example.com",
      status_if_new: "subscribed",
      status: "subscribed",
    });
    expect(calls[1].init.method).toBe("POST");
    expect(JSON.parse(String(calls[1].init.body))).toEqual({
      tags: [{ name: "Verb Conjugator", status: "active" }],
    });
  });

  it("distinguishes Mailchimp member and tag failures", async () => {
    await expect(
      subscribeAndTagMailchimp({
        email: "learner@example.com",
        apiKey: "key-us5",
        serverPrefix: "us5",
        audienceId: "3feeed30f4",
        sourceTag: "Verb Conjugator",
        fetchImpl: async () => new Response("{}", { status: 400 }),
      }),
    ).resolves.toEqual({ ok: false, stage: "member" });

    let requestNumber = 0;
    await expect(
      subscribeAndTagMailchimp({
        email: "learner@example.com",
        apiKey: "key-us5",
        serverPrefix: "us5",
        audienceId: "3feeed30f4",
        sourceTag: "Verb Conjugator",
        fetchImpl: async () => {
          requestNumber += 1;
          return new Response("{}", { status: requestNumber === 1 ? 200 : 500 });
        },
      }),
    ).resolves.toEqual({ ok: false, stage: "tag" });
  });
});
