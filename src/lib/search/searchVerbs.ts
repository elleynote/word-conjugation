import { verbs } from "../../data/verbs";
import type { Dialect, Verb } from "../../types/verb";
import { normalizeSearchQuery } from "./normalize";

function searchableValues(verb: Verb, dialect?: Dialect): string[] {
  const values = [...verb.english, ...verb.french, ...verb.aliases];
  const dialectEntries = dialect
    ? [verb.dialects[dialect]]
    : Object.values(verb.dialects);

  for (const data of dialectEntries) {
    if (data) values.push(data.lemma, data.transliteration);
  }

  return values.map(normalizeSearchQuery).filter(Boolean);
}

function scoreValue(value: string, query: string): number {
  if (value === query) return 100;
  if (value.startsWith(query)) return 70;
  if (value.includes(query)) return 40;
  return 0;
}

export function searchVerbs(query: string, dialect?: Dialect): Verb[] {
  const normalizedQuery = normalizeSearchQuery(query);
  const available = dialect ? verbs.filter((verb) => Boolean(verb.dialects[dialect])) : verbs;

  if (!normalizedQuery) return available.slice(0, 8);

  return available
    .map((verb) => ({
      verb,
      score: Math.max(...searchableValues(verb, dialect).map((value) => scoreValue(value, normalizedQuery))),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.verb.english[0].localeCompare(b.verb.english[0]))
    .map((item) => item.verb);
}
