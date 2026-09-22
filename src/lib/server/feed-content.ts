/**
 * The full body of a post as feed-reader HTML, for `content:encoded` (RSS) and Atom
 * `<content>`.
 *
 * A reader is a hostile place for the page as the site renders it. It throws away every
 * stylesheet, so KaTeX prints each formula twice and the interactive figures turn into a
 * heap of dead buttons. It also resolves relative URLs against the feed rather than the post,
 * or not at all. So the post component is rendered on the server as usual, and the result is
 * then rewritten for the reader:
 *
 * - comments, scripts, styles, form controls and `aria-hidden` decoration are dropped. That
 *   last one takes KaTeX's visual half with it and leaves the MathML, which readers render.
 * - a PluginRack is flattened into a plain list, since its markup already holds every
 *   description. Any other interactive figure becomes a pointer back to the post.
 * - `/…` and `#…` URLs are made absolute.
 * - classes are swapped for inline styles, the only styling that survives in most readers.
 *   Readers pick their own light or dark background, so the palette here is the site's
 *   accents and translucent greys that read on either, never its dark surfaces.
 */
import { render } from 'svelte/server';
import { parseFragment, serialize, type DefaultTreeAdapterMap } from 'parse5';
import { site } from '$lib/data/site';
import { formatDate, getPostComponent, type Post } from '$lib/posts';
import { escapeXml, postUrl } from '$lib/feed';

type Node = DefaultTreeAdapterMap['childNode'];
type Element = DefaultTreeAdapterMap['element'];
type Parent = DefaultTreeAdapterMap['parentNode'];

const ACCENT = '#e0a85c';
const ACCENT_DIM = '#a87a3c';
const COOL = '#7aa7d9';
const MUTED = '#80818a';
const PLATE = '#f2f2ef';
const RULE = 'rgba(128, 128, 128, 0.3)';
const WASH = 'rgba(128, 128, 128, 0.08)';
const DISPLAY = "'Playfair Display', 'Iowan Old Style', Georgia, serif";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const DROP = new Set(['script', 'style', 'button', 'input', 'select', 'textarea', 'template']);

const hasClass = (el: Element, name: string) =>
	(attr(el, 'class') ?? '').split(/\s+/).includes(name);

/** Takes any parent, since the fragment root has no attributes to look in. */
function attr(el: Parent, name: string): string | undefined {
	return 'attrs' in el ? el.attrs.find((a) => a.name === name)?.value : undefined;
}

function setAttr(el: Element, name: string, value: string) {
	const found = el.attrs.find((a) => a.name === name);
	if (found) found.value = value;
	else el.attrs.push({ name, value });
}

/** The site's prose styles, as inline declarations. Existing inline styles win. */
function styleFor(el: Element, parent: Parent): string | undefined {
	const inPre = 'tagName' in parent && parent.tagName === 'pre';
	switch (el.tagName) {
		case 'h2':
		case 'h3':
			return `font-family: ${DISPLAY}; line-height: 1.3; margin-top: 2em`;
		case 'blockquote':
			return `margin: 1.5em 0; padding-left: 1em; border-left: 2px solid ${ACCENT_DIM}; font-style: italic`;
		case 'pre':
			return `font-family: ${MONO}; font-size: 0.85em; line-height: 1.6; padding: 1em; background: ${WASH}; border: 1px solid ${RULE}; border-radius: 6px; overflow-x: auto`;
		case 'code':
			return inPre
				? `font-family: ${MONO}`
				: `font-family: ${MONO}; font-size: 0.85em; padding: 0.1em 0.35em; background: ${WASH}; border: 1px solid ${RULE}; border-radius: 3px`;
		case 'figure':
			return 'margin: 1.75em 0';
		case 'figcaption':
			return `margin-top: 0.6em; font-size: 0.85em; color: ${MUTED}`;
		case 'img':
			// Figures marked `plain` are dark ink on transparency, so they keep their light plate.
			return hasClass(parent as Element, 'plain')
				? `max-width: 100%; height: auto; box-sizing: border-box; padding: 1em; background: ${PLATE}; border-radius: 6px`
				: hasClass(parent as Element, 'cell-fig')
					? 'height: 120px; width: auto'
					: 'max-width: 100%; height: auto; border-radius: 6px';
		case 'table':
			return 'width: 100%; border-collapse: collapse; font-size: 0.95em';
		case 'th':
			return `text-align: left; padding: 0.5em 0.75em; border-bottom: 1px solid ${RULE}; font-size: 0.75em; letter-spacing: 0.08em; text-transform: uppercase`;
		case 'td':
			return `text-align: left; padding: 0.5em 0.75em; border-bottom: 1px solid ${RULE}`;
		case 'hr':
			return `border: 0; border-top: 1px solid ${RULE}; margin: 2.5em 0`;
		case 'a':
			return hasClass(el, 'cite') ? 'text-decoration: underline dotted' : undefined;
		case 'ol':
			return hasClass(el, 'references')
				? 'list-style: none; padding-left: 0; font-size: 0.875em; line-height: 1.6'
				: undefined;
		case 'li':
			return hasClass(parent as Element, 'references')
				? 'padding-left: 1.5em; text-indent: -1.5em'
				: undefined;
		case 'div':
			return hasClass(el, 'note')
				? `padding: 0.25em 1.25em; border: 1px solid ${RULE}; border-left: 3px solid ${COOL}; border-radius: 8px; font-size: 0.95em`
				: undefined;
	}
}

