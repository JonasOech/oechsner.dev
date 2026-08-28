import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// This route is the Worker. `adapter-cloudflare` compiles every server route
// into the `_worker.js` that Pages runs at the edge, so keep it dynamic -
// prerendering it would bake the response into a static file at build time.
export const prerender = false;

export const GET: RequestHandler = ({ platform }) => {
	// `platform` is only populated when running on the Workers runtime
	// (`wrangler pages dev`, or a real deployment). Under plain `vite dev`
	// the adapter proxies bindings but leaves request metadata empty.
	const cf = platform?.cf;

	return json(
		{
			siteName: platform?.env.SITE_NAME ?? 'oechsner.dev (local)',
			channel: platform?.env.BUILD_CHANNEL ?? 'development',
			servedAt: new Date().toISOString(),
			edge: cf
				? {
						colo: cf.colo,
						country: cf.country ?? null,
						city: cf.city ?? null,
						httpProtocol: cf.httpProtocol,
						tlsVersion: cf.tlsVersion
					}
				: null
		},
		{ headers: { 'cache-control': 'no-store' } }
	);
};
