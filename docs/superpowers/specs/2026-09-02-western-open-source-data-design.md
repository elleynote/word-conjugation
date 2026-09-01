# Western Open-Source Data Architecture Design

## Goal
Replace the small/simplified Western starter rules with a reproducible import pipeline for the client's 3,257-verb Western Armenian source while keeping Eastern Armenian separate and preserving AI as an unverified fallback only.

## Source of truth
Western Armenian source data comes from `jhdeov/ArmenianVerbs`, pinned to commit `d6aefd5dabbb6d0ca1c147182bbdf62aa5921153`. The project is BSD 3-Clause licensed and requests citation of Boyacioglu & Dolatian (2020). The client-provided `Western_Armenian_Verbs.xlsx` is a convenient export of this lexicon and was used to validate the expected 3,257 rows/fields. The client-provided `Eastern_Western_Armenian_Conjugations_.xlsx` is QA/reference only because its own notes mark the conjugations as pattern-generated and the client reported pronunciation/conjugation errors.

## Data model
Keep `verbs` and `verb_translations` as shared lexical tables. Extend `verb_dialects` with source/class metadata (`source_name`, `source_row`, `class_number`, `subclass`, `regularity`, `initial_segment`, `regular_category`, `affix`, `transitivity`), `verified_forms jsonb`, and `source_metadata jsonb`. Add `data_sources` for attribution and `transliteration_overrides` for TUN-specific learner transliterations.

`verified_forms` stores the app's normalized eight-tenses-by-six-persons shape under `affirmative` and `negative`. The server repository maps this JSON directly into the existing `IrregularOverrides` interface so every database-backed Western verb uses source-derived verified forms rather than the simplified rule generator.

## Import pipeline
A one-time Node importer uses only built-in `fetch` and the Supabase REST API. It downloads version-pinned upstream TSV files: Western Armenian lexicon, transliterated lexicon, stemmed paradigms, complex tense definitions, particles, and synthetic negative auxiliaries. It identifies each verb's paradigm using class/subclass/initial segment/affix/example lemma, instantiates stem placeholders, and generates the app tenses:

- Present: indicative present
- Imperfect: indicative past imperfect
- Preterite: indicative past
- Imperative: imperative 2sg/2pl
- Present Perfect: perfect participle + short auxiliary present
- Pluperfect: perfect participle + short auxiliary past imperfect
- Future: `պիտի` + subjunctive present
- Conditional: `պիտի` + subjunctive past imperfect

Negative forms use source negative forms, synthetic-negative periphrases, negative short auxiliaries, and prohibitives as appropriate.

## Transliteration
The upstream transliteration is retained only as a search alias. Display transcription continues through the TUN dialect-aware transliterator and may be overridden by `transliteration_overrides`. Western and Eastern transliterations must never be assumed identical.

## English and Russian
English headwords are derived from the upstream English translation text for search and sentence generation; the raw source translation is also retained. Russian remains a separate enrichment layer: existing reviewed Russian starter entries can remain, and missing Russian translations can later be generated as AI candidates and reviewed before becoming verified translations.

## AI boundary
OpenAI is never the source of verified Western conjugation forms when a source-derived record exists. AI remains a fallback for missing lexical/translation data and writes to `ai_candidates` with `verified=false`.

## Deployment
The importer runs once after the Supabase migration is applied and service-role credentials are configured locally. Netlify uses the same Supabase project at runtime. No source API key or service role key is committed to GitHub.