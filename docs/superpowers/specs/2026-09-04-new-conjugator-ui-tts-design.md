# New Conjugator UI + Text-to-Speech Design

Date: 2026-09-04
Branch: `feature/new-conjugator-ui-tts`

## Goal

Redesign the current Armenian conjugation interface to match the approved client reference while preserving the existing Supabase search, Western Armenian source data, dialect handling, transliteration, Russian/English interface support, conjugation engine, sentence-conjugation logic, and footer.

The redesign also adds text-to-speech for Armenian, English, and Russian content. The client explicitly requested that listening/speaker controls be removed from table headers.

## Scope

### In scope

- Replace the current top-heavy layout with a three-column desktop workspace.
- Add a left sidebar for search, selected verb details, dialect selection, recent verbs, and access to the Armenian keyboard.
- Add a centered verb-summary header card.
- Replace the current all-tenses table with tense tabs.
- For a selected tense, show a compact `Person / Affirmative / Negative` layout.
- Remove any speaker/listening control from the `Affirmative` and `Negative` table headers.
- Keep speaker buttons beside actual speakable content only.
- Convert the existing simple/full-sentence conjugation feature into a `Full Sentences` tab.
- Add a right sidebar with TUN Translator, TUN Online Armenian School, and a contextual Tip card.
- Add recent-verb history using `localStorage`.
- Preserve the existing Armenian keyboard but move it behind an optional expand/collapse control so it no longer dominates the desktop layout.
- Add server-side text-to-speech for Armenian, English, and Russian content.
- Keep the recently added illustrated TUN footer.
- Make the layout responsive across desktop, tablet, and mobile.

### Out of scope

- Rewriting the conjugation grammar engine.
- Changing the 3,257-verb Supabase Western Armenian source architecture.
- Fabricating a complete Eastern Armenian corpus.
- Fabricating Russian translations for verbs that do not yet have verified Russian data.
- Replacing existing source-backed Western forms with AI-generated conjugations.
- Automatically merging the feature branch to `main` before visual and functional review.

## Existing Architecture to Preserve

The current application already has these useful boundaries:

- `VerbExplorer` owns main client state, search, dialect switching, selected verb state, and result generation.
- `/api/verbs/search` resolves verified Supabase/local data and optional AI fallback.
- `ConjugationTable` renders the current result object.
- `SentenceConjugation` renders full-sentence conjugations.
- `PromoPanels` owns the TUN Translator and School links.
- `Footer` owns the illustrated TUN footer.

The redesign should reuse the same data and grammar outputs instead of introducing a parallel conjugation system.

## Desktop Layout

Desktop width target: `>= 1200px`.

```text
┌────────────────┬─────────────────────────────────────┬──────────────────┐
│ Left sidebar   │ Main content                        │ Right sidebar    │
│                │                                     │                  │
│ Search         │ Verb summary                        │ More Armenian    │
│ Selected verb  │ Tense tabs                          │ Tools            │
│ Dialect        │ Person / Affirmative / Negative     │ TUN School       │
│ Recent verbs   │ or Full Sentences                   │ Tip              │
│ Keyboard       │                                     │                  │
└────────────────┴─────────────────────────────────────┴──────────────────┘
```

Recommended proportions:

- left: approximately 250-290px
- main: flexible, dominant column
- right: approximately 250-280px

The page should feel like an application workspace rather than a large marketing hero.

## Left Sidebar

### Search

The top of the sidebar contains:

- label: `Search for a verb`
- search input
- clear button
- helper text indicating Armenian / English / Russian search according to available data
- optional keyboard toggle

Existing Supabase search behavior remains unchanged.

### Selected verb card

After a verb is selected, show:

- Armenian lemma
- transliteration
- primary English meaning
- optional Russian meaning if present
- classification badge such as `Regular Verb - E-Class`

Do not invent missing fields.

### Dialect selector

Preserve Western / Eastern selection.

Changing dialect should continue to use the current dialect-switch behavior and must not reset unrelated app state unnecessarily.

### Recently viewed

Store up to 5 recently selected verbs in `localStorage`.

Each item stores only enough information to re-run or restore the search safely, for example:

- verb id when available
- lemma
- dialect
- display label

Behavior:

- newest first
- no duplicates
- clicking an item reloads that verb
- history is local to the browser
- no account or Supabase write is required

### Armenian keyboard

