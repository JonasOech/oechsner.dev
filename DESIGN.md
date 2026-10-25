# DESIGN.md — oechsner.dev

> **Refined broadsheet.** The calm, grown-up cousin of the editorial-print idea: warm
> newsprint, deep ink, one muted oxblood. Think weekend-edition newspaper, not tabloid.
> `src/app.css` is the implementation and holds every CSS variable in the project.

## 1. Concept

A single serif superfamily (Newsreader) set on warm paper, structured only by hairline
rules and small caps. The home page is a front page: a lead story in the wide column, a
ruled column beside it holding the author's note and the latest pieces, then a two-column
archive. Nothing is decorated; every rule, label and colour carries information.

**Home stays content-first.** The largest type on the site is always a piece of writing
(the lead post title). The author's name lives in the masthead at about 1.9rem, a fraction
of the lead title.

## 2. Palette

Light only (warm newsprint). There is no dark mode and no theme toggle. The accent is used
for signal only (kickers, rail labels, link underlines, hover, focus, active state), never
as a fill behind running text.

| Token | Value | Role | on `--bg` | on `--surface` |
| --- | --- | --- | --- | --- |
| `--bg` | `#f6f1e7` | page paper | — | — |
| `--surface` | `#eee8da` | inline code, hovered reference, widget shell | — | — |
| `--bg-deep` | `#ebe4d4` | code blocks | — | — |
| `--surface-active` | `#e0d8c4` | pressed state, chips | — | — |
| `--plate` | `#fbf8f1` | lighter sheet under diagrams and widget panels | — | — |
| `--text` | `#1c1a17` | headings, ink | 15.4 : 1 | 14.2 : 1 |
| `--text-secondary` | `#3b3731` | body copy | 10.5 : 1 | 9.7 : 1 |
| `--text-muted` | `#665d4f` | meta, datelines, small caps | 5.75 : 1 | 5.3 : 1 |
| `--accent` | `#7b1e2b` | oxblood signal | 9.0 : 1 | 8.3 : 1 |
| `--accent-dim` | `#5f1622` | pressed link | 11.5 : 1 | 10.6 : 1 |
| `--line` | `#d9d1bf` | hairlines between items | decorative | |
| `--line-strong` | `#b8ae98` | section rules, control borders | decorative | |
| `--series-cool` | `#2f5f86` | second chart series | — | — |

`--text-muted` also clears AA on `--surface-active` (4.56 : 1) and `--bg-deep` (5.1 : 1).
It is the token with the least headroom: re-measure against both `--bg` and
`--surface-active` before touching it. Paper on oxblood (primary-button hover) is 9.0 : 1.

## 3. Type

One family plus mono. Self-hosted through `@fontsource-variable/newsreader` (roman and
italic, with the optical-size axis, so display sizes get a sharper cut automatically via
`font-optical-sizing: auto`) and `@fontsource-variable/jetbrains-mono` (code only).
Imported in `src/routes/+layout.svelte`; no request ever leaves the origin.

Hierarchy comes from weight, italic and small caps, never from a second face.

| Role | Style |
| --- | --- |
| Lead / post title | 500, `clamp(2.375rem, 4.6vw, 3.625rem)`, line-height 1.06, tracking -0.018em |
| Standfirst (summary) | italic 400, 1.3125rem, secondary ink |
| Section / entry title | 500, 1.375–1.4375rem |
| Body | 400, 1.0625rem / 1.65 |
| Post prose | 400, 1.1875rem / 1.7, justified with hyphenation above 480px |
| Kicker, rail label, nav, buttons | 500 `all-small-caps`, tracking 0.09–0.1em, accent or muted |
| Byline / meta | small caps, tabular lining figures, muted |
| Code | JetBrains Mono, 0.8125rem |

No drop caps, no text decoration beyond the link underline. Measure: 66ch prose, 62ch
elsewhere.

## 4. Grid and structure

- Container 1120px, 24px gutters. Spacing scale `--s-1 … --s-11` (4px to 176px).
- **Masthead** (not sticky; it scrolls away like a nameplate): dateline left, name centred,
  dateline right, then one ruled nav strip (hairline above and below). Below 600px the
  datelines drop out.
- **Front page**: `minmax(0,1fr) 17.5rem`, a vertical hairline between the columns. Under
  800px it stacks.
- **Rail**: a section with a hairline above, an accent small-caps label in a 180px column
  and content beside it; the label stacks above the content under 1024px.
- **Post page**: three tracks (outline 184px / 66ch text / marginalia 184px). The outline
  is a sticky ruled list on the left; the right margin holds the nerd rating, tags and the
  human-written laurel, hanging beside the headline. Under 1100px the outline hides and
  the marginalia become a quiet row under the byline.
- Archive: two newspaper columns, each item with a hairline above.

## 5. Shape, depth, motion

- Radius 2px everywhere (buttons, tags, code, widgets). Rules are 1px hairlines.
- No shadows, gradients or blur. The single exception is `--shadow-4`, a very soft
  paper-lift under the consent panel, which floats over running text.
- Interaction language: colour shift to oxblood (links, titles, labels); the current
  section carries an oxblood hairline. Buttons: ink fill (primary) or hairline outline
  (secondary), both turning oxblood on hover.
- Motion: a fade and 6px settle on entry (`.enter`, `.reveal`); everything is disabled
  under `prefers-reduced-motion`.
- Focus: a 2px paper gap plus 2px oxblood ring, on every interactive element.

## 6. Components

`Header` (masthead + nav, 'More' disclosure only below 19em), `Footer` (colophon in three
columns: name and note, sections, legal), `Rail`, `ArticleRow` (hairline item with small
cover), `PostOutline`, `Subscribe` (ruled strip), `Nerdyness`, `HumanWritten`,
`ConsentBanner`, `LatexBlock`, figures in `rpm/` (draw on `--plate`, a lighter sheet of
paper, and are the one place allowed to hard-code colour).

## 7. Covers

Each `static/img/<post>/cover.svg` is drawn on the same paper ground with ink strokes and
oxblood as the single highlight, with a slate blue for secondary lines. The old glow and
dot-grid plates were removed. Run `npm run og` after editing and commit both files.

## 8. Do / don't

- Do keep one accent, one serif, hairlines only.
- Don't add a second display face, drop caps, double rules, shadows, gradients or cards.
- Don't hard-code a colour in a component; add or reuse a token in `src/app.css`.
- Don't put anything above the lead post's title in size.

## 9. Accessibility

Body text is AA (10.5 : 1). Visible focus everywhere, skip link, reduced motion respected,
44px touch targets on coarse pointers, no horizontal scroll down to 360px (checked on every
prerendered route).
