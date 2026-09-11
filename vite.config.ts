import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Adapter, runes mode and the mdsvex preprocessor all live in `svelte.config.js`.
// mdsvex needs `extensions` at the SvelteKit-config level (svelte-kit sync reads it
// from there to route `.svx` files), so the config can no longer be inline here.

// `/beta` is a review surface for work-in-progress features (see BETA.md). It must never
// show its contents on the production site, only on Cloudflare *preview* deployments and in
// local dev. Cloudflare Pages sets CF_PAGES_BRANCH on every build; the production build is
// the one on `main`. We resolve the flag here, at build time, and inline it as the global
// `__BETA__` — a single boolean baked identically into the server render and the client
// bundle, so a prerendered page and a client-side navigation to it can never disagree.
const branch = process.env.CF_PAGES_BRANCH ?? '';
// Locally CF_PAGES_BRANCH is unset, so `/beta` is visible in `npm run dev` and `npm run
// preview` too. Only an actual production (main) Cloudflare build hides it.
const isProductionBuild = branch === 'main';

export default defineConfig({
	define: {
		__BETA__: JSON.stringify(!isProductionBuild)
	},
	plugins: [sveltekit()]
});
