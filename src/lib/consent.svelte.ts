/**
 * The gate in front of Google Analytics.
 *
 * GA4 writes `_ga` cookies and hands Google an address it can build a profile from, which
 * under § 25 TTDSG needs the visitor's agreement first — and "first" is the whole point.
 * Google's own Consent Mode answers this by loading `gtag.js` anyway and telling it to
 * behave; that still fetches a third-party script and still discloses the visitor to
 * Google before anyone has said yes. So this module does the blunter thing instead: until
 * the visitor agrees, the tag is not on the page at all. There is nothing to opt out of
 * because there is nothing running.
 *
 * What stays outside the gate, deliberately: the `/api/event` beacon in `track.ts`. It is
 * first-party, carries no identifier and sets no cookie, so it is not the kind of access
 * § 25 is about.
 *
 * The decision is kept in `localStorage` rather than a cookie — a consent record is
 * "unbedingt erforderlich" and would be lawful as a cookie, but there is no reason for it
 * to travel on every request when only this file ever reads it.
 */

/**
 * The Analytics property. It lives here rather than in `app.html` because this module is
 * now the only thing allowed to load it; a second copy of the id anywhere else would be a
 * second way for the tag to reach the page.
 */
export const GA_MEASUREMENT_ID = 'G-RNN4DP6E41';

const STORAGE_KEY = 'consent.analytics.v1';

/**
 * Consent is not forever. A year is the span the German supervisory authorities treat as
 * the outer edge of a still-valid agreement, so a stored decision older than that is read
 * as no decision and the banner asks again.
 */
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export type ConsentChoice = 'granted' | 'denied';

declare global {
	interface Window {
		/** The gtag command queue. Created by `load()` below, not by the document. */
		dataLayer?: unknown[];
		/** Defined only once analytics has been allowed — see `track.ts` on why it is optional. */
		gtag?: (...args: unknown[]) => void;
	}
}

type StoredChoice = { choice: ConsentChoice; at: number };

/**
 * `ready` exists because every page here is prerendered. The banner has to be absent from
 * the HTML that Cloudflare serves — otherwise a visitor who decided months ago gets a
 * flash of it on every single page load, before hydration can take it away again.
 */
export const consent = $state({
	choice: null as ConsentChoice | null,
	asking: false,
	ready: false
});

function read(): StoredChoice | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as Partial<StoredChoice>;
		// Anything that is not a decision this version of the site wrote counts as no
		// decision — a half-readable record must never be resolved in Analytics' favour.
		if (parsed.choice !== 'granted' && parsed.choice !== 'denied') return null;
		if (typeof parsed.at !== 'number' || Date.now() - parsed.at > MAX_AGE_MS) return null;

		return { choice: parsed.choice, at: parsed.at };
	} catch {
		// Private mode, blocked site data, or a corrupt value: ask again rather than assume.
		return null;
	}
}

function write(choice: ConsentChoice): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }));
	} catch {
		// Storage refused. The choice still holds for this page load; the banner will
		// simply return on the next one, which is the harmless direction to fail in.
	}
}

/** Set once the tag has been put on the page, so a second grant cannot load it twice. */
let loaded = false;

function load(): void {
	if (loaded) return;
	loaded = true;

	window.dataLayer = window.dataLayer ?? [];
	// Not an arrow: gtag.js reads the `arguments` object off the queue, so the shim has to
	// be able to forward one. This is the official snippet, moved out of `app.html`.
	window.gtag = function () {
		window.dataLayer!.push(arguments);
	};

	// Queued before the script arrives, exactly as the inline snippet used to do it. The
	// `config` call is what sends the first `page_view`.
	window.gtag('js', new Date());
	window.gtag('config', GA_MEASUREMENT_ID);

	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
	// `appendChild`, not `append`: the Workers types pulled in by `wrangler types` put a
	// different `append` in scope, and `npm run check` fails on it.
	document.head.appendChild(script);
}

/**
 * Withdrawing consent has to be as effective as never giving it, so the cookies go too —
 * leaving `_ga` in place would keep the visitor identifiable to the next grant.
 *
 * `_ga` is written on the registrable domain with a leading dot, `_ga_<id>` beside it, and
 * the path is always `/`. A cookie can only be expired by a matching name/domain/path, and
 * script cannot read back which domain was used, so all three candidates are tried.
 */
function clearCookies(): void {
	const names = document.cookie
		.split(';')
		.map((entry) => entry.split('=')[0].trim())
		.filter((name) => name.startsWith('_ga') || name === '_gid');

	const host = location.hostname;
	const registrable = host.split('.').slice(-2).join('.');
	const domains = ['', host, `.${host}`, `.${registrable}`];

	for (const name of names) {
		for (const domain of domains) {
			document.cookie =
				`${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT` +
				(domain ? `; domain=${domain}` : '');
		}
	}
}

/**
 * Reads the stored decision and acts on it. Called once, from the banner's own mount, so
 * that nothing here runs during prerendering.
 */
export function initConsent(): void {
	const stored = read();

	consent.choice = stored?.choice ?? null;
	consent.asking = stored === null;
	consent.ready = true;

	if (stored?.choice === 'granted') load();
}

/** Records a decision and applies it. */
export function decide(choice: ConsentChoice): void {
	write(choice);
	consent.choice = choice;
	consent.asking = false;

	if (choice === 'granted') {
		load();
		return;
	}

	clearCookies();

	// gtag.js cannot be unloaded — once it is on the page it keeps its own timers and will
	// go on reporting. If consent is withdrawn in the same page load that granted it, the
	// only honest way to stop it is to throw the page away and build it again without it.
	if (loaded) location.reload();
}

/** Puts the banner back on screen, so a decision can be changed at any time. */
export function reopenConsent(): void {
	consent.asking = true;
}
