# DESIGN.md — Neo-brutalism

The design contract for oechsner.dev. `src/app.css` is its implementation and holds every
CSS variable in the project. The idea: the site is a sheet of graph paper with things
stuck to it. Everything is a flat colour block with a thick ink outline and a hard,
un-blurred shadow; nothing is soft, translucent or gradient.

## 1. Principles

1. **Flat colour, thick ink.** Fills are saturated and opaque. Every box, button, tag and
   image has a 3px ink border (2px for small pills). No gradients, no blur, no glass.
2. **Hard offset shadows.** `--shadow-1…4` are `Npx Npx 0 var(--ink)`. A shadow is a
   solid copy of the box, never a glow.
3. **Slightly crooked.** Labels and stickers rotate by 0.5–2deg. Cards, body text and
   forms never rotate (a body paragraph never leaves the grid).
4. **Raw boxy layout.** Square corners. Pills (`999px`) are only for tags and nav links.
5. **Bold hover.** Hover lifts an element up-left and grows its shadow; press sinks it
   into the shadow (`translate(5px,5px)`, shadow `0`). Colour flips to a sticker colour.
6. **Content-first home.** The largest type on the site is always a piece of writing,
   never the author's name. The greeting card is capped at `1.75rem`; the lead post title
   goes up to `4.75rem`.

## 2. Palette

Light only. There is no dark mode and no theme toggle; ink-on-paper is the concept.

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#111111` | Borders, shadows, all text on colour |
| `--bg` / `--paper` | `#fff8ea` | Page, with a 32px graph-paper grid at 5.5% ink |
| `--surface` | `#ffffff` | Cards, article sheet, inputs |
| `--bg-deep` | `#f1e9d2` | Sunken: code blocks, inline code |
| `--yellow` | `#ffd93b` | Header, lead post, post title, primary buttons |
| `--pink` | `#ff8fc7` | Hover flood, secondary stickers |
| `--blue` | `#7cc4ff` | Greeting card, callouts |
| `--lime` | `#b7f04a` | Subscribe block, secondary hover |
| `--orange`, `--lilac` | `#ff9a3c`, `#c9b0ff` | Fourth card tone, consent banner |
| `--accent` | `#2b36e8` | The one text-safe colour (markers, widgets); 7:1 on `--bg` |

Text: `--text` `#111`, `--text-secondary` `#2a2a2a`, `--text-muted` `#4d4d4d` (meta only;
6:1+ on paper and on every sticker colour — re-measure if changed). Sticker colours
only ever carry ink text. Never put `--accent` text on a sticker fill.

## 3. Type

- **Bricolage Grotesque** (variable, 800): display, headings, labels, wordmark. Tight
  tracking (`-0.02em` to `-0.035em`), line-height about 1.
- **DM Sans** (variable): body (`1rem/1.7`), buttons (800), meta.
- **JetBrains Mono** (variable): code and numeric data.
- Fonts are self-hosted from `@fontsource-variable/*`, imported in `+layout.svelte`. No
  third-party font host.

## 4. Grid and spacing

- Container `1180px`, gutter `1.25rem`. Spacing scale `--s-1…--s-11` (4px to 11rem).
- Section gap `6rem` (`4rem` under 1024px, `3rem` under 768px).
- Home: greeting card + utility buttons in a flex row, lead post as one full-width yellow
  slab (text left, tilted cover right), then a two/three-column card grid
  (`auto-fill, minmax(330px, 1fr)`), then About.
- Post: three tracks (outline 200px, article 74ch, empty 200px) at 1180px and up. Title
  slab (yellow), cover, then the article on a white sheet with its own border and shadow.
- `Rail` is a rotated colour sticker label above its content; its tone cycles
  yellow, pink, blue, lime by `section` position (`--tone`).

## 5. Shape

Radius `0`, except pills. Border `--bw: 3px`, thin `--bw-thin: 2px`. Shadows as in §1.
Focus ring: `--focus-ring`, a yellow 3px halo inside a 3px ink ring, visible on every fill.

## 6. Components

- **Header**: yellow bar, 3px ink bottom border (plus a hard shadow once scrolled). Black
  rotated wordmark left; pill nav right, current page inverted. Below 35em the non-primary
  links fold into a "More" panel (white box, hard shadow).
- **Footer**: ink block with a four-colour strip on top, yellow wordmark sticker, outlined
  pill links, dashed rule, legal row.
- **Buttons** `.btn--primary` (yellow, floods pink on hover) and `.btn--secondary` (white,
  floods lime). 52px minimum height. Full width below 480px.
- **Tags**: uppercase pills, 2px border; interactive ones carry a small shadow and tilt on
  hover; pressed = inverted ink.
- **Cards** (`ArticleRow`): white, bordered, `--shadow-3`; cover on top, or a coloured bar
  when there is none; `--tone` set by the parent.
- **Entries** (`.entry`): boxed timeline items.
- **Prose**: `h2` are rotated colour stickers, `h3` get a thick pink underline,
  blockquotes are yellow slabs, links are a marker-pen underline that floods on hover,
  tables have ink grid lines and yellow heads, code sits in a sunken bordered box.
  Widgets and notes are bordered boxes with hard shadows. `src/lib/components/rpm/` is
  exempt from the no-hard-coded-colour rule and renders on a white plate.
- **Consent banner**: lilac slab, hard shadow, fixed to the bottom.

## 7. Icons

Inline SVG in `Icon.svelte`, stroke-based; buttons thicken the stroke to 2.25. No emoji,
no icon font.

## 8. Motion

Short and mechanical: 120–180ms transitions on `--ease-out`, 420ms stamp-in entrances
(`.enter`, `.reveal`: rise 18px with a slight rotation). Under `prefers-reduced-motion`
everything is instant and visible.

## 9. Accessibility

Body text meets AA everywhere (ink on paper/white/sticker). Focus is always visible.
Touch targets are 44px minimum (`pointer: coarse`) and buttons 52px. The header is sticky
and `scroll-padding-top` clears it.

## 10. Responsive

Tiers at 1179 (outline hides), 1023, 767, 479 and 360px. Below 768px shadows shrink
(`--shadow-3` 6px, `--shadow-4` 8px), the lead stacks with the cover between meta and the
call to action, and the post body padding drops to `1rem`. Under 480px prose is ragged
rather than justified. Nothing scrolls horizontally down to 360px.

## 11. Don'ts

- No gradients, blur, translucency or soft shadows.
- No hard-coded colour outside `app.css` (and `rpm/`).
- No light/dark toggle; no second theme.
- Never set the author's name larger than a piece of writing.
- Never rotate body text, form fields or tables.
