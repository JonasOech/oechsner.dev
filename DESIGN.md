# DESIGN.md — the "tty" language

This file is the contract for the site's visual design; `src/app.css` implements it and holds
every CSS variable. The site looks like a terminal session: one monospace face, a character
grid, panes drawn with box-drawing lines, a status bar on top and a keyboard-hint bar at the
bottom. It replaces the earlier editorial dark theme (Playfair / DM Sans / gold accent).

## 1. Principles

1. **Monospace everywhere.** JetBrains Mono (self-hosted via `@fontsource-variable/jetbrains-mono`)
   is the only family. `--font-sans` and `--font-display` alias `--font-mono`, so old components
   keep working. Hierarchy comes from weight, size and colour, never from a second face.
2. **The grid is `ch`.** Horizontal measures are in `ch` (`--measure: 72ch`, prose `76ch`);
   indents are `2ch`; list bullets hang in `2ch`. Vertical rhythm is multiples of 0.25rem.
3. **Drawn, not lifted.** No shadows, no radii (`border-radius: 0` is global), no blur, no
   gradients. Structure is 1px lines, solid for panes, dashed for dividers.
4. **Legibility first.** No scanlines, glow or CRT curvature. Motion is stepped and short.
5. **Content first (unchanged from the old §11).** The largest type on the site is the lead post
   title (`.hero-title`, up to 2.75rem). The author intro is a small `$ whoami` block above it
   (max 1.125rem). A post-page h1 tops out at 2.25rem.

## 2. Palette (dark only; no light mode, no toggle)

| Token | Value | Role |
| --- | --- | --- |
| `--bg` / `--bg-deep` | `#0a0d0b` / `#070908` | page / code, footer, inputs |
| `--surface`, `-hover`, `-active` | `#101511`, `#151b16`, `#1b231d` | row hover, hint bar |
| `--text` | `#dbe6d8` | headings, active text |
| `--text-secondary` | `#a9baa6` | body copy |
| `--text-muted` | `#84967f` | meta only; ≥ 5:1 on `--bg` and `--surface` — re-measure if changed |
| `--line`, `--line-strong` | `#223025`, `#3a5340` | dashed rules, pane borders |
| `--accent` | `#62e283` | phosphor green: links, status bar, focus, active filter |
| `--accent-dim` | `#3fa25d` | underlines, heading `#` marks (decoration only) |
| `--prompt` | `#e5b95c` | amber: the `$`, nav key numbers, inline code, eyebrows |
| `--series-cool` | `#7aa7d9` | the cwd in the prompt, second chart series, callout rule |

Components never hard-code colour; they use these tokens. `src/lib/components/rpm/` remains the
deliberate exception (light plate, feed readers).

## 3. Type roles

Base 14px / 1.7. Lead title 1.75–2.75rem / 800 / −0.03em. Post title 1.5–2.25rem. Body prose
0.9375rem / 1.8, ragged-right (justified monospace opens rivers). Meta 0.75rem. Labels 0.6875rem
uppercase with tracking. Markdown headings carry their sigils: `## ` and `### ` in `--accent-dim`,
post title `# `, figure captions `// `.

## 4. Shell chrome

- **Status bar** (top): one inverse green line: host, `tty1`, current path. Decorative.
- **Prompt nav** (sticky ≥ 768px): `jonas@oechsner.dev:~/writing $` plus numbered entries
  `[1] writing [2] about [3] projects [4] contact`. The current page is an inverse block. The
  numbers are live keyboard shortcuts (ignored while typing or with modifiers).
- **Footer**: `EOF ────` rule, `./path` links, legal row (Impressum, Datenschutz, Cookie settings),
  colophon, and a keyboard-hint bar with inverse key caps. The hint bar is `aria-hidden`.

## 5. Components

- **Pane (`Rail`)**: bordered box, title set into the top edge as `┤ title ├` in green. Titles are
  commands: `ls -l writing/`, `cat about.txt`.
- **Post list (`ArticleRow`)**: `ls -l` table: date, read minutes (`7m`), name, then summary and
  `#tags`. Hover tints the row and turns the title green. Below 600px the row stacks.
- **Buttons**: rectangles, 1px border. Primary is a solid green block, secondary an outlined one.
- **Tags**: `[name]` in muted text; the pressed filter is a green block.
- **Links**: green with a dim underline; hover inverts to a green block (selection style).
- **Focus**: a 2px green ring offset by 2px of `--bg`, always visible.
- **Prose**: dashed rule under h2, `-` bullets, left-barred blockquote and code, inline code in amber.

## 6. Layout and responsive

Container 1040px, gutter 1.25rem (1rem under 768px). Home: intro, lead post (title and summary left,
framed cover right; stacks under 768px), then panes. Posts: centred 76ch column with the outline in
the left track at ≥ 1100px. Everything holds at 360px with no horizontal scroll; coarse pointers get
44px targets.

## 7. Motion

`--ease-out` is `steps(4)`. Entrances are short opacity steps, the reveal action is opacity only,
and `.cursor` is a blinking block. `prefers-reduced-motion` disables all of it.

## 8. Don't

- Add a light theme, toggle, second typeface, shadow, radius, gradient or emoji.
- Use CRT effects (scanlines, glow, curvature), or make the author name larger than a post title.
- Hard-code a colour outside `app.css` (except `rpm/`).
