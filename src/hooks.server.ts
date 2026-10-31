import type { Handle, HandleServerError, RequestEvent } from '@sveltejs/kit';
import { building, dev } from '$app/environment';
import { site } from '$lib/data/site';

/**
 * The site chat (chat-aide), answered by Cloudflare Workers AI through the `AI` binding in
 * wrangler.jsonc — no API key, and the free daily Neuron allocation is the whole budget.
 *
 * The model has to support function calling, because the chat reads pages through a tool.
 * Qwen3 30B-A3B does, and is the cheapest such model per input token by a wide margin; a
 * turn here is mostly input (outline + page text), so that is the price that matters.
 * The Neuron rates are on Cloudflare's Workers AI pricing page.
 */
const MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';

/**
 * Built on the first request, and the library imported only then, for two reasons:
 *
 * - The binding only exists on `event.platform`. It is not a string, so `$env` never sees it.
 * - Workers forbid generating random values in global scope, and the library mints its
 *   per-process markers when its modules are evaluated. A dynamic import evaluates them
 *   inside the request instead.
 */
let chat: Promise<Handle> | undefined;

/** The paths the chat hook answers when the app does not (chat-aide's defaults). */
const isChatPath = (path: string) =>
	path === '/api/chat' || path === '/llms.txt' || path === '/llms-full.txt' || path.endsWith('.md');

/** chat-aide marks its own reads of the site with this header. */
const isChatRead = (event: RequestEvent) => event.request.headers.has('x-aide-internal');

export const handle: Handle = async ({ event, resolve }) => {
	// Everything else passes straight through: prerendering runs this hook for every page,
	// and the platform the adapter gives a prerenderable page throws on any `env` access —
	// in `vite dev` as much as in the build.
	if (building || !(isChatPath(event.url.pathname) || isChatRead(event))) return resolve(event);

	if (!chat) {
		const ai = binding(event);
		if (!ai) return resolve(event);
		chat = createChat(ai);
	}
	return (await chat)({ event, resolve });
};

function binding(event: RequestEvent): Ai | undefined {
	try {
		return event.platform?.env.AI;
	} catch {
		// The prerender platform's throwing getter (see above).
		return undefined;
	}
}

/**
 * The chat hook lets the app answer its paths first and takes over on the 404, and its own
 * reads of prerendered pages 404 in process before falling back to the network. Both are
 * expected, so they stay out of the log; everything else is logged as SvelteKit would.
 */
export const handleError: HandleServerError = ({ error, event, status }) => {
	if (status === 404) {
		if (isChatPath(event.url.pathname) || isChatRead(event)) return;
		console.error(`[404] ${event.request.method} ${event.url.pathname}`);
		return;
	}
	console.error(error);
};

async function createChat(ai: Ai): Promise<Handle> {
	const [{ aide }, { createWorkersAI }] = await Promise.all([
		import('@chat-aide/sveltekit/server'),
		import('workers-ai-provider')
	]);

	return aide({
		provider: {
			name: 'custom',
			model: MODEL,
			instance: createWorkersAI({ binding: ai })(MODEL)
		},
		// Never taken from the request's Host header. In `vite dev` nothing is prerendered, so
		// every page can be read in process and no origin is needed.
		origin: dev ? undefined : site.url,
		persona: {
			tone: 'plain, concise and friendly',
			audience: 'readers of a personal blog and portfolio: recruiters, students and engineers'
		},
		facts: `This is the personal site of ${site.name}: ${site.role}. Refer to him as Jonas.`,
		pages: {
			// The postal address and phone number live on /impressum and nowhere else
			// (DESIGN.md §8, Don't #10). The chat would otherwise repeat them on request.
			exclude: ['/impressum']
		},
		suggestions: {
			'*': [
				'What is this site about?',
				'What has Jonas written recently?',
				'What projects has Jonas built?'
			]
		},
		limits: {
			// Qwen3 reasons before it answers, and the reasoning counts against this.
			maxOutputTokens: 2048
		},
		rateLimit: { requests: 12, windowSeconds: 600, warmups: 40 },
		// Kept per Worker instance (the store is in memory), so these bound one instance,
		// not the account. The free plan's 10,000 Neurons a day is the account-wide cap.
		budget: { tokensPerDay: 150_000, siteTokensPerDay: 2_000_000 }
	});
}
