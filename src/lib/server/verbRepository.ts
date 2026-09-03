import { searchVerbs } from "@/lib/search/searchVerbs";
import { normalizeSearchQuery } from "@/lib/search/normalize";
import type { Dialect, DialectVerbData, IrregularOverrides, Person, Polarity, Tense, Verb } from "@/types/verb";
import { hasSupabaseReadConfig, hasSupabaseServiceConfig, supabaseRest } from "./supabaseRest";
import { verifiedFormsToOverrides } from "./verifiedForms";

type TranslationRow = { language_code: "en" | "ru"; value: string; is_primary: boolean };
type DialectRow = {
  dialect: Dialect;
  lemma: string;
  transliteration: string;
  conjugation_group: string;
  root: string;
  conjugation_class: "el" | "al" | "irregular";
  is_irregular: boolean;
  base: string | null;
  particule: string | null;
  present_participle: string | null;
  perfect_participle: string | null;
  past_participle: string | null;
  mediative_participle: string | null;
  future_participle: string | null;
  negative_participle: string | null;
  imperfect_non_personal: string | null;
  subject_participle: string | null;
  imperative_singular: string | null;
  imperative_plural: string | null;
  probable_future: Partial<Record<Person, string>> | null;
  continuous_forms: Partial<Record<Person, string>> | null;
  mediative_forms: Partial<Record<Person, string>> | null;
  verified_forms: unknown;
  class_number: number | null;
  subclass: string | null;
  regularity: string | null;
  regular_category: string | null;
  transitivity: string | null;
};

type OverrideRow = {
  dialect: Dialect;
  polarity: Polarity;
  tense: Tense;
  person: Person;
  value: string;
};

type VerbRow = { id: string; aliases: string[] };
type CandidateIdRow = { verb_id: string };

function queryToken(value: string): string {
  return normalizeSearchQuery(value).replace(/[,*()]/gu, " ").trim();
}

function mergeOverrides(target: IrregularOverrides, source: IrregularOverrides): IrregularOverrides {
  for (const [polarityKey, tenseMap] of Object.entries(source)) {
    const polarity = polarityKey as Polarity;
    if (!tenseMap) continue;
    target[polarity] ??= {};
    for (const [tenseKey, personMap] of Object.entries(tenseMap)) {
      const tense = tenseKey as Tense;
      if (!personMap) continue;
      target[polarity]![tense] ??= {};
      Object.assign(target[polarity]![tense]!, personMap);
    }
  }
  return target;
}

function dialectDataFromRow(row: DialectRow, overrides: OverrideRow[]): DialectVerbData {
  const irregularOverrides = verifiedFormsToOverrides(row.verified_forms);
  const manualOverrides: IrregularOverrides = {};
  for (const override of overrides.filter((item) => item.dialect === row.dialect)) {
    manualOverrides[override.polarity] ??= {};
    manualOverrides[override.polarity]![override.tense] ??= {};
    manualOverrides[override.polarity]![override.tense]![override.person] = override.value;
  }
  mergeOverrides(irregularOverrides, manualOverrides);

  return {
    lemma: row.lemma,
    transliteration: row.transliteration,
    group: row.conjugation_group,
    root: row.root,
    class: row.conjugation_class,
    isIrregular: row.is_irregular,
    participles: {
      present: row.present_participle ?? undefined,
      perfect: row.perfect_participle ?? undefined,
      future: row.future_participle ?? undefined,
      negative: row.negative_participle ?? undefined,
    },
    imperative: row.imperative_singular || row.imperative_plural
      ? { singular: row.imperative_singular ?? undefined, plural: row.imperative_plural ?? undefined }
      : undefined,
    irregularOverrides: Object.keys(irregularOverrides).length ? irregularOverrides : undefined,
    base: row.base ?? undefined,
    particule: row.particule ?? undefined,
    pastParticiple: row.past_participle ?? undefined,
    mediativeParticiple: row.mediative_participle ?? undefined,
    negativeParticiple: row.negative_participle ?? undefined,
    imperfectNonPersonal: row.imperfect_non_personal ?? undefined,
    subjectParticiple: row.subject_participle ?? undefined,
    futureParticiple: row.future_participle ?? undefined,
    probableFuture: row.probable_future ?? undefined,
    continuousForms: row.continuous_forms ?? undefined,
    mediativeForms: row.mediative_forms ?? undefined,
    classNumber: row.class_number ?? undefined,
    subclass: row.subclass ?? undefined,
    regularity: row.regularity ?? undefined,
    regularCategory: row.regular_category ?? undefined,
    transitivity: row.transitivity ?? undefined,
  };
}

