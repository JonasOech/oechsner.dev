# DESIGN.md — oechsner.dev / Aurora Glass

## 1. Concept

**Frosted glass floating over a night-sky aurora.** A midnight-indigo ground carries four large,
soft colour blobs (violet, teal, rose, blue) painted in pure CSS. Everything raised above it is
glass: a white-alpha fill, a backdrop blur, a luminous 1px edge and a faint top highlight. Shapes
are round (pills, 24–32px cards), type is a light geometric sans, and nothing moves except
hover lifts and a pulsing status dot.

Tone: calm, luminous, modern. Content-first: the largest type on the site is always a piece of
writing (the lead post title, 3.5rem), never the author's name (§11 of the old spec still holds).

## 2. Theme

Dark only. Do not add a light mode or toggle: the aurora needs a dark ground to read as light.

## 3. Palette (all in `src/app.css`, never hard-coded in components)

| Role | Tokens | Notes |
| --- | --- | --- |
| Ground | `--bg #080b1d`, `--bg-deep #050716` | midnight indigo |
| Aurora (background only) | `--aurora-violet/teal/rose/blue` | alpha blobs, tiled every 1100px down the page |
| Glass | `--glass`, `--glass-hover`, `--glass-strong`, `--glass-tint` | white at 5.5 / 9 / 13%; `--glass-tint` is the darker, near-opaque variant used behind long prose, the scrolled nav and the consent banner |
| Edges | `--glass-border` (16%), `--glass-edge` (32%), `--line` (11%) | luminous hairlines |
| Ink | `--text #f5f6ff`, `--text-secondary #c9cee9`, `--text-muted #a2a9d0` | body prose is `--text-secondary` |
| Accent | `--accent` aqua, `--violet`, `--rose`; `--grad-accent` aqua to lilac | gradient fills carry dark `--text-inverse` text |
| Feedback | `--danger`, `--success` | |

Contrast: body text sits on glass over the darkest part of the mesh or on `--glass-tint`;
`--text-muted` is for meta only. Re-measure `--text-muted` against `--bg` and a violet blob
if changed.

## 4. Type

One family: **Outfit** (300 / 400 / 500 / 600, Google Fonts as before) for everything; **JetBrains Mono**
for code. Roles: lead / hero titles 300 with `--grad-text`; headings 500; prose body 300 (posts) or 400 (UI);
labels and pills 500, letter-spaced 0.14–0.16em uppercase.

## 5. Grid and spacing

Container 1120px, 1.5rem gutter. Single column of stacked glass sections; the home post list is an
`auto-fill` grid of cards (min 22rem). Post pages centre a 70ch sheet with the outline panel to
its left at 1100px and up. Spacing tokens `--s-1`..`--s-11`; section gap 4rem (3rem on tablet).

## 6. Shape and depth

`--r-sm 12`, `--r-md 18`, `--r-lg 24`, `--r-xl 32`, `--r-pill 999`. Depth comes from blur
(`--glass-blur` 22px, 16px on phones), `--shadow-glass` and, on the lead card, a violet glow.
Always provide the `@supports not (backdrop-filter)` fallback to `--surface`.

## 7. Motion

Entrance rise, hover lift (`translateY(-3px)` on cards), arrow nudges, the status-dot pulse.
All collapse under `prefers-reduced-motion`.

## 8. Components

- **Nav**: floating glass pill, centred; current page is a filled gradient pill. Below 35em the
  secondary links fold into a "More" glass dropdown.
- **Rail** (section): pill label with a glowing dot above a glass panel (`wide` sections skip the panel).
- **Lead card**: large glass card, text left, cover right; stacks on mobile.
- **Article card**: glass card, cover window on top.
- **Buttons / tags / fields**: pills. Primary is the aqua-lilac gradient; secondary is glass.
- **Footer**: one glass slab with pill links and a colophon.
- **Prose sheet**: post body is a `--glass-tint` rounded sheet.
- `src/lib/components/rpm/` keeps its own light plate and is exempt from the no-hard-coded-colour rule.

## 9. Do / Don't

- Do route every colour through a token; do keep blur at or below 22px.
- Don't stack glass directly on glass more than two deep, put long prose on bare aurora, add a light theme, use emoji or icon fonts.
