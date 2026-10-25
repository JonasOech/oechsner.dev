# DESIGN.md — oechsner.dev

> Direction: **Academic paper.** The site is typeset like a research paper: white page, black
> text, one scholarly serif, numbered sections, an abstract for every post, figures with
> numbered captions, a references list. `src/app.css` is the implementation and holds every
> CSS variable in the project.

---

## 1. Concept

A CS student's notebook set the way a journal would set it. The home page is the front matter
of a proceedings volume: a small masthead, the featured post as a title page (title, author
block, abstract, Figure 1), then a table of contents with dotted leaders. A post page is the
paper itself. Nothing is decorative: no shadows, gradients, blur, rounded cards or
illustration. Structure comes from typography and rules.

Light paper is the only theme. There is no dark mode and no toggle.

## 2. Palette

One accent, used for signal only (links, cross-references, the active outline entry, focus).
It is never a fill behind running text.

| Token | Value | Role | on `--bg` | on `--surface` |
| --- | --- | --- | --- | --- |
| `--bg` | `#ffffff` | page | n/a | n/a |
| `--surface` / `--bg-deep` | `#f7f7f4` / `#f5f5f2` | code blocks, table wells | n/a | n/a |
| `--text` | `#0b0b0b` | headings, titles | 19.7 | 18.3 |
| `--text-secondary` | `#232323` | body copy | 15.7 | 14.6 |
| `--text-muted` | `#595959` | meta text, dates, numerals | 7.0 | 6.5 |
| `--accent` | `#1b3a8f` | links (hyperref blue) | 10.3 | 9.6 |
| `--accent-dim` | `#11296b` | pressed links | 13.5 | 12.6 |
| `--series-cool` | `#9c3d22` | second ink in figures and covers (brick) | 6.8 | 6.3 |
| `--danger` / `--success` | `#a3231c` / `#1f6a35` | form feedback, code strings | 7.5 / 6.6 | 7.0 / 6.2 |
| `--line` | `#cfcfc9` | hairlines (decorative only) | 1.6 | n/a |
| `--line-strong` | `#8c8c86` | input borders, leaders | 3.4 | n/a |

Contrast ratios were computed with the WCAG 2.x formula. `--text-muted` is meta text only;
re-measure against both `--bg` and `--surface` if it changes. Links are always underlined
(blue against black body text is not a sufficient cue by colour alone).

Covers (`static/img/*/cover.svg`) are drawn on white with the same ink greys, the blue and
the brick. They are static assets, so literal colours are permitted there.

## 3. Type

| Role | Family | Notes |
| --- | --- | --- |
| Everything | STIX Two Text (variable, roman + italic) | self-hosted via `@fontsource-variable/stix-two-text` |
| Code | JetBrains Mono 400/500 | self-hosted via `@fontsource/jetbrains-mono`; code only |

The root is 106.25 % (17 px). Prose is 1.0625rem / 1.62, justified with hyphenation above
480 px and ragged-right below. Measure is 66ch.

- **Small caps** (`font-variant-caps: all-small-caps`, tracked 0.1em) for navigation, rail
  labels, keywords, the abstract label and other meta.
- **Section heads** in prose are bold small caps, numbered `1`, `2`, ...; subsections are
  bold, numbered `1.1`. Numbers come from CSS counters, so `.svx` stays plain Markdown.
- Dates and numbers use lining tabular figures.
- Largest type on the site is always a piece of writing: the lead post title tops out at
  3rem, a post's own title at 2.5rem, the author's name never exceeds 1.125rem (home content
  hierarchy rule).

## 4. Grid and layout

- Container 1040 px, 1.5rem gutters. Rail column 168 px (label), content beside it.
- Home: masthead (double rule below) → lead post title page → numbered sections `1 Writing`,
  `2 About`. Entries in Writing are numbered `1.1`, `1.2`, ... .
- Post: three tracks at 1100 px and up (contents 190 px, article 66ch, empty counterweight);
  below that a single centred column.
- Breakpoints: 1023 (rail collapses above its content), 767, 479 (ragged text), 360 is the
  minimum supported width.

## 5. Shape and rules

Radius is 0 (1 px on focus outlines). No shadows. A 1 px hairline separates things; a heavy
1 px black rule opens the abstract, the references, the post navigation and the footnote
rule; a double rule closes the masthead; tables are booktabs (2 px top and bottom, 1 px under
the header).

## 6. Motion

One interaction language: colour shifts to the accent, underline becomes solid. Entry
animation is a fade only. `prefers-reduced-motion` removes all animation and transitions.

## 7. Components

- **Running head**: site name italic at the left, small-caps navigation at the right,
  hairline under it once scrolled. Below 35em secondary links fold into a "More" list.
- **Masthead / title page**: centred title, author block (name, role, date, read time), then
  an `Abstract` block and Figure 1 (the cover) with a numbered caption.
- **Abstract**: ruled, inset, justified summary; keywords line (`Keywords: a b c`) below it,
  with the human-written laurel at the right when `ai: false`.
- **Contents entry** (`ArticleRow`): number, title, dotted leader, date, summary, facts, and a
  small cover figure at the margin.
- **Outline**: "Contents" in the margin with the same section numbers as the prose.
- **Figures**: `Figure n.` captions are generated by CSS on every `figcaption` in prose.
  Widgets are figures ruled above and below, not cards.
- **References**: the plugin's `ol.references` becomes a hanging `[n]` list headed
  "References". Inline citations keep the plugin's author-year text as blue cross-references.
- **Buttons**: ruled rectangles, inverted on hover. **Tags/keywords**: small caps; interactive
  ones are underlined, pressed ones are bold with a solid underline.
- **Footer**: a short footnote rule, then small print.

## 8. Do and don't

- Do resolve every colour to a `var(--...)` token (the rpm figure set is the exception).
- Do keep icons inline SVG in `Icon.svelte`. No emoji, no icon font.
- Don't add shadows, gradients, blur, filled accent areas, rounded cards or a second theme.
- Don't introduce a sans-serif.
