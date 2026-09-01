# Original Armenian Conjugation Layout Parity Design

## Goal

Rebuild the existing TUN Armenian conjugator presentation so the desktop interface follows the original ma6.free.fr tool's layout, typography, density, dialect-specific styling, and feature presentation as closely as practical, while keeping TUN ownership/branding and the current local conjugation engine/data architecture.

## Reference behavior

The approved reference is the user's four screenshots of the original Western/Eastern interface and font inspection. The rebuilt app must preserve the original composition:

1. Large dialect-colored hero band.
2. Title block on the left, branded visual in the center, EN/FR selector on the right.
3. Main white tool panel overlapping the hero/body boundary.
4. Armenian keyboard on the left, dialect/options in the middle, translated-verb counts on the right.
5. Search helper, search input, OK/Erase buttons, selected verb translation in a single compact lower row.
6. Compact grammatical metadata table directly below the main panel.
7. Affirmative/negative tabs attached to the full conjugation table.
8. Optional extra-form tables only for features exposed by the active dialect.
9. Minimal centered footer area.

## TUN branding boundary

The layout and interaction model should visually mirror the original tool, but original proprietary artwork and original developer contact details must not be copied. Use the supplied TUN logo inside a same-position decorative center card and in the footer. Keep the app clearly client-owned.

## Typography

Reference the same font families identified in the user's inspection screenshot:

- Display/title: `Fraunces`, weight 600.
- General UI: `Inter`, weights 400, 600 and 700.
- Armenian forms: `Noto Serif Armenian`, weight 400/600.

Fonts are referenced from Google Fonts with robust local/system fallbacks; no font binaries are bundled.

## Dialect-specific theme

### Western Armenian

- Hero/table accent: deep navy similar to the original Western screenshot.
- Visible options: Transcription, Continuous form, Mediative form.
- Hidden option: Probable future.
- Metadata includes the Western-only `Particule` and `Mediative.P` columns.
- Extra forms may show Continuous and Mediative sections when enabled.

### Eastern Armenian

- Hero/table accent: burgundy/red similar to the original Eastern screenshot.
- Visible options: Transcription, Probable future.
- Hidden options: Continuous form, Mediative form.
- Metadata omits `Particule` and `Mediative.P` so the table matches the narrower original Eastern layout.
- Extra forms may show Probable future when enabled.

Switching dialect changes theme, visible controls, metadata fields, query/selected dialect data, and displayed conjugation forms without a page reload.

## Search behavior

Keep tolerant multilingual search internally, but remove the large autocomplete dropdown from the main visual flow so the page matches the original. Search runs on OK/Enter. The helper text is dialect-aware and language-aware. Erase clears and refocuses the input.

## Tables

Desktop keeps real tables with original-like compact row heights, warm beige borders, serif Armenian text, blue italic transcription, and a horizontally scrollable fallback only when the viewport is too narrow.

Mobile/tablet may adapt into scrollable tables/cards as needed for usability, but desktop parity takes priority.

## Public UI cleanup

Remove the visible developer/starter-corpus notice and the current TUN landing-page header/hero treatment. Keep corpus counts derived from included data. Do not hard-code the original site's 562/564/597/608 totals unless those records actually exist.

## Accessibility

Preserve semantic buttons, tabs, labels, keyboard focus styles, `aria-pressed`, `aria-selected`, and table headers. Theme colors must keep readable contrast.

## Verification

- Unit tests for dialect-specific option visibility.
- Unit tests for dialect-specific metadata columns.
- Core smoke tests for switching and option behavior.
- TypeScript typecheck.
- Source-level verification for required fonts/classes.
- Production Next.js build when npm dependencies can be installed.
