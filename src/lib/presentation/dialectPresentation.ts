import type { Dialect, LegacyDisplayOptions } from "../../types/verb";

export type LegacyOptionKey = Exclude<keyof LegacyDisplayOptions, "textCase">;

export interface DialectPresentation {
  theme: "navy" | "burgundy";
  optionKeys: LegacyOptionKey[];
}

const presentations: Record<Dialect, DialectPresentation> = {
  western: {
    theme: "navy",
    optionKeys: ["transcription", "continuousForm", "mediativeForm"],
  },
  eastern: {
    theme: "burgundy",
    optionKeys: ["transcription", "probableFuture"],
  },
};

export function getDialectPresentation(dialect: Dialect): DialectPresentation {
  return presentations[dialect];
}
