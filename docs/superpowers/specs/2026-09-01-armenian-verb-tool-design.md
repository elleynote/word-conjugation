# Armenian Verb Conjugation Tool — Design Specification

Date: 2026-09-01
Status: Approved design, ready for implementation planning after review

## 1. Product Goal

Build a fully independent, modern Armenian verb-conjugation web application inspired by the useful functionality of the legacy ma6.free.fr tool, without depending on its hosting, source code, or proprietary database.

The product will be free to end users and must be easy to deploy on a standalone domain or subdomain. Branding must be configurable so client fonts, colors, logo, and product name can be replaced without changing application logic.

## 2. Primary User Experience

Users can:

- Search Armenian verbs by English, French, Armenian script, or transliteration.
- Switch between Western Armenian and Eastern Armenian.
- View core verb metadata such as root, group/class, regularity, and participles.
- View affirmative and negative conjugations.
- View major tense groups including present, imperfect, preterite, present perfect, pluperfect, future, conditional, and imperative.
- Toggle transliteration on or off.
- Enter Armenian characters using an on-screen Armenian keyboard.
- Use the application comfortably on desktop, tablet, and mobile.

## 3. Scope for V1

Included:

1. Public landing/search interface.
2. Search autocomplete and normalized matching.
3. Western Armenian mode.
4. Eastern Armenian mode.
5. Deterministic conjugation engine.
6. Regular verb rules.
7. Irregular-form override system.
8. Affirmative forms.
9. Negative forms.
10. Armenian keyboard.
11. Transliteration display.
12. Verb metadata panel.
13. Responsive result cards/tables.
14. Local bundled seed dataset.
15. Supabase/PostgreSQL-ready schema.
16. Import-friendly seed format.
17. Theme/branding configuration.
18. README and setup instructions.
19. .env.example.
20. Basic unit tests for search normalization and conjugation helpers.
21. Netlify deployment instructions.

Not included in V1:

- User accounts.
- Paid plans or checkout.
- AI-generated conjugations.
- Saved favorites.
- Full administrative CMS UI.
- Automated scraping of the original ma6.free.fr database.

## 4. Technical Architecture

### Frontend

- Next.js App Router
- TypeScript
- React
- Tailwind CSS

### Data

The ZIP will run immediately from bundled TypeScript/JSON seed data.

A Supabase/PostgreSQL schema will also be included so the same logical model can later be moved to a hosted database without rewriting the frontend.

### Hosting

- Netlify-compatible Next.js deployment
- GitHub-friendly project structure

## 5. Application Structure

Planned high-level structure:

```text
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    SearchBar.tsx
    DialectToggle.tsx
    ArmenianKeyboard.tsx
    VerbSummary.tsx
    ConjugationTabs.tsx
    ConjugationTable.tsx
    TransliterationToggle.tsx
    EmptyState.tsx
  config/
    brand.ts
  data/
    verbs.ts
  lib/
    search/
    conjugation/
    transliteration/
  types/
    verb.ts
supabase/
  migrations/
  seed.sql
scripts/
  import-verbs.ts
public/
```

## 6. Data Model

### Verb

Each canonical verb record contains:

- id
- english translations
- french translations
- aliases
- search keywords

### Dialect-specific record

Each verb can have Western and/or Eastern Armenian data:

- lemma
- dialect
- conjugation group/class
- root/stem
- regular/irregular flag
- participles
- imperative stem where needed
- negative-form metadata where needed
- transliteration

### Irregular override

Irregular forms are stored as sparse overrides rather than duplicating all generated conjugations.

Conceptually:

```text
verb_id
 dialect
 polarity
 tense
 person
 value
 transliteration
```

## 7. Conjugation Engine

The engine will be deterministic.

Processing flow:

```text
selected verb
  -> selected dialect
  -> dialect rules
  -> tense rules
  -> person endings
  -> polarity rules
  -> irregular override lookup
  -> transliteration
  -> result model
```

The engine must keep Western and Eastern rules isolated so future linguistic corrections can be made without cross-dialect regressions.

## 8. Search Behavior

Search input will normalize:

- case
- surrounding whitespace
- optional leading English "to "
- punctuation differences
- Armenian Unicode normalization where practical

Matching priority:

1. exact lemma
2. exact translation
3. alias
4. transliteration
5. prefix match
6. substring match

Autocomplete should remain lightweight and work entirely client-side for the bundled dataset.

## 9. Armenian Keyboard

The on-screen keyboard will:

- insert characters at the current cursor position
- support Armenian uppercase/lowercase display where practical
- be collapsible on small screens
- not replace the user's physical keyboard

## 10. Result Layout

Desktop:

- Search and mode controls at top
- Verb metadata summary
- Affirmative / Negative switch
- Conjugation tense navigation
- Wide but readable person-by-tense layout where appropriate

Mobile:

- Each tense displayed as a card
- Person rows stacked vertically
- No forced horizontal scrolling for core conjugation data

## 11. Branding System

A single config module will expose:

- app name
- logo path
- primary font
- secondary font
- primary color
- secondary color
- surface/background colors
- optional domain-specific metadata

This keeps client branding separate from application logic.

## 12. Local Dataset Strategy

The starter ZIP will include a working seed dataset sufficient to demonstrate the complete search and conjugation flow across regular and irregular verbs in both dialect modes.

The project will also include:

- documented data format
- SQL schema
- seed script
- import script scaffold

The project will not claim to include the original proprietary ma6.free.fr database unless that data is legally supplied or independently verified for reuse.

## 13. Error Handling

Expected user-facing cases:

- no search results
- verb exists only in one dialect
- conjugation unavailable for a specific tense
- incomplete irregular override

The UI should fail gracefully with plain-language messages rather than broken tables.

## 14. Testing

Minimum automated coverage:

- English query normalization ("read" vs "to read")
- case-insensitive search
- transliteration lookup
- dialect selection
- regular conjugation helper outputs
- irregular override precedence
- negative-mode output routing

Manual verification checklist:

- desktop responsive layout
- mobile responsive layout
- Armenian keyboard insertion
- dialect switching
- affirmative/negative switching
- transliteration toggle
- no console-breaking errors on missing forms

## 15. Deployment

The README will document:

1. npm install
2. npm run dev
3. npm run build
4. environment variables
5. Netlify deployment
6. optional Supabase setup
7. how to replace branding
8. how to add/import verb records

## 16. Security and Privacy

V1 stores no personal user data and requires no authentication.

If Supabase is enabled later, public read-only access should be limited to the verb dataset. Any future write/admin features must use authenticated RLS-protected paths.

## 17. Success Criteria

The project is successful when:

- the ZIP installs and runs as a complete Next.js application
- users can search the bundled dataset
- users can switch Western/Eastern Armenian
- conjugations render deterministically
- affirmative and negative modes work
- transliteration can be toggled
- Armenian keyboard works
- the UI is responsive
- branding can be changed centrally
- database schema and import path are included
- documentation is sufficient for deployment without the original website

## 18. Future Extensions

Potential later additions:

- full client-owned verified verb corpus
- grammar explanations/tooltips
- example sentences
- favorites
- admin editor
- CSV import/export
- public API
- embeddable widget
- usage analytics
- pronunciation audio

