import adapter from '@sveltejs/adapter-cloudflare';
import { mdsvex } from 'mdsvex';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

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

/**
 * Gives every `##`/`###` in a post a stable `id` and records the same list in front-matter,
 * so the post route can render its outline server-side — no DOM walk after hydration, and
 * therefore no flash of a missing sidebar on a prerendered page.
 *
 * This runs on mdast rather than hast because heading text is still clean here: one `text`
 * node per run, with `inlineCode` and math as their own nodes, instead of the pile of spans
 * KaTeX and the syntax highlighter leave behind. `data.hProperties` is mdast-util-to-hast's
 * documented hand-off, so the id survives into the rendered element.
 *
 * mdsvex registers smartypants *before* the plugins passed here, so the text captured for
 * the outline already carries the curly quotes and dashes the heading itself will show.
 *
 * @returns {(tree: any, vfile: any) => void}
 */
function headingOutline() {
	return (tree, vfile) => {
		/** @type {{ depth: number; id: string; text: string }[]} */
		const headings = [];
		const seen = new Set();

		const textOf = (/** @type {any} */ node) => {
			let out = '';
			const walk = (/** @type {any} */ n) => {
				if (typeof n.value === 'string' && n.type !== 'html') out += n.value;
				if (Array.isArray(n.children)) n.children.forEach(walk);
			};
			walk(node);
			return out.trim();
		};

		const walk = (/** @type {any} */ node) => {
			if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
				const text = textOf(node);

				const base =
					text
						.toLowerCase()
						// Strip the punctuation smartypants just introduced along with the rest.
						.replace(/[^\p{Letter}\p{Number}]+/gu, '-')
						.replace(/^-+|-+$/g, '') ||
					// A heading that is nothing but math or an emoji slugs to the empty string.
					`section-${headings.length + 1}`;

				let id = base;
				for (let n = 2; seen.has(id); n++) id = `${base}-${n}`;
				seen.add(id);

				node.data = node.data ?? {};
				node.data.hProperties = { ...node.data.hProperties, id };
				headings.push({ depth: node.depth, id, text });
			}

			if (Array.isArray(node.children)) node.children.forEach(walk);
		};
		walk(tree);

		if (vfile.data?.fm) vfile.data.fm.headings = headings;
	};
}

/**
 * Svelte reads `{` in markup as the start of an expression, and KaTeX's output is full of
 * literal braces: every formula carries a `<annotation encoding="application/x-tex">` holding
 * the original TeX, and set notation like `\{x\}` puts braces in the visible spans too. mdsvex
 * only escapes fenced code blocks, so without this the compiler dies on `\frac{a}{b}`.
 *
 * Rewriting the text as `raw` hast nodes lets us emit numeric entities that survive
 * rehype-stringify untouched — which keeps the MathML branch, and with it screen-reader
 * semantics and copy-as-LaTeX. `&`, `<` and `>` are escaped here too, since raw nodes are
 * printed verbatim and math like `$a < b$` would otherwise inject stray markup.
 *
 * @returns {(tree: any, vfile: any) => void}
 */
function escapeKatexBraces() {
	/** @type {Record<string, string>} */
	const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '{': '&#123;', '}': '&#125;' };

	return (tree, vfile) => {
		const walk = (/** @type {any} */ node, /** @type {boolean} */ inKatex) => {
			if (node.type === 'text' && inKatex) {
				node.type = 'raw';
				node.value = String(node.value).replace(/[&<>{}]/g, (c) => escapes[c]);
				return;
			}

			const classes = node.properties?.className;
			const hasClass = (/** @type {string} */ name) =>
				Array.isArray(classes) && classes.includes(name);

			// rehype-katex swallows a formula it cannot parse into a red inline span instead of
			// throwing. On a prerendered site that means quietly publishing broken math, so stop
			// the build and hand back KaTeX's own message, which names the actual mistake.
			if (hasClass('katex-error')) {
				const where = vfile?.path ? ` (${vfile.path})` : '';
				throw new Error(`${node.properties?.title ?? 'KaTeX could not parse a formula'}${where}`);
			}

			if (Array.isArray(node.children)) {
				const nowInKatex = inKatex || hasClass('katex') || hasClass('katex-display');
				node.children.forEach((/** @type {any} */ child) => walk(child, nowInKatex));
			}
		};

		walk(tree, false);
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
			//
			// `remarkMath` runs first so `$…$` and `$$…$$` are already math nodes by the time
			// `readingTime` walks the tree and smartypants gets at the text. `rehypeKatex` then
			// renders them to static HTML at build time — no KaTeX ships to the browser, only
			// its stylesheet (imported by the post route).
			//
			// remark-math is pinned to v3 deliberately: mdsvex bundles the pre-micromark remark,
			// so v4+ registers micromark extensions that nothing here reads and silently leaves
			// `$…$` as plain text. rehype-katex still matches on the `math-inline`/`math-display`
			// classes v3 emits, so only the remark half needs the old version.
			remarkPlugins: [remarkMath, readingTime, headingOutline],
			rehypePlugins: [rehypeKatex, escapeKatexBraces],
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
