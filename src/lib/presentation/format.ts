import type { TextCaseMode } from "../../types/verb";

export function applyTextCase(value: string, mode: TextCaseMode): string {
  if (!value || value === "—") return value;
  if (mode === "lower") return value.toLocaleLowerCase("hy-AM");
  if (mode === "upper") return value.toLocaleUpperCase("hy-AM");
  return value;
}

export function visibleTranscription(value: string, visible: boolean): string {
  return visible ? value : "";
}
