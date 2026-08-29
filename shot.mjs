import { chromium } from 'playwright-core';

const browser = await chromium.launch();

for (const [name, width, height] of [
	['desktop', 1280, 900],
	['mobile', 390, 844]
]) {
	const page = await browser.newPage({ viewport: { width, height } });
	await page.goto('http://localhost:5177/', { waitUntil: 'networkidle' });
	await page.waitForTimeout(1200); // let the entrance animation finish

	if (name === 'desktop') {
		// Measure the actual vertical rhythm: is the byline now closer to the greeting
		// than to the post, and does the rule sit between them?
		const m = await page.evaluate(() => {
			const r = (s) => {
				const el = document.querySelector(s);
				if (!el) return null;
				const b = el.getBoundingClientRect();
				return { top: Math.round(b.top), bottom: Math.round(b.bottom) };
			};
			const intro = document.querySelector('.intro');
			const cs = getComputedStyle(intro);
			return {
				greeting: r('.intro__greeting'),
				byline: r('.intro__byline'),
				introBox: r('.intro'),
				leadEyebrow: r('.lead__eyebrow'),
				leadTitle: r('.lead__title'),
				rule: cs.borderBottomWidth + ' ' + cs.borderBottomColor,
				greetingSize: getComputedStyle(document.querySelector('.intro__greeting')).fontSize,
				greetingColor: getComputedStyle(document.querySelector('.intro__greeting')).color,
				bylineSize: getComputedStyle(document.querySelector('.intro__byline')).fontSize,
				titleSize: getComputedStyle(document.querySelector('.lead__title')).fontSize
			};
		});
		console.log(JSON.stringify(m, null, 2));
		const gapInside = m.byline.top - m.greeting.bottom;
		const gapToPost = m.leadEyebrow.top - m.byline.bottom;
		console.log(`\ngap greeting->byline : ${gapInside}px`);
		console.log(`gap byline->post     : ${gapToPost}px`);
		console.log(`ratio (post/inside)  : ${(gapToPost / gapInside).toFixed(1)}x`);
		console.log(`greeting ${m.greetingSize} vs lead title ${m.titleSize}`);
	}

	await page.screenshot({ path: `intro-${name}.png`, clip: { x: 0, y: 0, width, height: Math.min(height, 760) } });
	await page.close();
}

await browser.close();
