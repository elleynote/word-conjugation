import type { Dialect, DialectVerbData, Verb } from "@/types/verb";

interface ResponsesApiPayload {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
}

type CandidateDialect = {
  lemma: string;
  transliteration: string;
  group: string;
  root: string;
  class: "el" | "al" | "irregular";
  isIrregular: boolean;
  presentParticiple: string;
  perfectParticiple: string;
  futureParticiple: string;
  negativeParticiple: string;
  imperativeSingular: string;
  imperativePlural: string;
};

type Candidate = {
  id: string;
  english: string[];
  russian: string[];
  aliases: string[];
  dialects: {
    western: CandidateDialect;
    eastern: CandidateDialect;
  };
};

const dialectSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    lemma: { type: "string" },
    transliteration: { type: "string" },
    group: { type: "string" },
    root: { type: "string" },
    class: { type: "string", enum: ["el", "al", "irregular"] },
    isIrregular: { type: "boolean" },
    presentParticiple: { type: "string" },
    perfectParticiple: { type: "string" },
    futureParticiple: { type: "string" },
    negativeParticiple: { type: "string" },
    imperativeSingular: { type: "string" },
    imperativePlural: { type: "string" },
  },
  required: [
    "lemma", "transliteration", "group", "root", "class", "isIrregular",
    "presentParticiple", "perfectParticiple", "futureParticiple", "negativeParticiple",
    "imperativeSingular", "imperativePlural",
  ],
} as const;

const candidateSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    english: { type: "array", items: { type: "string" }, minItems: 1 },
    russian: { type: "array", items: { type: "string" }, minItems: 1 },
    aliases: { type: "array", items: { type: "string" } },
    dialects: {
      type: "object",
      additionalProperties: false,
      properties: { western: dialectSchema, eastern: dialectSchema },
      required: ["western", "eastern"],
    },
  },
  required: ["id", "english", "russian", "aliases", "dialects"],
} as const;

function outputText(response: ResponsesApiPayload): string | null {
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return null;
}

function optional(value: string): string | undefined {
  return value.trim() ? value.trim() : undefined;
}

function toDialectData(candidate: CandidateDialect): DialectVerbData {
  return {
    lemma: candidate.lemma,
    transliteration: candidate.transliteration,
    group: candidate.group,
    root: candidate.root,
    class: candidate.class,
    isIrregular: candidate.isIrregular,
    participles: {
      present: optional(candidate.presentParticiple),
      perfect: optional(candidate.perfectParticiple),
      future: optional(candidate.futureParticiple),
      negative: optional(candidate.negativeParticiple),
    },
    imperative: {
      singular: optional(candidate.imperativeSingular),
      plural: optional(candidate.imperativePlural),
    },
  };
}

export function openAiFallbackConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function openAiVerbModel(): string {
  return process.env.OPENAI_VERB_MODEL || "gpt-5.4-mini";
}

export async function generateVerbCandidate(query: string, dialect: Dialect): Promise<Verb | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = openAiVerbModel();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are preparing an UNVERIFIED candidate record for an Armenian verb reference. Return Western and Eastern Armenian linguistic data only when the input is genuinely a verb or clearly refers to one. Prefer standard Armenian spellings. The data will be reviewed by a human before it becomes verified. Do not invent citations or claim verification.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `User query: ${query}\nRequested display dialect: ${dialect}\nReturn the normalized English and Russian infinitive translations plus Western and Eastern Armenian verb data.`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "armenian_verb_candidate",
          strict: true,
          schema: candidateSchema,
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI fallback failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const payload = (await response.json()) as ResponsesApiPayload;
  const text = outputText(payload);
  if (!text) return null;

  const candidate = JSON.parse(text) as Candidate;
  if (!candidate.english?.length || !candidate.russian?.length || !candidate.dialects?.western || !candidate.dialects?.eastern) {
    return null;
  }

  return {
    id: candidate.id || candidate.english[0].toLowerCase().replace(/[^a-z0-9]+/gu, "-"),
    english: candidate.english,
    russian: candidate.russian,
    aliases: candidate.aliases ?? [],
    dialects: {
      western: toDialectData(candidate.dialects.western),
      eastern: toDialectData(candidate.dialects.eastern),
    },
    source: "ai",
    verified: false,
  };
}
