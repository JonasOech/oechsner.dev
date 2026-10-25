# DESIGN.md — Bauhaus / constructivist poster

This is the design contract for oechsner.dev. `src/app.css` is its implementation and holds
every CSS variable. This document replaces the earlier dark editorial spec; the content-first
rule on the home page (§10) survives it.

## 1. Concept

The site is a set of posters. Each page is built from flat colour blocks, thick black rules,
and three primitive shapes — circle, square, triangle — plus the diagonal. Nothing is
glossy: no blur, no gradients, no soft shadows. Depth is a hard offset block.

## 2. Palette

Light only. There is no dark mode and no toggle.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` / `--bg` | `#f4efe3` | page ground (warm white) |
| `--surface` | `#fffaf0` | cards, code, form fields |
| `--ink` / `--text` | `#111111` | type, rules, borders, footer ground |
| `--text-secondary` | `#2e2b26` | body copy |
| `--text-muted` | `#5a554b` | meta text only (6.4:1 on `--bg`) |
| `--red` / `--accent` | `#c8261a` | the voice: links underlines, markers, primary buttons |
| `--yellow` | `#f5b50a` | fill only, never text; hover floods, tags, highlights |
| `--blue` / `--series-cool` | `#1c3f9e` | colour blocks, second chart series, focus ring |

Rules: text on red and blue blocks is `--text-inverse`; text on yellow is `--ink`. Red as
text is allowed on paper only (4.9:1). No component hard-codes a colour; everything resolves
to a `var(--…)` token (`src/lib/components/rpm/` is the standing exception, it renders on a
light plate).

## 3. Type

One geometric sans carries everything: **Jost** (variable, self-hosted via
`@fontsource-variable/jost`), a Futura-descended face. **JetBrains Mono** for code.

- Display: weight 800, uppercase, tight leading (0.95–1.0), tracking −0.02em.
- Labels, buttons, nav, meta: weight 700–800, uppercase, tracking 0.1–0.16em.
- Body: weight 450, 17px, line-height 1.7. Prose 18px / 1.75, justified above 480px.
- `--text-muted` is for meta lines only.

## 4. Grid and spacing

- Container 1200px, 24px gutter (20px under 768px, 16px under 480px).
- Section rail: a 220px label column plus content, under an 8px ink rule. Below 1024px the
  label stacks above the content.
- Spacing scale `--s-1` … `--s-11` (0.25rem … 11rem). Section rhythm `--gap-section` steps
  down at 1023px and 767px.
- Diagonals: colour slabs (`.block`) are cut with `clip-path`, 3.5rem on desktop, ~1.75rem
  on phones. Neighbouring slabs overlap by negative margin so the cut shows paper.

## 5. Shape and elevation

- Border radius is 0 everywhere. The only curves are circles.
- Borders are 2–3px ink; rules are 4px (`--rule-w`) or 8px (`--rule-w-thick`).
- Elevation is a hard shadow in ink: `--shadow-1` 3px, `--shadow-2` 5px, `--shadow-3` 8px.
- Section markers cycle red circle, yellow square, blue triangle (`.rail`, article rows).

## 6. Components

- **Header**: sticky, paper, 4px ink bottom rule. Mark + wordmark left; nav right. The current
  page is an ink block; hover is yellow. Below 35em the links after the first fold behind
  "More" into a yellow panel. Below 30em only the mark remains.
- **Footer**: ink ground under a red/yellow/blue stripe; large uppercase links; hover floods
  yellow.
- **Buttons** `.btn--primary` (red) and `.btn--secondary` (yellow): 3px ink border, hard
  shadow; hover lifts (−2px), active presses flat.
- **Links** `.link`, `.prose a`: ink text, red 2px underline; hover floods yellow.
- **Tags**: 2px ink outline, uppercase; pressed is ink.
- **PageTitle**: coloured slab (yellow, red or blue) with diagonal foot, h1 and the band
  composition. Used on About, Projects, Contact and the legal pages.
- **Geometry**: decorative SVG compositions (`hero`, `band`, `solo`, `stripe`), always
  `aria-hidden`, coloured through tokens.
- **Prose**: h2 uppercase under a 4px ink rule; blockquote is a red bar on a yellow wash;
  code blocks are light with an ink border and a blue left bar; figures get 3px ink borders.

## 7. Motion

Short and mechanical: 120–200ms, `cubic-bezier(0.2, 0.9, 0.3, 1)`. Entrance is a 14px rise;
sections reveal once on scroll. Hovers translate blocks by 2px and grow their shadow.
`prefers-reduced-motion` removes all animation and transitions.

## 8. Accessibility

- Body text meets AA everywhere (ink on paper 16:1; inverse on blue 9:1; ink on yellow 10:1).
- Focus: a 2px paper gap and a 3px blue ring (`--focus-ring`); on ink the ring is yellow.
- Hit areas are at least 44px on coarse pointers; the layout holds down to 360px.

## 9. Don't

1. No gradients, blur, soft shadows or rounded corners.
2. No yellow text, and no red text on a coloured block.
3. No light/dark toggle.
4. No emoji or icon fonts; icons are inline SVG in `Icon.svelte`.
5. Do not put the author's name in the largest type on the home page.

## 10. Home page: content first

The lead post title (`.lead__title`, up to 5rem) is the largest type on the site. The greeting
is capped at 2.125rem. The lead is the newest post with `hero: true`; filtering by tag drops
the lead treatment. Order: greeting and composition, lead slab (blue), writing list, about
slab (yellow).

## 11. Legal pages

Impressum and Datenschutz are German, set on the same `.legal` styles under a `PageTitle`.
Fonts are self-hosted, which the Datenschutz text states.
