import type { Dialect, InterfaceLanguage, Verb } from "../../types/verb";

export interface MetadataField {
  key: string;
  label: string;
  value: string;
}

const labels = {
  en: {
    name: "Name", base: "Base", group: "Group", irregular: "Irregular", root: "Root",
    particule: "Particule", pastParticiple: "Past.P", mediativeParticiple: "Mediative.P",
    negativeParticiple: "Negative.P", imperfectNonPersonal: "Imperfect.NP",
    subjectParticiple: "Subject.P", futureParticiple: "Future.P", yes: "yes", no: "no",
  },
  ru: {
    name: "Глагол", base: "Основа", group: "Группа", irregular: "Неправильный", root: "Корень",
    particule: "Частица", pastParticiple: "Прич. прош.", mediativeParticiple: "Медиат. прич.",
    negativeParticiple: "Отриц. прич.", imperfectNonPersonal: "Несов. форма",
    subjectParticiple: "Субъект. прич.", futureParticiple: "Прич. буд.", yes: "да", no: "нет",
  },
} as const;

export function getVerbMetadata(verb: Verb, dialect: Dialect, language: InterfaceLanguage = "en"): MetadataField[] {
  const data = verb.dialects[dialect];
  if (!data) return [];
  const text = labels[language];

  const commonStart: MetadataField[] = [
    { key: "name", label: text.name, value: data.lemma },
    { key: "base", label: text.base, value: data.base ?? data.lemma },
    { key: "group", label: text.group, value: data.group },
    { key: "irregular", label: text.irregular, value: data.isIrregular ? text.yes : text.no },
    { key: "root", label: text.root, value: data.root },
  ];

  const westernOnly: MetadataField[] = dialect === "western" ? [
    { key: "particule", label: text.particule, value: data.particule ?? data.participles.present ?? "—" },
  ] : [];

  const middle: MetadataField[] = [
    { key: "pastParticiple", label: text.pastParticiple, value: data.pastParticiple ?? data.participles.perfect ?? "—" },
  ];

  const westernMediative: MetadataField[] = dialect === "western" ? [
    { key: "mediativeParticiple", label: text.mediativeParticiple, value: data.mediativeParticiple ?? "—" },
  ] : [];

  const commonEnd: MetadataField[] = [
    { key: "negativeParticiple", label: text.negativeParticiple, value: data.negativeParticiple ?? data.participles.negative ?? "—" },
    { key: "imperfectNonPersonal", label: text.imperfectNonPersonal, value: data.imperfectNonPersonal ?? data.participles.present ?? "—" },
    { key: "subjectParticiple", label: text.subjectParticiple, value: data.subjectParticiple ?? "—" },
    { key: "futureParticiple", label: text.futureParticiple, value: data.futureParticiple ?? data.participles.future ?? "—" },
  ];

  return [...commonStart, ...westernOnly, ...middle, ...westernMediative, ...commonEnd];
}
