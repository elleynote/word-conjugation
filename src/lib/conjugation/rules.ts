import type { Dialect, DialectVerbData, Person, Polarity, Tense } from "../../types/verb";

export const tenseLabels: Record<Tense, string> = {
  present: "Present",
  imperfect: "Imperfect",
  preterite: "Preterite",
  presentPerfect: "Present perfect",
  pluperfect: "Pluperfect",
  future: "Future",
  conditional: "Conditional",
  imperative: "Imperative",
};

export const pronouns: Record<Dialect, Record<Person, string>> = {
  eastern: {
    firstSingular: "ես",
    secondSingular: "դու",
    thirdSingular: "նա",
    firstPlural: "մենք",
    secondPlural: "դուք",
    thirdPlural: "նրանք",
  },
  western: {
    firstSingular: "ես",
    secondSingular: "դուն",
    thirdSingular: "ան",
    firstPlural: "մենք",
    secondPlural: "դուք",
    thirdPlural: "անոնք",
  },
};

const personIndex: Record<Person, number> = {
  firstSingular: 0,
  secondSingular: 1,
  thirdSingular: 2,
  firstPlural: 3,
  secondPlural: 4,
  thirdPlural: 5,
};

const eastPresentAux = ["եմ", "ես", "է", "ենք", "եք", "են"];
const eastNegativePresentAux = ["չեմ", "չես", "չի", "չենք", "չեք", "չեն"];
const eastImperfectAux = ["էի", "էիր", "էր", "էինք", "էիք", "էին"];
const eastNegativeImperfectAux = ["չէի", "չէիր", "չէր", "չէինք", "չէիք", "չէին"];

const westPresentEndingsEl = ["եմ", "ես", "է", "ենք", "էք", "են"];
const westPresentEndingsAl = ["ամ", "աս", "այ", "անք", "աք", "ան"];
const westImperfectEndingsEl = ["էի", "էիր", "էր", "էինք", "էիք", "էին"];
const westImperfectEndingsAl = ["այի", "այիր", "ար", "այինք", "այիք", "ային"];
const westNegativePresentAux = ["չեմ", "չես", "չի", "չենք", "չէք", "չեն"];
const westNegativeImperfectAux = ["չէի", "չէիր", "չէր", "չէինք", "չէիք", "չէին"];

function indexFor(person: Person): number {
  return personIndex[person];
}

function eastPreterite(data: DialectVerbData, person: Person): string {
  const index = indexFor(person);
  const endings = data.class === "al"
    ? ["ացի", "ացիր", "աց", "ացինք", "ացիք", "ացին"]
    : ["եցի", "եցիր", "եց", "եցինք", "եցիք", "եցին"];
  return `${data.root}${endings[index]}`;
}

function eastConditional(data: DialectVerbData, person: Person): string {
  const index = indexFor(person);
  const endings = data.class === "al"
    ? ["այի", "այիր", "ար", "այինք", "այիք", "ային"]
    : ["եի", "եիր", "եր", "եինք", "եիք", "եին"];
  return `կ${data.root}${endings[index]}`;
}

function westFinite(data: DialectVerbData, person: Person, imperfect: boolean): string {
  const index = indexFor(person);
  const al = data.class === "al";
  const endings = imperfect
    ? (al ? westImperfectEndingsAl : westImperfectEndingsEl)
    : (al ? westPresentEndingsAl : westPresentEndingsEl);
  return `${data.root}${endings[index]}`;
}

function eastFutureParticiple(data: DialectVerbData): string {
  if (data.participles.future) return data.participles.future;
  return `${data.lemma.replace(/լ$/u, "")}ու`;
}

function imperativeForm(data: DialectVerbData, person: Person): string {
  if (person === "secondSingular") return data.imperative?.singular ?? `${data.root}ի՛ր`;
  if (person === "secondPlural") return data.imperative?.plural ?? `${data.root}ե՛ք`;
  return "—";
}

export function generatedForm(
  data: DialectVerbData,
  dialect: Dialect,
  polarity: Polarity,
  tense: Tense,
  person: Person,
): string {
  const index = indexFor(person);

  if (tense === "imperative") {
    const imperative = imperativeForm(data, person);
    if (imperative === "—" || polarity === "affirmative") return imperative;
    return `մի՛ ${imperative.replace(/՛/g, "")}`;
  }

  if (dialect === "eastern") {
    const presentParticiple = data.participles.present ?? `${data.root}ում`;
    const perfectParticiple = data.participles.perfect ?? data.lemma;
    const futureParticiple = eastFutureParticiple(data);

    if (tense === "present") {
      return polarity === "affirmative"
        ? `${presentParticiple} ${eastPresentAux[index]}`
        : `${eastNegativePresentAux[index]} ${presentParticiple}`;
    }
    if (tense === "imperfect") {
      return polarity === "affirmative"
        ? `${presentParticiple} ${eastImperfectAux[index]}`
        : `${eastNegativeImperfectAux[index]} ${presentParticiple}`;
    }
    if (tense === "preterite") {
      const form = eastPreterite(data, person);
      return polarity === "affirmative" ? form : `չ${form}`;
    }
    if (tense === "presentPerfect") {
      return polarity === "affirmative"
        ? `${perfectParticiple} ${eastPresentAux[index]}`
        : `${eastNegativePresentAux[index]} ${perfectParticiple}`;
    }
    if (tense === "pluperfect") {
      return polarity === "affirmative"
        ? `${perfectParticiple} ${eastImperfectAux[index]}`
        : `${eastNegativeImperfectAux[index]} ${perfectParticiple}`;
    }
    if (tense === "future") {
      return polarity === "affirmative"
        ? `${futureParticiple} ${eastPresentAux[index]}`
        : `${eastNegativePresentAux[index]} ${futureParticiple}`;
    }
    const conditional = eastConditional(data, person);
    return polarity === "affirmative" ? conditional : `չ${conditional}`;
  }

  const perfectParticiple = data.participles.perfect ?? `${data.root}ած`;
  const negativeParticiple = data.participles.negative ?? `${data.root}${data.class === "al" ? "ար" : "եր"}`;
  const presentFinite = westFinite(data, person, false);
  const imperfectFinite = westFinite(data, person, true);

  if (tense === "present") {
    return polarity === "affirmative"
      ? `կը ${presentFinite}`
      : `${westNegativePresentAux[index]} ${negativeParticiple}`;
  }
  if (tense === "imperfect") {
    return polarity === "affirmative"
      ? `կը ${imperfectFinite}`
      : `${westNegativeImperfectAux[index]} ${negativeParticiple}`;
  }
  if (tense === "preterite") {
    const form = eastPreterite(data, person);
    return polarity === "affirmative" ? form : `չ${form}`;
  }
  if (tense === "presentPerfect") {
    return polarity === "affirmative"
      ? `${perfectParticiple} ${eastPresentAux[index].replace("եք", "էք")}`
      : `${westNegativePresentAux[index]} ${perfectParticiple}`;
  }
  if (tense === "pluperfect") {
    return polarity === "affirmative"
      ? `${perfectParticiple} ${eastImperfectAux[index]}`
      : `${westNegativeImperfectAux[index]} ${perfectParticiple}`;
  }
  if (tense === "future") {
    return polarity === "affirmative" ? `պիտի ${presentFinite}` : `պիտի չ${presentFinite}`;
  }
  return polarity === "affirmative" ? `պիտի ${imperfectFinite}` : `պիտի չ${imperfectFinite}`;
}
