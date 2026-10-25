# DESIGN.md: Lab notebook

The design contract for oechsner.dev. `src/app.css` is the implementation and the only
place a colour is declared. Read this before moving anything above the fold.

## 1. Concept

A tidy engineer's bound notebook, not a scrapbook. A warm white leaf with a barely visible
dot grid and one thin margin rule; graphite text; a single blue-pen accent. Writing is set in
a serif. Everything that would be *written in the margin* (dates, entry numbers, read times,
rail labels, tags, the nav tabs) is set in mono, small and tracked. Structure comes from
hairlines and type, never from shadows, fills, blur or rounded cards.

Posts are **entries**. The oldest published post is Entry 001; the number is derived in
`src/lib/entry.ts` from the post list, never written in front-matter.

## 2. Palette

One light theme. There is no dark mode and no toggle.

| Token | Value | Role | on `--bg` | on `--surface` |
| --- | --- | --- | --- | --- |
| `--bg` | `#fbf9f3` | the leaf | n/a | n/a |
| `--surface` | `#f6f3ea` | inset areas, hover tint | n/a | n/a |
| `--bg-deep` | `#f2eee2` | code blocks | n/a | n/a |
| `--text` | `#1f2227` | headings, ink | 15.2 | 14.4 |
| `--text-secondary` | `#41454c` | body copy | 9.2 | 8.7 |
| `--text-muted` | `#5e626a` | meta only (mono annotations) | 5.6 | 5.3 |
| `--accent` | `#1b479a` | blue pen: links, entry numbers, hover, active tab stroke | 8.3 | 7.8 |
| `--accent-dim` | `#5b82c4` | non-text only: list markers, borders (3:1) | 3.7 | 3.5 |
| `--line` / `--line-strong` | `#dcd6c4` / `#b9b29b` | pencil hairlines | decoration | decoration |
| `--grid-dot` | ink at 10% | the dot grid | decoration | decoration |
| `--margin-rule` | accent at 26% | the margin rule | decoration | decoration |
| `--plate` | `#fffefb` | white mount under figures and covers | n/a | n/a |
| `--series-cool` | `#a8512a` | rust second pen for two-series figures | 6.1 | n/a |

Ratios were measured with a script (WCAG 2.x relative luminance). `--text-muted` must stay
at 4.5:1 or better on `--bg`, `--surface` and `--bg-deep`; re-measure if changed. The accent
never fills a block behind running text.

## 3. Type

Two families, self-hosted with `@fontsource` (no third-party requests).

- **Source Serif 4 Variable**: body (17px / 1.7, prose 18px / 1.72), headings (600), the lead title (500), italic for the
  greeting and post standfirst.
- **JetBrains Mono** 400/500: annotations. Dates and numbers use tabular figures. Meta is
  12px, labels 11px uppercase tracked 0.12-0.14em.

`--font-sans` and `--font-display` are aliases of the serif so older rules keep working.

## 4. Grid

Container 1080px, 24px gutter. The **rail** is a 176px mono label column plus a content
column (62ch for text). It collapses to label-above-content under 1024px. The post is a
three-track grid (outline / 66ch / empty) from 1100px. The margin rule is fixed at the
container's left edge minus 18px (10px on phones). Dot grid: 24px, 20px on phones.

## 5. Shape

Corners 0-3px. Hairlines 1px. No shadows except one whisper (`--shadow-2`) under the open
mobile menu and the consent panel. Photographs and covers are *mounted*: a 1px pencil border
around a 3-6px `--plate` mat.

## 6. Home (content-first)

Flyleaf (small italic greeting, tagline, two links) then the lead entry: mono header strip
("Entry 003 / date / Featured"), the lead title as the largest type on the site, the cover
mounted at the right. Below, an **Index**: tag filters, then ruled rows of
`No. / date | title, summary, meta | thumbnail`. The author's name is a small mono label.

## 7. Components

- **Nav**: a tabbed index. Tabs hang from one baseline rule; the current page is
  paper-coloured, joined to the leaf, with a 2px blue-pen stroke on top. Under 40em only
  Writing stays and the rest fold into "More".
- **Post header**: entry strip (number left, ISO date right) over a rule, serif title,
  italic summary, meta, tags, laurel.
- **Prose**: justified and hyphenated (ragged under 480px); each `h2` gets a generated
  mono "§ 01" kicker; links are blue and underlined; blockquote is a 1px blue rule.
- **Buttons**: square, mono uppercase. Primary is a graphite fill that turns blue on hover;
  secondary is a pencil outline.
- **Tags**: lower-case mono in a ruled box.
- **Footer**: a double rule, then mono colophon.

## 8. Motion

Short fades (6px rise, 480ms) on first paint; hover is colour and underline only.
`prefers-reduced-motion` removes all of it.

## 9. Accessibility and responsive

Visible 2px blue focus ring (offset by the paper colour), 44px touch floors on coarse
pointers, no horizontal scroll at 360px, tabs collapse before they can overflow.

## 10. Covers

`static/img/<post>/cover.svg` are recoloured from this palette: paper ground, white plates,
graphite ink, blue-pen accents, glows reduced to 3.5% tints. PNGs are regenerated with
`npm run og`.

## 11. Don'ts

Do not hard-code colours outside `app.css` (the `rpm/` figures are the exception), add a dark
theme, add a third family, round corners past 4px, add shadows or blur, make the author's name
larger than the lead title, or make the grid texture stronger than a tenth of ink.
