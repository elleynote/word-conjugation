import type { Verb } from "../../types/verb";

export interface CorpusStats {
  western: number;
  eastern: number;
  french: number;
  english: number;
}

export function getCorpusStats(verbs: Verb[]): CorpusStats {
  return {
    western: verbs.filter((verb) => Boolean(verb.dialects.western)).length,
    eastern: verbs.filter((verb) => Boolean(verb.dialects.eastern)).length,
    french: verbs.reduce((total, verb) => total + verb.french.length, 0),
    english: verbs.reduce((total, verb) => total + verb.english.length, 0),
  };
}
