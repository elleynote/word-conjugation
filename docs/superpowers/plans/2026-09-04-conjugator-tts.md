# Conjugator Text-to-Speech Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure click-to-play text-to-speech for Armenian, English, and Russian content across the redesigned conjugator without exposing API keys or placing listening controls in table headers.

**Architecture:** Add a small server-only speech service and `POST /api/speech` route that validates requests and calls OpenAI Audio Speech. Add one reusable client `SpeakButton` plus a lightweight shared playback manager so only one clip plays at a time. Integrate speaker controls beside actual speakable text in the summary, conjugation rows, and Full Sentences view.

**Tech Stack:** Next.js App Router route handlers, TypeScript, React 19, OpenAI Audio Speech API via server-side `fetch`, Vitest, browser `Audio`/Blob APIs.

**Spec:** `docs/superpowers/specs/2026-09-04-new-conjugator-ui-tts-design.md`

## Global Constraints

- Work only on `feature/new-conjugator-ui-tts` until explicit approval to merge.
- `OPENAI_API_KEY` is server-only and must never be exposed to the client bundle.
- Default TTS model: `gpt-4o-mini-tts`, overridable by `OPENAI_TTS_MODEL`.
- Generate audio only after a user clicks a speaker button.
- Do not persist generated audio in Supabase in this release.
- Do not add speaker/listening icons to `Affirmative` or `Negative` table headers.
- Do not fabricate Russian text when no Russian translation exists.
- Western/Eastern Armenian pronunciation instructions are best-effort and require client QA.
- TTS failure must never hide or break conjugation content.

---

## File Structure

### New files

- `src/lib/server/speech.ts` — request validation, model/voice config, dialect-aware instruction builder, OpenAI speech call.
- `src/lib/server/speech.test.ts` — validation/instruction tests.
- `src/app/api/speech/route.ts` — authenticated-by-server-environment POST endpoint returning audio bytes.
- `src/lib/audio/playback.ts` — single-active-audio helper for client playback lifecycle.
- `src/lib/audio/playback.test.ts` — cleanup/state helper tests where practical.
- `src/components/SpeakButton.tsx` — reusable accessible audio control.

### Modified files

- `.env.example` — document TTS environment variables without secrets.
- `src/components/VerbSummary.tsx` — speaker controls for Armenian lemma and localized meaning.
- `src/components/TenseComparison.tsx` — speaker controls beside Armenian affirmative/negative forms and optional localized meanings.
- `src/components/SentenceConjugation.tsx` — speaker controls beside Armenian and English lines; Russian only when real text exists.
- `src/app/conjugator-redesign.css` — speaker states and compact placement.

---

### Task 1: Build and Test Speech Request Validation

**Files:**
- Create: `src/lib/server/speech.ts`
- Create: `src/lib/server/speech.test.ts`

**Interfaces:**
- Produces `SpeechLanguage = "hy" | "en" | "ru"`.
- Produces `validateSpeechRequest(input)`.
- Produces `speechInstructions(language, dialect?)`.
- Produces `generateSpeechAudio(request): Promise<ArrayBuffer>`.

- [ ] **Step 1: Write failing validation tests**

Create `src/lib/server/speech.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { speechInstructions, validateSpeechRequest } from "./speech";

describe("validateSpeechRequest", () => {
  it("accepts Western Armenian speech", () => {
    expect(validateSpeechRequest({ text: "կը սիրեմ", language: "hy", dialect: "western" })).toEqual({
      text: "կը սիրեմ",
      language: "hy",
      dialect: "western",
    });
  });

  it("rejects blank text", () => {
    expect(() => validateSpeechRequest({ text: "   ", language: "en" })).toThrow("Speech text is required");
  });

  it("requires an Armenian dialect", () => {
    expect(() => validateSpeechRequest({ text: "սիրել", language: "hy" })).toThrow("Armenian dialect is required");
  });

  it("rejects unsupported language", () => {
    expect(() => validateSpeechRequest({ text: "bonjour", language: "fr" })).toThrow("Unsupported speech language");
  });
});

describe("speechInstructions", () => {
  it("distinguishes Western and Eastern Armenian guidance", () => {
    expect(speechInstructions("hy", "western")).toContain("Western Armenian");
    expect(speechInstructions("hy", "eastern")).toContain("Eastern Armenian");
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- src/lib/server/speech.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement validation and instruction builder**

Create `src/lib/server/speech.ts` with:

```ts
import type { Dialect } from "@/types/verb";

