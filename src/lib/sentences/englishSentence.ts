import type { Person, Polarity, Tense } from "@/types/verb";

const subjectFor: Record<Person, string> = {
  firstSingular: "I",
  secondSingular: "You",
  thirdSingular: "He/She",
  firstPlural: "We",
  secondPlural: "You",
  thirdPlural: "They",
};

const irregularPast: Record<string, string> = {
  be: "was",
  come: "came",
  drink: "drank",
  eat: "ate",
  give: "gave",
  go: "went",
  read: "read",
  see: "saw",
  speak: "spoke",
  write: "wrote",
};

const irregularPastParticiple: Record<string, string> = {
  be: "been",
  come: "come",
  drink: "drunk",
  eat: "eaten",
  give: "given",
  go: "gone",
  read: "read",
  see: "seen",
  speak: "spoken",
  write: "written",
};

function thirdPerson(base: string): string {
  if (base === "be") return "is";
  if (base === "have") return "has";
  if (/[^aeiou]y$/u.test(base)) return `${base.slice(0, -1)}ies`;
  if (/(s|sh|ch|x|z|o)$/u.test(base)) return `${base}es`;
  return `${base}s`;
}

function regularPast(base: string): string {
  if (base.endsWith("e")) return `${base}d`;
  if (/[^aeiou]y$/u.test(base)) return `${base.slice(0, -1)}ied`;
  return `${base}ed`;
}

function gerund(base: string): string {
  if (base === "be") return "being";
  if (base.endsWith("ie")) return `${base.slice(0, -2)}ying`;
  if (base.endsWith("e") && !base.endsWith("ee")) return `${base.slice(0, -1)}ing`;
  return `${base}ing`;
}

function pastFor(base: string, person: Person): string {
  if (base === "be") {
    return person === "secondSingular" || person === "firstPlural" || person === "secondPlural" || person === "thirdPlural"
      ? "were"
      : "was";
  }
  return irregularPast[base] ?? regularPast(base);
}

function pastParticipleFor(base: string): string {
  return irregularPastParticiple[base] ?? regularPast(base);
}

export function englishSentenceFor(base: string, tense: Tense, polarity: Polarity, person: Person): string {
  const subject = subjectFor[person];
  const negative = polarity === "negative";

  if (tense === "imperative") {
    if (person !== "secondSingular" && person !== "secondPlural") return "—";
    return negative ? `Do not ${base}` : person === "secondPlural" ? `You all ${base}` : `${base.charAt(0).toUpperCase()}${base.slice(1)}`;
  }

  if (tense === "present") {
    if (base === "be") {
      const positive = person === "firstSingular" ? "am" : person === "thirdSingular" ? "is" : "are";
      return negative ? `${subject} ${positive} not` : `${subject} ${positive}`;
    }
    if (negative) return `${subject} ${person === "thirdSingular" ? "does" : "do"} not ${base}`;
    return `${subject} ${person === "thirdSingular" ? thirdPerson(base) : base}`;
  }

  if (tense === "imperfect") {
    const aux = person === "secondSingular" || person === "firstPlural" || person === "secondPlural" || person === "thirdPlural" ? "were" : "was";
    return `${subject} ${aux}${negative ? " not" : ""} ${gerund(base)}`;
  }

  if (tense === "preterite") {
    if (negative) return `${subject} did not ${base}`;
    return `${subject} ${pastFor(base, person)}`;
  }

  if (tense === "presentPerfect") {
    const have = person === "thirdSingular" ? "has" : "have";
    return `${subject} ${have}${negative ? " not" : ""} ${pastParticipleFor(base)}`;
  }

  if (tense === "pluperfect") {
    return `${subject} had${negative ? " not" : ""} ${pastParticipleFor(base)}`;
  }

  if (tense === "future") {
    return `${subject} will${negative ? " not" : ""} ${base}`;
  }

  return `${subject} would${negative ? " not" : ""} ${base}`;
}
