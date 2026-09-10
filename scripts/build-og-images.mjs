/**
 * Rasterises each post cover in `static/img/<postname>/` — plus the site-wide `og.svg`
 * fallback — to a PNG beside it.
 *
 * Why: social platforms (Facebook, X, LinkedIn, WhatsApp, Slack) all reject SVG for
 * `og:image` / `twitter:image` — the accepted formats are JPEG, PNG, WebP and GIF. The
 * SVGs stay in place for in-page rendering, where they're sharper and smaller; the PNGs
 * exist purely so shared links show a preview.
 *
 *   npm run og
 *
 * Uses the Playwright Chromium that is already needed for the visual checks. If it isn't
 * installed, this exits cleanly rather than failing a build — the committed PNGs are the
 * artefact that matters.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'static/img';

let chromium;
try {
	({ chromium } = await import('playwright'));
} catch {
	console.error('playwright is not installed — skipping. `npm i -D playwright` to regenerate.');
	process.exit(0);
}

// Only the images Seo.svelte can actually point at: the site-wide `og.svg` fallback and
// each post's `<postname>/cover.svg`. Deliberately not a blanket recursive walk — that
// would also rasterise in-post figures like `hangman/hangman-1.svg` into junk PNGs.
const svgs = [
	...readdirSync(DIR).filter((f) => f === 'og.svg'),
	...readdirSync(DIR, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => join(e.name, 'cover.svg'))
		.filter((f) => existsSync(join(DIR, f)))
];
if (svgs.length === 0) {
	console.log('No SVGs in static/img — nothing to do.');
	process.exit(0);
}

const browser = await chromium.launch();

for (const file of svgs) {
	const source = readFileSync(join(DIR, file), 'utf8');

	// Read the intrinsic size out of the SVG rather than assuming one.
	const width = Number(source.match(/\swidth="(\d+)"/)?.[1] ?? 1200);
	const height = Number(source.match(/\sheight="(\d+)"/)?.[1] ?? 630);

	const page = await browser.newPage({ viewport: { width, height } });
	await page.setContent(
		`<body style="margin:0">${source}</body>`,
		{ waitUntil: 'networkidle' }
	);
	const out = join(DIR, file.replace(/\.svg$/, '.png'));
	await page.screenshot({ path: out });
	await page.close();

	console.log(`  ${file} → ${file.replace(/\.svg$/, '.png')}  (${width}×${height})`);
}

await browser.close();

const missing = svgs.filter((f) => !existsSync(join(DIR, f.replace(/\.svg$/, '.png'))));
if (missing.length) {
	console.error('Failed to rasterise:', missing.join(', '));
	process.exit(1);
}
console.log(`Wrote ${svgs.length} PNG${svgs.length === 1 ? '' : 's'}.`);
