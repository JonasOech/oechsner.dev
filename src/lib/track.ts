/**
 * Feed-subscription events, and the beacon that reports them.
 *
 * Cloudflare's own analytics cannot answer "how often did someone ask for the feed?".
 * The primary action in `Subscribe.svelte` copies the URL to the clipboard and never
 * touches the network, so there is no request to count at all; and the three visible feed
 * links point at `/rss.xml`, which is prerendered to a static file whose hits are
 * dominated by readers re-polling it every half hour. Only the site knows that a human
 * pressed something, so the site is what has to say so.
 *
 * Nothing identifying goes out — an action and the place it was pressed, no address, no
 * cookie, no id. That keeps the record an anonymous aggregate rather than something the
 * Impressum would have to answer for.
 */

/** What was pressed. */
export const FEED_ACTIONS = ['copy-url', 'open-rss', 'open-atom'] as const;

/** Where it was pressed — the same offer is made on three different surfaces. */
export const FEED_SURFACES = ['post-footer', 'site-footer', 'home-intro'] as const;

export type FeedAction = (typeof FEED_ACTIONS)[number];
export type FeedSurface = (typeof FEED_SURFACES)[number];

/**
 * Reports one press, and never gets in the way of what the visitor actually asked for.
 *
 * `sendBeacon` rather than `fetch`: two of the three call sites are links, so the browser
 * starts tearing the page down as soon as the handler returns and would cancel a request
 * still in flight. A beacon is handed over for the browser to deliver on its own time —
 * there is no response to read and no failure this code could act on.
 */
export function trackFeed(action: FeedAction, surface: FeedSurface): void {
	// Absent during SSR. The counter is a convenience for the author, so its absence must
	// cost the visitor nothing.
	if (typeof window === 'undefined') return;

	// GA4 sees none of this on its own: the feed links are same-origin, so they never
	// become an outbound `click`; `.xml` is not in the `file_download` extension list; and
	// the copy button never touches the network at all. The site has to say so out loud
	// here too, for the same reason it posts to `/api/event`.
	//
	// The optional call is what carries the visitor's consent through to this event.
	// `window.gtag` is defined by `consent.svelte.ts` and only once analytics has been
	// allowed, so this line is a no-op for anyone who declined or has not answered yet —
	// while the first-party beacon below runs for everybody, because it identifies nobody.
	window.gtag?.('event', 'feed_subscribe', { method: action, surface });

	// Missing in any browser old enough to lack it; the beacon is best-effort either way.
	if (!navigator.sendBeacon) return;

	const body = new Blob([JSON.stringify({ action, surface })], { type: 'application/json' });
	navigator.sendBeacon('/api/event', body);
}
