# DESIGN.md — oechsner.dev, "Split page"

## 1. Concept

A printed leaflet folded in two. The left column is fixed and carries who and where: name,
one-line description, navigation, contact links. The right column is the paper that scrolls.
A single vertical hairline separates them. Ink on warm white, one deep green for signal,
structure from type and rules only: no shadows, glows, gradients, blur or rounded cards.

Below 64em (tablets and phones) the left column becomes an ordinary top header (name, then
the nav on one wrapping row) and the page is a single column.

Tone: calm, confident, portfolio-grade.

## 2. Palette

All colours are tokens in `src/app.css`. Contrast is WCAG 2.x, measured by script.

| Token | Hex | On `--bg` | On `--surface` | Role |
| --- | --- | --- | --- | --- |
| `--bg` | `#fbfaf7` | | | Paper ground |
| `--surface` / `--bg-deep` | `#f3f1ec` | | | Code wells, plates, pressed states |
| `--surface-hover` / `-active` | `#ece9e2` / `#e8e5dd` | | | Interaction wash |
| `--text` | `#17181a` | 17.0 | 15.7 | Titles, ink |
| `--text-secondary` | `#34373b` | 11.5 | 10.6 | Body copy |
| `--text-muted` | `#5c5f63` | 6.2 | 5.7 | Meta, rail labels only |
| `--accent` | `#1b5e4b` | 7.3 | 6.8 | Links, kickers, current page, hover |
| `--accent-dim` | `#134a3a` | 9.7 | 9.0 | Pressed |
| `--series-cool` | `#2f5f8a` | 6.4 | 6.0 | Second chart series, string tokens |
| `--danger` | `#a02828` | 7.1 | 6.6 | Errors |
| `--line` | `#dedad0` | | | Hairlines |
| `--line-strong` | `#8f8b7e` | 3.3 | 3.0 | Control borders (non-text, 3:1) |

The accent is never a fill behind running text. Dark mode does not exist.

## 3. Type

Self-hosted `@fontsource-variable`: Newsreader (opsz, wght, with italics), Inter, JetBrains Mono.

| Role | Face | Notes |
| --- | --- | --- |
| Titles, lead title, entry titles | Newsreader 500 | `font-variation-settings: 'opsz' 18` keeps stroke contrast low at every size |
| Post prose, lead summary, About lede | Newsreader 400, 19px / 1.7 | Justified with hyphenation above 480px |
| Rail labels | Newsreader italic 400, 16px | muted ink |
| UI, meta, lists, tags | Inter | Dates and numbers use tabular figures |
| Kickers, nav, tags | Inter 600, 11px, tracked 0.12em, uppercase | |
| Code | JetBrains Mono | |

Largest type: the lead post title, `clamp(2.25rem, 5.2vw, 3.5rem)`. The name in the rail is 24px.
A post h1 tops out at 2.875rem.

## 4. Grid

- `.shell`: at 64em and up, `19rem | 1fr`. The rail is `position: sticky; height: 100dvh`.
- `.stage` column: content is centred at max 58rem with a fluid gutter (`clamp(1.25rem, 5vw, 3.5rem)`).
- Rails (`.rail`): an 8.5rem label column and a body of at most 62ch, ruled above with a hairline.
  Under 48em the label stacks above its content.
- Posts: one 37rem column. The outline is drawn into the left rail between the nav and the
  contact links (`position: fixed`, markup stays in the article so it prerenders). Below 64em it is hidden.
- Home: intro, then the lead (2px ink rule, kicker, title, summary beside a 17rem cover), then a
  ruled list of posts with 8.5rem thumbnails.

## 5. Shape, depth, motion

- Radius 2px (`--radius`), 1px hairlines. The single heavy line is the 2px rule above the lead.
- No shadows (shadow tokens are no-ops), no blur, no gradients.
- Interaction language: colour shifts to green plus a hairline underline. Buttons invert from
  outlined to filled. Current nav item gains a short green rule.
- Motion: a 6px fade-up on entry, a 3px arrow nudge. Everything respects `prefers-reduced-motion`.

## 6. Components

- **Rail (Header.svelte)**: name, description (hidden on posts and on short windows), vertical nav, contact links with RSS.
- **Rail section (Rail.svelte)**: italic label + body.
- **ArticleRow**: hairline-ruled row, serif title, summary, meta, thumbnail; hover turns the title green.
- **Tags**: outlined small caps; a pressed filter inverts to ink.
- **Buttons**: `.btn--primary` ink fill, `.btn--secondary` hairline outline.
- **Figures and widgets**: sit on `--plate` (white) with a hairline; the rpm set keeps its own literal colours.
- **Covers**: vector, on a paper plate with ink and green strokes; no glow or dot grid.

## 7. Content-first home (hard rule)

The largest type on the home page is always a piece of writing. The author name is small and lives in the rail.

## 8. Accessibility

Body text is at least 10.6:1. Focus is a 2px paper gap plus a 2px green ring. Targets are 44px on
coarse pointers. No horizontal scroll down to 360px.

## 9. Don't

- Add a dark mode or theme toggle.
- Hard-code a colour in a component (the rpm figures excepted).
- Use shadows, blur, gradients, rounded cards or a second accent colour.
- Put the author's name in a larger size than the lead post title.
