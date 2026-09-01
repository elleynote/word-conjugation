# TUN Armenian Conjugation

A client-owned Western and Eastern Armenian conjugation tool for TUN. The application keeps the existing detailed conjugation table and adds a simpler sentence-learning view, English/Russian interface support, responsive mobile controls, a Supabase-first verified corpus, and an optional OpenAI fallback for missing verbs.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The bundled starter corpus works without environment variables, so local development and the existing production site do not depend on Supabase being available.

## Client revisions implemented

- Armenian keyboard collapsed by default on mobile only; desktop remains expanded.
- Simple full-sentence conjugation section above the detailed table.
- Sentence view includes Armenian sentence, Latin transcription and English sentence translation.
- Independent tense selector: Present, Imperfect, Preterite, Imperative, Present Perfect, Pluperfect, Future and Conditional.
- Independent Affirmative / Negative selector.
- Mobile sentence list initially shows a shorter list with Show all / Collapse.
- Desktop sentence view uses multiple columns.
- Existing full conjugation table remains underneath.
- French removed from the public product and replaced with Russian.
- `EN | RU` changes the full interface language.
- Search supports Armenian, phonetic Armenian, English and Russian.
- Western transliteration includes the requested `Yes`, `Toun`, `Touk` forms and `ու -> ou` convention.
- TUN Translator and TUN Online Armenian School promo panels.

## Data architecture

Priority order:

1. Supabase verified corpus when configured.
2. Bundled starter corpus fallback.
3. OpenAI fallback for a missing verb when `OPENAI_API_KEY` is configured.

AI results are returned as **unverified** and are stored in `ai_candidates` when the Supabase service-role key is configured. AI candidates never silently become verified production data.

## Environment variables

Copy `.env.example` to `.env.local` for local server integration:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_VERB_MODEL=gpt-5.4-mini
```

Do not commit real secrets. `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` are server-only.

## Supabase setup

A new project can be created when the feature branch is ready for live integration. Apply migrations in order:

```text
supabase/migrations/202609010001_create_verb_schema.sql
supabase/migrations/202609020001_client_revisions.sql
```

Then load:

```text
supabase/seed.sql
```

Main tables:

- `verbs`
- `verb_translations` (`en`, `ru`)
- `verb_dialects`
- `irregular_overrides`
- `ai_candidates`

Verified corpus tables are publicly readable through RLS. `ai_candidates` has no public read/write policy and is intended for service-role access only.

## Search API

`GET /api/verbs/search?q=<verb>&dialect=western|eastern`

The server route searches Supabase first, keeps the bundled corpus as a resilience fallback, then optionally calls OpenAI when no verified/local verb exists.

## OpenAI

The OpenAI API key is never sent to the browser. The server uses the Responses API and defaults to the client-requested model:

```text
gpt-5.4-mini
```

Override it with `OPENAI_VERB_MODEL` if required later.

Because an API key was previously shared in plain text during project discussion, rotate that key before adding a production `OPENAI_API_KEY` to Netlify.

## Corpus import

The JSON import format now requires:

```text
id
english[]
russian[]
aliases[]
dialects
```

Example:

```text
data/verbs.example.json
```

Generate a typed local corpus file with:

```bash
node scripts/import-verbs.mjs data/verbs.example.json src/data/generated-verbs.ts
```

## Verification

Before merge/deployment:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Deployment

The repo remains Netlify-ready. Add the Supabase/OpenAI environment variables in Netlify only after the new Supabase project has been created and migrated.

Development branch for this scope:

```text
feature/client-revisions-supabase-ai
```

Do not merge the feature branch to `main` until the changes have been reviewed and explicitly approved.
