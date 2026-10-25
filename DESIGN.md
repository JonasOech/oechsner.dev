# DESIGN.md — oechsner.dev ("Editorial print")

The design contract. `src/app.css` is its implementation and holds every CSS variable in the
project; components only ever reference `var(--…)` tokens (the one exception is
`src/lib/components/rpm/`, whose figures render on a light plate and in feed readers).

## 1. Concept

A broadsheet front page crossed with a literary magazine. Warm paper, black ink, one spot
colour (vermilion), hairline rules, a masthead, columns, small-caps datelines, drop caps and
marginalia. Nothing glows, floats or casts a shadow: paper does not. Motion is limited to a
gentle fade-up on load and underline/colour changes on hover.

**Theme**: light only (paper). There is no toggle and no dark mode.

## 2. Palette

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#f4efe4` | Paper; page ground |
| `--bg-deep` | `#e7dfcd` | Code blocks, deepest wells |
| `--surface` | `#ebe4d4` | Widgets, callouts, hover wash |
| `--plate` | `#fbf8f1` | Lighter sheet under figures and cover images |
| `--text` | `#17140f` | Ink: headlines, heavy rules, primary buttons |
| `--text-secondary` | `#3a352c` | Body copy |
| `--text-muted` | `#625a4c` | Meta, captions (5.4:1 on `--surface`; re-measure against `--bg` and `--surface` if changed) |
| `--line` / `--line-strong` | `#cfc6b0` / `#a69d86` | Hairlines / image borders and tag boxes |
| `--rule` | `var(--text)` | The heavy rule: masthead, section openers, card tops |
| `--accent` | `#a82e19` | Spot colour: kickers, rail labels, drop caps, bullets, hover (6.0:1 on `--bg`) |
| `--accent-dim` | `#85230f` | Pressed state |
| `--series-cool` | `#2d5a87` | Second ink for two-series figures |
| `--success` / `--danger` | `#3d6a2c` / `#b3261e` | Code strings / errors |

Rule of thumb: ink for structure, vermilion for *signal only* — never for body text blocks,
never as a fill behind text.

## 3. Type

Self-hosted via `@fontsource-variable/*` (imported in `src/routes/+layout.svelte`).

- **Playfair Display** (`--font-display`): headlines, wordmark (italic 800), pull quotes,
  drop caps, in-prose headings. Weights 700–800 for titles, italic for standfirsts and
  quotes.
- **Newsreader** (`--font-text`, optical-size axis): everything else — body, UI, meta.
  Small-caps roles are set as uppercase with `0.12–0.2em` tracking at `0.6875–0.75rem`,
  weight 600.
- **JetBrains Mono** (`--font-mono`): code only.

| Role | Size | Notes |
| --- | --- | --- |
| Home lead title (`.hero-title`) | `clamp(2.375rem, 8.2vw, 4.5rem)` / 800 / 1.02 | Largest type on the site |
| Post title | `clamp(2rem, 6vw, 3.5rem)` / 800 | Centred, `max-width: 22ch` |
| Wordmark | `clamp(1.625rem, 4.4vw, 2.5rem)` italic | Deliberately below any lead title |
| Standfirst | `1.3125rem` italic | Summaries |
| Body prose | `1.1875rem` / 1.7, justified, hyphenated (left-aligned below 480px) | `--measure-prose: 38rem` |
| Kicker / rail label | `0.75rem` caps `0.2em`, accent | Above headlines, in section margins |
| Meta | `0.75rem` caps `0.12em`, muted | Dates, read times, bylines |

## 4. Grid and layout

- Container `1180px`, `1.5rem` gutters. Home front page is a 12-column grid from 1024px:
  author's note (cols 1–3, ruled on its right), lead story (cols 4–12: text 2/3, cover
  figure with caption 1/3). Below 1024px everything stacks, **lead first**.
- **Section opener** (`.rail`): a thick-over-thin double rule, a 200px margin column holding a
  small-caps accent label, content beside it. Collapses to label-above-content under 1024px.
- **Archive**: `repeat(auto-fill, minmax(17rem, 1fr))` cards — hairline top rule, cover plate
  (3:2), kicker (first two tags), headline, standfirst, byline.
- **Post** (≥1100px): three tracks — table of contents (left margin), 38rem text column,
  marginalia (right margin: filed-under tags, depth, human-written laurel). On narrow
  screens the marginalia falls into the flow between byline and cover.
- Spacing scale `--s-1…--s-11` (0.25rem → 11rem); section gaps step down at 1023px/767px.

## 5. Shape, rules, elevation

Square corners everywhere (`border-radius: 0`). Rules do the work shadows would: 1px ink
rule (card tops, bylines), `4px double` (section openers, footer, post navigation,
subscribe box, consent panel), 6px ink bar above the masthead. Elevation tokens exist but are
near-zero; only the consent panel and the "More" menu use one.

## 6. Components

- **Masthead** (`Header.svelte`): strap line (small caps), italic wordmark, italic tagline,
  nav between two ink hairlines; current page marked by a 3px vermilion bar. Scrolls with the
  page (not sticky). Below 21em the links fold into a "More" disclosure.
- **Footer** (`Footer.svelte`): double rule, asterism, three-column colophon
  (Colophon / Sections / Imprint), copyright line.
- **Buttons** (`.btn`): square, uppercase tracked; primary = ink fill (hover vermilion),
  secondary = ink outline (hover inverts).
- **Tags** (`.tag`): small-caps, hairline box; pressed = ink fill.
- **Links**: ink with a vermilion underline; hover vermilion text, thicker underline.
- **Drop cap** (`.dropcap`): 4.6em Playfair 800 in vermilion, floated. Applied to the first
  paragraph of a post body (or the paragraph after a leading `##`), the about intro and the
  home About block.
- **Pull quote** (`.pullquote`): large italic Playfair between two ink rules.
- **Prose** (`.prose`): `h2` with a top rule, `h4` as small-caps label, blockquote as italic
  display with a vermilion left bar, `hr` as a `∗ ∗ ∗` asterism, vermilion list bullets,
  code in a `--bg-deep` well between two rules, widgets with a double top rule.
- **Fields** (`.field`): underline-only, ink baseline, vermilion on focus.

## 7. Motion and a11y

- `.enter` fade-up (≤ 560ms) and `.reveal` on scroll; both disabled under
  `prefers-reduced-motion`.
- Focus: `--focus-ring` (2px paper gap + 2px vermilion) on every interactive element.
- Contrast: body ink 10.6:1, muted 5.4–5.9:1, accent 5.4–6.0:1, all ≥ 4.5:1.
- Touch targets ≥ 44px under `pointer: coarse`.

## 8. Content-first hierarchy

The largest type on the site is always a piece of writing: the home lead title (up to 4.5rem)
outranks the wordmark (≤ 2.5rem), the greeting (1.625rem) and every page title. The author's
note is secondary on the front page and comes *after* the lead on small screens.

## 9. Don'ts

- No dark mode, toggle, glow, glassmorphism, rounded cards or drop shadows on content.
- No hard-coded colours outside `src/app.css` (and `rpm/`).
- No fourth typeface; no sans-serif; no emoji or icon fonts (inline SVG in `Icon.svelte`).
- Vermilion is a signal, not a fill. Don't tint paragraphs or panels with it.
