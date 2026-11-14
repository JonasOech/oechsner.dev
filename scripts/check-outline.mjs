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
	assert.ok((await state(page)).scrollTop > 0, 'precondition: the list followed down');
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
