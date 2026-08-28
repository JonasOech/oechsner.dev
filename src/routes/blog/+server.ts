import type { RequestHandler } from './$types';

/**
 * `/` is the writing index; `/blog` was the old one.
 *
 * This has to run in the Worker to emit a real 301. A `_redirects` file never fires here:
 * `_routes.json` includes `/*` minus the prerendered paths, so an unmatched `/blog` reaches
 * the Worker before Pages consults `_redirects`. A prerendered SvelteKit `redirect()` is no
 * better — it emits a 200 HTML page with a meta-refresh.
 */
export const prerender = false;

export const GET: RequestHandler = () =>
	new Response(null, {
		status: 301,
		headers: { location: '/', 'cache-control': 'public, max-age=3600' }
	});
