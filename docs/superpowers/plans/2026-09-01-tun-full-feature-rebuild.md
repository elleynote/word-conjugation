# TUN Armenian Conjugation Full-Feature Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing Armenian Verb Studio as a complete TUN-branded Armenian conjugation tool that preserves every user-facing control and result category identified in the legacy reference while remaining responsive and runnable from the ZIP without Supabase.

**Architecture:** Keep the deterministic TypeScript conjugation/search core and extend the verb model for the full legacy metadata and optional extra forms. Build a single client-side explorer composed of focused controls, metadata, desktop table, and mobile cards, with branding centralized in `brand.ts` and CSS variables. Bundled TypeScript data remains the default runtime source; SQL and JSON import formats mirror the expanded model.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, CSS/Tailwind PostCSS pipeline, Vitest, optional Supabase/PostgreSQL, Netlify.

**Spec:** `docs/superpowers/specs/2026-09-01-tun-full-feature-rebuild-design.md`

## Global Constraints

- Use the supplied TUN black logo as a local asset in `/public`.
- Primary coral/red is approximately `#EF344C`; secondary blue approximately `#159BD7`.
- Preserve Western and Eastern Armenian modes, EN/FR interface, Transcription, Probable Future, Continuous Form, Mediative Form, `Ab`/`ab`/`AB`, counters, full metadata, affirmative/negative tabs, and all eight core tenses.
- Search must accept Armenian, English, French, and transliteration and tolerate optional English `to`.
- Runtime conjugation is deterministic and makes no AI/API call.
- Legacy-specific extra forms that cannot be safely derived must come from optional data fields rather than fabricated rules.
- Desktop uses dense comparison tables; mobile uses cards with no required page-level horizontal scrolling.
- Starter corpus runs locally without Supabase; Supabase remains optional.

---

### Task 1: Expand the domain model and option helpers

**Files:**
- Modify: `src/types/verb.ts`
- Create: `src/lib/options/displayOptions.ts`
- Create: `src/lib/options/displayOptions.test.ts`

**Interfaces:**
- Produces `InterfaceLanguage`, `TextCaseMode`, `LegacyDisplayOptions`, expanded `DialectVerbData`, `ExtraFormSection`, and `getVisibleExtraSections(data, options)`.

- [ ] Write tests that prove disabled extra options return no sections and enabled options expose only populated probable-future, continuous, and mediative data.
- [ ] Run `npm test -- src/lib/options/displayOptions.test.ts` and confirm the tests fail because the helper/types do not exist.
- [ ] Add the expanded types and minimal option helper.
- [ ] Run the option test and confirm it passes.
- [ ] Commit with `feat: extend legacy conjugation data model`.

### Task 2: Add localized labels and corpus statistics

**Files:**
- Create: `src/lib/i18n/copy.ts`
- Create: `src/lib/i18n/copy.test.ts`
- Create: `src/lib/corpus/stats.ts`
- Create: `src/lib/corpus/stats.test.ts`

**Interfaces:**
- Produces `copyFor(language)`, `localizedVerbTranslation(verb, language)`, and `getCorpusStats(verbs)`.

- [ ] Write tests for EN/FR labels, fallback translation behavior, and counts derived from the actual corpus.
- [ ] Run both test files and confirm expected missing-module failures.
- [ ] Implement the copy dictionary and corpus stat aggregation.
- [ ] Run both tests and confirm pass.
- [ ] Commit with `feat: add localization and corpus stats`.

### Task 3: Complete keyboard editing behavior

**Files:**
- Modify: `src/lib/keyboard/insertAtSelection.ts`
- Modify: `src/lib/keyboard/insertAtSelection.test.ts`

**Interfaces:**
- Produces `insertAtSelection(value, insertion, start, end)` and `backspaceAtSelection(value, start, end)`.

- [ ] Add failing tests for deleting a selection and deleting the previous Armenian character when the caret is collapsed.
- [ ] Run the keyboard test and confirm the new tests fail because backspace behavior is missing.
- [ ] Implement `backspaceAtSelection` without changing insertion semantics.
- [ ] Run the keyboard tests and confirm pass.
- [ ] Commit with `feat: add keyboard backspace editing`.

### Task 4: Expand starter verb records and metadata mapping

**Files:**
- Modify: `src/data/verbs.ts`
- Create: `src/lib/metadata/metadata.ts`
- Create: `src/lib/metadata/metadata.test.ts`

**Interfaces:**
- Produces `getVerbMetadata(verb, dialect)` returning the 12 legacy metadata fields in display order.

