# DESIGN.md — oechsner.dev

> Derived from the **Elevate** portfolio template by Gaël Duval
> ([dribbble.com/shots/20829830](https://dribbble.com/shots/20829830-Portfolio-Template-Elevate)).
> Reference audit: see §10.

---

## 1. Visual Theme & Atmosphere

**Design philosophy** — *Quiet authority.* A near-black canvas with almost nothing on it, so the
few things that are there carry all the weight. Content sits in one narrow column with a serif
rail label to its left, like a printed monograph. Nothing moves unless you move it.

**Atmosphere keywords**: nocturnal · editorial · precise · warm-cool ambient · unhurried · engineered

**One-line tone**: *A CS student's notebook, typeset like a journal and lit like a darkroom.*

The page is not flat black. Two enormous, very diffuse radial glows — one warm copper, one cold
slate — sit behind the content at the top corners, and a 1px dot grid at ~4% opacity covers
everything. Both are barely perceptible; you notice them only if you look for them. That is the
point: the background has depth without asking for attention.

**Positioning**: personal portfolio + technical blog for Jonas Öchsner, B.Sc. Applied Computer
Science (Bamberg), working on ML and data-protection systems. Audience is recruiters, lab
supervisors, and other engineers — people who skim fast and distrust decoration.

---

## 2. Color Palette & Roles

All colors are CSS variables with an RGB triple companion so `rgba()` composition never needs a
second hex. **Dark is the only theme** — this design commits to it (see §8, Don't #2).

```css
:root {
  /* — Canvas ————————————————————————————————— */
  --bg:              #0e0f12;   --bg-rgb:              14, 15, 18;
  --bg-deep:         #0a0b0d;   --bg-deep-rgb:         10, 11, 13;
  --surface:         #16171b;   --surface-rgb:         22, 23, 27;
  --surface-hover:   #1c1d22;   --surface-hover-rgb:   28, 29, 34;
  --surface-active:  #212228;   --surface-active-rgb:  33, 34, 40;

  /* — Ink ———————————————————————————————————— */
  --text:            #f4f4f6;   --text-rgb:            244, 244, 246;
  --text-secondary:  #a3a4ac;   --text-secondary-rgb:  163, 164, 172;
  --text-muted:      #80818a;   --text-muted-rgb:      128, 129, 138;
  --text-inverse:    #0a0b0d;   --text-inverse-rgb:    10, 11, 13;

  /* — Structure —————————————————————————————— */
  --line:            #24252b;   --line-rgb:            36, 37, 43;
  --line-strong:     #34353d;   --line-strong-rgb:     52, 53, 61;

  /* — Accent: copper, sampled from the blog page's glow —— */
  --accent:          #e0a85c;   --accent-rgb:          224, 168, 92;
  --accent-dim:      #a87a3c;   --accent-dim-rgb:      168, 122, 60;
  --accent-wash:     rgba(224, 168, 92, 0.10);

  /* — Ambient glows (background only, never on text) ——— */
  --glow-warm:       rgba(176, 108, 46, 0.16);
  --glow-cool:       rgba(86, 108, 148, 0.13);

  /* — Feedback ——————————————————————————————— */
  --danger:          #e5484d;   --danger-rgb:          229, 72, 77;
  --success:         #46a758;   --success-rgb:         70, 167, 88;

  /* — Focus —————————————————————————————————— */
  --focus-ring:      0 0 0 2px var(--bg), 0 0 0 4px rgba(var(--accent-rgb), 0.75);
}
```

| Role | Variable | Where |
| --- | --- | --- |
| Page ground | `--bg` | `body` |
| Footer band, code blocks | `--bg-deep` | deepest wells |
| Raised panel | `--surface` | secondary button, tag chips, hovered article row |
| Body copy | `--text-secondary` | all paragraphs — never `--text` for long prose |
| Headings, active nav | `--text` | h1–h4, `aria-current` nav item |
| Rail labels, meta, dates | `--text-muted` | `ABOUT`, `ARTICLES`, "8 min read" |
| Hairlines | `--line` | dividers, secondary button border |
| Link hover, focus, tags | `--accent` | interactive affordance only |

**Contrast** — measured, not estimated. Against `--bg`: `--text` 16.6:1, `--text-secondary`
7.7:1, `--text-muted` 4.95:1, `--accent` 9.1:1. `--text-muted` must also clear AA against
**`--surface`**, because tags sit on it and article rows land on it while hovered — there it
measures 4.63:1. All clear 4.5:1 for normal-size text, so nothing on this page relies on the
large-text exemption.
`--text-muted` is nonetheless reserved for meta text — dates, rail labels, captions — never
body prose, for hierarchy reasons rather than contrast ones.

> `--text-muted` was originally `#6d6e77`, which measures **3.79:1** on `--bg` and fails AA.
> If you darken it again for atmosphere, re-measure against **both** `--bg` and `--surface` —
> this is the one token in the palette with no headroom, and `--surface` is the tighter test.

---

## 3. Typography Rules

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:opsz,wght@9..40,400..700&family=JetBrains+Mono:wght@400;500&display=swap');
```

The Google Fonts CSS2 endpoint serves `latin-ext` automatically via `unicode-range`, which is
**required** here — the site's own name contains *Öchsner*, and post content carries German
titles and umlauts. All three families ship latin-ext; verify any substitution does too.

```css
--font-display: 'Playfair Display', 'Iowan Old Style', Georgia, 'Times New Roman', serif;
--font-sans:    'DM Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

**Role split** — this is the whole typographic idea; do not blur it:

- **Playfair Display** — the hero headline, and *rail labels only*. Rail labels are uppercase at
  `letter-spacing: 0.24em`, which is what gives the template its engraved, monograph feel.
- **DM Sans** — every other piece of text on the site. All in-content headings, all body copy,
  all UI, all navigation.
- **JetBrains Mono** — code in blog posts and inline `code`. Nothing else.

| Token | Element | Family | Size (desktop) | Weight | Line-height | Tracking |
| --- | --- | --- | --- | --- | --- | --- |
| `--t-hero` | Home h1 | display | `clamp(2.5rem, 6.5vw, 4.25rem)` | 400 | 1.06 | `-0.015em` |
| `--t-eyebrow` | "I'M JONAS ÖCHSNER," | display | `0.875rem` | 400 | 1.4 | `0.24em` |
| `--t-rail` | `ABOUT` / `ARTICLES` | display | `0.8125rem` | 400 | 1.4 | `0.24em` |
| `--t-h2` | Page / section title | sans | `clamp(1.5rem, 3vw, 1.875rem)` | 700 | 1.2 | `-0.01em` |
| `--t-h3` | Article title, job title | sans | `1.1875rem` | 700 | 1.35 | `-0.005em` |
| `--t-h4` | Sub-heading in prose | sans | `1.0625rem` | 600 | 1.4 | `0` |
| `--t-body` | Paragraphs | sans | `0.9375rem` | 400 | 1.75 | `0` |
| `--t-prose` | Blog post body | sans | `1.0625rem` | 400 | 1.8 | `0` |
| `--t-meta` | Date · read time | sans | `0.75rem` | 700 | 1.4 | `0.01em` |
| `--t-nav` | Nav / footer links | sans | `0.75rem` | 700 | 1 | `0.11em`, uppercase |
| `--t-label` | `EMAIL`, `GITHUB` | sans | `0.6875rem` | 700 | 1.4 | `0.11em`, uppercase |
| `--t-code` | Code | mono | `0.8125rem` | 400 | 1.65 | `0` |

**Measure**: body copy caps at `--measure: 62ch`; blog prose at `--measure-prose: 68ch`. Never
full-bleed text.

**Forbidden**: Inter, Arial, Helvetica, or Times as *declared* families (fallback stacks only);
any script, novelty-display, or condensed face; Playfair Display for body copy; a fourth family;
faux-bold or faux-italic — load the real weights.

**Text decoration** (per the decoration decision table): the hero `h1` is the **only** element
permitted a treatment, and it gets exactly one — a near-invisible vertical gradient from
`--text` to `rgba(244, 244, 246, 0.82)` mimicking the light falloff in the reference shot. No
gradient on `h2`/`h3`, no `text-shadow` anywhere, no glow on type. The dark canvas already
supplies all the contrast the headline needs.

---

## 4. Component Stylings

### Buttons

```css
.btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-sans); font-size: 0.8125rem; font-weight: 700;
  padding: 0.6875rem 1.125rem; border-radius: 5px;
  border: 1px solid transparent; cursor: pointer;
  text-decoration: none; white-space: nowrap;
  box-shadow: var(--shadow-1);
  transition: background-color 180ms var(--ease-out), border-color 180ms var(--ease-out),
              color 180ms var(--ease-out), transform 180ms var(--ease-out),
              box-shadow 180ms var(--ease-out);
}
.btn svg { width: 15px; height: 15px; transition: transform 220ms var(--ease-out); }

/* Primary — white on black, straight from the reference */
.btn--primary               { background: var(--text); color: var(--text-inverse); }
.btn--primary:hover         { background: #ffffff; transform: translateY(-1px); box-shadow: var(--shadow-2); }
.btn--primary:hover svg     { transform: translateX(3px); }
.btn--primary:active        { transform: translateY(0); background: #e8e8ea; box-shadow: var(--shadow-1); }
.btn--primary:focus-visible { outline: none; box-shadow: var(--focus-ring); }

/* Secondary — raised dark panel */
.btn--secondary               { background: var(--surface); color: var(--text); border-color: var(--line); }
.btn--secondary:hover         { background: var(--surface-hover); border-color: var(--line-strong); transform: translateY(-1px); }
.btn--secondary:hover svg     { transform: translateY(2px); }   /* download arrow drops */
.btn--secondary:active        { transform: translateY(0); background: var(--surface-active); }
.btn--secondary:focus-visible { outline: none; box-shadow: var(--focus-ring); }

/* Disabled — both variants */
.btn:disabled, .btn[aria-disabled='true'] {
  opacity: 0.45; cursor: not-allowed; transform: none;
  pointer-events: none; box-shadow: none;
}
```

### Cards (article row)

The article row is **not** a bordered card. It is an invisible hit area that tints on hover —
exactly the behaviour visible on the second row of the reference home page.

```css
.card {
  display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: 2rem;
  padding: 1.5rem; margin: 0 -1.5rem; border-radius: 8px;
  background: transparent; border: 1px solid transparent;
  text-decoration: none; color: inherit;
  transition: background-color 220ms var(--ease-out), border-color 220ms var(--ease-out);
}
.card:hover              { background: var(--surface); border-color: var(--line); }
.card:hover .card__img   { transform: scale(1.03); }
.card:active             { background: var(--surface-active); }
.card:focus-visible      { outline: none; box-shadow: var(--focus-ring); background: var(--surface); }
.card__title { color: var(--text); transition: color 180ms var(--ease-out); }
.card:hover .card__title { color: var(--text); }
.card__media { overflow: hidden; border-radius: 4px; aspect-ratio: 4 / 3; }
.card__img   { width: 100%; height: 100%; object-fit: cover;
               transition: transform 480ms var(--ease-out); }
```

A post with no cover image omits `.card__media` entirely and the grid collapses to one column —
never a solid color block standing in for a photo.

### Navigation

```css
.nav       { display: flex; justify-content: center; gap: 1.75rem; padding: 1.5rem 0; }
.nav__link {
  font-family: var(--font-sans); font-size: 0.75rem; font-weight: 700; line-height: 1;
  letter-spacing: 0.11em; text-transform: uppercase; color: var(--text-muted);
  text-decoration: none; position: relative; padding: 0.5rem 0.125rem;
  transition: color 180ms var(--ease-out);
}
.nav__link::after {
  content: ''; position: absolute; left: 0; bottom: 0.125rem;
  width: 100%; height: 1px; background: currentColor;
  transform: scaleX(0); transform-origin: right;
  transition: transform 260ms var(--ease-out);
}
.nav__link:hover                { color: var(--text-secondary); }
.nav__link:hover::after         { transform: scaleX(1); transform-origin: left; }
.nav__link:active               { color: var(--text); }
.nav__link[aria-current='page'] { color: var(--text); }
.nav__link:focus-visible        { outline: none; border-radius: 3px; box-shadow: var(--focus-ring); }
.nav__link[aria-disabled='true']{ opacity: 0.4; pointer-events: none; }

/* Scrolled state — the one piece of scroll-driven chrome */
.header { position: sticky; top: 0; z-index: 50;
          background: transparent; border-bottom: 1px solid transparent;
          transition: background-color 260ms var(--ease-out), border-color 260ms var(--ease-out); }
.header[data-scrolled='true'] {
  background: rgba(var(--bg-rgb), 0.78);
  backdrop-filter: blur(12px);            /* ≤14px per the performance rule */
  border-bottom-color: var(--line);
  box-shadow: var(--shadow-3);
}
```

### Links (in prose)

```css
.link {
  color: var(--text); text-decoration: none;
  background-image: linear-gradient(var(--accent), var(--accent));
  background-size: 0% 1px; background-repeat: no-repeat; background-position: 0 100%;
  transition: background-size 280ms var(--ease-out), color 180ms var(--ease-out);
}
.link:hover         { color: var(--accent); background-size: 100% 1px; }
.link:active        { color: var(--accent-dim); }
.link:focus-visible { outline: none; border-radius: 2px; box-shadow: var(--focus-ring); }
.link[aria-disabled='true'] { color: var(--text-muted); pointer-events: none; background-image: none; }
```

### Tags / Badges

```css
.tag {
  display: inline-block; font-family: var(--font-sans);
  font-size: 0.6875rem; font-weight: 700; line-height: 1;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 0.375rem 0.625rem; border-radius: 3px;
  background: var(--surface); color: var(--text-muted);
  border: 1px solid var(--line); text-decoration: none;
  transition: color 180ms var(--ease-out), background-color 180ms var(--ease-out),
              border-color 180ms var(--ease-out);
}
.tag:hover         { color: var(--accent); background: var(--accent-wash); border-color: var(--accent-dim); }
.tag:active        { background: var(--surface-active); }
.tag:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.tag[aria-pressed='true'] { color: var(--text-inverse); background: var(--accent); border-color: var(--accent); }
.tag[aria-disabled='true']{ opacity: 0.45; pointer-events: none; }
```

### Rail section (the template's signature construct)

```css
.rail        { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 0; }
.rail__label {
  font-family: var(--font-display); font-size: 0.8125rem; font-weight: 400;
  letter-spacing: 0.24em; text-transform: uppercase; color: var(--text-muted);
  padding-top: 0.35rem;                 /* optically aligns with the first content line */
}
.rail__body  { max-width: var(--measure); }
```

### Timeline entry (experience / education / projects)

```css
.entry        { padding: 0 0 2.25rem; }
.entry__title { font-family: var(--font-sans); font-size: 1.1875rem; font-weight: 700;
                color: var(--text); margin: 0 0 0.625rem; }
.entry__body  { color: var(--text-secondary); margin: 0 0 0.75rem; }
.entry__meta  { font-family: var(--font-sans); font-size: 0.75rem; font-weight: 700;
                color: var(--text-muted); }
.entry__stack { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); }
```

### Form controls (tag filter / any future contact form)

```css
.field {
  width: 100%; font-family: var(--font-sans); font-size: 0.9375rem; font-weight: 400;
  background: var(--surface); color: var(--text);
  border: 1px solid var(--line); border-radius: 5px; padding: 0.6875rem 0.875rem;
  transition: border-color 180ms var(--ease-out), background-color 180ms var(--ease-out);
}
.field::placeholder         { color: var(--text-muted); }
.field:hover                { border-color: var(--line-strong); }
.field:focus                { outline: none; border-color: var(--accent-dim); background: var(--surface-hover); }
.field:focus-visible        { box-shadow: var(--focus-ring); }
.field:disabled             { opacity: 0.45; cursor: not-allowed; }
.field[aria-invalid='true'] { border-color: var(--danger); }
```

---

## 5. Layout Principles

**Grid** — one centred column, not a 12-column system. The reference has no multi-column layout
anywhere; content lives in a single measure with a label rail beside it.

```css
--container:     1080px;   /* outer max width */
--measure:       62ch;     /* body copy cap */
--measure-prose: 68ch;     /* blog post cap */
--rail-width:    200px;    /* label column */
--gutter:        1.5rem;   /* side padding */
```

**Spacing scale** (4px base, used exclusively — no arbitrary values):

```css
--s-1: 0.25rem;  --s-2: 0.5rem;  --s-3: 0.75rem;  --s-4: 1rem;
--s-5: 1.5rem;   --s-6: 2rem;    --s-7: 3rem;     --s-8: 4rem;
--s-9: 6rem;     --s-10: 8rem;   --s-11: 11rem;
```

**Vertical rhythm** — this is what makes the reference feel expensive: the gaps are *much*
larger than they need to be.

| Gap | Value | Between |
| --- | --- | --- |
| Hero top offset | `--s-10` (8rem) | header and avatar |
| Hero to first rail | `--s-11` (11rem) | the biggest void on the page — keep it |
| Rail section to rail section | `--s-10` (8rem) | ABOUT → ARTICLES |
| Entry to entry | `--s-6` (2rem) | jobs, articles |
| Heading to its body | `--s-3` (0.75rem) | tight, deliberately |
| Body to meta line | `--s-3` (0.75rem) | |
| Last section to footer | `--s-11` (11rem) | |

**Alignment** — the hero is centred; *everything after it is left-aligned* against the rail
column. Body copy is never centred. Article rows put text left, thumbnail right at a fixed 190px.

**Background composition**: `--bg` base, then two `radial-gradient` glows at `15% -10%` (cool)
and `85% -5%` (warm) at ~50vw radius, then a repeating dot grid
(`radial-gradient(circle, rgba(var(--text-rgb), 0.045) 1px, transparent 1px)` at `24px 24px`),
masked to fade out below ~140vh so it does not tile visibly down a long blog post. The whole
composition lives on one fixed pseudo-element with `pointer-events: none`.

---

## 6. Depth & Elevation

The reference is almost entirely flat — depth comes from *background tint*, not shadow. Shadows
exist only where an element genuinely floats.

```css
--shadow-0: none;                                      /* default for all content */
--shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);              /* buttons at rest */
--shadow-2: 0 4px 12px rgba(0, 0, 0, 0.45);            /* hovered primary button */
--shadow-3: 0 12px 32px rgba(0, 0, 0, 0.55);           /* sticky header when scrolled */
--shadow-4: 0 24px 64px rgba(0, 0, 0, 0.65);           /* lightbox / modal only */
--shadow-inset: inset 0 1px 0 rgba(var(--text-rgb), 0.04);  /* top highlight on surfaces */
```

| Layer | z-index | Elevation |
| --- | --- | --- |
| Background glows + dot grid | `0`, fixed pseudo-element, `pointer-events: none` | — |
| Page content | `1` | `--shadow-0` |
| Article row on hover | `1` | tint only, no shadow |
| Sticky header (scrolled) | `50` | `--shadow-3` + 12px backdrop blur |
| Skip link on focus | `100` | `--shadow-2` |

**Rule**: no element gains more than one elevation step on hover, and cards never gain a shadow
at all — they gain `--surface`.

---

## 7. Animation & Interaction

**Tier: L1 → low-L2.** Chosen deliberately over a higher tier because the reference template's
entire character is stillness — see §10. What that buys: a soft entrance, one-shot scroll
reveals, real hover/focus states, and a sticky header that acknowledges scroll. What it
excludes: scroll-jacking, pinning, parallax, WebGL, and cursor replacement.

### Dependencies

**None.** No GSAP, no ScrollTrigger, no Lenis, no Motion One. Everything is CSS transitions, CSS
keyframes, and two `IntersectionObserver`s. Total added JS: well under 50 lines.

### Base setup

```css
:root {
  --ease-out:   cubic-bezier(0.22, 1, 0.36, 1);
  --ease-inout: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast:   180ms;
  --dur-base:   260ms;
  --dur-slow:   620ms;
}
html { scroll-behavior: smooth; }       /* native — no smooth-scroll library */
```

### Entrance animation

Fires once on load. Hero elements stagger by ~90ms; nothing else on the first screen moves.

```css
@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}
.enter { opacity: 0; animation: rise var(--dur-slow) var(--ease-out) forwards;
         animation-delay: calc(60ms + var(--i, 0) * 90ms); }
```

### Scroll behavior

One-shot reveal per section, unobserved after firing — no persistent scroll listener, no
per-frame work.

```css
.reveal              { opacity: 0; transform: translateY(18px);
                       transition: opacity var(--dur-slow) var(--ease-out),
                                   transform var(--dur-slow) var(--ease-out); }
.reveal.is-visible   { opacity: 1; transform: none; }
.reveal--stagger > * { transition-delay: calc(var(--i, 0) * 70ms); }
```

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-visible');
    io.unobserve(e.target);                  // fire once, then stop
  }
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
```

The header's scrolled state uses a second `IntersectionObserver` watching a 1px sentinel at the
top of the document — **not** a `scroll` event listener.

### Hover & focus states

Every interactive element defines all five states in §4. Rules:

- Hover transform is capped at `translateY(-1px)` or `scale(1.03)`. Nothing jumps.
- Icons inside buttons move in the direction of their meaning: arrow-right slides right, the
  download arrow drops down.
- Underlines wipe in from the left via `transform: scaleX` or `background-size` — never by
  toggling `text-decoration`, which reflows.
- `:focus-visible` uses the two-ring `--focus-ring` so it reads on every surface. Keyboard focus
  is never removed and never styled identically to hover.
- All hover rules are gated behind `@media (hover: hover) and (pointer: fine)`.

### Special effects

Exactly two, both essentially free:

1. **Ambient background glows** — two static `radial-gradient`s, no animation at all. This is
   what gives the page its warmth in the reference shots.
2. **Article thumbnail zoom** — `scale(1.03)` on the image inside an `overflow: hidden` frame.

Explicitly *not* implemented: blur on moving elements, particle fields, 3D transforms, cursor
followers, text scramble, marquees, or a WebGL layer.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .enter  { opacity: 1; animation: none; }
  .reveal { opacity: 1; transform: none; }
}
```

The reveal observer additionally checks `matchMedia('(prefers-reduced-motion: reduce)').matches`
and, when set, marks everything visible immediately without observing. Content is **never**
hidden behind an animation that might not run: the `.reveal` class is applied by JS on mount, so
a no-JS visitor receives a fully rendered page.

---

## 8. Do's and Don'ts

### Do

1. **Do** keep the rail label as the only serif on the page besides the hero. It is the
   template's signature; using Playfair elsewhere dilutes it to nothing.
2. **Do** leave the huge vertical gaps alone (`--s-10` / `--s-11`). The emptiness *is* the
   design. Every instinct to tighten it up is wrong.
3. **Do** set body copy in `--text-secondary`, not `--text`. Full-white prose on this ground
   glares and flattens the heading hierarchy.
4. **Do** route every color through a variable, including one-off values in blog prose styles.
5. **Do** give thumbnails a real image with `aspect-ratio`, `width`/`height`, `loading="lazy"`,
   and `decoding="async"` so nothing shifts as posts load.
6. **Do** cap measure at `--measure`. A 1080px-wide paragraph is unreadable regardless of styling.
7. **Do** keep interactive targets ≥44×44px on coarse pointers, padding the hit area rather than
   the visual.
8. **Do** apply reveal classes from JS on mount, so the no-JS and reduced-motion paths render
   complete content.
9. **Do** keep the header's `backdrop-filter` at 12px and confined to a thin bar.

### Don't

1. **Don't** hard-code a hex anywhere in a component. Zero literal colors outside §2's variable
   block.
2. **Don't** add a light theme. This design commits to dark; a half-considered light mode would
   destroy the glow composition, which only reads on a near-black ground.
3. **Don't** animate `filter: blur()` on anything that moves, and don't exceed 14px on the
   header's `backdrop-filter`. Both are the fastest ways to drop frames on this layout.
4. **Don't** introduce a smooth-scroll library, scroll-jacking, pinning, or parallax. The
   reference has none, the chosen tier forbids it, and it fights the reading experience of a blog.
5. **Don't** centre anything except the hero block, the header nav, and the footer. Body content
   is left-aligned against the rail, always.
6. **Don't** use emoji as icons. Inline SVG only, 15–16px, `stroke-width: 1.5`, `currentColor`.
7. **Don't** put a solid color block where an image belongs. If a post has no cover, omit the
   media column and let the row run the full measure.
8. **Don't** add a fourth font family, and never set body copy in Playfair Display.
9. **Don't** style `:focus` and `:hover` identically, and never `outline: none` without an
   accompanying `box-shadow` ring.
10. **Don't** ship the street address or phone number from `resume.tex` to any portfolio page.
    Home, About, Blog, and Contact carry email, GitHub, and LinkedIn only. `/impressum` is the
    single, legally mandated exception — § 5 DDG requires a *ladungsfähige Anschrift* there,
    and an email address alone does not satisfy it. Keep those details in `impressum` in
    `src/lib/data/site.ts` and nowhere else.
11. **Don't** let the dot grid tile visibly past the first ~1.4 screens — it must be masked out.

---

## 9. Responsive Behavior

```css
--bp-sm: 480px;    /* small phone */
--bp-md: 768px;    /* tablet / large phone */
--bp-lg: 1024px;   /* small laptop — the rail appears here */
```

| Breakpoint | Behaviour |
| --- | --- |
| **≥1024px** | Full layout. Rail label in its own 200px column, left of content. Article rows are `1fr 190px`. Container 1080px, centred. |
| **768–1023px** | Rail collapses: the label moves *above* its content block, gains `margin-bottom: var(--s-4)`, keeps its tracking. Container fluid with `--s-6` padding. Article rows go `1fr 150px`. |
| **480–767px** | Article thumbnail drops below the text at full width, `aspect-ratio: 16 / 9`. Hero type scales via `clamp()` toward 2.5rem. Section gaps step down: `--s-11 → --s-8`, `--s-10 → --s-7`. |
| **<480px** | Nav wraps to two centred rows with `--s-3` gap and stays sticky. Buttons go full-width stacked with `--s-3` gap. Gutter `--gutter` (1.5rem). |

**Rules**

- **Touch targets**: every link, button, tag, and nav item is ≥44px tall on coarse pointers.
  Set the floor explicitly (`display: inline-flex; align-items: center; min-height: 44px`) rather
  than deriving it from padding — several of these elements have `line-height: 1`, where padding
  alone silently lands short of 44px. Two deliberate exclusions: links inside a sentence (WCAG
  2.5.8's "Inline" exception — enlarging them would break the line), and `span.tag`, which is a
  label rather than a control.
- **No horizontal overflow at any width ≥320px.** Code blocks and tables in blog prose scroll
  inside their own `overflow-x: auto` container; the body never does.
- **Images**: `max-width: 100%`, `height: auto`, explicit `width`/`height` attributes.
- **Hover-free devices**: all `:hover` rules sit inside `@media (hover: hover)`; touch devices
  get `:active` instead, so nothing stays stuck in a hovered look after a tap.
- **Dot grid** tightens to 18px spacing below 768px so it does not read as coarse.
- **Ambient glows** shrink to ~70vw radius on mobile to stay off the text.

---

## 10. Reference Audit — deviations from Elevate, and why

**Aligned deliberately**

| Aspect | Reference | Here |
| --- | --- | --- |
| Canvas | near-black, dot grid, corner glows | `#0e0f12`, 24px dot grid, warm + cool corner glows |
| Nav | centred, uppercase, tiny, letterspaced | identical, plus a scrolled state |
| Hero | avatar → serif eyebrow → Didone h1 → two buttons | identical structure |
| Rail sections | serif letterspaced label left of a narrow column | identical, 200px rail |
| Article row | text left, 190px thumbnail right, tint on hover | identical |
| Buttons | white primary + dark secondary, icon left, ~5px radius | identical |
| Footer | centred link row, avatar, copyright | identical |
| Pages | Home · About · Blog · Contact (+ 404) | the same five, plus `/blog/[slug]` and `/impressum` |

**Deviated deliberately**

1. **No landing-page spectacle beats.** The web-design skill's landing-page rule asks for three
   "wow" moments and a WebGL signature. The reference template has zero motion across all four
   of its screens, and the user named it explicitly. The named reference wins — spectacle here
   would produce a different design, not a better one. Recorded as a conscious deviation.
2. **An accent color is introduced.** The reference is monochrome, using color only in the
   ambient glow. A single copper accent (`--accent`, sampled from that glow) is added for link
   hover, focus rings, and tags — a blog needs a visible affordance for inline links that pure
   monochrome cannot provide accessibly.
3. **A mono family is added.** The reference has no code; a CS blog does. JetBrains Mono is
   scoped strictly to code.
4. **The header is sticky.** The reference header is static. Blog posts are long enough that
   losing navigation for several thousand words is a real cost.
5. **An Impressum page is added, and it is in German.** German law (§ 5 DDG, and § 18 Abs. 2
   MStV for the blog's editorial content) requires an operator identification page reachable
   from every page. The reference template has none. It is written in German because the duty
   arises under German law and the text must be intelligible to the audience it protects —
   the one deliberate exception to the site's English-only rule. It reuses the rail construct
   unchanged, so it does not introduce a new layout.
6. **A Projects section is added to About.** The reference has Experiences and Formations only.
   Both flagship projects here are closed source, so these are prose write-ups with no repo
   links — deliberately not linked cards with GitHub icons.
