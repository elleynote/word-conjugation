import { resolveMx } from "node:dns/promises";

const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com", "guerrillamail.com", "maildrop.cc", "mailinator.com",
  "sharklasers.com", "temp-mail.org", "tempmail.com", "yopmail.com",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_FORM_AGE_MS = 1_200;

export function validateNewsletterSubmission(input: {
  email: string; honeypot: string; startedAt: string; now?: number;
}) {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return { ok: false as const, reason: "invalid_email" };
  if (input.honeypot.trim()) return { ok: false as const, reason: "honeypot" };
  const domain = email.slice(email.lastIndexOf("@") + 1);
  if ([...DISPOSABLE_DOMAINS].some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`))) {
    return { ok: false as const, reason: "disposable_domain" };
  }
  const now = input.now ?? Date.now();
  const startedAt = Number(input.startedAt);
  if (!Number.isFinite(startedAt) || startedAt <= 0 || startedAt > now || now - startedAt < MINIMUM_FORM_AGE_MS) {
    return { ok: false as const, reason: "too_fast" };
  }
  return { ok: true as const, email, domain };
}

export async function hasMailExchange(domain: string): Promise<boolean> {
  try {
    return (await resolveMx(domain)).some((record) => Boolean(record.exchange));
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    return !["ENOTFOUND", "ENODATA", "ESERVFAIL"].includes(code);
  }
}

type Entry = { count: number; resetAt: number };
class NewsletterRateLimiter {
  private entries = new Map<string, Entry>();
  allow(key: string, limit: number, windowMs: number, now = Date.now()) {
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (current.count >= limit) return false;
    current.count += 1;
    return true;
  }
}
export const newsletterRateLimiter = new NewsletterRateLimiter();
