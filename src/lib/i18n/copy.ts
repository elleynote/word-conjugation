import type { InterfaceLanguage, Tense, Verb } from "../../types/verb";

const tenseNames: Record<InterfaceLanguage, Record<Tense, string>> = {
  en: {
    present: "Present", imperfect: "Imperfect", preterite: "Preterite", imperative: "Imperative",
    presentPerfect: "Present perfect", pluperfect: "Pluperfect", future: "Future", conditional: "Conditional",
  },
  fr: {
    present: "Présent", imperfect: "Imparfait", preterite: "Prétérit", imperative: "Impératif",
    presentPerfect: "Passé composé", pluperfect: "Plus-que-parfait", future: "Futur", conditional: "Conditionnel",
  },
};

const dictionary = {
  en: {
    title: "Armenian Conjugation",
    subtitle: "Conjugate Western and Eastern Armenian verbs",
    keyboard: "Armenian keyboard",
    western: "Western Armenian",
    eastern: "Eastern Armenian",
    transcription: "Transcription",
    probableFuture: "Probable future",
    continuousForm: "Continuous form",
    mediativeForm: "Mediative form",
    translatedVerbs: "Translated verbs",
    french: "French",
    english: "English",
    searchHelp: "Write a verb in Armenian, phonetic Armenian, English or French.",
    searchPlaceholder: "e.g. գրել, grel, to write, écrire",
    searchButton: "OK",
    erase: "Erase",
    affirmative: "Affirmative conjugation",
    negative: "Negative conjugation",
    pronouns: "Pronouns",
    noResults: "No matching verb in the starter corpus.",
    extraEmpty: "No verified additional forms are stored for this verb.",
    tenses: tenseNames.en,
  },
  fr: {
    title: "Conjugaison arménienne",
    subtitle: "Conjuguez les verbes arméniens occidentaux et orientaux",
    keyboard: "Clavier arménien",
    western: "Arménien occidental",
    eastern: "Arménien oriental",
    transcription: "Transcription",
    probableFuture: "Futur probable",
    continuousForm: "Forme continue",
    mediativeForm: "Forme médiative",
    translatedVerbs: "Verbes traduits",
    french: "Français",
    english: "Anglais",
    searchHelp: "Écrivez un verbe en arménien, arménien phonétique, anglais ou français.",
    searchPlaceholder: "ex. գրել, grel, to write, écrire",
    searchButton: "OK",
    erase: "Effacer",
    affirmative: "Conjugaison affirmative",
    negative: "Conjugaison négative",
    pronouns: "Pronoms",
    noResults: "Aucun verbe correspondant dans le corpus de démonstration.",
    extraEmpty: "Aucune forme supplémentaire vérifiée n’est stockée pour ce verbe.",
    tenses: tenseNames.fr,
  },
} as const;

export function copyFor(language: InterfaceLanguage) {
  return dictionary[language];
}

export function localizedVerbTranslation(verb: Verb, language: InterfaceLanguage): string {
  const values = language === "fr" ? verb.french : verb.english;
  return values[0] ?? verb.english[0] ?? verb.french[0] ?? verb.id;
}
