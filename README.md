# TUN Armenian Conjugation

A client-owned Armenian verb conjugation application for Western and Eastern Armenian. The public interface follows the layout and typography of the original `ma6.free.fr` conjugator while using TUN identity and a fully independent code/data architecture.

## Run it in VS Code

1. Extract the ZIP.
2. Open the extracted project folder in VS Code.
3. Open the VS Code terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open `http://localhost:3000`.

No `.env` file is required for the bundled local version.

## Original-layout parity

The desktop UI has been rebuilt around the original tool's structure:

- dialect-colored hero band
- Armenian title/subtitle on the left
- TUN-branded decorative panel in the original artwork position
- EN/FR switch on the right
- large white conjugation panel overlapping the hero
- Armenian mini keyboard on the left
- dialect/options controls in the middle
- translated-verb counters on the right
- compact search/help row
- one-row grammatical metadata table
- attached Affirmative/Negative tabs
- full eight-tense conjugation table
- minimal footer

The original developer's artwork/contact details are not bundled. The supplied TUN logo is used instead.

## Typography

The interface references the font families identified from the original tool:

- `Fraunces` 600 for the large title and display serif text
- `Inter` 400/600/700 for controls and interface text
- `Noto Serif Armenian` 400/600 for Armenian script

They are referenced through Google Fonts with system fallbacks; font files are not bundled in the project.

## Dialect-specific presentation

### Western Armenian

- deep navy theme
- Transcription
- Continuous form
- Mediative form
- 12-column metadata row including `Particule` and `Mediative.P`

When the optional Western switches are enabled, their stored forms are applied inside the main conjugation table rather than displayed as separate cards.

### Eastern Armenian

- burgundy/red theme
- Transcription
- Probable future
- 10-column metadata row matching the narrower original Eastern layout

When Probable future is enabled, stored probable-future forms are used in the main Future column.

## Included conjugator features

- Western Armenian and Eastern Armenian modes
- English and French interface switch
- search by Armenian, English, French, or phonetic/transliterated Armenian
- English infinitive normalization (`write` and `to write` both work)
- full on-screen Armenian keyboard
- Transcription toggle
- Probable Future toggle where applicable
- Continuous Form toggle where applicable
- Mediative Form toggle where applicable
- `Ab`, `ab`, and `AB` display modes
- translated-verb counters calculated from the actual bundled corpus
- legacy grammatical metadata fields
- Affirmative and Negative conjugation tabs
- Present, Imperfect, Preterite, Imperative, Present Perfect, Pluperfect, Future, and Conditional
- horizontally scrollable tables on smaller screens so the original comparison layout remains usable

## TUN branding

Brand and layout values are centralized in:

```text
src/config/brand.ts
src/app/globals.css
```

The bundled TUN logo is:

```text
public/tun-logo.png
```

Replace that PNG with another approved TUN logo asset at the same path if needed; no component edits are required.

## Starter corpus and linguistic review

The bundled corpus is a **starter corpus**, not a copy of the original site's private database. It proves the application workflow and contains regular/irregular examples. A qualified Armenian linguist should verify and expand the dataset before a large public launch.

The public interface does not show a developer/starter-corpus notice.

## Project architecture

```text
src/
  app/                 Next.js page, layout and original-style global CSS
  components/          UI controls, keyboard, metadata and conjugation results
  config/              TUN brand configuration
  data/                Bundled starter verb corpus
  lib/
    conjugation/        Deterministic conjugation rules
    corpus/             Live corpus counters
    i18n/               EN/FR interface text
    keyboard/           Caret insert/backspace helpers
    metadata/           Dialect-specific legacy metadata mapping
    options/            Legacy option application logic
    presentation/       Dialect UI policy and text formatting
    search/             Multilingual search/ranking
    transliteration/    Local Armenian transliteration
  types/                Shared domain model
data/                   JSON import example
scripts/                Corpus import and smoke-check helpers
supabase/               Optional PostgreSQL schema/seed
```

## Production verification

After dependencies are installed:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Dependency-free checks used by this project are also available through `tsconfig.core.json` and the smoke scripts in `scripts/`.

## Add or edit verbs directly

Edit:

```text
src/data/verbs.ts
```

Each dialect record can include:

```text
base
particule
pastParticiple
mediativeParticiple
negativeParticiple
imperfectNonPersonal
subjectParticiple
futureParticiple
probableFuture
continuousForms
mediativeForms
```

The final three are person-keyed objects used by the original-style option switches.

## Import a JSON corpus

Use the structure in:

```text
data/verbs.example.json
```

Run:

```bash
node scripts/import-verbs.mjs data/verbs.example.json src/data/generated-verbs.ts
```

The importer validates the core record structure and optional person-form maps before generating a typed TypeScript file.

## Optional Supabase database

Supabase is not required to run the ZIP. The included assets let you move the corpus to PostgreSQL later:

```text
supabase/migrations/202609010001_create_verb_schema.sql
supabase/seed.sql
```

## Netlify

The project remains Netlify-ready. Push it to GitHub, connect the repository in Netlify, and use the included `netlify.toml`.

## Data ownership boundary

This rebuild reproduces the legacy tool's functionality and information architecture while remaining independent. Import only client-owned, public-domain, or appropriately licensed linguistic data for production use.
