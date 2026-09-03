# New Conjugator UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current top-heavy Armenian conjugator presentation with the approved three-column desktop workspace, tense-tab comparison view, Full Sentences tab, recent history, collapsible keyboard, and responsive mobile layout while preserving existing Supabase search and conjugation behavior.

**Architecture:** Keep `VerbExplorer` as the single owner of selected verb, dialect, language, search, and conjugation state. Introduce small presentation helpers/components for recent history, active view/tabs, selected-verb metadata, and affirmative-vs-negative comparison; extend existing runtime verb metadata only enough to expose already-stored Supabase source fields. Reuse the existing conjugation engine and sentence generator rather than adding a parallel grammar path.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS, Vitest, Supabase REST-backed repository.

**Spec:** `docs/superpowers/specs/2026-09-04-new-conjugator-ui-tts-design.md`

## Global Constraints

- Work only on `feature/new-conjugator-ui-tts` until explicit approval to merge.
- Do not rewrite the conjugation grammar engine.
- Do not change the 3,257-verb Supabase Western Armenian source architecture.
- Do not fabricate Eastern Armenian or Russian source data.
- Preserve existing EN/RU interface switching and Western/Eastern dialect behavior.
- Preserve the illustrated TUN footer.
- No speaker/listening icon may appear in the `Affirmative` or `Negative` table headers.
- TTS implementation is handled in the companion plan `docs/superpowers/plans/2026-09-04-conjugator-tts.md`.
- Use tests before implementation for behavior changes.

---

## File Structure

### New files

- `src/lib/presentation/conjugatorTabs.ts` — active-tab type, ordered tab list, label mapping.
- `src/lib/presentation/conjugatorTabs.test.ts` — tense/view mapping tests.
- `src/lib/presentation/tenseComparison.ts` — merges existing affirmative and negative results into display rows.
- `src/lib/presentation/tenseComparison.test.ts` — comparison-row tests.
- `src/lib/recent/recentVerbs.ts` — pure recent-history normalization and persistence-safe model.
- `src/lib/recent/recentVerbs.test.ts` — dedupe/max-length tests.
- `src/components/ConjugatorSidebar.tsx` — search, selected result, dialect, recent verbs, keyboard shell.
- `src/components/RecentVerbs.tsx` — recent history rendering.
- `src/components/TenseTabs.tsx` — accessible active tense / Full Sentences navigation.
- `src/components/TenseComparison.tsx` — desktop table + mobile comparison cards.
- `src/app/conjugator-redesign.css` — approved visual layout and responsive styles.

### Modified files

- `src/types/verb.ts` — expose optional verified source metadata already stored in Supabase.
- `src/lib/server/verbRepository.ts` — map source metadata columns into `DialectVerbData`.
- `src/lib/metadata/metadata.ts` — provide concise display metadata for the redesigned summary card.
- `src/lib/i18n/copy.ts` — add new sidebar/tab/card labels in EN/RU.
- `src/components/SearchBar.tsx` — reduce to compact sidebar search UI and feedback.
- `src/components/ArmenianKeyboard.tsx` — make expansion controlled instead of mobile-only internal state.
- `src/components/VerbSummary.tsx` — replace legacy metadata table with the approved hero-style summary card.
- `src/components/SentenceConjugation.tsx` — adapt existing sentence content to the Full Sentences tab shell without changing grammar generation.
- `src/components/PromoPanels.tsx` — restyle/restructure right-sidebar cards and Tip.
- `src/components/VerbExplorer.tsx` — compose the new workspace and maintain single source of truth for UI state.
- `src/app/layout.tsx` — import `conjugator-redesign.css` after existing CSS so the redesign layer wins intentionally.

---

### Task 1: Expose Verified Source Metadata to the Presentation Layer

**Files:**
- Modify: `src/types/verb.ts`
- Modify: `src/lib/server/verbRepository.ts`
- Modify: `src/lib/metadata/metadata.ts`
- Test: `src/lib/metadata/metadata.test.ts`

