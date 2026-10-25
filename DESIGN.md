# DESIGN.md — "Desktop"

A System 7 homage: the site is a Mac desktop, pages are windows, posts are documents, the
index is a Finder list. Tasteful and legible, not a parody. `src/app.css` implements this
file and holds every CSS variable. **No component hard-codes a colour** — everything is a
`var(--…)` token. (`src/lib/components/rpm/` is the one exception: those figures render on
a light plate and in feed readers.)

## 1. Principles

1. **1-bit first.** Two inks, black and white, do all the structural work: borders, shadows,
   selection, pressed states. One colour (link blue) is allowed on top.
2. **Content-first.** The largest type on the site is always a piece of writing (the lead
   post title, `clamp(2.125rem, 5.2vw, 3.5rem)`), never the author's name. The greeting is
   a small line in a "Read Me" window. Do not put anything bigger above the fold.
3. **Everything is a window.** A page is a stack of windows on a dithered desktop.
4. **Inversion is the interaction.** Hover, focus, press and "current" all invert ink/paper.
5. **Hard edges.** No blur, no gradients, no rounding except push-buttons. Shadows are
   solid offsets in ink.

## 2. Palette (light only)

| Token | Value | Use |
| --- | --- | --- |
| `--ink` / `--paper` | `#000` / `#fff` | The two inks. Borders, text, window body. |
| `--text-secondary` | `#262626` | Body prose. |
| `--text-muted` | `#555` | Meta text only (7:1 on paper). |
| `--surface`, `-hover`, `-active` | `#f1f1f1` `#e2e2e2` `#d0d0d0` | Code, status strips, toolbars. |
| `--accent` | `#0a2cc8` | Links and the quill. 9:1 on paper. |
| `--series-cool` | `#b3500a` | Second chart series. |
| `--danger`, `--success` | `#b3001b`, `#0a6b25` | Feedback, syntax. |

The desktop is `--desk`: a 25% dither (one 2px ink dot per 4px tile) built with
`conic-gradient` from the two inks. `--dither-50` and `--stripes` (title-bar pinstripes) are
the other patterns. There is no dark theme: the 1-bit metaphor has one polarity, and
inversion is reserved for interaction.

## 3. Type

- **Pixelify Sans** (`--font-display`): chrome and headlines — title bars, menu, buttons,
  tags, meta lines, post titles, `h2`/`h3` in prose.
- **Atkinson Hyperlegible** (`--font-sans`): everything meant to be read, 17px / 1.65.
- **JetBrains Mono** (`--font-mono`): code and ASCII.

Self-hosted through `@fontsource` (imported in `+layout.svelte`); no third-party font
request, which the Datenschutz page states.

## 4. Grid and spacing

Container 1040px, gutter 1.5rem (0.875rem under 768px). Windows stack with `--gap-section`
(1.5rem). Spacing tokens `--s-1…--s-11` are unchanged. Home is two columns from 960px
(lead window | Read Me + About), then the full-width Finder; one column below, lead first.
Post pages use three tracks (outline palette | document | empty counterweight) from 1100px.

## 5. Shape

`2px` ink border on every window, `--shadow-4` (4px 4px 0 ink). Push-buttons are 8px
rounded. Everything else is square. Focus is a dotted 2px outline, or `--focus-ring`.

## 6. Components

- **Window** (`Window.svelte`, `.win*` in app.css): pinstriped title bar, close box (a link
  back to the index where meaningful), zoom box (decor), body, optional `.win__status` strip.
  `Rail` is a thin wrapper kept for page sections.
- **Menu bar** (`Header.svelte`): sticky, paper, 2px rule. Nav items are menu titles;
  current page is inverted. Under 35em, everything after "Writing" folds into a "More"
  pull-down.
- **Finder row** (`ArticleRow.svelte`): document glyph, title, summary, meta, thumbnail.
  Hover/focus inverts the row.
- **Tiles**: 40px glyph over a caption (CV, feed, About). Caption inverts on hover.
- **Buttons**: `.btn` outlined; `.btn--primary` is the double-ringed default button. The
  consent buttons are deliberately identical (no default ring).
- **Dialog**: consent banner, subscribe box and the error page are alert-style windows.
- **Tags**: square outlined chips; `aria-pressed` inverts.
- **Glyphs** (`Icon.svelte`): `folder doc pdf rss-file disk mail-file alert` on a 32px
  pixel grid, `crispEdges`; the 24px line icons remain for UI arrows.

## 7. Prose

Window body on paper, 68ch measure. Links blue underlined; `h2` has a 2px rule; blockquote
has a 6px ink bar; code and figures are bordered with hard shadows. Widgets and callouts
use ink borders and offset shadows.

## 8. Motion

Stepped (`steps(4)`), like a screen redrawing: windows open with a stepped clip, reveals
fade in three steps. No transforms, no easing curves. `prefers-reduced-motion` disables it.

## 9. Don't

1. No gradients, blur, or border-radius beyond push-buttons.
2. No greys for hierarchy beyond the tokens above; `--text-muted` is meta text only.
3. No emoji, no icon font. No literal colours outside `app.css` (and `rpm/`).
4. Nothing larger than the lead post title on the home page.

## 10. Responsive

360px is supported. The menu collapses at 35em; the Finder thumbnail hides under 768px;
windows go edge to edge with a 0.875rem gutter; buttons stack under 480px; justified prose
becomes ragged-right under 480px. Coarse pointers get 44px targets (menu bar grows to 2.75rem).
