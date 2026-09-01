# Client Revisions + Supabase + AI Design

## Goal
Implement the client-requested product changes without redesigning the full desktop layout before the client supplies a replacement design.

## Approved scope
- Mobile only: Armenian keyboard is collapsed by default and can be expanded/collapsed.
- All devices: corrected Western transliteration, including preferred pronouns `Yes`, `Toun`, `Touk` and consistent `ու -> ou` handling.
- All devices: add a simple sentence conjugation view above the existing detailed table. It shows Armenian full sentence, Latin transliteration, and English/Russian full-sentence translation for all six persons.
- Sentence view has tense selection for Present, Imperfect, Preterite, Imperative, Present Perfect, Pluperfect, Future, Conditional and polarity selection for Affirmative/Negative.
- Sentence view uses a single vertical list with Show all/Collapse behavior on mobile and multi-column cards on desktop.
- Existing detailed conjugation table remains.
- Replace French with Russian everywhere: interface, search, translations, stats, types, database schema/imports/tests.
- RU switches the entire interface to Russian.
- Use TUN-facing typography while keeping current overall layout until the client sends a new design.
- Add two configurable promo panels: TUN Translator App and TUN Online Armenian School.

## Data architecture
Supabase is the primary verified-data source. The app continues to include a local starter corpus as a safe fallback until a live Supabase project is created and seeded.

Tables:
- `verbs`
- `verb_translations` using language codes `en` and `ru`
- `verb_dialects`
- `irregular_overrides`
- `ai_candidates` for unverified AI-generated records

Public users only read verified verb data. Service-role writes are server-side only.

## Runtime search flow
1. Normalize query.
2. Search Supabase when configured.
3. If no Supabase match, search bundled starter corpus.
4. If still not found and `OPENAI_API_KEY` is configured, call the OpenAI Responses API server-side.
5. Return the AI result as unverified and store a candidate in Supabase when service-role credentials are available.
6. Never expose OpenAI or Supabase service-role credentials to the browser.

## OpenAI boundary
Use the client-requested model `gpt-5.4-mini` through a server route. AI is a fallback and candidate generator, not the source of truth. AI output must be parsed into a strict structured verb-candidate shape and clearly marked unverified.

## Environment
The code can be implemented before a Supabase project exists. The live connection is activated later with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

No secrets are committed.

## Deployment
Work occurs on `feature/client-revisions-supabase-ai`. Do not merge to `main` without explicit user approval.