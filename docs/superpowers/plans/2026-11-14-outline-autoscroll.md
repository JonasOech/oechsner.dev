# Post Outline Auto-Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "On this page" list beside a post follow the reader. The current entry
always has 3 entries of context on each side, and the list stays out of the way while the
reader uses the panel.

**Architecture:** A pure function, `followTarget()` in `src/lib/outline-follow.ts`, turns
the entries' boxes into a target `scrollTop` (nvim-style scrolloff, counted in entries).
`PostOutline.svelte` calls it whenever the displayed entry changes and applies the result
with the browser's native `scroller.scrollTo()`. It never scrolls the page. The component
also holds a clicked entry until the page rests, backs off on hover, keyboard focus or a
manual list scroll, and fades the list's edges through an `IntersectionObserver`. A
separate fix in `+page.svelte` moves the heading observer's top edge to the reading line,
so the highlight is right once a glide stops.

**Tech Stack:** SvelteKit 2 / Svelte 5 (runes), TypeScript, Playwright (Chromium) for the
browser checks, `node:test` for the unit tests (Node 22 strips the types from the `.ts`
import, so no build step is needed).

**Spec:** `docs/superpowers/specs/2026-11-14-outline-autoscroll-design.md`

## Where to work

- The work goes on branch `feature/onthispage`, which the user reset to `main` (578afe4).
  The user switches branches in their own checkout while working, so **don't build in it**:
  - Don't switch branches there.
  - Don't stash there.
  - Don't touch `src/posts/` there.

  Use a worktree instead:
  `git worktree add .claude/worktrees/onthispage feature/onthispage`.
  If the branch is checked out in the user's tree at that moment, branch from it instead:
  `git worktree add .claude/worktrees/onthispage -b feature/outline-autoscroll feature/onthispage`.
  Then run `npm ci` in the worktree.
- This plan and its spec were saved **untracked** in the user's checkout. Copy both
  `docs/superpowers/` files into the worktree before Task 1; Task 1 commits them there.
- The browser checks need a dev server serving the **worktree**. The user's server on :5173
  serves their checkout, so don't use it. Run `npm run dev -- --port 5174` from the
  worktree in the background, check it with
  `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5174/blog/obsidian-setup`
  (should print `200`), and prefix every browser-check run with the base URL:
  `OUTLINE_BASE=http://localhost:5174 node scripts/check-outline.mjs [filter]`. The
  commands below leave the prefix out for brevity. Shell variables don't persist between
  tool calls, so write it out every time.
- Never point the checks at `/blog/this-llm-has-a-context-of-1`: it hangs headless
  Chromium at 1440px and 390px wide.

## Global Constraints

- Svelte 5 runes only (`$state`, `$derived`, `$effect`, `untrack`). Never `export let` or `$:`.
- Tabs, single quotes, semicolons. Match the file you're in.
- No hard-coded colours. Use only tokens from `src/app.css`: `--surface`, `--surface-rgb`,
  `--s-5`, `--dur-fast`, `--ease-out`.
- No new dependencies and no smooth-scroll library (DESIGN.md §8 Don't 4).
- The list glides with `scroller.scrollTo({ top, behavior: 'smooth' })`. It uses
  `behavior: 'instant'` under `prefers-reduced-motion: reduce` and for the first placement.
- Never call `scrollIntoView` for the list: it would also scroll the page.
- Scrolloff = **3 entries**. Back-off = **3000ms**. Rest = **150ms** without a window
  scroll event. Reading line = `scroll-padding-top` + **8px**. Fade height = `var(--s-5)`.
- `PostOutline`'s props stay `{ headings: Heading[]; activeId: string }`.
- Unchanged: row density, the outline being hidden below 1100px, and the footer cut-off at
  the top of the page.
- `npm run check` and `npm run build` must pass before anything is called done.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **A long page glide that wasn't started from the outline** (an in-article anchor, a hash
   change). The list should retarget as sections pass and end with 3 entries around the
   final section. Pinned in Task 4: "a long glide from an anchor ends with room around the
   final entry".
2. **A mouse click leaves focus on the link** (Chrome focuses links on click). Following
   must not stay paused for the rest of the read. Pinned in Task 5: "a mouse click on an
   entry does not pause following for the rest of the read".
3. **Short windows**, ≥1100px wide but ~480px tall, where 7 entries don't fit. The active
   entry must never be hidden. Pinned in Task 4: "on a short window the active entry is
   never hidden".
4. **Client-side navigation between posts** (Newer/Older). The component instance
   survives, so its list must start at the top with no held highlight. Pinned in Task 4:
   "moving to another post starts its list at the top".
5. **Clicking the last entry**, whose section ends near the bottom of the page. It must end
   lit, not on the entry before it. Pinned in Task 1: "clicking the last entry ends with
   it active".

## File Structure

| File | Change | Responsibility |
| --- | --- | --- |
| `scripts/check-outline.mjs` | Create (Task 1), extended by each task | Playwright checks against the dev server |
| `src/routes/blog/[slug]/+page.svelte` | Modify `$effect` at lines 32–59 (Task 1) | Which heading is active |
| `src/lib/components/PostOutline.svelte` | Modify (Tasks 2, 4, 5, 6) | Hold, follow, back-off, edge fade |
| `src/lib/outline-follow.ts` | Create (Task 3) | Pure scrolloff maths, plus measuring entry boxes |
| `scripts/outline-follow.test.mjs` | Create (Task 3) | `node:test` unit tests for the maths |
| `DESIGN.md` | Modify (Task 7) | §4 "Post outline", §7 pointer |

