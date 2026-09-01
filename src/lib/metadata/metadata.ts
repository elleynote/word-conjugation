import type { Dialect, Verb } from "../../types/verb";

export interface MetadataField {
  key: string;
  label: string;
  value: string;
}

export function getVerbMetadata(verb: Verb, dialect: Dialect): MetadataField[] {
  const data = verb.dialects[dialect];
  if (!data) return [];

  const commonStart: MetadataField[] = [
    { key: "name", label: "Name", value: data.lemma },
    { key: "base", label: "Base", value: data.base ?? data.lemma },
    { key: "group", label: "Group", value: data.group },
    { key: "irregular", label: "Irregular", value: data.isIrregular ? "yes" : "no" },
    { key: "root", label: "Root", value: data.root },
  ];

  const westernOnly: MetadataField[] = dialect === "western" ? [
    { key: "particule", label: "Particule", value: data.particule ?? data.participles.present ?? "—" },
  ] : [];

  const middle: MetadataField[] = [
    { key: "pastParticiple", label: "Past.P", value: data.pastParticiple ?? data.participles.perfect ?? "—" },
  ];

  const westernMediative: MetadataField[] = dialect === "western" ? [
    { key: "mediativeParticiple", label: "Mediative.P", value: data.mediativeParticiple ?? "—" },
  ] : [];

  const commonEnd: MetadataField[] = [
    { key: "negativeParticiple", label: "Negative.P", value: data.negativeParticiple ?? data.participles.negative ?? "—" },
    { key: "imperfectNonPersonal", label: "Imperfect.NP", value: data.imperfectNonPersonal ?? data.participles.present ?? "—" },
    { key: "subjectParticiple", label: "Subject.P", value: data.subjectParticiple ?? "—" },
    { key: "futureParticiple", label: "Future.P", value: data.futureParticiple ?? data.participles.future ?? "—" },
  ];

  return [...commonStart, ...westernOnly, ...middle, ...westernMediative, ...commonEnd];
}