export type SpeechLanguage = "hy" | "en" | "ru";

export interface SpeechRequest {
  text: string;
  language: SpeechLanguage;
  dialect?: Dialect;
}

const MAX_SPEECH_CHARS = 500;

export function validateSpeechRequest(input: unknown): SpeechRequest {
  if (!input || typeof input !== "object") throw new Error("Invalid speech request");
  const value = input as Record<string, unknown>;
  const text = typeof value.text === "string" ? value.text.trim() : "";
  if (!text) throw new Error("Speech text is required");
  if (text.length > MAX_SPEECH_CHARS) throw new Error("Speech text is too long");

  const language = value.language;
  if (language !== "hy" && language !== "en" && language !== "ru") {
    throw new Error("Unsupported speech language");
  }

  const dialect = value.dialect;
  if (language === "hy") {
    if (dialect !== "western" && dialect !== "eastern") {
      throw new Error("Armenian dialect is required");
    }
    return { text, language, dialect };
  }

  return { text, language };
}

export function speechInstructions(language: SpeechLanguage, dialect?: Dialect): string {
  if (language === "hy" && dialect === "western") {
    return "Speak clearly and naturally in Western Armenian pronunciation. Preserve the exact Armenian words and do not translate them.";
  }
  if (language === "hy" && dialect === "eastern") {
    return "Speak clearly and naturally in Eastern Armenian pronunciation. Preserve the exact Armenian words and do not translate them.";
  }
  if (language === "ru") {
    return "Speak clearly and naturally in Russian. Preserve the exact words and do not translate them.";
  }
  return "Speak clearly and naturally in English. Preserve the exact words and do not translate them.";
}
```

- [ ] **Step 4: Add server-only OpenAI call**

In the same file add:

```ts
export function openAiTtsModel(): string {
  return process.env.OPENAI_TTS_MODEL?.trim() || "gpt-4o-mini-tts";
}

export function openAiTtsVoice(): string {
  return process.env.OPENAI_TTS_VOICE?.trim() || "alloy";
}

export async function generateSpeechAudio(request: SpeechRequest): Promise<ArrayBuffer> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OpenAI speech is not configured");

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openAiTtsModel(),
      voice: openAiTtsVoice(),
      input: request.text,
      instructions: speechInstructions(request.language, request.dialect),
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI speech request failed: ${response.status}`);
  }

  return response.arrayBuffer();
}
```

- [ ] **Step 5: Run focused tests and typecheck**

```bash
npm test -- src/lib/server/speech.test.ts
npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/server/speech.ts src/lib/server/speech.test.ts
git commit -m "feat: add speech service validation"
```

---

### Task 2: Add the Server Speech API Route

**Files:**
- Create: `src/app/api/speech/route.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes `validateSpeechRequest` and `generateSpeechAudio` from Task 1.
- Produces `POST /api/speech` returning `audio/mpeg`.

- [ ] **Step 1: Implement the route**

Create `src/app/api/speech/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { generateSpeechAudio, validateSpeechRequest } from "@/lib/server/speech";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = validateSpeechRequest(await request.json());
    const audio = await generateSpeechAudio(payload);

    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Speech generation failed";
    const configurationError = message === "OpenAI speech is not configured";
    const upstreamError = message.startsWith("OpenAI speech request failed");
    const status = configurationError ? 503 : upstreamError ? 502 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 2: Document environment variables**

Append to `.env.example`:

```text
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=alloy
```

