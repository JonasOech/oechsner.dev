# DESIGN.md — oechsner.dev ("Two papers")

`src/app.css` is the implementation of this file and holds every CSS variable in the project.

## 1. Concept

*A reading column grown up.* One 65-character column of serif text, a slim index beside it, and
nothing else. Beauty comes from spacing and type alone: no cards, no shadows, no gradients, no
illustration for its own sake. The site is printed on one of two papers: **soft white** or **ink
on warm charcoal**. Both are first-class; neither is an afterthought of the other.

Tone: a CS student's notebook, set like a small journal. The accent is a single understated
slate blue used for links and signals, never as a fill.

## 2. Themes and palette

The light tokens are the `:root` default. Dark applies when `prefers-color-scheme: dark` and the
visitor has not pinned light, or when `data-theme="dark"` is set. The footer's *Auto / Light /
Dark* control writes `data-theme` and stores it in `localStorage` (`theme`, wrapped in try/catch).
`src/app.html` applies a stored choice before first paint. Without JavaScript the system setting
decides and the control is not rendered.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#fbf9f5` | `#1c1b19` | page |
| `--surface` | `#f4f1ea` | `#252321` | code, widgets, tints |
| `--text` | `#1f1d1a` | `#ece8df` | body, headings |
| `--text-secondary` | `#46423b` | `#c6c1b5` | standfirsts, secondary |
| `--text-muted` | `#6b665c` | `#9c9689` | meta, labels |
| `--accent` (link) | `#2a5985` | `#9bbde3` | links, hover, focus |
| `--line` / `--line-strong` | `#e4dfd3` / `#cbc4b3` | `#35332e` / `#4d4a43` | hairlines |
| `--plate` | `#f4f1ea` | `#f4f1ea` | figure plate (diagrams stay on paper) |

Measured contrast (WCAG, `contrast.py` formula):

| Pair | Light | Dark |
|---|---|---|
| text on bg / surface | 15.99 / 14.91 | 14.08 / 12.81 |
| text-secondary on bg / surface | 9.50 / 8.85 | 9.59 / 8.72 |
| text-muted on bg / surface | 5.43 / 5.06 | 5.85 / 5.32 |
| accent on bg / surface | 6.97 / 6.50 | 8.84 / 8.04 |
| danger on bg | 6.45 | 6.78 |
| success on bg | 6.04 | 8.65 |

Chart series are drawn on the plate in both themes: `--series-a` `#2a5985` (6.50 on plate),
`--series-b` `#a65a2e` (4.52). Hairlines are decorative and are not held to text contrast.

## 3. Type

| Role | Family | Use |
|---|---|---|
| Reading | Source Serif 4 Variable | body 17px (18px from 40em), headings 600, summaries |
| UI | Inter Variable | nav, meta, labels, tags, buttons, footer, tables |
| Code | JetBrains Mono Variable | code only |

All self-hosted through `@fontsource-variable`. Scale: post h1 `clamp(1.875rem, 4.6vw, 2.5rem)`;
home lead title `.hero-title` `clamp(2rem, 5.2vw, 2.875rem)`; h2 1.5rem; list titles 1.3125rem;
labels 0.6875rem tracked 0.14em uppercase; meta 0.8125rem with tabular lining figures. Body copy
uses oldstyle proportional figures. Text is flush-left and hyphenated; nothing is justified or
centred.

## 4. Grid

`[index rail 9.5rem] [column 38rem ≈ 65ch] [margin 13rem]`, centred as one composition.
- ≥ 56em: the index is a sticky left rail (name over a hairline, links stacked, current page
  marked by a short rule). Below: it collapses to a single wrapping line at the top.
- ≥ 72em: the margin track opens beside posts and holds the outline ("On this page" with reading
  progress), hung from hairlines. Elsewhere the margin stays empty.
- Section labels (`Rail`) are small tracked sans lines over a hairline, inside the column.
- Works down to 360px with no horizontal scroll.

## 5. Shape and depth

Radius 2px (`--radius`); 1px hairlines; no shadows, blur or gradients (all `--shadow-*` are
`none`). The one heavy line is the rule above the home lead post.

## 6. Motion

A short fade-and-rise on first paint (`.enter`, `.reveal`); hover changes colour or underline
only; arrows nudge 3px. `prefers-reduced-motion` removes all of it.

## 7. Components

- **Links**: accent colour, 1px underline at 40% that goes solid on hover.
- **Buttons**: hairline box, sans 13px; primary is ink-filled and inverts on hover.
- **Tags**: lowercase sans in a hairline box; pressed = ink fill.
- **Article row**: title, standfirst, meta, small cover at the right; hairline between rows; hover
  colours the title.
- **Footer**: hairline, links, legal line, colophon, theme control (chosen option underlined).
- **Figures**: `.widget` is a `--surface` box with a hairline; callout `.note` is a left rule.
- **Covers**: `static/img/<post>/cover.svg` are drawn on paper `#f4f1ea` with ink and the two
  figure hues; `npm run og` regenerates the PNGs.

## 8. Home hierarchy

The largest type on the site is always a piece of writing. The author's name is the small word in
the index; the greeting is one 20px serif line. The newest `hero: true` post leads (kicker, title,
standfirst, facts, cover), then a plain list of posts, then a short About.

## 9. Don'ts

No colour outside a token (the `rpm/` figure set aside); no light/dark special-casing in
components; no shadows, glows, blur or gradients; no accent as a fill behind text; no emoji or
icon font; no third-party font requests.