async function fetchVerbById(id: string): Promise<Verb | null> {
  const encodedId = encodeURIComponent(id);
  const [verbRows, translations, dialectRows, overrides] = await Promise.all([
    supabaseRest<VerbRow[]>(`verbs?id=eq.${encodedId}&select=id,aliases&limit=1`),
    supabaseRest<TranslationRow[]>(`verb_translations?verb_id=eq.${encodedId}&select=language_code,value,is_primary&order=is_primary.desc`),
    supabaseRest<DialectRow[]>(`verb_dialects?verb_id=eq.${encodedId}&select=*`),
    supabaseRest<OverrideRow[]>(`irregular_overrides?verb_id=eq.${encodedId}&select=dialect,polarity,tense,person,value`),
  ]);

  const row = verbRows[0];
  if (!row || !dialectRows.length) return null;

  const dialects: Verb["dialects"] = {};
  for (const dialectRow of dialectRows) {
    dialects[dialectRow.dialect] = dialectDataFromRow(dialectRow, overrides);
  }

  return {
    id: row.id,
    aliases: row.aliases ?? [],
    english: translations.filter((item) => item.language_code === "en").map((item) => item.value),
    russian: translations.filter((item) => item.language_code === "ru").map((item) => item.value),
    dialects,
    source: "supabase",
    verified: true,
  };
}

async function searchSupabase(query: string, dialect: Dialect): Promise<Verb | null> {
  if (!hasSupabaseReadConfig()) return null;
  const token = queryToken(query);
  if (!token) return null;

  const orTranslation = encodeURIComponent(`(value.ilike.*${token}*)`);
  const orDialect = encodeURIComponent(`(lemma.ilike.*${token}*,transliteration.ilike.*${token}*)`);
  const encodedDialect = encodeURIComponent(dialect);

  const [translationMatches, dialectMatches] = await Promise.all([
    supabaseRest<CandidateIdRow[]>(`verb_translations?select=verb_id&or=${orTranslation}&limit=8`),
    supabaseRest<CandidateIdRow[]>(`verb_dialects?select=verb_id&dialect=eq.${encodedDialect}&or=${orDialect}&limit=8`),
  ]);

  const candidateIds = [...dialectMatches, ...translationMatches].map((item) => item.verb_id);
  for (const candidateId of [...new Set(candidateIds)]) {
    const verb = await fetchVerbById(candidateId);
    if (verb?.dialects[dialect]) return verb;
  }
  return null;
}

export async function findVerifiedVerb(query: string, dialect: Dialect): Promise<Verb | null> {
  if (hasSupabaseReadConfig()) {
    try {
      const remote = await searchSupabase(query, dialect);
      if (remote) return remote;
    } catch (error) {
      console.error("Supabase verb search failed; using local corpus fallback.", error);
    }
  }

  const local = searchVerbs(query, dialect)[0];
  return local ? { ...local, source: "local", verified: true } : null;
}

export async function storeAiCandidate(query: string, dialect: Dialect, payload: Verb, model: string): Promise<void> {
  if (!hasSupabaseServiceConfig()) return;
  await supabaseRest("ai_candidates", {
    method: "POST",
    serviceRole: true,
    prefer: "return=minimal",
    body: { query, dialect, payload, model, status: "pending" },
  });
}
