import type { InterfaceLanguage, Tense } from "@/types/verb";

export type ConjugatorView = Exclude<Tense, "imperative"> | "fullSentences";

export const CONJUGATOR_VIEWS: ConjugatorView[] = [
  "present",
  "imperfect",
  "preterite",
  "future",
  "conditional",
  "presentPerfect",
  "pluperfect",
  "fullSentences",
];

const labels = {
  en: {
    present: "Present",
    imperfect: "Imperfect",
    preterite: "Simple Past",
    future: "Future",
    conditional: "Conditional",
    presentPerfect: "Present Perfect",
    pluperfect: "Past Perfect",
    fullSentences: "Full Sentences",
  },
  ru: {
    present: "Настоящее",
    imperfect: "Прошедшее несовершенное",
    preterite: "Простое прошедшее",
    future: "Будущее",
    conditional: "Условное",
    presentPerfect: "Совершённое",
    pluperfect: "Предпрошедшее",
    fullSentences: "Полные предложения",
  },
} as const;

export function labelForConjugatorView(view: ConjugatorView, language: InterfaceLanguage): string {
  return labels[language][view];
}
