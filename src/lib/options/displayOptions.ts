import type { DialectVerbData, ExtraFormSection, LegacyDisplayOptions } from "../../types/verb";

export function getVisibleExtraSections(data: DialectVerbData, options: LegacyDisplayOptions): ExtraFormSection[] {
  const sections: ExtraFormSection[] = [];
  if (options.probableFuture && data.probableFuture && Object.keys(data.probableFuture).length) {
    sections.push({ key: "probableFuture", label: "Probable future", forms: data.probableFuture });
  }
  if (options.continuousForm && data.continuousForms && Object.keys(data.continuousForms).length) {
    sections.push({ key: "continuous", label: "Continuous form", forms: data.continuousForms });
  }
  if (options.mediativeForm && data.mediativeForms && Object.keys(data.mediativeForms).length) {
    sections.push({ key: "mediative", label: "Mediative form", forms: data.mediativeForms });
  }
  return sections;
}
