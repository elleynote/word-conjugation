export const DIALECTS = ["western", "eastern"] as const;
export type Dialect = (typeof DIALECTS)[number];

export const INTERFACE_LANGUAGES = ["en", "ru"] as const;
export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];

export const TEXT_CASE_MODES = ["title", "lower", "upper"] as const;
export type TextCaseMode = (typeof TEXT_CASE_MODES)[number];

export const POLARITIES = ["affirmative", "negative"] as const;
export type Polarity = (typeof POLARITIES)[number];

export const PERSONS = [
  "firstSingular",
  "secondSingular",
  "thirdSingular",
  "firstPlural",
  "secondPlural",
  "thirdPlural",
] as const;
export type Person = (typeof PERSONS)[number];

export const TENSES = [
  "present",
  "imperfect",
  "preterite",
  "imperative",
  "presentPerfect",
  "pluperfect",
  "future",
  "conditional",
] as const;
export type Tense = (typeof TENSES)[number];

export type VerbClass = "el" | "al" | "irregular";
export type ResultSource = "supabase" | "local" | "ai";

export interface VerbParticiples {
  present?: string;
  perfect?: string;
  future?: string;
  negative?: string;
}

export interface VerbImperative {
  singular?: string;
  plural?: string;
}

export type PersonForms = Partial<Record<Person, string>>;

export type IrregularOverrides = Partial<
  Record<Polarity, Partial<Record<Tense, Partial<Record<Person, string>>>>>
>;

export interface DialectVerbData {
  lemma: string;
  transliteration: string;
  group: string;
  root: string;
  class: VerbClass;
  isIrregular: boolean;
  participles: VerbParticiples;
  imperative?: VerbImperative;
  irregularOverrides?: IrregularOverrides;
  base?: string;
  particule?: string;
  pastParticiple?: string;
  mediativeParticiple?: string;
  negativeParticiple?: string;
  imperfectNonPersonal?: string;
  subjectParticiple?: string;
  futureParticiple?: string;
  probableFuture?: PersonForms;
  continuousForms?: PersonForms;
  mediativeForms?: PersonForms;
}

export interface Verb {
  id: string;
  english: string[];
  russian: string[];
  /** Legacy import compatibility only. French is no longer exposed in the UI. */
  french?: string[];
  aliases: string[];
  dialects: Partial<Record<Dialect, DialectVerbData>>;
  source?: ResultSource;
  verified?: boolean;
}

export interface LegacyDisplayOptions {
  transcription: boolean;
  probableFuture: boolean;
  continuousForm: boolean;
  mediativeForm: boolean;
  textCase: TextCaseMode;
}

export type ExtraFormKey = "probableFuture" | "continuous" | "mediative";

export interface ExtraFormSection {
  key: ExtraFormKey;
  label: string;
  forms: PersonForms;
}

export interface ConjugatedForm {
  armenian: string;
  transliteration: string;
}

export interface TenseResult {
  tense: Tense;
  label: string;
  forms: Record<Person, ConjugatedForm>;
}

export interface ConjugationResult {
  verbId: string;
  dialect: Dialect;
  polarity: Polarity;
  pronouns: Record<Person, string>;
  tenses: Record<Tense, TenseResult>;
}
