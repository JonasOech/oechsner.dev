import adapter from '@sveltejs/adapter-cloudflare';
import { mdsvex } from 'mdsvex';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';

/**
 * The one bibliography every post cites from. It sits beside the posts, so it lands in the
 * Obsidian vault through the `src/posts` symlink and a reference manager can export into it.
 * The post glob only matches `.svx`, so the site never tries to render it.
 */
const BIBLIOGRAPHY = fileURLToPath(new URL('./src/posts/references.bib', import.meta.url));

/** @type {Record<string, string>} */
const svelteEscapes = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'{': '&#123;',
	'}': '&#125;'
};

/**
 * Makes text safe to print verbatim into Svelte markup: HTML's own specials, plus the braces
 * Svelte would otherwise read as the start of an expression.
 *
 * @param {unknown} text
 */
function escapeForSvelte(text) {
	return String(text).replace(/[&<>"{}]/g, (c) => svelteEscapes[c]);
}

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

/** @type {{ mtime: number; cite: any; ids: Set<string> } | undefined} */
let bibCache;

/**
 * Parses `references.bib`, re-reading it only when it has changed on disk — every post
 * transform asks, and parsing a growing bibliography for each one would add up.
 */
function loadBibliography() {
	const { mtimeMs } = statSync(BIBLIOGRAPHY);
	if (bibCache?.mtime !== mtimeMs) {
		const cite = new Cite(readFileSync(BIBLIOGRAPHY, 'utf8'));
		bibCache = {
			mtime: mtimeMs,
			cite,
			ids: new Set(cite.data.map((/** @type {any} */ entry) => entry.id))
		};
	}
	return bibCache;
}

/**
 * BibTeX's `and others` reaches citeproc as an author literally named "others", which APA then
 * prints as "Zhao & others". Put back the "et al." it stands for.
 *
 * @param {string} text
 */
function etAl(text) {
	return text.replace(/,? (?:&|&#38;|&amp;) others\b\.?/g, ' et al.');
}

/** Pandoc's citation key: word characters, with inner punctuation only between them. */
const KEY = String.raw`[\p{L}\p{N}_](?:[\p{L}\p{N}_]|[:.#$%&+?<>~\/-](?=[\p{L}\p{N}_]))*`;

/** `@key` in running text, as long as it is not part of a word or an address. */
const BARE_KEY = new RegExp(String.raw`(?<![\p{L}\p{N}_@.])@(${KEY})`, 'gu');

/** One item of a bracketed cite: `@key`, `-@key`, either with an optional `, locator`. */
const CITE_ITEM = new RegExp(String.raw`^\s*(-?)@(${KEY})\s*(?:,\s*(.+?))?\s*$`, 'u');

/** The locator abbreviations pandoc understands, mapped to CSL's locator labels. */
/** @type {Record<string, string>} */
const LOCATOR_LABELS = {
	p: 'page',
	pp: 'page',
	page: 'page',
	pages: 'page',
	ch: 'chapter',
	chap: 'chapter',
	chapter: 'chapter',
	sec: 'section',
	section: 'section',
	'§': 'section',
	fig: 'figure',
	figure: 'figure',
	eq: 'equation',
	vol: 'volume'
};

/**
 * Turns pandoc-style citations into author–year links and appends a References section,
 * formatted in APA from `src/posts/references.bib`:
 *
 * - `[@key]` → (Zhao et al., 2023); `[@a; @b, p. 4]` for several, with locators
 * - `[-@key]` → (2023), for when the prose already names the authors
 * - `@key` → Zhao et al. (2023), the narrative form — only for keys the bib knows, so an
 *   `@handle` in the prose is left alone
 *
 * The old remark mdsvex bundles parses every `[…]` as a shortcut `linkReference`, defined or
 * not, so the bracketed forms arrive as those; the bare form is still plain text.
 *
 * The bibliography lists what the post cites plus anything in a `nocite` front-matter list,
 * and goes in as a real `##` heading so `headingOutline` puts it in the outline. An unknown
 * key in brackets stops the build, for the same reason a broken formula does.
 *
 * @returns {(tree: any, vfile: any) => void}
 */
function citations() {
	return (tree, vfile) => {
		const where = vfile?.path ? ` (${vfile.path})` : '';
		/** @type {ReturnType<typeof loadBibliography> | undefined} */
		let bib;
		const getBib = () => (bib ??= loadBibliography());

		/** Keys in order of first use. */
		/** @type {Set<string>} */
		const cited = new Set();
		/** Labels with a `[label]: url` definition are real links, not citations. */
		/** @type {Set<string>} */
		const defined = new Set();

		const findDefinitions = (/** @type {any} */ node) => {
			if (node.type === 'definition') defined.add(String(node.label).toLowerCase());
			if (Array.isArray(node.children)) node.children.forEach(findDefinitions);
		};
		findDefinitions(tree);

		/** @param {string} id */
		const entryOf = (id) => getBib().cite.data.find((/** @type {any} */ e) => e.id === id);

		/** The full reference as plain text, for the hover title on a citation. */
		/** @param {string} id */
		const titleOf = (id) =>
			etAl(getBib().cite.format('bibliography', { template: 'apa', format: 'text', entry: [id] })).trim();

		/** @param {string} id @param {string} text */
		const link = (id, text) =>
			`<a class="cite" href="#ref-${escapeForSvelte(id)}" title="${escapeForSvelte(titleOf(id))}">${escapeForSvelte(text)}</a>`;

		/** Zhao, Zhao & Ng, or Zhao et al., then the year — APA's narrative citation. */
		/** @param {string} id */
		const narrative = (id) => {
			const entry = entryOf(id);
			const names = (entry.author ?? entry.editor ?? []).map(
				(/** @type {any} */ a) => a.family ?? a.literal ?? ''
			);
			const who =
				names.length === 0
					? (entry.title ?? id)
					: names.length === 1
						? names[0]
						: names.length === 2 && names[1] !== 'others'
							? `${names[0]} & ${names[1]}`
							: `${names[0]} et al.`;
			const year = entry.issued?.['date-parts']?.[0]?.[0] ?? 'n.d.';
			return `${who} (${year})`;
		};

		/**
		 * Parses the inside of `[…]`. Returns null if it is not citation syntax at all, so an
		 * ordinary bracketed aside is left as it was.
		 *
		 * @param {string} label
		 */
		const parseCluster = (label) => {
			const items = [];
			for (const part of label.split(';')) {
				const m = CITE_ITEM.exec(part);
				if (!m) return null;
				const [, suppress, id, locator] = m;
				/** @type {Record<string, any>} */
				const item = { id };
				if (suppress) item['suppress-author'] = true;
				if (locator) {
					const lm = /^([\p{L}§]+)\.?\s+(.+)$/u.exec(locator);
					const labelName = lm && LOCATOR_LABELS[lm[1].toLowerCase()];
					if (labelName) {
						item.label = labelName;
						item.locator = lm[2];
					} else {
						item.suffix = `, ${locator}`;
					}
				}
				items.push(item);
			}
			return items;
		};

		const walk = (/** @type {any} */ node) => {
			if (!Array.isArray(node.children)) return;
			if (node.type === 'link' || node.type === 'inlineCode' || node.type === 'code') return;

			node.children = node.children.flatMap((/** @type {any} */ child) => {
				if (
					child.type === 'linkReference' &&
					typeof child.label === 'string' &&
					!defined.has(child.label.toLowerCase())
				) {
					const items = parseCluster(child.label);
					if (!items) return [child];

					for (const { id } of items) {
						if (!getBib().ids.has(id)) {
							throw new Error(`Unknown citation key "${id}"${where}`);
						}
						cited.add(id);
					}

					// Several works share one pair of parentheses, but each gets its own link, so
					// every work is formatted alone and the cluster is reassembled in APA's
					// alphabetical order.
					const parts = items
						.map((item) => {
							const text = etAl(getBib().cite.format('citation', { template: 'apa', entry: [item] }));
							return { id: item.id, text: text.replace(/^\((.*)\)$/s, '$1') };
						})
						.sort((a, b) => a.text.localeCompare(b.text));
					const value = `(${parts.map((p) => link(p.id, p.text)).join('; ')})`;
					return [{ type: 'html', value }];
				}

				if (child.type === 'text' && child.value.includes('@')) {
					/** @type {any[]} */
					const out = [];
					let last = 0;
					for (const m of child.value.matchAll(BARE_KEY)) {
						const id = m[1];
						if (!getBib().ids.has(id)) continue;
						cited.add(id);
						if (m.index > last) out.push({ type: 'text', value: child.value.slice(last, m.index) });
						out.push({ type: 'html', value: link(id, narrative(id)) });
						last = m.index + m[0].length;
					}
					if (!out.length) return [child];
					if (last < child.value.length) out.push({ type: 'text', value: child.value.slice(last) });
					return out;
				}

				walk(child);
				return [child];
			});
		};
		walk(tree);

		const nocite = vfile.data?.fm?.nocite;
		if (Array.isArray(nocite)) {
			for (const id of nocite) {
				if (!getBib().ids.has(id)) throw new Error(`Unknown nocite key "${id}"${where}`);
				cited.add(id);
			}
		}

		if (!cited.size) return;

		const html = etAl(getBib().cite.format('bibliography', {
			template: 'apa',
			format: 'html',
			entry: [...cited]
		}));

		// citeproc sorts the entries APA's way and wraps each in its own div; lift them into list
		// items with anchors the citations can target. It leaves DOIs and URLs as bare text.
		const items = [...html.matchAll(/<div data-csl-entry-id="([^"]+)" class="csl-entry">([\s\S]*?)<\/div>/g)]
			.map(([, id, body]) => {
				const linked = body
					.trim()
					.replace(/https?:\/\/[^\s<]+[^\s<.,;)]/g, (url) => `<a href="${url}">${url}</a>`);
				return `<li id="ref-${escapeForSvelte(id)}">${linked.replace(/[{}]/g, (c) => svelteEscapes[c])}</li>`;
			})
			.join('\n');

		tree.children.push(
			{ type: 'heading', depth: 2, children: [{ type: 'text', value: 'References' }] },
			{ type: 'html', value: `<ol class="references">\n${items}\n</ol>` }
		);
	};
}

/**
 * The import `latexBlocks` injects into a post that uses a formula block. It goes in as a
 * module script because the post's own `<script>` is the instance one, and because that is
 * where mdsvex puts the front-matter — `context="module"`, spelled the old way, is what its
 * regex looks for when it merges `export const metadata` into an existing module script.
 */
const LATEX_BLOCK_IMPORT = [
	'<script context="module">',
	"\timport LatexBlock from '$lib/components/LatexBlock.svelte';",
	'</script>'
].join('\n');

/** An `inlineMath` node that was written with `$$`, not `$` — see `inlineMathDouble`. */
function isDoubleInline(/** @type {any} */ node) {
	const classes = node?.data?.hProperties?.className;
	return (
		node?.type === 'inlineMath' && Array.isArray(classes) && classes.includes('math-display')
	);
}

/** A block math node shaped exactly like the one remark-math's fenced form produces. */
function displayMath(/** @type {string} */ value) {
	return {
		type: 'math',
		value,
		data: {
			hName: 'div',
			hProperties: { className: ['math', 'math-display'] },
			hChildren: [{ type: 'text', value }]
		}
	};
}

/**
 * The inline nodes left over beside a formula, as a note — or nothing, if all that is left
 * is the space that separated them.
 *
 * @param {any[]} children
 */
function noteFrom(children) {
	const note = children.map((child) => ({ ...child }));

	while (note.length && note[0].type === 'text') {
		note[0].value = note[0].value.replace(/^\s+/, '');
		if (note[0].value) break;
		note.shift();
	}
	while (note.length && note[note.length - 1].type === 'text') {
		const last = note[note.length - 1];
		last.value = last.value.replace(/\s+$/, '');
		if (last.value) break;
		note.pop();
	}

	return note.length ? note : undefined;
}

/**
 * Turns display math into a `<LatexBlock>`: the figure in `$lib/components/LatexBlock.svelte`,
 * which scrolls a wide formula inside its own box, maximises it on demand, and prints the
 * note under it.
 *
 * Two shapes, both of which Obsidian renders as display math as well, so a post is still
 * plain markdown in the vault:
 *
 *     $$a^2 + b^2 = c^2$$ the note, on the same line
 *
 *     $$
 *     \begin{aligned} … \end{aligned}
 *     $$
 *     the note, on the line straight after the closing fence
 *
 * The note is optional in both, and stays mdast rather than becoming an attribute string, so
 * emphasis, links and `[@citations]` in it are processed like any other prose — which is why
 * this plugin runs before `citations`.
 *
 * The one-line shape does not reach remark-math's block tokenizer at all: that one bails on a
 * second `$` before the line ends, so what arrives is a paragraph opening with an `inlineMath`
 * node. `inlineMathDouble` is what marks those as having been written with `$$`; the ones this
 * plugin does not claim (a `$$…$$` in the middle of a sentence) have the mark taken back off,
 * so they keep rendering inline as they always have.
 *
 * @returns {(tree: any) => void}
 */
function latexBlocks() {
	return (tree) => {
		/** @param {any} math @param {any[] | undefined} note */
		const block = (math, note) => [
			{ type: 'html', value: '<LatexBlock>' },
			math,
			...(note
				? [
						{
							type: 'paragraph',
							children: note,
							data: { hName: 'figcaption', hProperties: { className: ['latex-note'] } }
						}
					]
				: []),
			{ type: 'html', value: '</LatexBlock>' }
		];

		/** @type {any[]} */
		const children = [];
		let used = false;

		for (let i = 0; i < tree.children.length; i++) {
			const node = tree.children[i];

			// The fenced form. Its note is the paragraph on the very next line — a blank line
			// between the two means the author wrote a new paragraph, and it stays one.
			if (node.type === 'math') {
				const next = tree.children[i + 1];
				const adjacent =
					next?.type === 'paragraph' &&
					next.position?.start?.line === node.position?.end?.line + 1;
				if (adjacent) i++;
				children.push(...block(node, adjacent ? noteFrom(next.children) : undefined));
				used = true;
				continue;
			}

			// The one-line form: `$$…$$` opening a paragraph, the rest of it the note.
			if (node.type === 'paragraph' && isDoubleInline(node.children[0])) {
				const [math, ...rest] = node.children;
				children.push(...block(displayMath(math.value), noteFrom(rest)));
				used = true;
				continue;
			}

			children.push(node);
		}

		// Whatever `$$…$$` is left is inside a sentence, where a display-mode formula would
		// tower over the line it sits on.
		const unclaim = (/** @type {any} */ node) => {
			if (isDoubleInline(node)) {
				node.data.hProperties.className = node.data.hProperties.className.filter(
					(/** @type {string} */ name) => name !== 'math-display'
				);
			}
			if (Array.isArray(node.children)) node.children.forEach(unclaim);
		};
		children.forEach(unclaim);

		tree.children = used ? [{ type: 'html', value: LATEX_BLOCK_IMPORT }, ...children] : children;
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
	return (tree, vfile) => {
		const walk = (/** @type {any} */ node, /** @type {boolean} */ inKatex) => {
			if (node.type === 'text' && inKatex) {
				node.type = 'raw';
				node.value = escapeForSvelte(node.value);
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
			//
			// `latexBlocks` runs first of the local plugins: it rewrites display math into the
			// `<LatexBlock>` figure while the note beside it is still ordinary mdast, so
			// `citations` then treats that note like any other prose. `inlineMathDouble` is
			// only there to tell it which `$…$` were really written `$$…$$`.
			//
			// `citations` runs before `headingOutline` so the References heading it appends is
			// in the outline, and before `readingTime` so it sees the post as written.
			remarkPlugins: [
				[remarkMath, { inlineMathDouble: true }],
				latexBlocks,
				citations,
				readingTime,
				headingOutline
			],
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
