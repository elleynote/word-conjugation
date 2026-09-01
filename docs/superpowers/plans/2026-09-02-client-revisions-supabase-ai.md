# Client Revisions + Supabase + AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the approved client UI/data revisions, a Supabase-first verified data layer, and an OpenAI fallback while keeping the current deployed layout stable until the client sends a new full design.

**Architecture:** Keep the local starter corpus as fallback. Add a server search route that prefers Supabase, then local corpus, then OpenAI. Keep secrets server-side. Add the simple learning sentence view as a new presentation layer over the existing deterministic conjugation result.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Supabase REST API, OpenAI Responses API via server-side fetch.

**Spec:** `docs/superpowers/specs/2026-09-02-client-revisions-supabase-ai-design.md`

## Global Constraints
- Do not merge to `main` without explicit user approval.
- Do not commit API keys or service-role credentials.
- Preserve the existing detailed conjugation table.
- Mobile-only keyboard collapse must not change desktop behavior.
- French is removed and Russian becomes a full interface/search language.
- AI output is always unverified and never silently promoted to verified data.

---

### Task 1: Russian interface and data model
**Files:** `src/types/verb.ts`, `src/lib/i18n/copy.ts`, `src/components/LanguageToggle.tsx`, `src/components/CorpusStats.tsx`, `src/lib/corpus/stats.ts`, tests and starter data.
- Update `InterfaceLanguage` to `en | ru`.
- Replace French fields/copy/stats with Russian.
- Add Russian starter translations for bundled verbs.
- Update tests to verify full RU interface copy and RU search.

### Task 2: Transliteration corrections
**Files:** `src/lib/transliteration/transliterate.ts` plus tests.
- Add test cases for `ես -> Yes`, `դուն -> Toun`, `դուք -> Touk`, and `ու -> ou` behavior.
- Implement Western-aware transliteration normalization without changing Armenian source text.

### Task 3: Mobile keyboard collapse
**Files:** `src/components/ArmenianKeyboard.tsx`, `src/app/globals.css` and tests where practical.
- Add accessible expand/collapse control.
- CSS keeps keyboard expanded on desktop/tablet and collapsed initially only on mobile.

### Task 4: Simple sentence conjugation view
**Files:** create `src/lib/sentences/*`, `src/components/SentenceConjugation.tsx`, update `VerbExplorer.tsx`, CSS, tests.
- Generate localized English/Russian full-sentence translations for each person/tense/polarity.
- Add tense selector and polarity selector local to the sentence section.
- Render Armenian sentence, transliteration, and localized translation.
- Mobile initially shows a shortened list with Show all/Collapse; desktop shows all six in multiple columns.

### Task 5: Promo panels and TUN typography
**Files:** create `src/components/PromoPanels.tsx`, update `src/config/brand.ts`, `VerbExplorer.tsx`, `globals.css`.
- Add configurable translator-app and online-school cards.
- Keep URLs centralized and safe to update later.
- Apply TUN-facing font stack without redesigning the full page structure.

### Task 6: Supabase-first server data layer
**Files:** create `src/lib/server/supabaseRest.ts`, `src/lib/server/verbRepository.ts`, `src/app/api/verbs/search/route.ts`; update migrations/seed and env example; tests.
- Search verified records through Supabase REST when configured.
- Fall back to local corpus when not configured or no match is found.
- Extend schema to `en | ru` and add `ai_candidates`.
- Keep public read policies and server-only candidate writes.

### Task 7: OpenAI fallback
**Files:** create `src/lib/server/openaiVerbFallback.ts`, route integration, tests with injected/mock fetch at server boundary.
- Call Responses API server-side with `gpt-5.4-mini` only after DB/local misses.
- Require structured candidate fields.
- Mark result `source: ai`, `verified: false`.
- Store candidate in Supabase only when service credentials are configured.

### Task 8: Verification and handoff
- Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` where environment permits.
- Compare feature branch against `main`.
- Push branch and keep it unmerged.
- At this point request creation of the Supabase project, then provide the migration and Netlify environment-variable steps.