---

### Task 1: Browser check harness, and the highlight switching at the reading line

**Files:**
- Create: `scripts/check-outline.mjs`
- Modify: `src/routes/blog/[slug]/+page.svelte:32-59` (the `activeId` `$effect`)
- Commit also: `docs/superpowers/specs/2026-11-14-outline-autoscroll-design.md`,
  `docs/superpowers/plans/2026-11-14-outline-autoscroll.md`

**Interfaces:**
- Produces (for every later task): the harness in `scripts/check-outline.mjs`, with
  `test(name, [opts], fn)`, `open(page, path?)`, `placeHeading(page, i, y)`,
  `rest(page)`, `state(page)`, `record(page)` / `recorded(page)`,
  `watchList(page)` / `listTops(page)`, `isolated(page)`, `assertScrolloff(s)`, and the
  constants `POST`, `VIEWPORT`, `AWAY`, `SCROLLOFF`. Later tasks add tests at the end of
  the `// — Tests —` section, above `// — Runner —`.
- Produces: `activeId` in `+page.svelte` keeps its meaning (the id of the last heading at
  or above the reading line, or `''`), but now updates whenever a heading crosses the line.

- [ ] **Step 1: Create the harness**

Create `scripts/check-outline.mjs` with this header and these helpers. The helpers are test
infrastructure that later tasks rely on exactly, so write them as given:

```js
// Browser checks for the post outline (src/lib/components/PostOutline.svelte).
// Needs the dev server: `npm run dev`, then `node scripts/check-outline.mjs [filter]`
// (a filter runs only the tests whose name contains it). OUTLINE_BASE points it at another
// server, OUTLINE_POST at another post. Chromium only: WebKit cannot launch on this machine.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const BASE = process.env.OUTLINE_BASE ?? 'http://localhost:5173';
const FILTER = process.argv[2] ?? '';
// 17 entries; at 1200×640 the list shows 385 of its 546px, so it has to scroll.
// Override to re-check another post, e.g. OUTLINE_POST=/blog/ranking-everything.
const POST = process.env.OUTLINE_POST ?? '/blog/obsidian-setup';
const VIEWPORT = { width: 1200, height: 640 };
const AWAY = { x: 700, y: 400 }; // over the article, clear of the panel
const SCROLLOFF = 3;

const tests = [];
function test(name, opts, fn) {
	if (!fn) [opts, fn] = [{}, opts];
	tests.push({ name, opts, fn });
}

// — Helpers —

async function open(page, path = POST) {
	await page.goto(BASE + path, { waitUntil: 'load' });
	await page.waitForSelector('.outline__link');
	await page.mouse.move(AWAY.x, AWAY.y);
	await page.waitForTimeout(300);
}

/** Puts heading `i`'s top `y`px below the top of the viewport, instantly, then lets observers run. */
async function placeHeading(page, i, y) {
	await page.evaluate(([i, y]) => {
		const link = document.querySelectorAll('.outline__link')[i];
		const el = document.getElementById(decodeURIComponent(link.hash.slice(1)));
		window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - y, behavior: 'instant' });
	}, [i, y]);
	await page.waitForTimeout(250);
}

/** Resolves once neither the page nor the list has moved for 300ms. */
async function rest(page) {
	// Forget the last call's reading, or a glide that has not started yet would count as rest.
	await page.evaluate(() => (window.__restKey = undefined));
	await page.waitForFunction(
		() => {
			const key = `${scrollY}|${document.querySelector('.outline__scroll')?.scrollTop}`;
			if (window.__restKey !== key) {
				window.__restKey = key;
				window.__restAt = performance.now();
				return false;
			}
			return performance.now() - window.__restAt >= 300;
		},
		null,
		{ polling: 50, timeout: 8000 }
	);
}

/** The list as the reader sees it. Indices are entry positions; -1 means none. */
async function state(page) {
	return page.evaluate(() => {
		const s = document.querySelector('.outline__scroll');
		const items = [...document.querySelectorAll('.outline__list > li')];
		const box = s.getBoundingClientRect();
		const full = items.map((li) => {
			const r = li.getBoundingClientRect();
			return r.top >= box.top - 0.5 && r.bottom <= box.bottom + 0.5;
		});
		const vp = document.querySelector('.outline__viewport');
		const fade = (pseudo) => (vp ? getComputedStyle(vp, pseudo).opacity === '1' : undefined);
		return {
			n: items.length,
			active: items.findIndex((li) => li.querySelector('.is-active')),
			scrollTop: s.scrollTop,
			maxScroll: s.scrollHeight - s.clientHeight,
			firstFull: full.indexOf(true),
			lastFull: full.lastIndexOf(true),
			fadeAbove: fade('::before'),
			fadeBelow: fade('::after')
		};
	});
}

/** Starts noting every change of the lit entry (deduplicated, as indices). */
async function record(page) {
	await page.evaluate(() => {
		window.__seen = [];
		const note = () => {
			const i = [...document.querySelectorAll('.outline__link')].findIndex((a) =>
				a.classList.contains('is-active')
			);
			if (window.__seen.at(-1) !== i) window.__seen.push(i);
		};
		new MutationObserver(note).observe(document.querySelector('.outline'), {
			subtree: true,
			attributes: true,
			attributeFilter: ['class']
		});
	});
}
const recorded = (page) => page.evaluate(() => window.__seen);

/** Starts noting every scrollTop the list passes through. */
async function watchList(page) {
	await page.evaluate(() => {
		const s = document.querySelector('.outline__scroll');
		window.__tops = [];
		s.addEventListener('scroll', () => window.__tops.push(Math.round(s.scrollTop)));
	});
}
const listTops = (page) => page.evaluate(() => [...new Set(window.__tops)]);

/** First heading with ≥300px of article above and below it, so a 60px move crosses no other heading's edge. */
async function isolated(page) {
	return page.evaluate(() => {
		const tops = [...document.querySelectorAll('.outline__link')].map((a) =>
			document.getElementById(decodeURIComponent(a.hash.slice(1))).getBoundingClientRect().top
		);
		return tops.findIndex(
			(t, i) => i > 0 && i < tops.length - 1 && t - tops[i - 1] >= 300 && tops[i + 1] - t >= 300
		);
	});
}

function assertScrolloff(s) {
	assert.ok(s.active >= 0, 'an entry is active');
	assert.ok(
		s.firstFull <= Math.max(0, s.active - SCROLLOFF),
		`3 entries visible above #${s.active} (first fully visible: #${s.firstFull})`
	);
	assert.ok(
		s.lastFull >= Math.min(s.n - 1, s.active + SCROLLOFF),
		`3 entries visible below #${s.active} (last fully visible: #${s.lastFull})`
	);
}