Keep `OPENAI_API_KEY=` as the existing server-side key entry; do not add or commit a real key.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/speech/route.ts .env.example
git commit -m "feat: add speech API route"
```

---

### Task 3: Add Single-Active Audio Playback Helper

**Files:**
- Create: `src/lib/audio/playback.ts`
- Create: `src/lib/audio/playback.test.ts`

**Interfaces:**
- Produces `stopActiveAudio()`.
- Produces `playAudioBlob(blob, callbacks)`.

- [ ] **Step 1: Write a failing lifecycle test for pure URL cleanup state**

Because browser `Audio` is not reliable in Node tests, isolate URL bookkeeping in a small pure helper and test that helper.

Create `src/lib/audio/playback.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { replaceActiveObjectUrl } from "./playback";

describe("replaceActiveObjectUrl", () => {
  it("returns the previous URL for cleanup and the new active URL", () => {
    expect(replaceActiveObjectUrl("blob:old", "blob:new")).toEqual({
      previous: "blob:old",
      active: "blob:new",
    });
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- src/lib/audio/playback.test.ts
```

- [ ] **Step 3: Implement playback manager**

Create `src/lib/audio/playback.ts` with module-level active `HTMLAudioElement | null` and active object URL.

Expose:

```ts
export function replaceActiveObjectUrl(previous: string | null, next: string) {
  return { previous, active: next };
}

export function stopActiveAudio(): void

export async function playAudioBlob(
  blob: Blob,
  callbacks?: { onEnded?: () => void; onError?: () => void },
): Promise<void>
```

Behavior:

- stop/pause previous audio
- revoke previous object URL
- create new object URL
- create `new Audio(url)`
- call `play()`
- cleanup URL on ended/error
- never leave two clips playing simultaneously

- [ ] **Step 4: Run focused test and typecheck**

```bash
npm test -- src/lib/audio/playback.test.ts
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/audio
git commit -m "feat: add single audio playback manager"
```

---

### Task 4: Build the Reusable SpeakButton

**Files:**
- Create: `src/components/SpeakButton.tsx`
- Modify: `src/app/conjugator-redesign.css`

**Interfaces:**
- Produces:

```ts
interface SpeakButtonProps {
  text: string;
  language: "hy" | "en" | "ru";
  dialect?: Dialect;
  label?: string;
  className?: string;
}
```

- [ ] **Step 1: Implement client state and API request**

Create `src/components/SpeakButton.tsx` with `"use client"` and states:

```ts
type SpeakState = "idle" | "loading" | "playing" | "error";
```

On click:

```ts
const response = await fetch("/api/speech", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text, language, dialect }),
});
```

If successful:

```ts
const blob = await response.blob();
await playAudioBlob(blob, {
  onEnded: () => setState("idle"),
  onError: () => setState("error"),
});
setState("playing");
```

If currently playing and clicked again, call `stopActiveAudio()` and return to idle.

- [ ] **Step 2: Add accessible states**

Button requirements:

- `type="button"`
- `aria-label={label ?? `Listen to ${text}`}`
- `aria-busy={state === "loading"}`
- disabled only for empty text or loading
- visual states for loading/playing/error
- icon may be inline SVG or a Unicode speaker glyph; do not add a new icon dependency

- [ ] **Step 3: Add compact CSS**

In `conjugator-redesign.css`, define `.speak-button`, `.is-loading`, `.is-playing`, `.is-error` with a compact circular control that does not change row height materially.

- [ ] **Step 4: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add src/components/SpeakButton.tsx src/app/conjugator-redesign.css
git commit -m "feat: add reusable speech control"
```

---

### Task 5: Add Speech Controls to the Verb Summary

**Files:**
- Modify: `src/components/VerbSummary.tsx`

**Interfaces:**
- Consumes `SpeakButton` from Task 4.

- [ ] **Step 1: Add Armenian lemma audio**

Beside the visible Armenian lemma, render:

```tsx
<SpeakButton
  text={data.lemma}
  language="hy"
  dialect={dialect}
  label={language === "ru" ? "Прослушать армянский глагол" : "Listen to Armenian verb"}
/>
```

- [ ] **Step 2: Add localized meaning audio**

For the visible localized meaning:

- EN UI / English meaning: `language="en"`
- RU UI / real Russian meaning exists: `language="ru"`
- if RU UI falls back to English because `verb.russian` is empty, use `language="en"`

Do not tell the speech service Russian when the actual text is English.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/components/VerbSummary.tsx
git commit -m "feat: add speech to verb summary"
```

---

### Task 6: Add Speech Controls to Tense Comparison Rows

**Files:**
- Modify: `src/components/TenseComparison.tsx`

**Interfaces:**
- Consumes `SpeakButton`.
- Must preserve text-only table headers.

- [ ] **Step 1: Add Armenian audio to row forms**

For each non-`—` affirmative and negative Armenian form, render `SpeakButton` adjacent to the form with:

```tsx
language="hy"
dialect={affirmative.dialect}
```

- [ ] **Step 2: Preserve the explicit no-header-audio rule**

The `<thead>` remains:

```tsx
<tr>
  <th>Person</th>
  <th>{copy.affirmative}</th>
  <th>{copy.negative}</th>
</tr>
```

No `SpeakButton`, SVG speaker, or listening text is allowed inside these headers.

- [ ] **Step 3: Add the same controls to mobile cards**

The mobile stacked representation must use the same speakable Armenian strings and dialect.

- [ ] **Step 4: Run typecheck/lint**

```bash
npm run typecheck
npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add src/components/TenseComparison.tsx
git commit -m "feat: add speech to conjugation forms"
```

---

### Task 7: Add Speech Controls to Full Sentences

**Files:**
- Modify: `src/components/SentenceConjugation.tsx`

**Interfaces:**
- Armenian lines use `hy` + selected dialect.
- English lines use `en`.
- Russian line/audio appears only if real Russian sentence text exists in a future supported path; do not synthesize fake Russian sentences now.

- [ ] **Step 1: Add Armenian sentence audio**

For each non-`—` Armenian sentence:

```tsx
<SpeakButton text={row.armenian} language="hy" dialect={dialect} />
```

- [ ] **Step 2: Add English sentence audio**

For each generated English sentence:

```tsx
<SpeakButton text={row.english} language="en" />
```

- [ ] **Step 3: Do not generate Russian sentence text**

The current component has only `englishSentenceFor`. Keep that boundary. Russian UI may still label controls in Russian, but sentence content/audio remains Armenian + English until a verified Russian sentence source/generator is intentionally added.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add src/components/SentenceConjugation.tsx
git commit -m "feat: add speech to full sentences"
```

---

### Task 8: TTS Security, Runtime, and QA Verification

**Files:**
- Modify only if a verification failure requires a targeted fix.

- [ ] **Step 1: Run complete automated verification**

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

All must exit 0 before claiming technical readiness.

- [ ] **Step 2: Verify key secrecy**

Inspect browser DevTools on the feature deploy:

- Network calls from browser go only to `/api/speech`.
- No `OPENAI_API_KEY` appears in page source, JS bundles, request payloads, or response headers.

- [ ] **Step 3: Verify request behavior**

Test:

1. Western Armenian lemma.
2. Eastern Armenian lemma.
3. Western affirmative form.
4. Western negative form.
5. Armenian Full Sentence.
6. English meaning/sentence.
7. Russian meaning only on a verb that truly has Russian data.
8. Click a second speaker while first is playing; first must stop.
9. API failure must leave text visible and UI usable.

- [ ] **Step 4: Verify no table-header listening controls**

Inspect desktop and mobile conjugation views. `Person`, `Affirmative`, and `Negative` headers/labels must not include a listening icon/button.

- [ ] **Step 5: Client pronunciation QA**

Have the client review at least:

- one regular Western verb
- one irregular/suppletive Western verb
- one Eastern verb
- one full sentence in each dialect if available

Record pronunciation issues as targeted follow-up fixes. Do not mark Western/Eastern TTS linguistically verified solely because the API returns audio.

- [ ] **Step 6: Commit targeted fixes only if needed**

```bash
git add src
 git commit -m "fix: refine conjugator speech behavior"
```

Skip if no fixes are needed.

---

## TTS Plan Completion Gate

This plan is complete only when fresh evidence shows:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

all exit successfully, feature-deploy speech works without exposing the API key, only one audio clip plays at a time, and Armenian pronunciation has received client QA. Do not merge to `main` until the UI plan and TTS plan are both reviewed together.
