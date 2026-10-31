import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Adapter, runes mode and the mdsvex preprocessor all live in `svelte.config.js`.
// mdsvex needs `extensions` at the SvelteKit-config level (svelte-kit sync reads it
// from there to route `.svx` files), so the config can no longer be inline here.
export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		// Bundled here rather than left for Wrangler: Wrangler bundles `_worker.js` with the
		// `browser` export condition, under which chat-aide's server entry deliberately
		// resolves to a module that does not exist (its guard against shipping server code
		// to a browser). Vite resolves it with the server conditions instead.
		noExternal: ['@chat-aide/core']
	}
});