Keep the existing keyboard component.

New behavior:

- hidden/collapsed by default in the redesign
- opened from a keyboard button near the search field
- closes without clearing the query
- remains usable on desktop and mobile

## Main Verb Summary

The main summary card should visually follow the reference design.

Display:

- prominent Armenian lemma or Armenian initial in a circular mark
- transliteration / readable learner form
- primary English meaning
- speaker control beside speakable text
- dialect
- conjugation class/group
- regular / irregular / suppletive status
- transitivity when available

If a field is unavailable for a local/Eastern record, display an em dash or omit the row rather than inventing metadata.

## Tense Navigation

Replace the current all-tenses-at-once desktop table with these tabs:

- Present
- Imperfect
- Simple Past
- Future
- Conditional
- Present Perfect
- Past Perfect
- Full Sentences

Internally, map these labels to the existing tense keys. Preserve the existing grammar result model rather than changing tense generation.

Tabs should be horizontally scrollable on smaller screens rather than wrapping into an unusable grid.

## Conjugation Table

When a normal tense tab is selected, render exactly three conceptual columns:

- Person
- Affirmative
- Negative

Each person row contains:

### Person

- localized English/Russian person label where relevant

### Affirmative cell

- Armenian form
- transliteration when enabled
- English or Russian meaning line where available/appropriate
- speaker control beside actual content

### Negative cell

- Armenian negative form
- transliteration when enabled
- English or Russian meaning line where available/appropriate
- speaker control beside actual content

### Explicit audio rule

There must be **no speaker/listening icon in the `Affirmative` or `Negative` table headers**.

Speaker controls belong only next to text that will actually be spoken.

## Full Sentences Tab

The existing `SentenceConjugation` functionality becomes the `Full Sentences` view inside the main content area.

It should reuse the current sentence-generation logic and preserve:

- all six persons
- Armenian sentence
- learner transliteration
- English sentence
- Russian sentence only when reliable Russian data exists
- affirmative and negative support
- tense selection as needed inside the sentence view, if not fully represented by the top-level active tab

Preferred UX:

- entering `Full Sentences` keeps the last sentence tense where practical
- sentence cards show speaker buttons beside Armenian, English, and Russian lines individually
- mobile cards remain readable without horizontal scrolling

## Right Sidebar

### More Armenian Tools

TUN Translator card:

- title
- short description
- optional small feature list
- link to the existing translator URL

### TUN Online Armenian School

- title
- short description
- CTA to the existing school URL

### Tip card

Default tip:

`Use the Full Sentences tab to see conjugations in everyday sentences.`

The tip can later become contextual, but dynamic tip logic is not required for the first implementation.

## Text-to-Speech Architecture

### Why server-side TTS

Do not rely solely on browser `speechSynthesis` because available voices and Armenian support vary across browsers and operating systems.

Use a server-side speech endpoint so behavior is consistent and the API key remains private.

### Endpoint

Add:

`POST /api/speech`

Input shape:

```json
{
  "text": "կը սիրեմ",
  "language": "hy",
  "dialect": "western"
}
```

For English/Russian, dialect may be omitted.

### Model

Use OpenAI text-to-speech through the Audio Speech API, defaulting to `gpt-4o-mini-tts` unless an environment override is configured.

Suggested env values:

- `OPENAI_API_KEY`
- `OPENAI_TTS_MODEL=gpt-4o-mini-tts`
- optional `OPENAI_TTS_VOICE`

The API key must remain server-only.

### Dialect handling

For Armenian speech requests:

- Western selection sends Western Armenian pronunciation guidance in the model instructions.
- Eastern selection sends Eastern Armenian pronunciation guidance.

This is best-effort TTS pronunciation guidance, not a claim that generic synthesis is a verified linguistic authority. Armenian pronunciation must be client-QA tested before production sign-off.

### Supported speakable content

Speaker buttons may be provided for:

- main Armenian lemma
- Armenian conjugated forms
- Armenian negative forms
- Armenian full sentences
- English meanings/sentences
- Russian meanings/sentences when Russian text exists

Do not add speaker controls where there is no text to speak.

### Reusable client component

Create a reusable `SpeakButton` responsible for:

- idle state
- loading state
- playing state
- stop/replay behavior
- disabled state for empty text
- accessible label
- client-side audio cleanup
- reporting a non-blocking error if speech generation fails

