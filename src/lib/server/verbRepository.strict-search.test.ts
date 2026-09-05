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

function westernRow(lemma: string, transliteration: string) {
  return {
    dialect: "western",
    lemma,
    transliteration,
    conjugation_group: "E-Class",
    root: "սիր",
    conjugation_class: "el",
    is_irregular: false,
    base: lemma,
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
}

const sirelVerb = {
  id: "hyw-2661",
  aliases: ["սիրել", "sirel", "love"],
  verb_translations: [
    { language_code: "en", value: "love", is_primary: true },
    { language_code: "en", value: "like", is_primary: false },
  ],
  verb_dialects: [westernRow("սիրել", "sirel")],
  irregular_overrides: [],
};

describe("strict verified verb search", () => {
  it("prioritizes an exact English translation over substring transliteration matches", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = decodeURIComponent(String(input));

      if (url.includes("verb_translations?")) {
        expect(url).toContain("language_code=eq.en");
        expect(url).toContain("value=eq.love");
        expect(url).toContain("order=is_primary.desc");
        return jsonResponse([{ verb_id: "hyw-2661" }]);
      }
      if (url.includes("verb_dialects?")) {
        return jsonResponse([{ verb_id: "hyw-1626" }]);
      }
      if (url.includes("verbs?id=eq.hyw-2661")) return jsonResponse([sirelVerb]);
      throw new Error(`Unexpected request: ${url}`);
    });

    const verb = await findVerifiedVerb("love", "western");
    expect(verb?.id).toBe("hyw-2661");
    expect(verb?.dialects.western?.lemma).toBe("սիրել");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("requires exact Armenian/transliteration matches instead of substring matches", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key";

    const requests: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = decodeURIComponent(String(input));
      requests.push(url);

      if (url.includes("verb_translations?")) return jsonResponse([]);
      if (url.includes("verb_dialects?") && url.includes("transliteration.eq.sirel")) return jsonResponse([{ verb_id: "hyw-2661" }]);
      if (url.includes("verb_dialects?") && url.includes("lemma.eq.սիրել")) return jsonResponse([{ verb_id: "hyw-2661" }]);
      if (url.includes("verbs?id=eq.hyw-2661")) return jsonResponse([sirelVerb]);
      throw new Error(`Unexpected request: ${url}`);
    });

    expect((await findVerifiedVerb("sirel", "western"))?.id).toBe("hyw-2661");
    expect((await findVerifiedVerb("սիրել", "western"))?.id).toBe("hyw-2661");
    expect(requests.some((url) => url.includes("ilike.*sirel*"))).toBe(false);
    expect(requests.some((url) => url.includes("ilike.*սիրել*"))).toBe(false);
  });
});