// — Tests —

// — Runner —

const browser = await chromium.launch();
const run = tests.filter((t) => t.name.includes(FILTER));
let failed = 0;
for (const t of run) {
	const context = await browser.newContext({
		viewport: t.opts.viewport ?? VIEWPORT,
		reducedMotion: t.opts.reducedMotion ?? 'no-preference'
	});
	// Answer the consent banner up front: at 640px tall it covers the bottom of the panel.
	await context.addInitScript(() =>
		localStorage.setItem('consent.analytics.v1', JSON.stringify({ choice: 'denied', at: Date.now() }))
	);
	const page = await context.newPage();
	try {
		await t.fn(page);
		console.log(`✓ ${t.name}`);
	} catch (error) {
		failed++;
		console.log(`✗ ${t.name}\n    ${String(error.message).split('\n').join('\n    ')}`);
	} finally {
		await context.close();
	}
}
await browser.close();
console.log(`\n${run.length - failed}/${run.length} passed`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Write the failing tests**

Add these under `// — Tests —`:

```js
test('a heading that reaches the reading line becomes active', async (page) => {
	await open(page);
	const i = await isolated(page);
	assert.ok(i > 0, 'the post has a heading with room around it');
	await placeHeading(page, i, 160); // below the line (~108px), inside the old observer band
	assert.equal((await state(page)).active, i - 1);
	await placeHeading(page, i, 98); // just past the line
	assert.equal((await state(page)).active, i);
});

test('moving a heading back below the line hands the highlight back', async (page) => {
	await open(page);
	const i = await isolated(page);
	await placeHeading(page, i, 98);
	assert.equal((await state(page)).active, i);
	await placeHeading(page, i, 130);
	assert.equal((await state(page)).active, i - 1);
});

test('clicking an entry ends with that entry active', async (page) => {
	await open(page);
	await page.locator('.outline__link').nth(10).click();
	await rest(page);
	assert.equal((await state(page)).active, 10);
});

test('clicking the last entry ends with it active', async (page) => {
	await open(page);
	const last = (await state(page)).n - 1;
	await page.locator('.outline__link').nth(last).click();
	await rest(page);
	assert.equal((await state(page)).active, last);
});
```

- [ ] **Step 3: Run them to make sure they fail**

Run: `node scripts/check-outline.mjs`
Expected: ✗ on the first three. The second fails on its *last* assertion, with the
highlight stuck on `i`. The third typically fails with active `9` instead of `10`. The fourth may
pass or fail; that depends on how far the last section sits from the page end.

- [ ] **Step 4: Move the observer's top edge to the reading line in `+page.svelte`**

In the `$effect` that sets `activeId`:
- Compute `line = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 8`
  once, before creating the observer.
- Observer options: `{ rootMargin: \`-${line}px 0px 0px 0px\`, threshold: [0, 1] }`. The
  old `-66%` bottom margin goes.
- In the callback, compare `el.getBoundingClientRect().top <= line`. The rest of the
  callback is unchanged.
- Rewrite the comments. The observer's top edge *is* the reading line, so a heading
  crossing it changes its intersection ratio in either direction and the callback runs,
  even when a smooth glide stops exactly on the line. The old version only fired at the
  viewport's top edge, under the header.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node scripts/check-outline.mjs`
Expected: `4/4 passed`

- [ ] **Step 6: Type-check**

Run: `npm run check`
Expected: `svelte-check found 0 errors and 0 warnings`

- [ ] **Step 7: Commit**

```bash
git add scripts/check-outline.mjs "src/routes/blog/[slug]/+page.svelte" docs/superpowers/specs/2026-11-14-outline-autoscroll-design.md docs/superpowers/plans/2026-11-14-outline-autoscroll.md
git commit -m "PostOutline: switch the highlight at the reading line

The heading observer's top edge was the viewport's, under the header, so a
heading that glided to the reading line and stopped there never fired it:
clicking an entry left the one before it lit.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: A clicked entry lights up at once

**Files:**
- Modify: `src/lib/components/PostOutline.svelte`
- Test: `scripts/check-outline.mjs`

**Interfaces:**
- Consumes: `activeId` from Task 1 (correct at rest).
- Produces (for Tasks 4–6, inside `PostOutline.svelte`):
  - `let heldId = $state<string | null>(null)`: the entry held during a glide. `''` means
    "hold with nothing lit".
  - `const current = $derived(heldId ?? activeId)`: the entry the panel shows as lit.
    **Everything downstream uses `current`, never `activeId`.**
  - `function hold(id: string): void` sets `heldId` and arms the rest timer.
  - `const REST_MS = 150` and `let restTimer: ReturnType<typeof setTimeout> | undefined`.

- [ ] **Step 1: Write the failing tests**

```js
test('a clicked entry lights up at once, and nothing else does on the way', async (page) => {
	await open(page);
	await record(page);
	await page.locator('.outline__link').nth(12).click();
	assert.equal((await state(page)).active, 12, 'lit before the page has moved');
	await rest(page);
	assert.deepEqual(await recorded(page), [12]);
});

test('back to top clears the highlight at once, and nothing lights up on the way', async (page) => {
	await open(page);
	await placeHeading(page, 12, 98);
	await record(page);
	await page.locator('.outline__top').click();
	await rest(page);
	assert.deepEqual(await recorded(page), [-1]);
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `node scripts/check-outline.mjs "at once"`
Expected: both ✗. The first fails on "lit before the page has moved"; the second records
a run of intermediate indices before `-1`.

- [ ] **Step 3: Implement the hold in `PostOutline.svelte`**

- Add `heldId`, `current`, `REST_MS`, `restTimer`, and `hold(id)` as in Interfaces.
  `hold` sets `heldId = id`, then (re)arms
  `restTimer = setTimeout(() => (heldId = null), REST_MS)` after clearing any previous one.
- In the existing window `onScroll` handler, before the `ticking` guard: if
  `heldId !== null`, re-arm the rest timer the same way. Every scroll event of the glide
  pushes the release back, so the hold ends 150ms after the page stops.
- Entry links: `onclick={() => hold(heading.id)}`. Do **not** `preventDefault`; the native
  anchor jump, CSS smooth scroll and hash update stay as they are.
- `backToTop`: call `hold('')` before `window.scrollTo`.
- In the template, mark entries with `current === heading.id` (class and `aria-current`)
  instead of `activeId === heading.id`.
- Clear `restTimer` in the cleanup of the effect that owns the scroll listener.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node scripts/check-outline.mjs`
Expected: `6/6 passed`

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/PostOutline.svelte scripts/check-outline.mjs
git commit -m "PostOutline: light a clicked entry at once

Hold the clicked entry until the page has rested for 150ms instead of
stepping the highlight through every section the glide passes.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: The scrolloff maths

**Files:**
- Create: `src/lib/outline-follow.ts`
- Test: `scripts/outline-follow.test.mjs`

**Interfaces:**
- Produces (for Task 4):

```ts
/** An entry's box in the list's scroll coordinates: 0 is the top of the scrolled content. */
export interface EntryBox {
	top: number;
	bottom: number;
}

export interface ScrollView {
	scrollTop: number;
	clientHeight: number;
	scrollHeight: number;
}

/**
 * Where the list should scroll so entry `active` has `scrolloff` entries visible on each
 * side, or null when it already has them (or the move would be under a pixel).
 */
export function followTarget(
	entries: readonly EntryBox[],
	active: number,
	view: ScrollView,
	scrolloff = 3
): number | null;

/** Measures `items` (the list's <li>s) in `scroller`'s scroll coordinates. */
export function entryBoxes(scroller: HTMLElement, items: ArrayLike<Element>): EntryBox[];
```

- [ ] **Step 1: Write the failing tests**

Create `scripts/outline-follow.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { followTarget } from '../src/lib/outline-follow.ts';

/** `n` entries of equal height, stacked from 0. */
const rows = (n, h = 30) => Array.from({ length: n }, (_, i) => ({ top: i * h, bottom: (i + 1) * h }));
const list = rows(17); // 510px of entries
const view = (scrollTop, clientHeight = 300, scrollHeight = 510) => ({ scrollTop, clientHeight, scrollHeight });

test('holds still while the active entry has 3 entries of room both ways', () => {
	assert.equal(followTarget(list, 5, view(0)), null);
});

test('glides down just far enough to show 3 entries below', () => {
	assert.equal(followTarget(list, 7, view(0)), 30); // entry 10 ends at 330
});

test('glides up just far enough to show 3 entries above', () => {
	assert.equal(followTarget(list, 6, view(150)), 90); // entry 3 starts at 90
});

test('within 3 entries of the start it goes all the way to the top', () => {
	assert.equal(followTarget(list, 2, view(100)), 0);
});

test('within 3 entries of the end it goes all the way to the bottom', () => {
	assert.equal(followTarget(list, 14, view(0)), 210);
});

test('counts entries, not pixels', () => {
	// Entry 6 is a wrapped, three-line 90px entry.
	const tall = [
		...rows(6),
		{ top: 180, bottom: 270 },
		...rows(10).map((r) => ({ top: r.top + 270, bottom: r.bottom + 270 }))
	];
	// Entry 7 (3 below entry 4) ends at 300. A 90px pixel margin would have stopped at 240.
	assert.equal(followTarget(tall, 4, view(0, 280, 570)), 20);
});

test('centres the active entry when 7 entries do not fit', () => {
	assert.equal(followTarget(list, 8, view(0, 150)), 180); // entry 8 spans 240–270
});

test('keeps the target inside the scrollable range', () => {
	assert.equal(followTarget(list, 1, view(40, 100)), 0); // centring alone would ask for -5
});

test('ignores a move under a pixel', () => {
	assert.equal(followTarget(list, 7, view(29.6)), null);
});

test('ignores an index outside the list', () => {
	assert.equal(followTarget(list, -1, view(0)), null);
	assert.equal(followTarget(list, 17, view(0)), null);
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `node --test scripts/outline-follow.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/lib/outline-follow.ts`.

- [ ] **Step 3: Implement `src/lib/outline-follow.ts`**

`followTarget` works like this:
1. If `active` is not an index of `entries`, return `null`.
2. `lo` = `0` if `active - scrolloff <= 0`, else `entries[active - scrolloff].top`.
   `hi` = `view.scrollHeight` if `active + scrolloff >= entries.length - 1`, else
   `entries[active + scrolloff].bottom`. Using `0` and `scrollHeight` at the ends is what
   sends the list all the way there, past any padding or sentinel.
3. If `hi - lo > clientHeight`, the target centres the active entry:
   `(top + bottom) / 2 - clientHeight / 2`. Else if `lo < scrollTop`, the target is `lo`.
   Else if `hi > scrollTop + clientHeight`, the target is `hi - clientHeight`. Else return
   `null`.
4. Clamp the target to `[0, scrollHeight - clientHeight]`. Return `null` if it is within
   1px of `scrollTop`, otherwise the target.

`entryBoxes` uses `origin = scroller.getBoundingClientRect().top + scroller.clientTop - scroller.scrollTop`
and maps each item's `getBoundingClientRect()` to `{ top: r.top - origin, bottom: r.bottom - origin }`.

Give both functions a doc comment explaining the nvim `scrolloff` analogy and why the
margin is counted in entries: a wrapped heading is one step for the reader, not three.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test scripts/outline-follow.test.mjs`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 5: Type-check and commit**

Run: `npm run check`. Expected: 0 errors, 0 warnings.

```bash
git add src/lib/outline-follow.ts scripts/outline-follow.test.mjs
git commit -m "PostOutline: scrolloff maths for the outline list

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: The list follows the reader

**Files:**
- Modify: `src/lib/components/PostOutline.svelte`
- Test: `scripts/check-outline.mjs`

**Interfaces:**
- Consumes: `current`, `heldId`, `restTimer` (Task 2); `followTarget`, `entryBoxes` (Task 3).
- Produces (for Tasks 5–6):
  - `let nav: HTMLElement` (`bind:this` on `<nav class="outline">`) and
    `let scroller: HTMLElement` (`bind:this` on `.outline__scroll`).
  - `const SCROLLOFF = 3`.
  - `let placed = false`: whether the list has been placed since load or since the last
    change of post.
  - `function follow(id: string): void`. Task 5 adds its pause check at the top.

- [ ] **Step 1: Write the failing tests**

```js
test('the list holds still while the active entry has room', async (page) => {
	await open(page);
	await placeHeading(page, 4, 98);
	await rest(page);
	assert.equal((await state(page)).scrollTop, 0);
});

test('the list follows down, keeping 3 entries below', async (page) => {
	await open(page);
	await placeHeading(page, 10, 98);
	await rest(page);
	assertScrolloff(await state(page));
});

test('and back up, keeping 3 entries above', async (page) => {
	await open(page);
	await placeHeading(page, 14, 98);
	await rest(page);
	await placeHeading(page, 5, 98);
	await rest(page);
	assertScrolloff(await state(page));
});

test('near the end the list goes all the way down', async (page) => {
	await open(page);
	const { n } = await state(page);
	await placeHeading(page, n - 2, 98);
	await rest(page);
	const s = await state(page);
	assert.ok(s.maxScroll - s.scrollTop <= 1, `scrolled to the end (${s.scrollTop} of ${s.maxScroll})`);
});

test('the list glides rather than jumps', async (page) => {
	await open(page);
	await placeHeading(page, 1, 98); // the first placement jumps; get it out of the way
	await rest(page);
	await watchList(page);
	await placeHeading(page, 10, 98);
	await rest(page);
	assert.ok((await listTops(page)).length >= 3, 'passed through intermediate positions');
});

test('under reduced motion the list jumps', { reducedMotion: 'reduce' }, async (page) => {
	await open(page);
	await placeHeading(page, 1, 98);
	await rest(page);
	await watchList(page);
	await placeHeading(page, 10, 98);
	await rest(page);
	assert.equal((await listTops(page)).length, 1);
});

test('a long glide from an anchor ends with room around the final entry', async (page) => {
	await open(page);
	const { n } = await state(page);
	await page.evaluate((i) => {
		location.hash = document.querySelectorAll('.outline__link')[i].hash;
	}, n - 3);
	await rest(page);
	const s = await state(page);
	assert.equal(s.active, n - 3);
	assertScrolloff(s);
});

test('opening a post at a deep anchor shows that entry with room around it', async (page) => {
	await open(page);
	const hash = await page.locator('.outline__link').nth(14).evaluate((a) => a.hash);
	await page.goto('about:blank');
	await page.goto(BASE + POST + hash, { waitUntil: 'load' });
	await page.waitForSelector('.outline__link');
	await page.mouse.move(AWAY.x, AWAY.y);
	await rest(page);
	const s = await state(page);
	assert.equal(s.active, 14);
	assertScrolloff(s);
});

test('moving to another post starts its list at the top', async (page) => {
	await open(page);
	await placeHeading(page, 15, 98);
	await rest(page);
	assert.ok((await state(page)).scrollTop > 0, 'precondition: the list has scrolled');
	const before = page.url();
	await page.locator('.post__nav-link--next').click();
	await page.waitForURL((url) => url.href !== before);
	await page.mouse.move(AWAY.x, AWAY.y);
	await rest(page);
	const s = await state(page);
	assert.equal(s.scrollTop, 0);
	assert.equal(s.active, -1);
});

test('on a short window the active entry is never hidden', { viewport: { width: 1200, height: 480 } }, async (page) => {
	await open(page);
	const { n } = await state(page);
	for (let i = 0; i < n; i++) {
		await placeHeading(page, i, 98);
		await rest(page);
		const s = await state(page);
		assert.ok(s.firstFull <= i && i <= s.lastFull, `#${i} visible (shown: #${s.firstFull}–#${s.lastFull})`);
	}
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `node scripts/check-outline.mjs`
Expected: "the list holds still while the active entry has room" passes. It is a guard,
since the list never moves yet. Every other new test fails. "moving to another post" fails
on its precondition.

- [ ] **Step 3: Implement following in `PostOutline.svelte`**

- Import `untrack` from `svelte`, and `followTarget` and `entryBoxes` from
  `$lib/outline-follow`.
- Add `nav`, `scroller`, `SCROLLOFF` and `placed` as in Interfaces.
- `follow(id)`:
  1. Return if `!scroller` or `id === ''`.
  2. `index = headings.findIndex((h) => h.id === id)`. Return if it is `-1`.
  3. `target = followTarget(entryBoxes(scroller, scroller.querySelectorAll('.outline__list > li')), index, scroller, SCROLLOFF)`.
     `scroller` satisfies `ScrollView` directly.
  4. `behavior = !placed || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'`.
     Then set `placed = true`.
  5. If `target !== null`, call `scroller.scrollTo({ top: target, behavior })`.
- **Reset effect, declared before the follow effect** (effects run in declaration order):
  read `headings` (for example `headings.length`) to subscribe, then in `untrack`:
  `scroller?.scrollTo({ top: 0, behavior: 'instant' })`, `placed = false`,
  `heldId = null`, and `clearTimeout(restTimer)`. The component instance survives
  client-side navigation between posts, so without this the new list would inherit the
  old one's offset.
- **Follow effect:** `$effect(() => { const id = current; untrack(() => follow(id)); });`.
  It re-runs only when the lit entry changes. A hold being released onto the same id
  doesn't change `current`, so it doesn't run.
- Comment in the component why it is `scrollTo` on the list and never `scrollIntoView`:
  the latter scrolls every scrollable ancestor, the page included.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node scripts/check-outline.mjs`
Expected: `16/16 passed`

- [ ] **Step 5: Type-check and commit**

Run: `npm run check`. Expected: 0 errors, 0 warnings.

```bash
git add src/lib/components/PostOutline.svelte scripts/check-outline.mjs
git commit -m "PostOutline: let the list follow the reader

Keep three entries visible above and below the current one, like nvim's
scrolloff=3, gliding with the browser's own smooth scroll (instant under
reduced motion and on first placement). Only the list scrolls, never the page.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Back off while the reader uses the panel

**Files:**
- Modify: `src/lib/components/PostOutline.svelte`
- Test: `scripts/check-outline.mjs`

**Interfaces:**
- Consumes: `nav`, `scroller`, `follow` (Task 4).
- Produces: `const BACK_OFF_MS = 3000`, `let lastManualScroll = -Infinity`,
  `function pausedNow(): boolean`.

- [ ] **Step 1: Write the failing tests**

```js
test('hovering the panel stops the list following', async (page) => {
	await open(page);
	await page.hover('.outline__head');
	await placeHeading(page, 14, 98);
	await rest(page);
	assert.equal((await state(page)).scrollTop, 0);
});

test('once the pointer leaves, the next section change is followed', async (page) => {
	await open(page);
	await page.hover('.outline__head');
	await placeHeading(page, 13, 98);
	await rest(page);
	await page.mouse.move(AWAY.x, AWAY.y);
	await placeHeading(page, 14, 98);
	await rest(page);
	assertScrolloff(await state(page));
});

test('a hand scroll of the list holds following off for 3 seconds', async (page) => {
	await open(page);
	await placeHeading(page, 1, 98);
	await rest(page);
	await page.hover('.outline__scroll');
	await page.mouse.wheel(0, 150);
	await page.waitForTimeout(400);
	const handScrolled = (await state(page)).scrollTop;
	assert.ok(handScrolled > 0, 'precondition: the wheel scrolled the list');
	await page.mouse.move(AWAY.x, AWAY.y);
	await placeHeading(page, 0, 98); // entry 0 is now above the visible list
	await rest(page);
	assert.equal((await state(page)).scrollTop, handScrolled, 'held off');
	await page.waitForTimeout(3200);
	await placeHeading(page, 1, 98);
	await rest(page);
	assertScrolloff(await state(page));
});

test('keyboard focus in the panel stops the list following', async (page) => {
	await open(page);
	await page.locator('.outline__link').first().focus();
	await page.keyboard.press('Tab');
	assert.ok(
		await page.evaluate(() => document.querySelector('.outline :focus-visible') !== null),
		'precondition: a panel link has keyboard focus'
	);
	await placeHeading(page, 14, 98);
	await rest(page);
	assert.equal((await state(page)).scrollTop, 0);
});

test('a mouse click on an entry does not pause following for the rest of the read', async (page) => {
	await open(page);
	await page.locator('.outline__link').nth(2).click();
	await rest(page);
	await page.mouse.move(AWAY.x, AWAY.y);
	await placeHeading(page, 14, 98);
	await rest(page);
	assertScrolloff(await state(page));
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `node scripts/check-outline.mjs`
Expected: ✗ on "hovering the panel…", "a hand scroll…" (on "held off") and "keyboard
focus…". The other two are guards and pass.

- [ ] **Step 3: Implement the back-off in `PostOutline.svelte`**

- `pausedNow()` returns true when any of these holds:
  - `matchMedia('(hover: hover)').matches && nav.matches(':hover')`. The hover check is
    gated so the sticky `:hover` after a tap on a touch screen doesn't pause following.
  - `nav.querySelector(':focus-visible') !== null`. Use keyboard focus only: a mouse click
    focuses the link in Chrome, and `:focus-within` would pause following for the rest of
    the read.
  - `performance.now() - lastManualScroll < BACK_OFF_MS`.
- An `$effect` that adds listeners to `scroller` and removes them in its cleanup:
  - `wheel` and `touchmove`, `{ passive: true }`, which set `lastManualScroll = performance.now()`.
  - `pointerdown`, `{ passive: true }`, doing the same only when
    `event.target === scroller`. That is a drag on the list's own scrollbar; a press on an
    entry is a click, not a scroll.
- In `follow`, return early after the `id === ''` check if `pausedNow()`. Leave `placed`
  untouched in that case, so the first real placement still jumps. When the pause ends,
  nothing catches up; the next change of `current` is followed.
- In the Task 4 reset effect, also set `lastManualScroll = -Infinity`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node scripts/check-outline.mjs`
Expected: `21/21 passed`

- [ ] **Step 5: Type-check and commit**

Run: `npm run check`. Expected: 0 errors, 0 warnings.

```bash
git add src/lib/components/PostOutline.svelte scripts/check-outline.mjs
git commit -m "PostOutline: back off while the reader uses the panel

No following while the panel is hovered or has keyboard focus, or for 3s
after the list is scrolled by hand; it resumes at the next section change.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Fade the list's edges when it continues

**Files:**
- Modify: `src/lib/components/PostOutline.svelte` (markup and `<style>`)
- Test: `scripts/check-outline.mjs`

**Interfaces:**
- Consumes: `scroller` (Task 4).
- Produces: a new `.outline__viewport` element wrapping `.outline__scroll`. Its `::before`
  is the top fade and its `::after` the bottom fade. `state()` reads their computed
  opacity, and the class name is relied on by the harness.

- [ ] **Step 1: Write the failing tests**

```js
test('at the top of the list only the bottom edge fades', async (page) => {
	await open(page);
	await page.waitForTimeout(400);
	const s = await state(page);
	assert.equal(s.fadeAbove, false);
	assert.equal(s.fadeBelow, true);
});

test('mid-list both edges fade', async (page) => {
	await open(page);
	await page.evaluate(() => (document.querySelector('.outline__scroll').scrollTop = 80));
	await page.waitForTimeout(400);
	const s = await state(page);
	assert.equal(s.fadeAbove, true);
	assert.equal(s.fadeBelow, true);
});

test('at the end only the top edge fades', async (page) => {
	await open(page);
	await page.evaluate(() => {
		const s = document.querySelector('.outline__scroll');
		s.scrollTop = s.scrollHeight;
	});
	await page.waitForTimeout(400);
	const s = await state(page);
	assert.equal(s.fadeAbove, true);
	assert.equal(s.fadeBelow, false);
});

test('a list that fits shows no fade', { viewport: { width: 1200, height: 1000 } }, async (page) => {
	await open(page);
	await page.waitForTimeout(400);
	const s = await state(page);
	assert.equal(s.maxScroll, 0, 'precondition: the whole list fits');
	assert.equal(s.fadeAbove, false);
	assert.equal(s.fadeBelow, false);
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `node scripts/check-outline.mjs fade`
Expected: all four ✗. `fadeAbove` / `fadeBelow` are `undefined` because there is no
`.outline__viewport` yet.

- [ ] **Step 3: Implement the fade**

Markup:
- Wrap `.outline__scroll` in
  `<div class="outline__viewport" data-more-above={moreAbove} data-more-below={moreBelow}>`.
- Inside `.outline__scroll`, add one sentinel before the `<ol>` and one after it:
  `<div class="outline__edge" aria-hidden="true">`, bound as `topEdge` and `bottomEdge`.

Script:
- Add `let moreAbove = $state(false)` and `let moreBelow = $state(false)`. They start
  false, so the prerendered HTML shows no fade.
- Add an `$effect` that creates
  `new IntersectionObserver(callback, { root: scroller })`, observes both sentinels, and
  disconnects in its cleanup. In the callback, set `moreAbove = !entry.isIntersecting` for
  `topEdge` and `moreBelow = !entry.isIntersecting` for `bottomEdge`. There is no scroll
  listener.

Style:
- `.outline__viewport`: `position: relative; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column;`.
  It takes over the flex role, so `.outline__scroll` keeps `flex: 1 1 auto; min-height: 0`
  inside it.
- `.outline__viewport::before, ::after`: `content: ''; position: absolute; left: 0; right: 0; height: var(--s-5); pointer-events: none; z-index: 1; opacity: 0; transition: opacity var(--dur-fast) var(--ease-out);`.
- `::before` sits at `top: 0` with `linear-gradient(to bottom, var(--surface), rgba(var(--surface-rgb), 0))`.
  `::after` sits at `bottom: 0` with `linear-gradient(to top, var(--surface), rgba(var(--surface-rgb), 0))`.
- `[data-more-above='true']::before` and `[data-more-below='true']::after` get `opacity: 1`.
- `.outline__edge { height: 1px; }`.
- Add `.outline__viewport::before` and `.outline__viewport::after` to the component's
  existing `prefers-reduced-motion` block (`transition: none`).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node scripts/check-outline.mjs`
Expected: `25/25 passed`. Earlier tests must still pass, because the new wrapper must not
change the list's height or scroll geometry.

- [ ] **Step 5: Type-check and commit**

Run: `npm run check`. Expected: 0 errors, 0 warnings.

```bash
git add src/lib/components/PostOutline.svelte scripts/check-outline.mjs
git commit -m "PostOutline: fade the list's edges when it continues

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Document it in DESIGN.md, then verify everything

**Files:**
- Modify: `DESIGN.md`: a new `### Post outline` in §4 after `### Media lightbox` (before
  `### Rail section`), and one paragraph in §7 "Scroll behavior".

- [ ] **Step 1: Add the §4 subsection**

Insert this verbatim:

```markdown
### Post outline

Beside a post with more than one heading, from 1100px up, the left track holds an "On this
page" panel (`src/lib/components/PostOutline.svelte`): a sticky `--surface` panel with a
hairline, a reading-progress line, the post's `##` and `###` headings, and "Back to top".
The entry for the section being read is lit — `--accent-wash` behind it, a 2px `--accent`
bar at its left edge.

**The highlight follows the reading line**, `scroll-padding-top` + 8px: a heading becomes
current as it crosses that line, in either direction. A clicked entry lights at once and
holds while the page glides there, so the highlight does not flick through every section on
the way; tracking takes over again once the page has rested for 150ms. "Back to top" clears
it the same way.

**The list follows the reader.** A long outline scrolls inside the panel, and the list keeps
three entries visible above and below the current one — nvim's `scrolloff=3`, counted in
entries rather than pixels, because a wrapped heading is one step for the reader. It stays
still while there is room and, when there is not, moves just far enough, with the browser's
own smooth scroll — instant under reduced motion and for the first placement after load.
Within three entries of either end it goes all the way; where seven entries do not fit, the
current one is centred. It only ever scrolls the list. `scrollIntoView` would move the page
as well, and is not used.

**It backs off when the reader takes over**: no following while the pointer is over the
panel (hover-capable devices only), while a control in it has keyboard focus
(`:focus-visible` — a mouse click leaves focus on the link, and must not pause following for
the rest of the read), or for 3s after the list is scrolled by hand. It picks up at the next
section change rather than jumping back.

**Edge fade**: a `--s-5` gradient from `--surface` at whichever edge has more entries beyond
it, gone at the ends and when the whole list fits. It is driven by an `IntersectionObserver`
on a sentinel at each end of the list, not by a scroll listener.
```

- [ ] **Step 2: Add the §7 pointer**

In §7 "Scroll behavior", after the paragraph that ends "— **not** a `scroll` event
listener.", add:

```markdown
The post outline's list is the one element that scrolls itself, and only in answer to the
reader's own scrolling — see *Post outline* in §4.
```

- [ ] **Step 3: Run the unit tests**

Run: `node --test scripts/outline-follow.test.mjs`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 4: Run the browser checks**

Run: `node scripts/check-outline.mjs`
Expected: `25/25 passed`

- [ ] **Step 5: Type-check**

Run: `npm run check`
Expected: `svelte-check found 0 errors and 0 warnings`

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: exits 0, and the prerender finishes without errors.

- [ ] **Step 7: Look at it**

Screenshot `/blog/obsidian-setup` at 1200×640 three times: at the top, part-way (with the
list scrolled and both fades showing), and at the end. Read the screenshots, checking that
the fades sit on `--surface` with no visible band, the lit entry is never under a fade,
and the panel's height is unchanged. Save the screenshots in the session scratchpad, not
the repo.

- [ ] **Step 8: Commit**

```bash
git add DESIGN.md
git commit -m "DESIGN.md: document the post outline

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 9: Report what can't be checked here**

Tell the user these are unverified because only Chromium runs on this machine, and need a
real Safari or iPad:
- the glide on the inner list
- `:focus-visible` after a click on an entry
- the rest timer's release at the end of a glide

Also tell them that once `post/RE` is merged, the checks can be re-run against the post
that started this:
`OUTLINE_POST=/blog/ranking-everything node scripts/check-outline.mjs`.
