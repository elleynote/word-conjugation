import type { Dialect } from "@/types/verb";

export const SPEECH_LANGUAGES = ["hy", "en", "ru"] as const;
export type SpeechLanguage = (typeof SPEECH_LANGUAGES)[number];

export const MAX_SPEECH_TEXT_LENGTH = 4096;

export interface SpeechRequest {
  text: string;
  language: SpeechLanguage;
  dialect?: Dialect;
}

export type SpeechValidationResult =
  | { ok: true; value: SpeechRequest }
  | { ok: false; error: string };

function isSpeechLanguage(value: unknown): value is SpeechLanguage {
  return typeof value === "string" && (SPEECH_LANGUAGES as readonly string[]).includes(value);
}

function isDialect(value: unknown): value is Dialect {
  return value === "western" || value === "eastern";
}

export function validateSpeechRequest(input: unknown): SpeechValidationResult {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid request." };
  const payload = input as Record<string, unknown>;
  const text = typeof payload.text === "string" ? payload.text.trim() : "";

  if (!text) return { ok: false, error: "Text is required." };
  if (text.length > MAX_SPEECH_TEXT_LENGTH) return { ok: false, error: "Text is too long." };
  if (!isSpeechLanguage(payload.language)) return { ok: false, error: "Unsupported language." };

  if (payload.language === "hy") {
    if (!isDialect(payload.dialect)) return { ok: false, error: "Armenian speech requires a valid dialect." };
    return { ok: true, value: { text, language: "hy", dialect: payload.dialect } };
  }

  return { ok: true, value: { text, language: payload.language } };
}

export function speechInstructions(language: SpeechLanguage, dialect?: Dialect): string {
  if (language === "hy") {
    const variety = dialect === "eastern" ? "Eastern Armenian" : "Western Armenian";
    return `Speak the supplied text in natural ${variety} pronunciation. Pronounce exactly the supplied Armenian text without translating, explaining, or adding words. Use a clear, neutral language-learning pace.`;
  }
  if (language === "ru") {
    return "Speak the supplied Russian text naturally and clearly. Do not translate, explain, or add words. Use a neutral language-learning pace.";
  }
  return "Speak the supplied English text naturally and clearly. Do not translate, explain, or add words. Use a neutral language-learning pace.";
}

export function openAiTtsModel(): string {
  return process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts";
}

export function openAiTtsVoice(): string {
  return process.env.OPENAI_TTS_VOICE?.trim() || "marin";
}
