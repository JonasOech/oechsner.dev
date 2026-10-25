# DESIGN.md — oechsner.dev, "Catalogue"

## 1. Concept

A museum or archive catalogue. Stone-white paper, charcoal ink, one muted verdigris accent used for
signal only. Every post is a catalogue **entry**: an accession number, a title, a medium (tags), a
date and dimensions (reading time), set in ruled rows. The post page opens with a **label card** of
those facts, then the text. Orderly, curatorial, restrained: structure comes from hairlines, one
heavy rule and type, never from shadows, gradients, blur or rounded cards.

Light only. There is no dark theme and no toggle.

## 2. Palette

Every colour is a variable in `src/app.css`; components never hard-code one (the figure set in
`src/lib/components/rpm/` is the exception and sits on `--plate`). Contrast is WCAG 2.x, measured
with a script (`relative luminance`), not estimated.

| Token | Hex | Role | on `--bg` | on `--surface` | on `--bg-deep` |
| --- | --- | --- | --- | --- | --- |
| `--bg` | `#f4f2ec` | page ground | | | |
| `--surface` | `#faf9f5` | label card, index card, figure plate | | | |
| `--bg-deep` | `#ebe8de` | footer, code wells | | | |
| `--text` | `#1d211f` | headings, body prose, values | 14.55 | 15.46 | 13.28 |
| `--text-secondary` | `#3a403c` | summaries, lists | 9.48 | 10.08 | 8.66 |
| `--text-muted` | `#5d635e` | meta, labels, dates (no headroom: re-measure on all three grounds) | 5.50 | 5.84 | 5.02 |
| `--accent` | `#2c6a5c` | verdigris: links, kickers, hover, active | 5.64 | 6.00 | 5.15 |
| `--accent-dim` | `#1d4d42` | pressed / hover fill | 8.56 | 9.09 | 7.81 |
| `--line` | `#d3cfc1` | hairline rows | decorative | | |
| `--line-strong` | `#a7a393` | tag outlines, label-card top rule (decorative only, 2.3:1) | | | |
| `--danger` / `--success` | `#a2382f` / `#3f6b35` | form errors, code strings | 5.97 / 5.57 | | |
| `--series-cool` | `#46698c` | second chart series | 5.13 | | |

Primary button: `--text-inverse` on `--text` (14.5:1). Selected tag: `--text-inverse` on `--accent` (5.64:1).
The accent is never a fill behind running text.

## 3. Type

Three self-hosted families (`@fontsource`, imported in `src/routes/+layout.svelte`):

- **Source Serif 4** (variable, optical size): all headings, entry titles, standfirsts, pull quotes.
- **IBM Plex Sans** 400/500/600: running text, buttons, nav prose.
- **IBM Plex Mono** 400/500: metadata labels (`ACCESSION NO.`, `DATE`, `MEDIUM`, `DIMENSIONS`), rail
  labels, nav, dates, tabular numerals, code.

Scale: labels 11px tracked uppercase; meta 12px; body 15px (prose 17px / 1.75); entry title 21px;
post title 32-46px; lead title 30-48px. Dates and numbers use tabular figures.

## 4. Grid and measure

Container 1080px, 24px gutter. Sections ("rails") open on a 2px charcoal rule with a mono label in a
200px margin column. Prose measure 66ch, justified with hyphenation above 480px, ragged below.
Post pages: outline column left (180px, sticky, heavy top rule), text centred, right track empty.

## 5. Shape, elevation, motion

- Radius 2px (`--radius`), 1px hairlines, one 2px heavy rule per section. No shadows (only the
  cookie banner has a faint paper lift).
- Motion is 150-220ms colour and underline shifts plus a short fade-in on first paint;
  `prefers-reduced-motion` disables all of it.
- Focus: 2px accent ring offset by the page ground.

## 6. Components

- **Index card** (home lead): 1px charcoal frame, mono title strip (`FEATURED ENTRY` / `NO. 2026.003`),
  title, summary, ruled fact list (date, medium, dimensions, depth), cover mounted as a plate.
- **Entry row** (`ArticleRow`): `No. | Title, summary, Medium | Date, extent | plate`, one hairline
  between rows, column header row above on desktop. On phones the number and facts share one line.
- **Label card** (post header): accession no., date, medium (tags), dimensions, depth, and the
  human-written seal when `ai: false`. Followed by the cover as "Plate." with its alt text as caption.
- **Tags**: lowercase mono, outlined, square. Pressed = filled accent.
- **Accession numbers** are derived in `src/lib/catalogue.ts` (year + running count of published
  posts, oldest first). They are decoration, not permalinks.
- Header: serif wordmark + mono descriptor left, mono nav right; solid ground, hairline below.

## 7. Home hierarchy

The largest type on the home page is always the lead post title. The author name is 16px in the
wordmark; the greeting is 20px. Newest `hero: true` post leads, then the collection list.

## 8. Covers

`static/img/<post>/cover.svg` are recoloured to this palette (paper ground, charcoal ink, verdigris
signal, slate for the second hue). Static assets, so literal hex values are allowed there. After
editing run `npm run og` and commit the SVG and PNG.

## 9. Don'ts

No dark theme or toggle; no shadows, gradients, blur or glows; no rounded cards; no accent fill behind
prose; no emoji or icon fonts; no fourth typeface.
