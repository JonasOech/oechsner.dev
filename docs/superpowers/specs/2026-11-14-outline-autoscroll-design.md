# Post outline auto-scroll — design

Date: 2026-11-14 · Status: approved in conversation · Plan:
`docs/superpowers/plans/2026-11-14-outline-autoscroll.md`

## Intent

The "On this page" panel beside a post (`src/lib/components/PostOutline.svelte`) is too short
for long outlines. The Ranking Everything post (on the `post/RE` branch) has 25 entries.
The panel already fills the screen height, but at 1440×900 only ~80% of the list is
visible (~58% at 1280×720). The rest is behind an inner scroll that never moves by itself.
Reading into the "Technical" section takes the highlighted entry out of view, so the
outline stops saying where the reader is.

The fix: **the list follows the reader.** It glides so the current section's entry always
has a few neighbours visible around it, and it doesn't fight a reader who is using the
panel.

## Findings that shape the design

- **Tracking bug.** `src/routes/blog/[slug]/+page.svelte` works out the active heading
  inside an `IntersectionObserver` callback. The observer is set to
  `rootMargin: '0px 0px -66% 0px'`, so its top edge is the top of the viewport, under the
  sticky header, while the "passed" test uses the reading line (`scroll-padding-top` + 8px,
  about 108px). A heading that glides to the reading line and stops there (which is where
  every anchor click lands) crosses no observer edge, so the callback never runs. Measured:
  clicking "Limitations" ended with "What went wrong" lit, and clicking "References" ended
  with "Special Thanks" lit. During normal reading the switch also comes late, when the
  heading slides under the header rather than when it reaches the line.
- **Intermediate highlights.** During the smooth glide after a click, the highlight runs
  through every section in between (9 for "Limitations", 11 for "References").
- On `main` the Ranking Everything post has no headings yet. `obsidian-setup` (17 entries)
  shows the same overflow at 1200×640 (385 of 546px visible), so the checks use it.

## Goals

1. The active entry always has **3 entries** visible above and below it in the list, like
   nvim's `:set scrolloff=3`. The margin is counted in entries, not pixels, so a wrapped
   three-line entry counts as one. Within 3 entries of either end, the list scrolls all
   the way to that end.
2. While the active entry already has that room, the list **holds still**. When it doesn't,
   the list glides **just far enough** to restore it.
3. The glide is the **browser's native smooth scroll** (`scrollTo({ behavior: 'smooth' })`).
   Under `prefers-reduced-motion: reduce`, and for the first placement after load, it jumps.
4. **Back off:** the list doesn't follow while the pointer is over the panel (on devices
   with hover), while a panel control has keyboard focus (`:focus-visible`), or for
   **3 seconds** after the reader scrolls the list by hand. It doesn't catch up at once when
   a pause ends; it follows from the next section change.
5. **Click:** a clicked entry lights up straight away. The highlight holds on it, without
   stepping through intermediate sections, until the page has stopped moving (no window
   scroll for 150ms). Then normal tracking resumes. "Back to top" does the same with
   *no* entry lit.
6. **Tracking fix:** the highlight switches when a heading crosses the reading line, in
   both directions, including when a glide stops exactly on it.
7. **Edge fade:** a `--s-5` (1.5rem) gradient from `--surface` to transparent at the top
   or bottom of the list whenever more entries lie that way, gone at the very ends and when
   the whole list fits. It is driven by an `IntersectionObserver` on two sentinels inside
   the list, not by a scroll listener.
8. Moving to another post by client-side navigation resets the list to the top and drops
   any held highlight.

## Non-goals

- Making the list more compact: no folding of `###` entries and no tighter rows. The user
  chose auto-scroll only.
- The panel's footer being cut off at the top of the page (it starts 6rem lower than where
  it docks). Left as is: it resolves after ~70px of scroll.
- Narrow screens: the outline stays hidden below 1100px.
- A custom easing or duration for the glide. The user chose the browser default.

## Anti-goals (a failure even if it technically works)

- The list moving while the reader is looking at or using it.
- The page itself scrolling because the list followed (for example via `scrollIntoView`).
- The list in constant motion during ordinary reading.
- A smooth-scroll library, scroll-jacking, or any new dependency (DESIGN.md §7, §8 Don't 4).
- A hard-coded colour (CLAUDE.md, DESIGN.md §8 Don't 1).

## Constraints

- Svelte 5 runes only. Tabs, single quotes, semicolons.
- Colours and sizes come from `src/app.css` tokens: `--surface`, `--surface-rgb`, `--s-5`,
  `--dur-fast`, `--ease-out`.
- The panel's props stay `{ headings: Heading[]; activeId: string }`.
- `npm run check` and `npm run build` pass.
- Safari can't be tested on this machine (Chromium only). Smooth `scrollTo` on an element
  and `:focus-visible` are long-supported there, but this needs a check on a real device.

## Approaches considered

| Approach | Trade-off | Verdict |
| --- | --- | --- |
| **A. Entry-counted scrolloff, `scroller.scrollTo()`.** A pure function computes the target `scrollTop` from the entries' boxes; the component calls `scrollTo` on the list element only. | Exact nvim semantics; moves only the list; the maths can be unit-tested without a browser. ~120 lines. | **Chosen** |
| B. `activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' })` with `scroll-margin` on the links | Fewest lines, but it scrolls **every** scrollable ancestor, including the page, which fights the reader's own scroll. The margin is in pixels, not entries. | Rejected (anti-goal) |
| C. CSS only (scroll-snap, scroll-driven animations) | Cannot follow a state that JavaScript decides (the active heading). | Rejected |
| D. Compact the list (fold `###` children, tighter rows) | Fits more entries without motion. | Declined by the user ("autoscroll only") |

## Decisions (the user's answers)

- Compactness: **autoscroll only**.
- Follow style: **keep it in view**, the list resting until needed, with "always some
  headings below, like nvim `:set scrolloff=`" → **3 entries both ways**.
- Hands-on: **back off** while hovered or focused and for a few seconds after a manual
  scroll.
- Cue: **edge fade**.
- Click: **light up at once**.
- Glide: **browser default** smooth scroll.
- Footer cut-off: **leave it**.

## Calls made by Claude (open to correction)

- Back-off lasts **3000ms**. Page "rest" means **150ms** without a window scroll event,
  because `scrollend` isn't available in every Safari version.
- Keyboard focus counts only as `:focus-visible`. A mouse click on an entry focuses the
  link in Chrome, and with `:focus-within` that click would pause following for the rest
  of the read.
- Hover counts only where `(hover: hover)` matches, so the sticky `:hover` after a tap on
  touch screens doesn't pause following.
- The first placement after load (for example a reload part-way down) jumps instead of
  gliding. It still obeys back-off.
- If 7 entries don't fit in the list (very short windows), the active entry is centred
  instead.
- The checks are a committed Playwright script, `scripts/check-outline.mjs`, run against
  the dev server, plus a `node:test` unit test for the maths. The repo has no test runner.
  Both can be deleted if unwanted.
- DESIGN.md gains a "Post outline" subsection in §4 and a one-line pointer in §7, because
  the panel isn't documented there yet.

## Left to the builder

Internal names beyond those in the plan's Interfaces blocks, comment wording, and the order
of CSS rules.

## Noticed, out of scope

`PostOutline`'s progress effect reads the post's word count once per component instance.
The component instance survives client-side navigation between posts, so "min left" after
a move to another post probably uses the previous post's word count. Not yet checked in a
browser.
