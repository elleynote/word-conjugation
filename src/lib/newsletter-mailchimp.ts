import { createHash } from "node:crypto";

export async function subscribeAndTagMailchimp(input: {
  email: string; apiKey: string; serverPrefix: string; audienceId: string; sourceTag: string;
}): Promise<{ ok: true; tagged: boolean } | { ok: false }> {
  const email = input.email.trim().toLowerCase();
  const hash = createHash("md5").update(email).digest("hex");
  const url = `https://${input.serverPrefix}.api.mailchimp.com/3.0/lists/${input.audienceId}/members/${hash}`;
  const headers = {
    authorization: `Basic ${Buffer.from(`newsletter:${input.apiKey}`).toString("base64")}`,
    "content-type": "application/json",
  };
  try {
    const member = await fetch(url, {
      method: "PUT", headers,
      body: JSON.stringify({ email_address: email, status_if_new: "subscribed" }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!member.ok) return { ok: false };
  } catch {
    return { ok: false };
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const tag = await fetch(`${url}/tags`, {
        method: "POST", headers,
        body: JSON.stringify({ tags: [{ name: input.sourceTag, status: "active" }] }),
        signal: AbortSignal.timeout(5_000),
      });
      if (tag.ok) return { ok: true, tagged: true };
    } catch {
      // Retry transient tag failures. The member upsert is idempotent.
    }
  }
  return { ok: true, tagged: false };
}
