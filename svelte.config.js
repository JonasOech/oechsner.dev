import adapter from '@sveltejs/adapter-cloudflare';
import { mdsvex } from 'mdsvex';

/**
 * Counts the words in a post's body and writes `readingMinutes` into its front-matter,
 * so the blog index can show a read time without shipping the post text to the client.
 * mdsvex exposes parsed front-matter on `vfile.data.fm`.
 *
 * @returns {(tree: any, vfile: any) => void}
 */
function readingTime() {
	return (tree, vfile) => {
		let words = 0;
		const walk = (/** @type {any} */ node) => {
			if (node.type === 'text' || node.type === 'inlineCode') {
				words += String(node.value).trim().split(/\s+/).filter(Boolean).length;
			}
			// Code blocks are skimmed, not read — count them at a quarter weight.
			if (node.type === 'code') {
				words += Math.ceil(String(node.value).trim().split(/\s+/).filter(Boolean).length / 4);
			}
			if (Array.isArray(node.children)) node.children.forEach(walk);
		};
		walk(tree);

		if (vfile.data?.fm) {
			vfile.data.fm.readingMinutes = Math.max(1, Math.round(words / 200));
		}
	};
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// `.svx` files are Svelte components, so SvelteKit has to recognise the
	// extension before mdsvex can preprocess them.
	extensions: ['.svelte', '.svx'],

	preprocess: [
		mdsvex({
			extensions: ['.svx'],
			// Posts render inside the blog post route, so no mdsvex layout wrapper here.
			// Fenced code blocks go through mdsvex's bundled Prism; the token colours are
			// themed from CSS variables in app.css.
			remarkPlugins: [readingTime],
			smartypants: { dashes: 'oldschool' }
		})
	],

	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},

	kit: {
		adapter: adapter()
	}
};

export default config;
