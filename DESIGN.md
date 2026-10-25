# DESIGN.md — "Typeset book"

The design contract for oechsner.dev. `src/app.css` is its implementation and holds every
CSS variable in the project; no component hard-codes a colour (`src/lib/components/rpm/` is
the one deliberate exception, because that figure set renders on a light plate and in feed
readers).

## 1. Concept

A well-made monograph. Cream book paper, brown-black ink, one muted sienna accent, a
classical text serif set with true small capitals and old-style figures. Structure comes
from hairlines, one short double rule and type, never from shadows, blur, gradients or
rounded cards. The home page is a contents page; a post is a chapter with a running head,
a chapter number and a wide margin of sidenotes.

Light paper is the only theme. There is no dark mode and no toggle.

## 2. Palette

| Token | Value | Role | on `--bg` | on `--surface` |
| --- | --- | --- | --- | --- |
| `--bg` | `#f4eddc` | page paper | | |
| `--surface` | `#ece3ce` | code blocks, hover wash | | |
| `--plate` | `#fbf8ef` | figures, formulas, covers: the lighter leaf | | |
| `--text` | `#1f1a15` | headings, links, emphasis | 14.8 | 13.5 |
| `--text-secondary` | `#3d342b` | running text | 10.4 | 9.5 |
| `--text-muted` | `#65594b` | meta only | 5.8 | 5.3 |
| `--accent` | `#7a3b1c` | kickers, numerals, hover, focus | 7.3 | 6.7 |
| `--accent-press` | `#54260f` | `:active` | 10.8 | 9.9 |
| `--accent-dim` | `#b48a68` | resting link hairline (decorative, 2.7) | | |
| `--line` | `#d3c6a8` | quiet rules (decorative) | | |
| `--line-strong` | `#a89a7c` | structural rules, control borders (2.4) | | |
| `--series-cool` | `#3d5a73` | second chart hue | 6.2 | 5.7 |

Ratios are WCAG 2.x, measured by script. Every text token is AA on both grounds. The accent
is signal only: it is never a fill behind running text (the one filled use is the primary
button, 7.3 against `--text-inverse`). `--text-muted` has little headroom; re-measure
against `--bg` and `--surface` if it changes.

## 3. Type

Two families, self-hosted from `@fontsource-variable` and imported in `+layout.svelte`.
No third-party font requests.

- **EB Garamond** for everything. The root is 112.5% (106.25% below 480px) because Garamond
  is small for its nominal size; every `rem` on the site scales with it.
- **JetBrains Mono** for code only.

| Role | Setting |
| --- | --- |
| Lead / post title | 400, `clamp(2.25rem, 5.4vw, 3.75rem)`, no tracking |
| Prose | 1.125rem, line-height 1.55, justified, hyphenated (ragged below 480px) |
| Paragraphs | book style: solid, with a 1.5em first-line indent after another paragraph |
| h2 in prose | small capitals, +0.06em; h3 italic; h4 italic semibold |
| Meta labels, nav, tags, buttons | `font-variant-caps: all-small-caps`, +0.09em |
| Rail labels | italic, muted |
| Standfirsts, summaries | italic |
| Figures | old-style by default; `.num` switches to lining tabular (tables, dates in lists) |

The largest type on the site is always a piece of writing, never the author's name. The
home page's imprint is a small-caps line at 1.125rem.

## 4. Grid and measure

- Container 1100px, gutter 1.5rem. Prose measure 35rem (about 66 characters).
- **Rail**: an 11rem italic label column beside a 36rem content column (`Rail.svelte`).
- **Post**: two columns, text 35rem and a 14.5rem right margin, centred as a pair. The
  margin carries the sidenotes (written, length, depth, subjects, the human-written laurel)
  and the contents, sticky, hung from a hairline. Below 1100px the sidenotes fold into a
  block under the chapter opening and the contents drop out.
- Vertical rhythm is the spacing scale `--s-1…--s-11`; section gaps step down at 1023px and 767px.

## 5. Shape and elevation

Corners are 0 to 2px. Rules are 1px hairlines; the one heavier device is a short double
rule closing the home imprint, each chapter opening and the footer. No shadows, with a
single exception: the consent notice is a leaf of paper with `--shadow-4`.

## 6. Motion

Hover is a colour shift to `--accent` plus an underline. Entrances are a 6px, 520ms rise.
Everything honours `prefers-reduced-motion`.

## 7. Components

- **Header**: a solid running head of small-caps nav, hairline appearing on scroll. The
  current page is underlined in ink. Below 35em the links beyond the first fold into "More".
- **Home**: imprint, then the lead chapter (kicker, title, italic summary, meta, cover on a
  bordered plate), then **Contents**: tag filter as dotted small-caps words, and one row per
  post: title, dotted leader, date, italic synopsis, reading time. The lead is the newest
  `hero: true` post. List rows show no thumbnail.
- **Post header**: running head (back to Contents, author), "Chapter" in roman numerals
  (oldest published post is I), title, italic summary, short double rule, the cover as a
  plate. A folio (the chapter number between dashes) closes the text.
- **Prose**: blockquotes italic and indented, tables ruled top and bottom only, code on
  `--surface` between hairlines, figures and formulas on `--plate` with a `--line-strong` border.
- **Buttons**: small-caps, 2px corners; primary is ink on cream, secondary a hairline box.
- **Tags**: not boxes; small-caps words with a dotted underline. Filters turn accent when pressed.
- **Covers** (`static/img/*/cover.svg`, `og.svg`): drawn on `--plate` in the palette above
  (ink, sienna, slate, a muted green). Regenerate PNGs with `npm run og`.

## 8. Accessibility

Visible focus ring (`--focus-ring`: 2px paper, 2px accent). Text AA on both grounds, see §2.
Coarse pointers get 44px targets. No horizontal scroll down to 360px.

## 9. Don't

- Don't add a dark theme, shadows, blur, gradients, rounded cards or emoji.
- Don't add a second accent, or fill a block of text with the accent.
- Don't introduce a third font family.
- Don't put anything above the lead title that is larger than it.
