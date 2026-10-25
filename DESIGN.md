# DESIGN.md — ultra-minimal, reading-first

This is the design contract. `src/app.css` implements it and holds every CSS variable.
Beauty comes from typography and spacing alone: one narrow column, one serif, black on paper
(or the reverse after dark), and a single understated link colour.

## 1. Principles

1. **One column.** Everything — header, lists, prose, footer — hangs off the same left edge
   and the same `62ch` measure. Nothing sits in a second column except the post outline,
   which is a margin note on wide screens only.
2. **Almost no chrome.** No cards, no shadows, no fills, no pills, no images on the index.
   Structure comes from whitespace, a few hairlines and italics.
3. **Typography is the interface.** Hierarchy is made of size, weight, italics and the
   muted/ink contrast, never of colour or boxes.
4. **Restraint with the colour.** Monochrome plus one link colour. The accent is for links
   and nothing else.
5. **Content first (home).** The largest type on the site is always a piece of writing
   (`.hero-title` on the lead post, up to 2.75rem). The author's name is 1rem in the header.

## 2. Palette

Light is the default; dark applies via `@media (prefers-color-scheme: dark)` only. There is no
toggle. Token names are stable (components and the `rpm` figures use them).

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg` | `#fbfaf6` | `#151514` | paper |
| `--surface` | `#f3f1ea` | `#1c1c1a` | code, figure wells (the only filled areas) |
| `--text` | `#1c1b19` | `#ebe9e3` | body and headings |
| `--text-secondary` | `#4c4a45` | `#bfbcb4` | standfirsts |
| `--text-muted` | `#6a665f` | `#94918a` | meta, labels. 5:1+ on `--bg` and `--surface` — re-measure if changed |
| `--line` / `--line-strong` | `#e2dfd5` / `#cbc6b8` | `#2c2b28` / `#403e3a` | hairlines |
| `--accent` | `#2a5788` | `#8fb5e0` | links only |
| `--plate` | `#f2f2ef` | same | light ground for dark-ink diagrams |

No component hard-codes a colour (`src/lib/components/rpm/` is the deliberate exception).

## 3. Type

One humanist serif stack, no webfonts, no external requests:
`Charter, 'Bitstream Charter', 'Sitka Text', 'Iowan Old Style', Palatino, Cambria, Georgia, serif`.
`--font-sans` and `--font-display` alias it. JetBrains is gone; code uses the system monospace.

| Role | Size / line | Notes |
| --- | --- | --- |
| Body | 1.1875rem / 1.65 (1.0625rem under 600px) | `--measure: 62ch` |
| Lead title (home) | clamp 2rem–2.75rem / 1.15, 600 | largest type on the site |
| Post / page title | clamp 1.75–2.5rem / 1.15–1.2, 600 | |
| Section label (`.rail__label`) | 1rem italic, muted | the only section marker |
| Meta, tags, footer | 0.9375rem, muted | tabular figures for dates |
| Prose h2 / h3 | 1.5rem / 1.25rem, 600 | |

Paragraphs are ragged-right, hyphenated, `text-wrap: pretty`. Never justified, never centred.

## 4. Grid and spacing

- `.container`: `62ch` plus a `1.25rem` gutter (1.125rem under 600px), centred.
- Post page at 1100px+: three tracks (`11rem` outline, measure, `11rem` empty), text stays centred.
- Spacing scale `--s-1…--s-11` (0.25rem … 11rem). Section gap `--s-8` (`--s-7` on phones);
  lead post and intro are separated by `--s-9`. Generous, consistent vertical rhythm.

## 5. Shape and depth

Radius is `2px` or none. There are no shadows (`--shadow-*` are no-op tokens). Hairlines are
`1px var(--line)`. Fills exist only on `--surface` (inline code, `pre`, widgets).

## 6. Motion

Colour fades at 150–200ms and a single 400ms opacity fade on first paint (`.enter`). Nothing
moves in space; scroll-reveal is retired. `prefers-reduced-motion` removes all of it.

## 7. Components

- **Header**: site name left (1rem, 600), four inline text links right; wraps under the name on
  phones. Current page is underlined. Not sticky.
- **Dated list (`ArticleRow`)**: ISO date in a 6.75rem muted column, title, summary as a muted
  second line; stacks under 480px. Hover only recolours the title.
- **Tags**: plain words. Filters are links that underline when pressed; labels read as a
  comma-separated sentence.
- **Buttons (`.btn`)**: hairline box, 2px radius, serif; primary is inked in. Used sparingly.
- **Links**: accent colour with a thin underline at 45% alpha.
- **Subscribe, consent banner**: a hairline-topped paragraph / strip, no card.
- **Footer**: hairline, inline links, one muted colophon.
- **Outline (`PostOutline`)**: small muted text with a 1px progress line, wide screens only.
- **Blockquote**: hairline left rule, italic. `hr` is three asterisks.

## 8. Accessibility

Body text meets AA in both schemes; muted text is meta-only. Focus is a 2px offset ring in
`--accent`. Hit areas reach 44px on coarse pointers. Layout holds to 360px with no horizontal
scroll.

## 9. Don'ts

No light/dark toggle, no webfonts, no card or shadow, no second link colour, no centred body
text, no images on the index, no emoji or icon fonts (icons are inline SVG in `Icon.svelte`).
