# DESIGN.md — oechsner.dev

## 1. Concept: sheets on a desk

The site is a well-made native document app. A pale grey-linen **desk** is the ground; every
page is a white **sheet** of paper lying on it, with a hairline border and one very soft,
layered paper shadow. A slim **menu bar** runs across the top. The post index is a Mail/Finder
style **list pane** (toolbar of tag filters, rows with thumbnail, title, summary and a mono
date, a status bar underneath). One calm blue is the only accent. No pixel fonts, no dither,
no pastiche: structure comes from sheets, hairlines and type.

Tone: *calm, professional, native.* Audience: recruiters, supervisors, engineers.

## 2. Palette (light only)

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `--bg` | `#e2e5e9` | The desk (with a 2%-ink linen weave) | text 14.1:1, muted 4.98:1 |
| `--sheet` | `#ffffff` | Paper: pages, menus, dialogs | text 17.8:1 |
| `--surface` | `#f5f6f8` | Toolbars, menu bar, chips, wells, callouts | text 16.5:1 |
| `--bg-deep` | `#f2f4f6` | Code blocks | |
| `--surface-hover` / `-active` | `#edf0f3` / `#e3e7ec` | Hover, pressed | text 14.4:1 (active) |
| `--text` | `#14181d` | Headings, ink | 17.8:1 on sheet |
| `--text-secondary` | `#343c46` | Body copy | 11.2:1 on sheet |
| `--text-muted` | `#566170` | Meta, dates, rail labels only | 6.3:1 sheet, 5.8:1 surface, 5.0:1 desk |
| `--accent` | `#1d5bc4` | Links, kickers, selection, primary button fill | 6.3:1 sheet, 5.0:1 desk; white on it 6.3:1 |
| `--accent-dim` | `#14438f` | Hover/pressed accent, active nav text | 9.4:1 sheet |
| `--accent-wash` | 8% accent | Active nav, hovered list row, pressed tag | |
| `--line` / `--line-strong` | `#dadee4` / `#bcc3cc` | Hairlines / control borders | |
| `--series-cool` | `#b4570f` | Second chart series beside the blue | 4.5:1 on plate |
| `--danger`, `--success` | `#b3261e`, `#1b7a3a` | Feedback, code strings | 6.5:1, 5.4:1 |

Ratios are WCAG 2 relative-luminance measurements. If a muted or accent value changes,
re-measure against `--bg`, `--sheet` and `--surface`.

## 3. Type

Two families, self-hosted via `@fontsource` (no third-party requests): **IBM Plex Sans**
(400, 400 italic, 500, 600) for everything and **IBM Plex Mono** (400, 500) for dates, meta,
status bar, brand and code. `--font-display` is an alias of the sans.

| Role | Spec |
| --- | --- |
| Lead post title | Sans 600, `clamp(1.875rem, 3.8vw, 3rem)`, -0.022em |
| Post h1 | Sans 600, up to 2.75rem |
| Body | 15.5px/1.7, prose 17px/1.8, measure 62ch / 68ch (justified, hyphenated above 480px) |
| Rail label, kicker, `.label` | Sans 600, 11px, tracked 0.12em, uppercase; kicker in accent |
| Meta, dates | Plex Mono 12px, tabular figures |

## 4. Grid and sheet

`--container` 1120px is the sheet width. The sheet floats `--desk-pad` (0.5rem to 1.75rem) in
from the viewport and gets inner padding from `--gutter`. Sections are **rails**: a 180px
label column beside the content, a hairline above (collapses to label-above below 1024px).
Posts: outline sidebar (180px), prose column, empty counterweight track; outline hides below
1100px. Nothing scrolls horizontally down to 360px.

## 5. Shape and elevation

Radius 4px for controls and panes (`--radius`), 3px for the sheet. 1px hairlines. **Only a
sheet casts a shadow** (`--shadow-sheet`: hairline ring plus four soft layers at 4-5% ink).
Menus and the consent dialog are small sheets. No blur, no gradients, no glows.

## 6. Components

- **Menu bar**: full-width `--surface` strip, 2.5rem, hairline below; mono brand with a small
  blue square left, nav right; current item in accent wash. Below 35em the links fold into a
  "More" menu (a small sheet).
- **List pane** (home): toolbar with tag chips (pressed = accent wash and border), rows
  (112px thumbnail, title, mono date right, summary, meta), hover = accent wash, status bar
  with live count.
- **Buttons**: 40px, 4px radius. Primary = blue fill, white text. Secondary = white, strong
  hairline. **Tags**: white chips, strong hairline.
- **Links**: accent with a 40% underline that firms up on hover.
- **Post**: back link, title, summary, mono meta, tag chips, laurel, cover, prose, subscribe
  block, newer/older nav.

## 7. Motion

Fades and 6-8px rises only, 140-360ms, plus 2px arrow nudges. `prefers-reduced-motion`
removes all of it. No parallax, no scroll-linked effects beyond the outline highlight.

## 8. Do / Don't

- Do resolve every colour to a token in `src/app.css` (exception: `components/rpm/`, which
  renders on a light plate and in feed readers; cover SVGs use palette hexes literally).
- Don't add a dark mode, a second accent, a second shadow, rounded cards or pixel fonts.
- Don't fill running text with the accent.

## 9. Responsive

Breakpoints: 1100 (outline), 1023 (rail collapses, lead cover narrows), 767 (lead stacks,
desk padding 0.5rem), 599 (list thumbnails 76px, date stacks under title), 479 (buttons full
width, prose ragged-right), 35em (menu folds).

## 10. Covers

Post covers are 1200x675 SVGs on the `#f5f6f8` plate in palette inks, blue for signal, hairline
`#bcc3cc` strokes. Regenerate PNGs with `npm run og`.

## 11. Content-first hierarchy (home)

The largest type on the site is always a piece of writing. The author greeting is a 17px
masthead line; the newest `hero: true` post leads at up to 3rem, followed by the list pane.
Filtering by tag drops the lead (a filtered view is a list). Nothing may be moved above the
lead that is larger than the lead title.