function absolute(url: string, slug: string): string {
	if (url.startsWith('#')) return `${postUrl(slug)}${url}`;
	if (url.startsWith('/') && !url.startsWith('//')) return `${site.url}${url}`;
	return url;
}

const textOf = (node: Node): string =>
	'value' in node && node.nodeName === '#text'
		? node.value
		: 'childNodes' in node
			? node.childNodes.map(textOf).join('')
			: '';

function findAll(node: Node, match: (el: Element) => boolean, out: Element[] = []): Element[] {
	if ('tagName' in node && match(node)) out.push(node);
	if ('childNodes' in node) node.childNodes.forEach((c) => findAll(c, match, out));
	return out;
}

/** Parses a snippet of our own markup into nodes ready to splice in under `parent`. */
function fragment(html: string, parent: Parent): Node[] {
	const nodes = parseFragment(html).childNodes;
	nodes.forEach((n) => (n.parentNode = parent));
	return nodes;
}

/** A PluginRack's names and descriptions, which the page shows one at a time, as a list. */
function pluginList(rack: Element, parent: Parent): Node[] {
	const names = findAll(rack, (el) => el.tagName === 'button').map((b) => textOf(b).trim());
	const uses = findAll(rack, (el) => hasClass(el, 'panel__use')).map((p) => textOf(p).trim());
	const items = names
		.map((name, i) => `<li><strong>${escapeXml(name)}</strong> — ${escapeXml(uses[i] ?? '')}</li>`)
		.join('');
	return fragment(`<ul style="padding-left: 1.25em">${items}</ul>`, parent);
}

/** Every other widget: keep its caption, and send the reader to the page to use it. */
function widgetStub(widget: Element, parent: Parent, slug: string): Node[] {
	const caption = widget.childNodes.find(
		(n): n is Element => 'tagName' in n && n.tagName === 'figcaption'
	);
	const text = caption ? textOf(caption).trim() : '';
	return fragment(
		`<p style="padding: 0.75em 1em; border: 1px dashed ${RULE}; border-left: 3px solid ${ACCENT}; border-radius: 6px; font-size: 0.95em">` +
			(text ? `${escapeXml(text)}<br />` : '') +
			`<a href="${postUrl(slug)}">▶ Interactive figure — try it on ${site.shortName}</a></p>`,
		parent
	);
}

function rewrite(parent: Parent, slug: string) {
	parent.childNodes = parent.childNodes.flatMap((node): Node[] => {
		if (node.nodeName === '#comment') return [];
		if (!('tagName' in node)) return [node];

		const el = node;
		if (DROP.has(el.tagName) || attr(el, 'aria-hidden') === 'true') return [];
		if (el.tagName === 'figure' && hasClass(el, 'plugin-rack')) return pluginList(el, parent);
		if (el.tagName === 'figure' && hasClass(el, 'widget')) return widgetStub(el, parent, slug);

		const style = styleFor(el, parent);
		const own = attr(el, 'style');
		if (style) setAttr(el, 'style', own ? `${style}; ${own}` : style);

		for (const name of ['href', 'src']) {
			const value = attr(el, name);
			if (value) setAttr(el, name, absolute(value, slug));
		}

		rewrite(el, slug);

		// Classes are spent once the styles are inline, and readers ignore them anyway.
		el.attrs = el.attrs.filter((a) => a.name !== 'class' && !a.name.startsWith('data-'));
		return [el];
	});
}

function body(slug: string): string {
	const Content = getPostComponent(slug);
	if (!Content) throw new Error(`No component for post "${slug}"`);
	const tree = parseFragment(render(Content).body);
	rewrite(tree, slug);
	return serialize(tree).trim();
}

/** The post as a reader shows it: the facts line, the lead, the cover, the body, a way home. */
export function feedContent(post: Post): string {
	const url = postUrl(post.slug);
	const facts = [
		formatDate(post.date),
		`${post.readingMinutes} min read`,
		post.nerdyness && `${'🤓'.repeat(post.nerdyness)} ${post.nerdyness}/3 nerds`,
		post.ai === false && '✒️ 100% human-written'
	]
		.filter(Boolean)
		.join(' · ');

	const tags = post.tags.length
		? `<p style="margin-top: 0; font-size: 0.8em; letter-spacing: 0.08em; text-transform: uppercase; color: ${ACCENT_DIM}">${post.tags.map((t) => `#${escapeXml(t)}`).join('&nbsp;&nbsp;')}</p>`
		: '';

	const cover = post.cover
		? `<p><img src="${absolute(post.cover, post.slug)}" alt="${escapeXml(post.coverAlt ?? '')}" style="width: 100%; height: auto; border-radius: 6px" /></p>`
		: '';

	return [
		`<p style="margin-bottom: 0.25em; font-size: 0.85em; color: ${MUTED}">${facts}</p>`,
		tags,
		post.summary &&
			`<p style="font-size: 1.1em; line-height: 1.7; padding-left: 1em; border-left: 3px solid ${ACCENT}">${escapeXml(post.summary)}</p>`,
		cover,
		body(post.slug),
		`<hr style="border: 0; border-top: 1px solid ${RULE}; margin: 2.5em 0 1em" />`,
		`<p style="font-size: 0.9em; color: ${MUTED}">Originally published on <a href="${url}">${site.shortName}</a>. Read it there →</p>`
	]
		.filter(Boolean)
		.join('\n');
}