**Interfaces:**
- Produces optional `DialectVerbData` fields: `classNumber?: number`, `subclass?: string`, `regularity?: string`, `regularCategory?: string`, `transitivity?: string`.
- Produces `getVerbSummaryMetadata(verb, dialect, language)` for the redesigned summary card.

- [ ] **Step 1: Write the failing metadata test**

Create `src/lib/metadata/metadata.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getVerbSummaryMetadata } from "./metadata";
import type { Verb } from "@/types/verb";

const verb: Verb = {
  id: "hyw-test",
  english: ["love"],
  russian: [],
  aliases: [],
  dialects: {
    western: {
      lemma: "սիրել",
      transliteration: "sirel",
      group: "E-Class",
      root: "սիր",
      class: "el",
      isIrregular: false,
      participles: {},
      classNumber: 2,
      regularity: "Regular",
      transitivity: "Transitive",
    },
  },
};

describe("getVerbSummaryMetadata", () => {
  it("uses verified source metadata when available", () => {
    expect(getVerbSummaryMetadata(verb, "western", "en")).toEqual([
      { key: "dialect", label: "Dialect", value: "Western Armenian" },
      { key: "class", label: "Conjugation class", value: "E-Class" },
      { key: "type", label: "Verb type", value: "Regular" },
      { key: "transitivity", label: "Transitivity", value: "Transitive" },
    ]);
  });
});
```

- [ ] **Step 2: Run the test and confirm the red state**

Run:

```bash
npm test -- src/lib/metadata/metadata.test.ts
```

Expected: FAIL because `getVerbSummaryMetadata` and the new metadata fields do not exist.

- [ ] **Step 3: Extend `DialectVerbData` with optional source metadata**

Add to `DialectVerbData` in `src/types/verb.ts`:

```ts
classNumber?: number;
subclass?: string;
regularity?: string;
regularCategory?: string;
transitivity?: string;
```

- [ ] **Step 4: Map the existing Supabase columns**

Extend `DialectRow` in `src/lib/server/verbRepository.ts`:

```ts
class_number: number | null;
subclass: string | null;
regularity: string | null;
regular_category: string | null;
transitivity: string | null;
```

Add to the returned `DialectVerbData` in `dialectDataFromRow`:

```ts
classNumber: row.class_number ?? undefined,
subclass: row.subclass ?? undefined,
regularity: row.regularity ?? undefined,
regularCategory: row.regular_category ?? undefined,
transitivity: row.transitivity ?? undefined,
```

Do not add a migration; these columns already exist in `202609020002_western_source_data.sql`.

- [ ] **Step 5: Implement concise summary metadata**

In `src/lib/metadata/metadata.ts`, add:

```ts
export function getVerbSummaryMetadata(
  verb: Verb,
  dialect: Dialect,
  language: InterfaceLanguage = "en",
): MetadataField[] {
  const data = verb.dialects[dialect];
  if (!data) return [];

  const en = language === "en";
  const dialectLabel = dialect === "western"
    ? (en ? "Western Armenian" : "Западноармянский")
    : (en ? "Eastern Armenian" : "Восточноармянский");

  const typeValue = data.regularity
    ?? (data.isIrregular ? (en ? "Irregular" : "Неправильный") : (en ? "Regular" : "Правильный"));

  return [
    { key: "dialect", label: en ? "Dialect" : "Диалект", value: dialectLabel },
    { key: "class", label: en ? "Conjugation class" : "Класс спряжения", value: data.group || "—" },
    { key: "type", label: en ? "Verb type" : "Тип глагола", value: typeValue || "—" },
    { key: "transitivity", label: en ? "Transitivity" : "Переходность", value: data.transitivity || "—" },
  ];
}
```

Keep the existing `getVerbMetadata` export for compatibility until all old references are removed.

- [ ] **Step 6: Run focused test and typecheck**

Run:

```bash
npm test -- src/lib/metadata/metadata.test.ts
npm run typecheck
```