Suggested interface:

```tsx
<SpeakButton
  text="կը սիրեմ"
  language="hy"
  dialect="western"
/>
```

### Audio behavior

- generate audio only on click
- do not preload every row
- stop the previous clip when another speaker button starts
- avoid duplicate simultaneous playback
- cache the active clip in memory where practical during the current page session
- do not persist generated audio in Supabase in the initial implementation

## Language Behavior

### English UI

Keep existing English interface copy.

### Russian UI

Keep existing Russian interface support.

Russian verb meaning/audio appears only where actual Russian translation data exists. Do not fabricate Russian content for the 3,257 Western source records that currently have no Russian translation.

## Responsive Behavior

### Desktop >= 1200px

Three columns: left / main / right.

### Tablet 768-1199px

Recommended order:

1. search/sidebar controls
2. main verb/conjugation area
3. promo cards in a two-column row where space allows
4. footer

### Mobile < 768px

Single column.

Recommended order:

1. search
2. selected verb card
3. dialect selector
4. recent items / keyboard controls
5. main verb summary
6. horizontally scrollable tense tabs
7. active tense cards
8. right-sidebar promos
9. footer

On mobile, do not force the desktop table into horizontal scrolling. Render person rows as stacked cards or two clearly separated Affirmative/Negative blocks.

## State Model

Add only presentation state needed for the redesign:

- `activeView` or `activeTense`
- recent-verb history
- keyboard expanded/collapsed
- speech playback state inside the audio helper/component

Do not duplicate selected verb, dialect, language, or conjugation data in multiple state stores.

## Error Handling

### Search

Preserve current loading, not-found, verified, and AI-unverified behavior.

### TTS

If speech generation fails:

- keep the conjugation visible
- return the button to idle/error state
- show a small accessible non-blocking message or tooltip
- do not break the table

Server endpoint should validate:

- non-empty text
- allowed language values
- maximum text length
- valid dialect when Armenian is requested

### Missing Russian content

Hide or omit the Russian audio/meaning line when no Russian text exists.

## Accessibility

- All speaker buttons need descriptive `aria-label`s.
- Tense tabs use proper tab semantics or equivalent keyboard-accessible buttons.
- Active state must not rely on color alone.
- Recent-history buttons must be keyboard accessible.
- Keyboard expansion control uses `aria-expanded`.
- Loading audio state must be exposed accessibly.
- Keep sufficient contrast in the white/blue/red reference style.

## Testing Strategy

### Unit tests

Add focused tests for:

- tense/view mapping
- recent-history deduplication and max length
- speech request validation
- language/dialect speech instruction builder
- any extraction helper used to build affirmative + negative row content

### Component-level tests where practical

Verify:

- no audio button is rendered in table headers
- audio buttons appear beside speakable rows
- `Full Sentences` switches to sentence content
- missing Russian text does not render a Russian speaker button

### Integration verification

Verify against live/feature deploy:

- Supabase verb search still returns source-backed verbs
- Western/Eastern switching still works
- tense tabs show correct forms
- affirmative and negative columns use existing engine output
- Full Sentences preserves the previously implemented sentence behavior
- recent history survives refresh
- Armenian keyboard can expand/collapse
- TTS requests are server-side and API key is not exposed
- desktop/tablet/mobile layouts match the approved visual direction
- footer still renders correctly

### TTS QA

Client review is required for Western vs Eastern Armenian pronunciation. TTS correctness cannot be signed off solely from build/tests.

## Implementation Order

1. Layout shell and responsive three-column structure.
2. New left sidebar and verb summary.
3. Tense tabs and new affirmative/negative presentation.
4. Full Sentences tab using existing sentence component/logic.
5. Right-sidebar promo redesign.
6. Recently viewed history and collapsible keyboard.
7. Server-side TTS endpoint and reusable speaker component.
8. Add audio controls to all approved speakable content.
9. Responsive/mobile polish.
10. Tests, build/typecheck/lint, feature-deploy visual QA.

## Release Strategy

All implementation remains on `feature/new-conjugator-ui-tts` until reviewed.

Do not merge to `main` until:

- functional checks pass
- desktop and mobile visual QA are acceptable
- Supabase search remains intact
- TTS is tested with production-like environment configuration
- Armenian pronunciation is reviewed sufficiently for the client to approve

Only then merge to `main` so Netlify production deploys automatically.
