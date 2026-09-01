# Armenian Verb Conjugation Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, runnable Next.js Armenian verb-conjugation web application with bundled data, deterministic conjugation/search logic, responsive UI, an Armenian keyboard, and Supabase-ready database assets.

**Architecture:** The app runs entirely from local TypeScript data for zero-config development. Pure library modules handle search normalization, dataset lookup, transliteration, and conjugation generation; UI components consume those stable interfaces. Supabase SQL and import assets mirror the same data model without becoming a runtime dependency.

**Tech Stack:** Next.js 16.3.x, React 19.2.x, TypeScript, Tailwind CSS 4.3.x, Vitest 4.1.x.

**Spec:** `docs/superpowers/specs/2026-09-01-armenian-verb-tool-design.md`

## Global Constraints

- No user accounts, billing, or AI calls in V1.
- The project must run from bundled data immediately after `npm install` and `npm run dev`.
- Western and Eastern Armenian dialect rules stay isolated in the model.
- Irregular forms override generated forms.
- Branding is centralized in `src/config/brand.ts`.
- No automated copying of the original ma6.free.fr proprietary database.

---

### Task 1: Search and text helpers

**Files:**
- Create: `src/types/verb.ts`
- Create: `src/data/verbs.ts`
- Create: `src/lib/search/normalize.ts`
- Create: `src/lib/search/searchVerbs.ts`
- Test: `src/lib/search/search.test.ts`

**Interfaces:**
- Produces: `normalizeSearchQuery(query: string): string`
- Produces: `searchVerbs(query: string, dialect?: Dialect): Verb[]`

- [ ] Write failing tests for `to read` normalization, case folding, transliteration lookup, aliases, and dialect filtering.
- [ ] Run the tests and confirm the failures are caused by missing production modules.
- [ ] Implement the data types, starter verb corpus, normalization, and ranked search.
- [ ] Run tests and confirm they pass.

### Task 2: Deterministic conjugation engine

**Files:**
- Create: `src/lib/conjugation/rules.ts`
- Create: `src/lib/conjugation/conjugate.ts`
- Create: `src/lib/transliteration/transliterate.ts`
- Test: `src/lib/conjugation/conjugate.test.ts`

**Interfaces:**
- Produces: `conjugateVerb(verb: Verb, dialect: Dialect, polarity: Polarity): ConjugationResult`
- Produces: `transliterateArmenian(value: string, dialect: Dialect): string`

- [ ] Write failing tests for regular Western/Eastern output, negative routing, imperative rows, and irregular override precedence.
- [ ] Run the tests and confirm expected failures.
- [ ] Implement rule helpers, transliteration, and conjugation result generation.
- [ ] Run tests and confirm they pass.

### Task 3: Armenian keyboard helper and interaction model

**Files:**
- Create: `src/lib/keyboard/insertAtSelection.ts`
- Test: `src/lib/keyboard/insertAtSelection.test.ts`
- Create: `src/components/ArmenianKeyboard.tsx`

**Interfaces:**
- Produces: `insertAtSelection(value: string, insert: string, start: number, end: number)`

- [ ] Write failing tests for insertion and selection replacement.
- [ ] Run tests and confirm expected failures.
- [ ] Implement the helper and keyboard component.
- [ ] Run tests and confirm they pass.

### Task 4: Application UI and branding

**Files:**
- Create: `src/config/brand.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/VerbExplorer.tsx`
- Create: `src/components/SearchBar.tsx`
- Create: `src/components/DialectToggle.tsx`
- Create: `src/components/VerbSummary.tsx`
- Create: `src/components/ConjugationTable.tsx`
- Create: `src/components/Toggle.tsx`
- Create: `src/components/Footer.tsx`

**Interfaces:**
- Consumes: search, conjugation, keyboard, and branding modules from Tasks 1-3.

- [ ] Build the responsive single-page explorer UI using the tested pure interfaces.
- [ ] Add autocomplete, keyboard toggling, dialect/polarity/transliteration controls, metadata, and mobile tense cards.
- [ ] Ensure empty/no-match states are graceful and accessible.

### Task 5: Project configuration and database assets

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `supabase/migrations/202609010001_create_verb_schema.sql`
- Create: `supabase/seed.sql`
- Create: `scripts/import-verbs.mjs`
- Create: `data/verbs.example.json`
- Create: `README.md`
- Create: `netlify.toml`

- [ ] Add runnable scripts for dev, build, start, typecheck, test, and lint.
- [ ] Add PostgreSQL schema with public read-only tables and irregular override structure.
- [ ] Add import example and documentation for branding, data extension, Supabase, and Netlify.

### Task 6: Verification and packaging

**Files:**
- Modify only files required to fix verification failures.
- Create final ZIP outside the project directory.

- [ ] Install dependencies.
- [ ] Run `npm test` and fix failures using test-first regression cases when behavior changes.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Check git diff/status for accidental generated files or secrets.
- [ ] Package the repository source, excluding `node_modules` and `.next`, as `/mnt/data/armenian-verb-conjugator.zip`.