Expected: PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/types/verb.ts src/lib/server/verbRepository.ts src/lib/metadata/metadata.ts src/lib/metadata/metadata.test.ts
git commit -m "feat: expose verb source metadata"
```

---

### Task 2: Add Stable Tense/View Mapping and Comparison Rows

**Files:**
- Create: `src/lib/presentation/conjugatorTabs.ts`
- Create: `src/lib/presentation/conjugatorTabs.test.ts`
- Create: `src/lib/presentation/tenseComparison.ts`
- Create: `src/lib/presentation/tenseComparison.test.ts`

**Interfaces:**
- Produces `ConjugatorView = Exclude<Tense, "imperative"> | "fullSentences"`.
- Produces `CONJUGATOR_VIEWS` in approved visual order.
- Produces `buildTenseComparisonRows(affirmative, negative, tense)`.

- [ ] **Step 1: Write failing tab-order test**

Create `src/lib/presentation/conjugatorTabs.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CONJUGATOR_VIEWS, labelForConjugatorView } from "./conjugatorTabs";

describe("conjugator tabs", () => {
  it("uses the approved desktop order", () => {
    expect(CONJUGATOR_VIEWS).toEqual([
      "present",
      "imperfect",
      "preterite",
      "future",
      "conditional",
      "presentPerfect",
      "pluperfect",
      "fullSentences",
    ]);
  });

  it("renames preterite and pluperfect for the new UI", () => {
    expect(labelForConjugatorView("preterite", "en")).toBe("Simple Past");
    expect(labelForConjugatorView("pluperfect", "en")).toBe("Past Perfect");
    expect(labelForConjugatorView("fullSentences", "en")).toBe("Full Sentences");
  });
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- src/lib/presentation/conjugatorTabs.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the tab model**

Create `src/lib/presentation/conjugatorTabs.ts`:

```ts
import type { InterfaceLanguage, Tense } from "@/types/verb";

export type ConjugatorView = Exclude<Tense, "imperative"> | "fullSentences";

export const CONJUGATOR_VIEWS: ConjugatorView[] = [
  "present",
  "imperfect",
  "preterite",
  "future",
  "conditional",
  "presentPerfect",
  "pluperfect",
  "fullSentences",
];

const labels = {
  en: {
    present: "Present",
    imperfect: "Imperfect",
    preterite: "Simple Past",
    future: "Future",
    conditional: "Conditional",
    presentPerfect: "Present Perfect",
    pluperfect: "Past Perfect",
    fullSentences: "Full Sentences",
  },
  ru: {
    present: "Настоящее",
    imperfect: "Прошедшее несовершенное",
    preterite: "Простое прошедшее",
    future: "Будущее",
    conditional: "Условное",
    presentPerfect: "Совершённое",
    pluperfect: "Предпрошедшее",
    fullSentences: "Полные предложения",
  },
} as const;

export function labelForConjugatorView(view: ConjugatorView, language: InterfaceLanguage): string {
  return labels[language][view];
}
```

- [ ] **Step 4: Write failing comparison-row test**

Create `src/lib/presentation/tenseComparison.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildTenseComparisonRows } from "./tenseComparison";
import type { ConjugationResult } from "@/types/verb";

const makeResult = (polarity: "affirmative" | "negative", value: string): ConjugationResult => ({
  verbId: "test",
  dialect: "western",
  polarity,
  pronouns: {
    firstSingular: "ես",
    secondSingular: "դուն",
    thirdSingular: "ան",
    firstPlural: "մենք",
    secondPlural: "դուք",
    thirdPlural: "անոնք",
  },
  tenses: {
    present: { tense: "present", label: "Present", forms: Object.fromEntries([
      "firstSingular", "secondSingular", "thirdSingular", "firstPlural", "secondPlural", "thirdPlural",
    ].map((person) => [person, { armenian: value, transliteration: value }])) as never },
    imperfect: {} as never,
    preterite: {} as never,
    imperative: {} as never,
    presentPerfect: {} as never,
    pluperfect: {} as never,
    future: {} as never,
    conditional: {} as never,
  },
});

describe("buildTenseComparisonRows", () => {
  it("pairs affirmative and negative forms by person", () => {
    const rows = buildTenseComparisonRows(
      makeResult("affirmative", "կը սիրեմ"),
      makeResult("negative", "չեմ սիրեր"),
      "present",
    );

    expect(rows[0]).toMatchObject({
      person: "firstSingular",
      pronoun: "ես",
      affirmative: { armenian: "կը սիրեմ" },
      negative: { armenian: "չեմ սիրեր" },
    });
  });
});
```

- [ ] **Step 5: Run and verify failure**

```bash
npm test -- src/lib/presentation/tenseComparison.test.ts
```

Expected: FAIL because `buildTenseComparisonRows` does not exist.

- [ ] **Step 6: Implement the comparison helper**

Create `src/lib/presentation/tenseComparison.ts`:

```ts
import { PERSONS, type ConjugatedForm, type ConjugationResult, type Person, type Tense } from "@/types/verb";

export interface TenseComparisonRow {
  person: Person;
  pronoun: string;
  affirmative: ConjugatedForm;
  negative: ConjugatedForm;
}

export function buildTenseComparisonRows(
  affirmative: ConjugationResult,
  negative: ConjugationResult,
  tense: Tense,
): TenseComparisonRow[] {
  return PERSONS.map((person) => ({
    person,
    pronoun: affirmative.pronouns[person],
    affirmative: affirmative.tenses[tense].forms[person],
    negative: negative.tenses[tense].forms[person],
  }));
}
```

- [ ] **Step 7: Run focused tests**

```bash
npm test -- src/lib/presentation/conjugatorTabs.test.ts src/lib/presentation/tenseComparison.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/presentation
git commit -m "feat: add conjugator view models"
```

---

### Task 3: Add Recently Viewed Verb History

**Files:**
- Create: `src/lib/recent/recentVerbs.ts`
- Create: `src/lib/recent/recentVerbs.test.ts`
- Create: `src/components/RecentVerbs.tsx`

**Interfaces:**
- Produces `RecentVerbEntry`.
- Produces `pushRecentVerb(entries, next, limit = 5)`.
- Produces storage key `tun-conjugator-recent-v1`.

- [ ] **Step 1: Write failing history tests**

Create `src/lib/recent/recentVerbs.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pushRecentVerb, type RecentVerbEntry } from "./recentVerbs";

const entry = (id: string): RecentVerbEntry => ({
  id,
  lemma: id,
  dialect: "western",
  label: id,
});

describe("pushRecentVerb", () => {
  it("puts the newest item first and removes duplicates", () => {
    expect(pushRecentVerb([entry("a"), entry("b")], entry("b"))).toEqual([
      entry("b"),
      entry("a"),
    ]);
  });

  it("keeps at most five items", () => {
    const result = ["a", "b", "c", "d", "e", "f"].reduce(
      (items, id) => pushRecentVerb(items, entry(id)),
      [] as RecentVerbEntry[],
    );
    expect(result.map((item) => item.id)).toEqual(["f", "e", "d", "c", "b"]);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

```bash
npm test -- src/lib/recent/recentVerbs.test.ts
```

- [ ] **Step 3: Implement the history helper**

Create `src/lib/recent/recentVerbs.ts`:

```ts
import type { Dialect } from "@/types/verb";

export const RECENT_VERBS_STORAGE_KEY = "tun-conjugator-recent-v1";

export interface RecentVerbEntry {
  id: string;
  lemma: string;
  dialect: Dialect;
  label: string;
}

export function pushRecentVerb(
  entries: RecentVerbEntry[],
  next: RecentVerbEntry,
  limit = 5,
): RecentVerbEntry[] {
  return [next, ...entries.filter((entry) => !(entry.id === next.id && entry.dialect === next.dialect))].slice(0, limit);
}
```

- [ ] **Step 4: Implement `RecentVerbs` presentational component**

Create `src/components/RecentVerbs.tsx` with props:

```ts
interface RecentVerbsProps {
  entries: RecentVerbEntry[];
  language: InterfaceLanguage;
  onSelect: (entry: RecentVerbEntry) => void;
}
```

Render a heading, empty-state copy, and accessible `<button>` for each entry. Do not access `localStorage` inside this component.

- [ ] **Step 5: Run focused tests and typecheck**

```bash
npm test -- src/lib/recent/recentVerbs.test.ts
npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/recent src/components/RecentVerbs.tsx
git commit -m "feat: add recent verb history model"
```

---

### Task 4: Refactor Search and Keyboard into the Left Sidebar

**Files:**
- Modify: `src/components/SearchBar.tsx`
- Modify: `src/components/ArmenianKeyboard.tsx`
- Create: `src/components/ConjugatorSidebar.tsx`
- Modify: `src/lib/i18n/copy.ts`

**Interfaces:**
- `SearchBar` remains controlled by `VerbExplorer` and no longer renders the selected-verb result inline.
- `ArmenianKeyboard` receives `open: boolean` and `onToggle: () => void`.
- `ConjugatorSidebar` receives search/dialect/keyboard/recent state and callbacks; it owns no conjugation state.

- [ ] **Step 1: Add copy keys before component changes**

Add EN/RU keys in `src/lib/i18n/copy.ts` for:

```ts
searchForVerb
selectedVerb
chooseDialect
recentlyViewed
noRecentVerbs
openKeyboard
closeKeyboard
```

Use these exact English values:

```text
Search for a verb
Selected verb
Choose dialect
Recently viewed
No recently viewed verbs yet.
Open Armenian keyboard
Close Armenian keyboard
```

Add natural Russian equivalents in the RU dictionary.

- [ ] **Step 2: Make `ArmenianKeyboard` controlled**

Replace its internal `mobileOpen` state with props:

```ts
interface ArmenianKeyboardProps {
  language: InterfaceLanguage;
  textCase: TextCaseMode;
  open: boolean;
  onToggle: () => void;
  onInsert: (character: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}
```

Set `data-open={open ? "true" : "false"}` and `aria-expanded={open}`. Render the body only when `open` is true or use CSS based on `data-open`; do not maintain a second source of truth.

- [ ] **Step 3: Simplify `SearchBar`**

Keep:

- controlled input
- Enter-to-search
- clear × button
- Search button
- loading / not-found / AI warning feedback
- helper text

Remove the old inline `selected-verb` section and the redundant separate Erase button from the wide layout. The sidebar already has a clear × control and selected-verb card.

- [ ] **Step 4: Build `ConjugatorSidebar`**

Create `src/components/ConjugatorSidebar.tsx` to compose:

```tsx
<aside className="conjugator-sidebar">
  <SearchBar ... />
  <SelectedVerbSidebarCard ... />
  <DialectToggle ... />
  <RecentVerbs ... />
  <ArmenianKeyboard ... />
</aside>
```

The selected card shows lemma, transliteration, primary localized meaning, and a simple regularity/group badge. Do not duplicate the full main summary metadata.

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

Expected: PASS after all call sites are updated in the same task or temporarily adjusted in `VerbExplorer` behind the current layout.

- [ ] **Step 6: Commit**

```bash
git add src/components/SearchBar.tsx src/components/ArmenianKeyboard.tsx src/components/ConjugatorSidebar.tsx src/lib/i18n/copy.ts
git commit -m "feat: add conjugator sidebar"
```

---

### Task 5: Replace the Legacy Summary with the Approved Verb Card

**Files:**
- Modify: `src/components/VerbSummary.tsx`
- Modify: `src/lib/i18n/copy.ts`

**Interfaces:**
- `VerbSummary` keeps the existing public props so `VerbExplorer` integration remains simple.
- Uses `getVerbSummaryMetadata` from Task 1.
- TTS button placement is deferred to the companion TTS plan.

- [ ] **Step 1: Replace legacy table markup**

Render a card structure equivalent to:

```tsx
<section className="verb-summary-card">
  <div className="verb-summary-card__mark">{firstArmenianCharacter}</div>
  <div className="verb-summary-card__identity">
    <strong className="verb-summary-card__lemma">...</strong>
    <span className="verb-summary-card__transliteration">...</span>
    <span className="verb-summary-card__meaning">...</span>
  </div>
  <dl className="verb-summary-card__facts">...</dl>
</section>
```

Use `localizedVerbTranslation(verb, language)` for the meaning. Show transcription only when `showTranscription` is true.

- [ ] **Step 2: Display source-backed facts safely**

For each `getVerbSummaryMetadata` item:

```tsx
<div key={field.key}>
  <dt>{field.label}</dt>
  <dd>{field.value || "—"}</dd>
</div>
```

Never infer transitivity or regularity beyond the fallback already defined in Task 1.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/components/VerbSummary.tsx src/lib/i18n/copy.ts
git commit -m "feat: redesign verb summary card"
```

---

### Task 6: Build Tense Tabs and the Person / Affirmative / Negative View

**Files:**
- Create: `src/components/TenseTabs.tsx`
- Create: `src/components/TenseComparison.tsx`
- Modify: `src/components/ConjugationTable.tsx`
- Modify: `src/components/VerbExplorer.tsx`

**Interfaces:**
- `TenseTabs` consumes `value: ConjugatorView`, `language`, `onChange`.
- `TenseComparison` consumes two `ConjugationResult`s and one non-imperative `Tense`.
- `ConjugationTable` may be retained as compatibility code until Task 10 cleanup, but the redesigned UI should stop rendering it.

- [ ] **Step 1: Implement accessible `TenseTabs`**

Use `CONJUGATOR_VIEWS` and `labelForConjugatorView` from Task 2.

Each button:

```tsx
<button
  type="button"
  role="tab"
  aria-selected={value === view}
  className={value === view ? "is-active" : ""}
  onClick={() => onChange(view)}
>
  {labelForConjugatorView(view, language)}
</button>
```

The container uses `role="tablist"` and becomes horizontally scrollable in CSS.

- [ ] **Step 2: Implement `TenseComparison`**

Use `buildTenseComparisonRows`.

Desktop header must be exactly conceptual columns:

```tsx
<thead>
  <tr>
    <th>Person</th>
    <th>{copy.affirmative}</th>
    <th>{copy.negative}</th>
  </tr>
</thead>
```

**Do not put any icon/button inside these header cells.**

Rows show person/pronoun, Armenian form, and transliteration when enabled.

Also render a `.tense-comparison-mobile` card representation for `< 768px` rather than horizontal table scrolling.

- [ ] **Step 3: Change `VerbExplorer` from one polarity result to two results**

Replace the top-level `polarity` state used by the main table with `activeView`:

```ts
const [activeView, setActiveView] = useState<ConjugatorView>("present");
```

Compute both conjugation results from the same selected verb/dialect/options:

```ts
const affirmativeResult = useMemo(
  () => selectedVerb && selectedData
    ? applyLegacyDisplayOptions(conjugateVerb(selectedVerb, dialect, "affirmative"), selectedData, dialect, options)
    : null,
  [selectedVerb, selectedData, dialect, options],
);

const negativeResult = useMemo(
  () => selectedVerb && selectedData
    ? applyLegacyDisplayOptions(conjugateVerb(selectedVerb, dialect, "negative"), selectedData, dialect, options)
    : null,
  [selectedVerb, selectedData, dialect, options],
);
```

Do not alter `conjugateVerb`.

- [ ] **Step 4: Render tabs and active normal tense**

When `activeView !== "fullSentences"`, render `TenseComparison` using both results and `activeView` as the tense.

When `activeView === "fullSentences"`, defer to Task 7.

- [ ] **Step 5: Run tests, typecheck, and lint**

```bash
npm test -- src/lib/presentation/conjugatorTabs.test.ts src/lib/presentation/tenseComparison.test.ts
npm run typecheck
npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add src/components/TenseTabs.tsx src/components/TenseComparison.tsx src/components/VerbExplorer.tsx src/components/ConjugationTable.tsx
git commit -m "feat: add tense comparison interface"
```

---

### Task 7: Move Existing Sentence Conjugation into the Full Sentences Tab

**Files:**
- Modify: `src/components/SentenceConjugation.tsx`
- Modify: `src/components/VerbExplorer.tsx`
- Modify: `src/lib/i18n/copy.ts`

**Interfaces:**
- Preserve `SentenceConjugationProps` unless a controlled sentence tense is needed.
- Preserve existing `englishSentenceFor`, `conjugateVerb`, transliteration, polarity, and six-person generation.

- [ ] **Step 1: Remove the old standalone page placement**

In `VerbExplorer`, do not render `SentenceConjugation` between summary and conjugation sections anymore.

- [ ] **Step 2: Render it only for `fullSentences`**

Use:

```tsx
{activeView === "fullSentences" ? (
  <SentenceConjugation
    verb={selectedVerb}
    dialect={dialect}
    language={language}
    options={options}
  />
) : (
  <TenseComparison ... />
)}
```

- [ ] **Step 3: Restyle sentence component markup without changing data generation**

Keep its internal `tense`, `polarity`, `expanded`, and row generation behavior. Change headings/copy from `Simple conjugation` to the new Full Sentences wording through `copy.ts`.

The component continues to display:

- Armenian full sentence
- learner transliteration
- English full sentence
- six persons
- affirmative/negative controls
- sentence tense select including imperative, preserving access to the existing imperative sentence behavior

Russian sentence lines are **not** synthesized here until a reliable Russian sentence generator/data source exists.

- [ ] **Step 4: Verify existing sentence helpers**

Run any existing sentence test plus full tests:

```bash
npm test
npm run typecheck
```

Expected: existing sentence behavior remains green.

- [ ] **Step 5: Commit**

```bash
git add src/components/SentenceConjugation.tsx src/components/VerbExplorer.tsx src/lib/i18n/copy.ts
git commit -m "feat: add full sentences tab"
```

---

### Task 8: Redesign the Right Sidebar Promos and Tip

**Files:**
- Modify: `src/components/PromoPanels.tsx`
- Modify: `src/lib/i18n/copy.ts`

**Interfaces:**
- Keep existing `PromoPanels({ language })` interface.
- Keep URLs from `brand.promos` unchanged.

- [ ] **Step 1: Add Tip copy**

Add:

```text
EN: Use the Full Sentences tab to see conjugations in everyday sentences.
RU: Используйте вкладку «Полные предложения», чтобы увидеть спряжения в повседневных фразах.
```

Add heading copy for `More Armenian Tools` / Russian equivalent.

- [ ] **Step 2: Restructure `PromoPanels`**

Render three cards inside a right-sidebar-friendly container:

1. TUN Translator
2. TUN Online Armenian School
3. Tip

Use existing translator/school title, description, CTA, and URLs. No new external service or tracking.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/components/PromoPanels.tsx src/lib/i18n/copy.ts
git commit -m "feat: redesign TUN resource sidebar"
```

---

### Task 9: Compose the New Workspace and Persist Recent/Keyboard State

**Files:**
- Modify: `src/components/VerbExplorer.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/conjugator-redesign.css`

**Interfaces:**
- `VerbExplorer` remains the only top-level client state owner.
- Local storage is read/written only from `VerbExplorer` effects/handlers.

- [ ] **Step 1: Add UI state**

In `VerbExplorer` add:

```ts
const [keyboardOpen, setKeyboardOpen] = useState(false);
const [recentVerbs, setRecentVerbs] = useState<RecentVerbEntry[]>([]);
```

`activeView` comes from Task 6.

- [ ] **Step 2: Load recent history after mount**

Use a guarded effect:

```ts
useEffect(() => {
  try {
    const raw = window.localStorage.getItem(RECENT_VERBS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as RecentVerbEntry[];
    if (Array.isArray(parsed)) setRecentVerbs(parsed.slice(0, 5));
  } catch {
    setRecentVerbs([]);
  }
}, []);
```

Do not make local history a blocking dependency.

- [ ] **Step 3: Update history only after a verb is successfully selected**

Inside `selectVerb`, build an entry from the active dialect and call `pushRecentVerb`. Persist the returned list with `localStorage.setItem` inside a try/catch.

Do not add failed searches to history.

- [ ] **Step 4: Implement recent-item selection**

On click:

- set dialect from entry
- set query to entry.lemma
- execute the same `/api/verbs/search` path used by normal search

Prefer re-searching by lemma instead of trusting stale serialized conjugation payloads.

- [ ] **Step 5: Compose the workspace**

Replace the old hero/tool-shell structure with:

```tsx
<div className="conjugator-page" data-dialect={dialect}>
  <header className="conjugator-topbar">...</header>
  <main className="conjugator-workspace">
    <ConjugatorSidebar ... />
    <section className="conjugator-main">...</section>
    <aside className="conjugator-resources">
      <PromoPanels language={language} />
    </aside>
  </main>
</div>
```

Keep `LanguageToggle` in the compact top bar. Keep TUN branding/logo. Remove the old oversized hero presentation from the rendered tree.

- [ ] **Step 6: Add the redesign stylesheet**

Create `src/app/conjugator-redesign.css` with these breakpoints:

```css
.conjugator-workspace {
  width: min(1440px, calc(100% - 40px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(250px, 290px) minmax(0, 1fr) minmax(250px, 280px);
  gap: 24px;
  align-items: start;
}

@media (max-width: 1199px) {
  .conjugator-workspace {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 767px) {
  .conjugator-workspace {
    width: min(100% - 24px, 720px);
    gap: 16px;
  }
}
```

Add focused classes for sidebar cards, verb summary, tab strip, desktop table, mobile cards, promo cards, and keyboard overlay/expansion. Do not rewrite unrelated global styles.

- [ ] **Step 7: Import redesign CSS last**

In `src/app/layout.tsx`:

```ts
import "./globals.css";
import "./client-revisions.css";
import "./conjugator-redesign.css";
```

This makes override precedence explicit.

- [ ] **Step 8: Verify desktop/tablet/mobile DOM behavior**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: all commands exit 0 before claiming the UI branch is technically ready.

Then verify manually at approximately:

- 1440px desktop
- 1024px tablet
- 390px mobile

Check no page-level horizontal overflow and mobile conjugation uses cards rather than the desktop wide table.

- [ ] **Step 9: Commit**

```bash
git add src/components/VerbExplorer.tsx src/app/layout.tsx src/app/conjugator-redesign.css
git commit -m "feat: compose responsive conjugator workspace"
```

---

### Task 10: UI Regression Verification and Legacy Rendering Cleanup

**Files:**
- Modify only if verified unused: `src/components/ConjugationTable.tsx`
- Modify only if verified unused: legacy CSS selectors in `src/app/globals.css` and `src/app/client-revisions.css`

**Interfaces:**
- No functional API change.

- [ ] **Step 1: Search for legacy component references**

Run:

```bash
grep -R "ConjugationTable" -n src
```

Expected after redesign: only its own file/import if still present; if there are no runtime references, remove its import and optionally delete the component in a separate commit.

- [ ] **Step 2: Do not broadly delete old CSS**

Only remove selectors proven unused by the redesigned component tree. Avoid a large unrelated CSS cleanup in this release.

- [ ] **Step 3: Run complete verification**

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Record actual command output. Do not claim success based on previous runs.

- [ ] **Step 4: Feature-deploy functional checklist**

On the Netlify feature deploy, verify:

1. Search `ազատագրել` and confirm result still comes from Supabase.
2. Search `խաղալ`, `ուտել`, `ըլլալ` and inspect irregular/suppletive behavior.
3. Switch Western/Eastern and confirm no crash/stale forms.
4. Switch EN/RU UI.
5. Verify recent history survives refresh.
6. Open/close Armenian keyboard without clearing the query.
7. Verify each normal tense tab changes the comparison rows.
8. Verify table headers contain text only: Person / Affirmative / Negative.
9. Verify Full Sentences shows the existing sentence conjugation behavior.
10. Verify right-side Translator, School, and Tip cards.
11. Verify illustrated footer remains intact.
12. Verify 390px mobile has no page-level horizontal scrolling.

- [ ] **Step 5: Commit any narrowly-scoped cleanup**

```bash
git add src
git commit -m "chore: clean up redesigned conjugator UI"
```

Skip this commit if no cleanup is needed.

---

## UI Plan Completion Gate

This plan is complete only when fresh evidence shows:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

all exit successfully, and the feature deployment has passed the manual desktop/tablet/mobile checklist. Do **not** merge to `main` yet; execute the TTS companion plan next and review the combined feature branch.
