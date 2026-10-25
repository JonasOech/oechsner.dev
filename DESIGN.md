# DESIGN.md — oechsner.dev ("Stationery")

`src/app.css` is the implementation and holds every CSS variable. Components reference tokens
only (`src/lib/components/rpm/` is the one deliberate exception; it renders on a light plate and
in feed readers). Cover SVGs and the favicon are static assets and use literal values taken from
the palette below.

## 1. Concept

Fine correspondence paper. An ivory sheet, deep navy ink, hairline rules, a small monogram as the
brand, and a serif with some warmth. The site reads like a private-bank or law-firm letter: a
letterhead at the top, sections that read as paragraphs with a small label in the margin, and a
post list that is a table of correspondence (date, subject, enclosure). Dignified and personal,
never ornamental: every rule and every gold-brown detail does a job.

Light is the only theme. Do not add a dark mode or a toggle.

## 2. Palette

| Token | Value | Role | On `--bg` | On `--surface` |
| --- | --- | --- | --- | --- |
| `--bg` | `#f6f1e6` | the desk / page ground | | |
| `--surface` | `#fbf8f0` | the sheet: panels, inputs, hover | | |
| `--bg-deep` | `#eee7d6` | code wells | | |
| `--plate` | `#fdfbf5` | lightest sheet: figures, equations | | |
| `--text` | `#14203b` | navy ink: headings, nav, strong | 14.35 | 15.23 |
| `--text-secondary` | `#2b3750` | body copy | 10.56 | 11.21 |
| `--text-muted` | `#596378` | meta, rail labels, dates | 5.36 | 5.68 |
| `--accent` | `#826428` | gold-brown: link underlines, bullets, umlaut, feed icon | 4.90 | 5.2 |
| `--accent-dim` | `#6a501f` | hover and code numerals | 6.71 | 7.12 |
| `--series-cool` | `#2c4a82` | second chart ink | 7.74 | 8.21 |
| `--success` / `--danger` | `#2c6a3d` / `#9a2b2b` | feedback, code strings | 5.76 / 6.77 | 6.11 / 7.18 |
| `--line` | `#d9d0bb` | hairlines (decorative) | 1.36 | |
| `--line-strong` | `#b5a98b` | tag and enclosure borders (decorative) | 2.07 | |
| `--line-control` | `#857a5e` | form-control and secondary-button edges | 3.77 | 4.00 |

Ratios were computed with the WCAG relative-luminance formula. Accent is signal only, never a fill
behind running text. `--text-muted` is for meta text and has little headroom: re-measure against
`--bg` and `--surface` if changed. Selection is a 22% accent wash.

## 3. Type

One family plus mono. **Source Serif 4** (variable, optical size axis, self-hosted via
`@fontsource-variable/source-serif-4`) for everything; `--font-display` and `--font-sans` alias it.
**JetBrains Mono** (variable, self-hosted) for code only.

| Role | Spec |
| --- | --- |
| Lead title (home) | `clamp(2rem, 4vw, 3.25rem)`, 500, -0.02em: the largest type on the site |
| Post title | `clamp(2rem, 4.6vw, 2.75rem)`, 500 |
| Standfirst | 1.25rem italic |
| Prose | 1.1875rem / 1.7, 66ch, justified with hyphenation above 480px |
| Prose h2 / h3 | 1.625rem 500 with a hairline above / 1.3125rem 600 |
| Meta, dates | 0.875rem, tabular lining figures, `--text-muted` |
| Rail labels, nav, buttons, tags | 0.6875-0.75rem, 600, uppercase, 0.14-0.2em tracking |
| Salutation (home) | 1.25-1.5rem italic |

## 4. Grid and layout

Container 1040px, 1.5rem gutter. `.rail` is a two-column grid: 190px margin label, 62ch body, with
a hairline across the top of the section. Below 1024px the label sits above the body. Posts use
three tracks (180px outline, 66ch text, 180px counterweight) from 1100px. Section rhythm
`--gap-section` 4rem (3rem on phones).

## 5. Shape, rules and depth

Radius 0 everywhere except 2px on buttons, inputs and inline code. No gradients, blur or glow. The
only shadow is the soft paper lift under the consent notice and a maximised equation. Rules:
1px navy under the letterhead name and above the footer; 1px `--line` between sections and list
rows; a 3px double navy rule opens the lead post; covers sit in a 1px bordered mount with 8px of
paper around them like a photograph on a letter.

## 6. Components

- **Letterhead** (`Header.svelte`): monogram (`Monogram.svelte`, an inline SVG double-ruled "J O"
  whose diaeresis is gold) beside the name in tracked caps and an italic descriptor; email and domain
  right-aligned (hidden under 40em). Nav below a navy rule, then a hairline. It scrolls away; it is
  stationery, not chrome. Below 35em the nav folds into a "More" disclosure.
- **Table of correspondence** (`ArticleRow.svelte`): 7.5rem date column, subject and summary, a
  132px enclosure thumbnail. Hairlines between rows; hover underlines the subject in gold.
- **Buttons**: square, tracked caps. Primary is a navy fill, inverted to an outline on hover;
  secondary is outlined, filled on hover.
- **Tags**: ruled boxes, navy fill when pressed.
- **Links**: ink with a 1px gold underline; hover shifts to `--accent-dim`.
- **Outline** (`PostOutline.svelte`): marginalia, a list down a hairline; the active entry is
  ink with a gold tick.
- **Footer**: navy rule, monogram and colophon, ruled nav, legal line.
- **Blockquote**: italic with a single gold hairline.

## 7. Motion

A six-pixel fade-rise on load and on reveal, 160-220ms colour changes on hover. Everything respects
`prefers-reduced-motion` (durations collapse, reveal is skipped).

## 8. Accessibility

Body text is at least 10:1. Focus is a 2px ink ring offset by a 2px paper gap. Targets are 44px on
coarse pointers. Layout holds to 360px with no horizontal scroll.

## 9. Do and don't

Do keep gold to tiny details. Do let rules, not boxes, make structure. Don't add shadows, rounded
cards, emoji, icon fonts, a second text family, or a dark theme. Don't colour a component by
hand; add or reuse a token.

## 10. Home page hierarchy

Content first. A small italic salutation and standfirst, then the newest hero-eligible post leads
with the largest type on the site, then the post list, then a short About paragraph. The author's
name appears only in the letterhead, small.

## 11. Covers

Each `static/img/<post>/cover.svg` is drawn on the `--bg` ivory with navy ink, gold-brown for
highlight and `--series-cool` for a second ink, with no gradients or glows. Run `npm run og` and
commit both the SVG and the PNG.
