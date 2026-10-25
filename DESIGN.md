# DESIGN.md — Swiss on paper

The design contract for oechsner.dev. `src/app.css` is its implementation and holds every
CSS variable in the project.

**One-line tone**: *The Swiss grid, softened: a calm, architectural page printed on warm
paper.*

## 1. Concept

A very slightly warm off-white ground, near-black ink, and **one** muted ink-blue accent.
Structure comes from a twelve-column grid, hairline rules and tabular numerals, never from
shadows, fills, gradients, blur or rounded cards. One neo-grotesque family does all the
talking. Scale contrast is modest: the largest type on the site is 44px.

There is one theme and it is light. Do not add a dark mode or a toggle.

## 2. Palette

All colours are tokens in `src/app.css`. Ratios are WCAG 2.x, measured with a script
against the paper (`--bg`) and the second paper step (`--surface`).

| Token | Hex | On `--bg` | On `--surface` | Role |
| --- | --- | --- | --- | --- |
| `--bg` | `#f4f1ea` | — | — | Paper |
| `--surface` | `#ebe7de` | — | — | Code, inputs, widget sheets |
| `--bg-deep` | `#e3ded2` | — | — | Rarely used third step |
| `--plate` | `#fbfaf6` | — | — | Lighter sheet under figures |
| `--text` | `#17160f` | 16.1 | 14.7 | Ink: body, titles |
| `--text-secondary` | `#3b3932` | 10.2 | 9.4 | Standfirsts, supporting copy |
| `--text-muted` | `#64615a` | 5.5 | 5.0 | Meta only; little headroom, re-measure on change |
| `--accent` | `#243f8f` | 8.5 | 7.8 | Signal: links, numerals, kickers, hover |
| `--accent-dim` | `#182c6c` | 11.5 | 10.5 | Pressed and hover-deepened accent |
| `--line` | `#d6d1c5` | 1.35 | 1.2 | Decorative hairlines |
| `--line-strong` | `#8a8679` | 3.2 | 2.95 | Tag outlines, form borders (>= 3:1 on paper) |
| `--danger` | `#a32a2a` | 6.4 | 5.8 | Invalid fields |
| `--success` | `#2b6a38` | 5.8 | 5.3 | Code strings |
| `--series-cool` | `#9c3e27` | 5.9 | 5.4 | Second series in figures only (vermilion) |

The accent is never a fill behind running text. Buttons are the one place it may fill, and
only on hover and press. `src/lib/components/rpm/` hard-codes nothing of its own; it reads
tokens through the aliases at the bottom of `app.css`.

## 3. Type

| Role | Family | Notes |
| --- | --- | --- |
| Everything | Schibsted Grotesk Variable | Self-hosted, `@fontsource-variable`, weights 400–600 in use |
| Code | JetBrains Mono | Self-hosted, `@fontsource`, 400 and 500 |

`--font-display` is an alias of `--font-sans`; there is no second family.

Scale: 11 (labels, tracked caps) / 12–13 (meta) / 14 (nav, UI) / 16 (body) / 17 (prose) /
19 (standfirst) / 24 (h2) / 32–40 (post title) / up to 44 (lead title). Titles are weight
600 with -0.02em tracking. Labels are 11–12px, 600, uppercase, +0.1em. Dates, indices and
table figures use `tabular-nums`.

## 4. Grid

Twelve columns, 24px gutters, inside a 72rem container with 24px side padding (20px
below 768px). Utilities: `.grid`, `.container`, `.rail`.

- **Columns 1–3** are the margin: rail labels, left-hung metadata, the post's facts and
  outline, the footer name.
- **Columns 4–12** are the content. Prose is capped at 68ch from column 4; rails at 62ch.
- Below 768px the grid collapses to one column and labels sit above their content.
- **Rail**: a section opens on a 1px ink rule, with an accent index numeral (CSS counter,
  `01`, `02`, …) and a tracked label hung in the margin. The label is sticky on desktop.
- **Hairlines**: ink for the start of a section, `--line` between rows. One heavy rule
  exists: the 2px ink rule across the top of the header.

## 5. Shape and surface

Radius is 0–2px. No shadows (the `--shadow-*` tokens are all `none`), no gradients, no
blur. Hover and focus are never expressed as lift. Figures sit on `--surface` sheets with
an ink top rule.

## 6. Components

- **Header**: name hung in column 1–3, numbered links from column 4, solid paper with a
  hairline that appears after scroll. Below 35em the last three links fold into a ruled
  "More" sheet.
- **Footer**: closes on an ink rule; name in the margin, links, legal row, colophon.
- **ArticleRow**: facts (ISO date, read time, depth) in columns 1–3, title and summary in
  4–10, a 2-column thumbnail. The whole row is the link; the title takes the accent and an
  underline on hover.
- **Buttons**: square, 1px ink border; primary is an ink fill, secondary is outlined and
  inverts on hover. 44px minimum height.
- **Tags**: outlined uppercase labels; filters invert to ink when pressed.
- **Links**: accent with a 1px underline that firms up on hover.
- **Entries** (about, projects): period hung left, substance right.
- **Post**: margin column with back link, ruled facts list, human-written mark and sticky
  outline; the article from column 4. Below 900px the facts become a compact run above the
  title.

## 7. Motion

A fade, 140–420ms, and an underline that grows. Nothing translates, scales or lifts.
`prefers-reduced-motion` removes all of it.

## 8. Don't

1. No shadows, gradients, blur, glow or rounded cards.
2. No dark theme and no theme toggle.
3. No hard-coded colours in components; everything resolves to a token (covers, which are
   static assets, are the exception and use palette values).
4. No second type family; no display face.
5. No emoji and no icon font; icons are inline SVG in `Icon.svelte`.
6. No third-party font or script requests before consent; fonts are self-hosted.
7. No justified text; prose is flush-left, ragged-right.

## 9. Responsive and accessibility

- Breakpoints: 1100 (post outline appears), 900 (post margin column), 768 (grid collapses),
  600 (entries stack), 480 (button rows stack), 35em (nav folds).
- Verified with no horizontal scroll at 360px on every route.
- Focus is a 2px accent ring on a 2px paper gap. Interactive targets are at least 44px
  (inline links in running text are exempt).
- Body text is `--text` on `--bg` at 16.1:1.

## 10. Covers

Post covers are flat vector drawings on the paper ground (`#f4f1ea`) with ink, accent-blue
and vermilion strokes, no glows or dot grids. PNG twins for `og:image` are produced by
`npm run og`.

## 11. Content-first hierarchy (home)

The largest type on the home page is always a piece of writing, never the author's name.
The introduction is a 16px greeting hung in the margin plus a short standfirst. The lead
post (newest `hero: true`) follows: kicker and facts in the margin, title at up to 44px,
summary, call to action and cover on the right. Then the writing index with tag filter,
then About. Filtering by tag drops the lead treatment.
