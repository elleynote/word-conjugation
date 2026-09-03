import { afterEach, describe, expect, it, vi } from "vitest";
import { findVerifiedVerb } from "./verbRepository";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnon;
  vi.restoreAllMocks();
});

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const dialectRow = {
  dialect: "western",
  lemma: "կուտակել",
  transliteration: "gudagel",
  conjugation_group: "E-Class",
  root: "կուտակ",
  conjugation_class: "el",
  is_irregular: false,
  base: null,
  particule: null,
  present_participle: null,
  perfect_participle: null,
  past_participle: null,
  mediative_participle: null,
  future_participle: null,
  negative_participle: null,
  imperfect_non_personal: null,
  subject_participle: null,
  imperative_singular: null,
  imperative_plural: null,
  probable_future: {},
  continuous_forms: {},
  mediative_forms: {},
  verified_forms: {},
  class_number: 2,
  subclass: null,
  regularity: "Regular",
  regular_category: "E-Class",
  transitivity: "Transitive",
};

describe("findVerifiedVerb", () => {
  it("keeps the bundled corpus working before Supabase is configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const verb = await findVerifiedVerb("любить", "western");
    expect(verb?.id).toBe("love");
    expect(verb?.source).toBe("local");
    expect(verb?.verified).toBe(true);
  });

  it("loads a verified Supabase verb in no more than three REST requests", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("verb_translations?select=verb_id")) return jsonResponse([]);
      if (url.includes("verb_dialects?select=verb_id")) return jsonResponse([{ verb_id: "hyw-test" }]);

      if (url.includes("verbs?id=eq.hyw-test&select=id,aliases,verb_translations")) {
        return jsonResponse([{
          id: "hyw-test",
          aliases: ["accumulate"],
          verb_translations: [{ language_code: "en", value: "accumulate", is_primary: true }],
          verb_dialects: [dialectRow],
          irregular_overrides: [],
        }]);
      }

      if (url.includes("verbs?id=eq.hyw-test&select=id,aliases&limit=1")) {
        return jsonResponse([{ id: "hyw-test", aliases: ["accumulate"] }]);
      }
      if (url.includes("verb_translations?verb_id=eq.hyw-test")) {
        return jsonResponse([{ language_code: "en", value: "accumulate", is_primary: true }]);
      }
      if (url.includes("verb_dialects?verb_id=eq.hyw-test")) return jsonResponse([dialectRow]);
      if (url.includes("irregular_overrides?verb_id=eq.hyw-test")) return jsonResponse([]);

      throw new Error(`Unexpected Supabase request: ${url}`);
    });

    const verb = await findVerifiedVerb("կուտակել", "western");

    expect(verb?.id).toBe("hyw-test");
    expect(verb?.source).toBe("supabase");
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(3);
  });
});
