# TUN Armenian Conjugation Full-Feature Rebuild Design

## Goal
Rebuild the existing Armenian Verb Studio project into a client-owned TUN-branded Armenian conjugation tool that preserves the original `ma6.free.fr` tool's complete user-facing feature set while modernizing the interface for desktop, tablet, and mobile.

## Product Direction
The application must feel like a native TUN product rather than a visual clone of the legacy site. It will use the supplied black TUN logo, white-first layouts, near-black text, TUN coral/red primary accents, bright blue secondary accents, soft gray surfaces, rounded controls, and generous spacing inspired by `tunapp.com`.

The legacy tool remains the functionality reference. The TUN website remains the branding reference.

## Supported Features

### Language and dialect controls
- Western Armenian mode.
- Eastern Armenian mode.
- English interface.
- French interface.
- Search by Armenian script, English, French, or transliteration/phonetic Armenian.
- Tolerant search for English infinitives with or without `to`.

### Legacy display options
- Transcription toggle.
- Probable Future toggle.
- Continuous Form toggle.
- Mediative Form toggle.
- Text display mode selector with `Ab`, `ab`, and `AB` modes.
- Translated-verb counters generated from the bundled corpus rather than hard-coded legacy counts.

### Armenian keyboard
- Full on-screen Armenian keyboard.
- Insert at current caret position.
- Backspace.
- Clear/erase action.
- Responsive wrapping on small screens.

### Search experience
- Search input with autocomplete suggestions.
- `OK`/submit action.
- `Erase` action.
- Selected result label showing Armenian lemma and localized translation.
- Empty-state feedback when no matching verb exists.

### Verb metadata
The result area must expose the legacy metadata fields in a structured table/card representation:
- Name
- Base
- Group
- Irregular
- Root
- Particule
- Past.P
- Mediative.P
- Negative.P
- Imperfect.NP
- Subject.P
- Future.P

Desktop uses one comparison row similar to the legacy information density. Mobile turns the fields into compact responsive cards.

### Conjugation results
- Affirmative conjugation tab.
- Negative conjugation tab.
- Pronouns for all six persons.
- Present.
- Imperfect.
- Preterite.
- Imperative.
- Present Perfect.
- Pluperfect.
- Future.
- Conditional.
- Additional probable-future, continuous, and mediative output is shown when the corresponding legacy options are enabled and source data/rules support it.
- Transcription lines are hidden when transcription is disabled.

Desktop prioritizes a comparison table so the six persons can be scanned across tenses. Mobile transforms each tense into a card to avoid unusable horizontal scrolling.

## Data Model
Extend `DialectVerbData` so each dialect can carry the legacy grammatical metadata and optional derived forms:
- `base`
- `particule`
- `pastParticiple`
- `mediativeParticiple`
- `negativeParticiple`
- `imperfectNonPersonal`
- `subjectParticiple`
- `futureParticiple`
- optional `probableFuture`
- optional `continuousForms`
- optional `mediativeForms`

Existing fields such as lemma, transliteration, group, root, verb class, irregular flag, imperative, and irregular overrides remain supported.

The starter corpus remains bundled in TypeScript so the ZIP runs immediately. Supabase schema and JSON import examples are updated to understand the expanded fields.

## Conjugation Engine
The engine remains deterministic. It must not call an AI model at runtime.

Core behavior:
1. Resolve selected dialect record.
2. Apply explicit irregular override when available.
3. Fall back to dialect/class rule generation.
4. Generate transcription locally from Armenian script.
5. Respect polarity and display-option state in the presentation layer.

Legacy-specific forms that are not safely derivable from current generic rules are represented as optional dataset fields rather than fabricated.

## Branding

### Logo
Use the client-supplied asset URL as the design source:
`https://tunapp.com/wp-content/uploads/2020/09/Tun-Logo_Web-Black_80.png`

A local copy is bundled in `/public` so the application does not depend on the WordPress asset URL at runtime.

### Visual tokens
- Primary coral/red: approximately `#EF344C` based on the supplied TUN homepage screenshot.
- Secondary blue: approximately `#159BD7`.
- Ink: near-black/navy.
- Background: white.
- Secondary surface: very light neutral gray.
- Borders: low-contrast neutral gray.
- Buttons: rounded/pill treatment consistent with TUN's site.
- Typography: clean sans-serif for interface copy with an Armenian-capable font fallback for Armenian text.

Colors and logo path stay centralized in the brand configuration/CSS variables so they can be adjusted without touching feature code.

## Page Structure
1. Compact TUN header with local TUN logo and short product label.
2. Intro/hero area: `Armenian Verb Conjugator` with a concise Eastern/Western description.
3. Primary tool card containing keyboard, dialect, language, and display options.
4. Search instruction strip and search row.
5. Verb metadata result.
6. Affirmative/negative conjugation area.
7. Minimal TUN-style footer.

No unrelated TUN marketing sections, donation sections, product grids, or WordPress navigation are copied into this standalone tool.

## Responsive Behavior
- Large desktop: legacy-like dense comparison table with modern styling.
- Tablet: controls wrap cleanly and metadata remains readable.
- Mobile: keyboard uses smaller responsive keys, controls stack, metadata becomes cards, tense results become individual cards, and all buttons remain touch-friendly.
- No required horizontal page scrolling.

## Accessibility
- Buttons use semantic button elements.
- Inputs have associated accessible labels.
- Toggle state uses `aria-pressed` or native checkbox semantics.
- Active tabs expose selected state.
- Keyboard actions have descriptive labels.
- Color is not the only indicator of state.

## Testing
Add or extend automated tests for:
- Search in English, French, Armenian, and transliteration.
- Dialect filtering.
- Irregular overrides.
- Affirmative vs negative conjugation.
- Metadata mapping.
- Transcription visibility model.
- Legacy option state and optional extra-form extraction.
- Keyboard insertion/backspace behavior.

Run the complete test suite, TypeScript checks, lint, and production build before packaging when dependencies are available.

## Packaging and Deployment
The final deliverable is a complete ZIP that can be extracted and opened in VS Code.

Local run:
```bash
npm install
npm run dev
```

The project remains Netlify-ready and GitHub-ready. Supabase is optional for the starter version; the bundled corpus is enough to run the tool immediately.

## Data Ownership Boundary
The rebuild reproduces the legacy tool's functionality and information architecture. It does not claim ownership of or silently redistribute a proprietary source database. The included records are a starter/verified corpus and the import/database architecture supports expansion with client-owned or appropriately licensed linguistic data.
