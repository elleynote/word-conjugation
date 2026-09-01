# Original Layout Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the TUN conjugator match the original Western/Eastern Armenian tool layout, typography, density, and dialect-specific feature presentation while preserving the existing engine.

**Architecture:** Keep the current Next.js/React data and conjugation layers. Add a small pure presentation policy module for dialect-specific theme/options/metadata behavior, then restructure the page shell and CSS around the original tool's hero-overlap-table composition. The UI remains data-driven and uses existing search/conjugation functions.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS/Tailwind import, Vitest, local JSON/TypeScript corpus.

**Spec:** `docs/superpowers/specs/2026-09-01-original-layout-parity-design.md`

## Global Constraints

- Preserve current conjugation/search functionality and bundled corpus.
- Use Fraunces 600, Inter 400/600/700, and Noto Serif Armenian 400/600 through web-font references with fallbacks.
- Western uses navy theme and exposes Transcription + Continuous + Mediative.
- Eastern uses burgundy theme and exposes Transcription + Probable future.
- Western metadata includes Particule and Mediative.P; Eastern omits those columns.
- Remove visible starter-corpus developer notice from the public UI.
- Do not bundle/copy the original site's mountain artwork or contact details.
- Keep the supplied TUN logo and client-owned identity.

---

### Task 1: Dialect presentation policy

**Files:**
- Create: `src/lib/presentation/dialectPresentation.test.ts`
- Create: `src/lib/presentation/dialectPresentation.ts`
- Modify: `src/lib/metadata/metadata.ts`
- Modify: `src/lib/metadata/metadata.test.ts`

**Interfaces:**
- Produces: `getDialectPresentation(dialect)` returning accent/theme and visible legacy option keys.
- Produces: `getVerbMetadata(verb, dialect)` returning dialect-appropriate columns.

- [ ] Write failing tests asserting Western exposes transcription/continuous/mediative and Eastern exposes transcription/probableFuture.
- [ ] Run tests and confirm failure because the policy module does not exist.
- [ ] Implement the minimal policy module.
- [ ] Write failing metadata test proving Eastern omits `particule`/`mediativeParticiple` while Western includes them.
- [ ] Update metadata generation and run tests to green.
- [ ] Commit.

### Task 2: Original-style shell and dialect-aware controls

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/VerbExplorer.tsx`
- Modify: `src/components/LegacyOptions.tsx`
- Modify: `src/components/SearchBar.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/config/brand.ts`

**Interfaces:**
- Consumes: `getDialectPresentation(dialect)`.
- Produces: original-style hero/tool overlap DOM classes and dialect-aware option rendering.

- [ ] Add source/smoke assertions for `data-dialect`, original hero composition classes, and hidden dialect-inapplicable options.
- [ ] Run smoke check and confirm failure.
- [ ] Restructure shell: remove standalone TUN site header, move language selector into hero, add center TUN decorative card, set root dialect attribute.
- [ ] Make legacy options render only the active dialect's original controls.
- [ ] Remove visual autocomplete menu while retaining tolerant OK/Enter search.
- [ ] Remove public starter-corpus notice and replace footer with minimal TUN ownership treatment.
- [ ] Run smoke assertions to green and commit.

### Task 3: Original typography, spacing, theme and table styling

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/VerbSummary.tsx`
- Modify: `src/components/ConjugationTable.tsx`
- Modify: `src/components/ExtraForms.tsx`

**Interfaces:**
- Uses dialect attributes/CSS variables from Task 2.
- Produces desktop layout matching the screenshots and responsive fallback.

- [ ] Add source verification for Google font references and required CSS theme selectors.
- [ ] Confirm verification fails before changes.
- [ ] Add Google font stylesheet references in layout and update brand font stacks.
- [ ] Replace current white landing-page styling with cream page + deep hero + overlapping white panel + compact beige/gold borders.
- [ ] Style Western navy and Eastern burgundy through `[data-dialect]` variables.
- [ ] Match metadata/conjugation table density, serif headings, Armenian/transcription hierarchy, and original tab treatment.
- [ ] Style extra forms as compact original-like tables and ensure only applicable sections render.
- [ ] Keep responsive table/card fallback without changing desktop parity.
- [ ] Run source verification and typecheck; commit.

### Task 4: Verification and package

**Files:**
- Modify: `README.md`
- Create: `/mnt/data/tun-armenian-conjugator-original-layout.zip`

**Interfaces:**
- Produces downloadable ZIP with no `.git`, `node_modules`, or build cache.

- [ ] Run full unit tests when dependencies are available.
- [ ] Run dependency-free core TypeScript/smoke validation.
- [ ] Run `tsc --noEmit` or equivalent framework-stub type validation when npm dependencies are unavailable.
- [ ] Run `git diff --check` and inspect final diff/status.
- [ ] Update README with dialect-specific UI behavior and run instructions.
- [ ] Package clean project ZIP and list its contents.