- [ ] Write tests against the `write` record for all 12 metadata keys and a Western/Eastern difference.
- [ ] Run the metadata test and confirm failure because the mapping is missing.
- [ ] Populate expanded metadata on the starter corpus, including optional extra-form examples only where explicitly provided.
- [ ] Implement `getVerbMetadata`.
- [ ] Run metadata plus existing search/conjugation tests and confirm pass.
- [ ] Commit with `feat: add legacy verb metadata`.

### Task 5: Build the TUN-branded control surface

**Files:**
- Modify: `src/config/brand.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/VerbExplorer.tsx`
- Modify: `src/components/SearchBar.tsx`
- Modify: `src/components/ArmenianKeyboard.tsx`
- Create: `src/components/LanguageToggle.tsx`
- Create: `src/components/LegacyOptions.tsx`
- Create: `src/components/CorpusStats.tsx`
- Create: `src/components/TextCaseToggle.tsx`
- Modify: `src/components/DialectToggle.tsx`

**Interfaces:**
- Consumes option/i18n/stats helpers.
- Produces the complete legacy control state and localized search selection flow.

- [ ] Add component-facing pure state tests where logic is non-trivial (language-dependent selected translation and text-case transformation).
- [ ] Run targeted tests and confirm new expectations fail.
- [ ] Implement EN/FR, Western/Eastern, all legacy toggles, counters, OK/Erase search behavior, local TUN logo usage, and selected result label.
- [ ] Run tests and TypeScript check.
- [ ] Commit with `feat: rebuild TUN conjugator controls`.

### Task 6: Rebuild metadata and conjugation results for desktop/mobile

**Files:**
- Replace: `src/components/VerbSummary.tsx`
- Replace: `src/components/ConjugationTable.tsx`
- Create: `src/components/ExtraForms.tsx`
- Modify: `src/components/VerbExplorer.tsx`

**Interfaces:**
- Consumes `getVerbMetadata`, `ConjugationResult`, display options, text-case mode, and localized copy.
- Produces a 12-column legacy-style metadata row on desktop, cards on mobile, a dense eight-tense comparison table, mobile tense cards, and optional extra-form sections.

- [ ] Add pure formatter tests for transcription visibility and case mode.
- [ ] Run tests and confirm expected failures.
- [ ] Implement metadata rendering, affirmative/negative tabs, responsive results, and extra sections.
- [ ] Run tests and typecheck.
- [ ] Commit with `feat: add full legacy result presentation`.

### Task 7: Apply TUN visual system and accessibility

**Files:**
- Replace: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Footer.tsx`
- Add: `public/tun-logo.png`

**Interfaces:**
- Produces TUN visual tokens and responsive layout without changing feature logic.

- [ ] Add/verify semantic labels, `aria-pressed` state, selected tab state, and accessible keyboard labels in components before styling.
- [ ] Download/bundle the supplied TUN logo asset.
- [ ] Implement white-first TUN styling with coral/blue accents, compact header, modern card surfaces, desktop tables, mobile cards, touch targets, and no page-level overflow.
- [ ] Run lint/typecheck and inspect CSS for invalid selectors/tokens.
- [ ] Commit with `style: apply TUN responsive branding`.

### Task 8: Update optional database/import formats and documentation

**Files:**
- Modify: `data/verbs.example.json`
- Modify: `scripts/import-verbs.mjs`
- Modify: `supabase/migrations/202609010001_create_verb_schema.sql`
- Modify: `supabase/seed.sql`
- Modify: `README.md`

**Interfaces:**
- Produces importable expanded metadata/extra-form fields and exact local/deployment instructions.

- [ ] Extend the JSON example and import validation with the expanded fields.
- [ ] Extend SQL columns/JSONB storage without making Supabase mandatory.
- [ ] Update README with all controls, branding notes, run commands, data ownership boundary, and corpus expansion instructions.
- [ ] Run the import script against the example JSON and validate generated output.
- [ ] Commit with `docs: update data import and setup`.

### Task 9: Full verification and ZIP packaging

**Files:**
- Create outside project: `/mnt/data/tun-armenian-conjugator.zip`

**Interfaces:**
- Produces the user-downloadable project ZIP.

- [ ] Run `npm install` if dependencies are not installed.
- [ ] Run `npm test` and require zero failures.
- [ ] Run `npm run typecheck` and require exit code 0.
- [ ] Run `npm run lint` and require exit code 0.
- [ ] Run `npm run build` and require exit code 0.
- [ ] Run `git diff --check` and confirm no whitespace errors.
- [ ] Package the repository excluding `.git`, `.worktrees`, `node_modules`, `.next`, coverage, and logs.
- [ ] List ZIP contents and confirm `package.json`, `README.md`, `public/tun-logo.png`, `src`, `data`, `supabase`, and `netlify.toml` are present.
