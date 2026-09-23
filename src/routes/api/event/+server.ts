import type { RequestHandler } from './$types';
import { FEED_ACTIONS, FEED_SURFACES, type FeedAction, type FeedSurface } from '$lib/track';

/**
 * The write end of the feed counter — `src/lib/track.ts` explains why it exists.
 *
 * It has to run in the Worker: `src/routes/+layout.ts` prerenders the whole site, and a
 * prerendered route is a static file that never invokes one. Opting out here is also what
 * puts the path in the adapter's `_routes.json` include list, the same way `/blog` gets
 * there.
 */
export const prerender = false;

const isAction = (v: unknown): v is FeedAction => FEED_ACTIONS.includes(v as FeedAction);
const isSurface = (v: unknown): v is FeedSurface => FEED_SURFACES.includes(v as FeedSurface);

/**
 * The endpoint is public and unauthenticated — anyone can post to it — so both fields are
 * checked against the lists they came from rather than written straight through. Analytics
 * Engine samples and bills by cardinality, and a free-text blob would hand a stranger the
 * decision of how many distinct series the dataset carries.
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	// A beacon has nobody to read the reply, and a 400 would only tell someone probing the
	// endpoint which half of their payload was rejected. Every path answers 204.
	const ok = new Response(null, { status: 204 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return ok;
	}

	const { action, surface } = (body ?? {}) as Record<string, unknown>;
	if (!isAction(action) || !isSurface(surface)) return ok;

	// Missing under `vite dev`, and under `wrangler pages dev` without the binding. The site
	// keeps working either way; it just does not count.
	platform?.env.ANALYTICS?.writeDataPoint({
		// One index for every feed event, so they sample as a single population — and it is
		// the only index Analytics Engine allows per data point anyway.
		indexes: ['feed'],
		blobs: [action, surface]
		// No `doubles`: the count is `sum(_sample_interval)` at query time, not a number
		// carried on each row.
	});

	return ok;
};
