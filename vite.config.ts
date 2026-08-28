import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Adapter, runes mode and the mdsvex preprocessor all live in `svelte.config.js`.
// mdsvex needs `extensions` at the SvelteKit-config level (svelte-kit sync reads it
// from there to route `.svx` files), so the config can no longer be inline here.
export default defineConfig({
	plugins: [sveltekit()]
});
