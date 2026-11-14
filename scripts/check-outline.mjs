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
