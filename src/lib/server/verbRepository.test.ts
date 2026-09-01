import { afterEach, describe, expect, it } from "vitest";
import { findVerifiedVerb } from "./verbRepository";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnon;
});

describe("findVerifiedVerb", () => {
  it("keeps the bundled corpus working before Supabase is configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const verb = await findVerifiedVerb("любить", "western");
    expect(verb?.id).toBe("love");
    expect(verb?.source).toBe("local");
    expect(verb?.verified).toBe(true);
  });
});
