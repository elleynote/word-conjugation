import { hasMailExchange, newsletterRateLimiter, validateNewsletterSubmission } from "@/lib/newsletter-spam";
import { subscribeAndTagMailchimp } from "@/lib/newsletter-mailchimp";
import { verifyTurnstileToken } from "@/lib/newsletter-turnstile";

export const runtime = "nodejs";
const HONEYPOT = "_newsletter_company";
const TURNSTILE_ACTION = "newsletter_signup";

function response(message: string, status: number) {
  const safe = message.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tun newsletter</title><body><main><p>${safe}</p></main></body></html>`, {
    status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function requestIp(request: Request) {
  return request.headers.get("x-nf-client-connection-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  let data: FormData;
  try { data = await request.formData(); } catch { return response("Please enter a valid email address and try again.", 400); }
  const validation = validateNewsletterSubmission({
    email: String(data.get("EMAIL") ?? ""), honeypot: String(data.get(HONEYPOT) ?? ""),
    startedAt: String(data.get("_newsletter_started_at") ?? ""),
  });
  if (!validation.ok) {
    if (validation.reason === "honeypot") return response("Thanks. You're on the newsletter.", 200);
    if (validation.reason === "disposable_domain") return response("Please use a permanent email address to join the newsletter.", 400);
    return response("Please enter a valid email address and try again.", 400);
  }
  const ip = requestIp(request);
  const now = Date.now();
  if (!newsletterRateLimiter.allow(`ip:${ip}`, 5, 15 * 60_000, now) ||
      !newsletterRateLimiter.allow(`email:${validation.email}`, 3, 60 * 60_000, now)) {
    return response("Too many attempts. Please wait a little and try again.", 429);
  }
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const sourceTag = process.env.MAILCHIMP_SOURCE_TAG;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const allowedHostnames = (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "").split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  if (!apiKey || !serverPrefix || !audienceId || !sourceTag || !turnstileSecret || !allowedHostnames.length) {
    return response("We could not add you to the newsletter right now. Please try again shortly.", 503);
  }
  const verified = await verifyTurnstileToken({
    token: String(data.get("cf-turnstile-response") ?? ""), secret: turnstileSecret,
    remoteIp: ip, allowedHostnames, expectedAction: TURNSTILE_ACTION,
  });
  if (!verified) return response("We could not verify this request. Please try again.", 400);
  if (!(await hasMailExchange(validation.domain))) return response("Please use an email domain that can receive email.", 400);
  const result = await subscribeAndTagMailchimp({ email: validation.email, apiKey, serverPrefix, audienceId, sourceTag });
  if (!result.ok) return response("We could not add you to the newsletter right now. Please try again shortly.", 502);
  if (!result.tagged) console.warn("Newsletter signup succeeded, but Mailchimp source tagging failed after retries.");
  return response("Thanks. You're on the newsletter.", 200);
}
