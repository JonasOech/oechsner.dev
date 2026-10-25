# DESIGN.md — Photocopy Zine

The design contract for oechsner.dev. `src/app.css` is its implementation and holds every
CSS variable; no component hard-codes a colour (`src/lib/components/rpm/` is the one
exception, it draws on a light plate).

## 1. Concept

A photocopied zine: cream stock, two riso inks (fluorescent orange and blue-black/blue),
masking tape, staples, rubber stamps, highlighter, torn paper and cut-out ransom-note
headlines. Everything is slightly crooked and hard-edged. **Body text is never decorated:**
posts and paragraphs are plain, high-contrast serif on flat cream.

## 2. Palette (light only; no theme toggle)

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#f2ead7` | page paper |
| `--surface` / `--surface-hover` / `--surface-active` | `#fbf7ea` / `#fffdf5` / `#ebe0c4` | sheets laid on the page |
| `--text` | `#14153a` | ink one: headings, rules, hard shadows (14.6:1 on `--bg`) |
| `--text-secondary` | `#2a2c55` | body copy (11:1) |
| `--text-muted` | `#555777` | meta text only (5.3:1 on the darkest paper; re-measure if changed) |
| `--accent` | `#ff5a1f` | ink two, a **fill**: tape, highlighter, buttons. 2.6:1, never carries text |
| `--accent-dim` | `#a63305` | text-safe orange (>= 4.5:1) |
| `--blue` | `#2338b8` | links, stamps, handwriting (7.5:1) |
| `--bg-deep` / `--paper` | `#14153a` / `#f2ead7` | the dark footer band and its cream type |

Ink on `--accent` is `--text-inverse` (= `--text`), 5.6:1.

## 3. Type roles

- **Anton** (`--font-head`): condensed headlines, nav, buttons, rail labels. Uppercase.
- **Special Elite** (`--font-type`): typewriter. Meta, labels, tags, stamps, summaries.
- **Permanent Marker** (`--font-marker`): handwritten asides only (greeting, scrawls). Short lines.
- **Source Serif 4** (`--font-body`, alias `--font-sans`): all reading text.
- **JetBrains Mono**: code.

Largest type on the site is always writing (section 8): the lead post's ransom title.

## 4. Texture

- Grain: one fixed `body::before` layer of SVG `feTurbulence`, multiplied (CSS/SVG only).
- Halftone: blue dot screen plus orange bleed at the top (`body::after`), faded out.
- Shadows are hard offsets (`--shadow-1..4`, `--shadow-orange`), never blurred.
- Torn edge: `--torn-top` clip-path (used on the footer). Tape ends: `--tape-cut`.

## 5. Shape and rotation

Radius is 0 (only tape ends, the feed mark and stamps break that). Borders are 2px
`--text`. Elements sit at +/-0.3 to 2.5 degrees; hover straightens them and lifts them.
Body text blocks are never rotated.

## 6. Components

- **Collage kit** (app.css): `.taped` (+`--one`), `.hl` highlighter, `.stamp`, `.scrawl`,
  `.slip`, `.staple`.
- **Ransom** (`Ransom.svelte`): a title split into per-word cut-outs in six paper/type
  combinations. Words stay real text with real spaces.
- **Rail**: an ink-black strip label (rotated) beside a content column; stacks below 1024px.
- **ArticleRow**: a clipping with number tab, hard shadow, photocopied thumbnail.
- **Buttons / tags**: cut labels with hard shadows; they press into the shadow on `:active`.
- **Header**: static (not sticky) masthead: tape-strip brand left, nav right, the current page
  highlighted; below 35em all but "Writing" fold into "More". Footer: torn, dark ink, colophon.
- **Prose**: justified serif (ragged below 480px), h2 with highlighter strip, pull-quote
  slips, code on a cream slip with a hard shadow, widgets as taped sheets.

## 7. Motion

Elements "slap" in once (`.enter`, 560ms, opacity plus a small settle), hovers straighten and
lift with a snappy ease. All of it is disabled under `prefers-reduced-motion`.

## 8. Home page: content first

The cover (greeting in marker, typed tagline slip, issue stamp) is deliberately small. The
lead post's ransom headline (up to 4.25rem) is the largest type on the site; the author's name
is never display type. Filtering by tag drops the lead.

## 9. Responsive and a11y

Container 1120px, gutter 1.25rem, works to 360px with no horizontal scroll. Focus is a double
ring in `--blue`. Interactive targets are >= 44px on coarse pointers. Decorative layers are
`aria-hidden` or pseudo-elements.

## 10. Don'ts

No second theme, no emoji or icon font, no blur or soft shadows, no orange text on paper
(use `--accent-dim`), no rotation on running prose, no new hard-coded colours.
