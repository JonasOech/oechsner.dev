# DESIGN.md — oechsner.dev (bento / product-UI)

The contract that `src/app.css` implements. Every colour is a `var(--…)` token declared in
that file; components never hard-code one (`src/lib/components/rpm/` is the one exception: it
draws on a white plate and in feed readers).

## 1. Concept

A modern product UI rather than a printed page: a **bento grid** of rounded white cards on a
refined grey canvas, with **one vivid gradient** (indigo, violet, pink) used sparingly for
marks, hairlines and highlights. Surfaces are crisp and neutral, hover lifts a card by a few
pixels, and small status chips carry metadata.

## 2. Palette (light is the only theme)

| Role | Token | Value |
| --- | --- | --- |
| Canvas | `--bg` | `#f3f4f6` |
| Wells (code) | `--bg-deep` | `#eceef1` |
| Card | `--surface` | `#ffffff` |
| Card hover / pressed | `--surface-hover` / `--surface-active` | `#fafafb` / `#eef0f3` |
| Headings | `--text` | `#0f1218` |
| Body | `--text-secondary` | `#454b57` |
| Meta (smallest ink; 5.6:1 on `--bg`) | `--text-muted` | `#5f6572` |
| Hairlines | `--line` / `--line-strong` | `#e3e5ea` / `#cfd2d9` |
| Accent (text, links, focus) | `--accent` / `--accent-dim` | `#4f46e5` / `#4338ca` |
| Gradient | `--grad` | indigo `#4f46e5` to violet `#9333ea` to pink `#ec4899`, 120deg |
| Soft gradient wash | `--grad-soft` | the same stops at 7 to 10% alpha |

Gradient is for: the brand monogram, the lead card's top edge, rail/tile label dots, icon
chips and block quotes. Never behind body text. Accent text must stay on white or `--bg`.
`--text-muted` is meta text only; re-measure if changed.

## 3. Type

- **Inter Variable** (self-hosted via `@fontsource-variable/inter`) for everything: UI,
  headings and prose. Headings 650 to 700 weight, tracking -0.015 to -0.035em.
- **JetBrains Mono Variable** for code, key hints, `.label` captions and `.eyebrow`.
- Body 15px/1.65 (prose 17px/1.8). No serif, no letterspaced caps except mono labels.
- Scale: lead-post title `clamp(1.875rem, 3.6vw, 3rem)` is the largest type on the home page.
  Intro greeting is 1.25rem. Post h1 tops out below the lead title.

## 4. Grid, spacing, shape

- Container 1180px, gutter 20px (16px under 768px). 4px spacing base (`--s-*`).
- `.bento`: 12 columns, 14px gap (`--bento-gap`). Desktop (900px and up) home layout: lead
  spans 8 columns by 2 rows; intro and Now tiles stack in the right 4; Writing is 8, a side
  column (Stack, About) is 4; three link tiles (CV, contact, RSS) span 4 each. 600 to 899px:
  intro/Now are 6 each, link tiles 4 each. Below 600px: one column, lead first.
- Radii: 6 / 10 / 14 / 20px / pill (`--r-xs` to `--r-pill`). Cards are `--r-lg`, shrinking
  to `--r-md` on phones. Cards have a 1px `--line` border and `--shadow-1`.

## 5. Components

- **Top bar**: sticky, 56px, translucent with blur; gradient monogram, pill nav with the
  current page on a white chip, and a "Jump to…" button (`Ctrl/Cmd K` or `/`) opening
  `CommandMenu`, a working `<dialog>` filter over pages, posts and actions. Below 720px the
  nav drops to a second row.
- **Tile** (home) / `.rail` + `.rail__body` (inner pages): labelled card; label has a
  gradient square marker.
- **Chip** (`.chip`, `.tag`): pill, 11 to 12px. `.chip--live` adds a green dot, `--accent`
  a tinted variant. Filter tags go solid ink when pressed.
- **Buttons**: `.btn--primary` ink, `.btn--secondary` white with border; 44px min height.
- **Footer**: a closing card with brand, nav, legal links and the colophon.
- **Prose**: left-aligned on phones, justified above 480px; widgets are rounded cards.

## 6. Motion

Entrance rise (`.enter`) and one-shot scroll reveal (`.reveal`), hover lift of 2 to 3px with
a larger shadow, arrows nudge 3px. All of it is disabled under `prefers-reduced-motion`.
No blur above 12px; the only background decoration is one soft gradient bloom behind the bar.

## 7. Accessibility

Body text is at least AA on every surface it sits on. Focus is a 2px gap plus a 2px accent
ring (`--focus-ring`). The skip link is first in the tab order. Targets are 44px for
coarse pointers. The layout holds down to 360px with no horizontal scroll.

## 8. Content-first rule (unchanged)

The largest type on the home page is a piece of writing, never the author's name. The lead
card (newest post with `hero: true`) owns that slot; the greeting stays a small tile.

## 9. Don'ts

No dark mode or toggle, no emoji or icon font (icons are inline SVG in `Icon.svelte`), no
second gradient, no hard-coded colours outside `app.css` and `rpm/`.
