// Rasterises banner.html to the LinkedIn cover size (1584×396).
//   node docs/linkedin-cover/render.cjs            → linkedin-cover.png and @2x
// Needs the Playwright Chromium (same as `npm run og`) and network for Google Fonts.
const { chromium } = require('playwright');
const { join } = require('node:path');

(async () => {
	const browser = await chromium.launch();
	for (const scale of [1, 2]) {
		const page = await browser.newPage({ viewport: { width: 1584, height: 396 }, deviceScaleFactor: scale });
		await page.goto('file://' + join(__dirname, 'banner.html'), { waitUntil: 'networkidle' });
		await page.evaluate(() => document.fonts.ready);
		const out = join(__dirname, scale === 1 ? 'linkedin-cover.png' : 'linkedin-cover@2x.png');
		await page.screenshot({ path: out });
		await page.close();
		console.log('  →', out);
	}
	await browser.close();
})();
