import type { Component } from 'svelte';

export type PostMeta = {
	title: string;
	date: string;
	summary: string;
	tags: string[];
	cover?: string;
	coverAlt?: string;
	/** A PDF in `static/` to offer for download under the post's facts; omit for no button. */
	download?: string;
	/** The button's label. Defaults to "Download PDF". */
	downloadLabel?: string;
	draft?: boolean;
	/**
	 * Makes this a link post: an entry that points somewhere else (a running experiment, a
	 * tool, a talk) instead of being read here. Listings and feeds send the reader straight to
	 * this URL; `/blog/<slug>` still renders, as a landing page with the body as a short note
	 * and a button out. Must be an absolute `http(s)` URL.
	 */
	link?: string;
	/** The link post's button label. Defaults to "Visit". */
	linkLabel?: string;
	/** How deep the post goes, 1–3. Shown as 🤓 beside the read time; omit to hide it. */
	nerdyness?: 1 | 2 | 3;
	/**
	 * Whether the prose was written with an LLM. Only an explicit `false` earns the
	 * human-written laurel on the post page — an omitted field claims nothing either way.
	 */
	ai?: boolean;
	/**
	 * Whether the post may take the lead slot on the home page. The newest post with
	 * `hero: true` wins it; an omitted field means "not eligible", so a new post has to
	 * opt in rather than displace the current lead the moment it lands.
	 */
	hero?: boolean;
	/** Injected at build time by the `readingTime` remark plugin in svelte.config.js. */
	readingMinutes?: number;
	/** Injected at build time by the `headingOutline` remark plugin in svelte.config.js. */
	headings?: Heading[];
};

/** One `##`/`###` in a post body, as the post route's outline renders it. */
export type Heading = { depth: 2 | 3; id: string; text: string };

export type Post = PostMeta & {
	slug: string;
	readingMinutes: number;
	headings: Heading[];
};

type PostModule = {
	default: Component;
	metadata: Partial<PostMeta>;
};

/**
 * Every post in `src/posts` is an mdsvex `.svx` component. The glob is eager so the
 * blog index, the home page and the post route can all read front-matter synchronously
 * and be fully prerendered — there is no loading state anywhere in the blog.
 *
 * With a handful of posts this bundles cheaply. If the archive ever grows past ~50
 * posts, switch to a lazy glob plus a build-time metadata manifest.
 */
const modules = import.meta.glob<PostModule>('/src/posts/*.svx', { eager: true });

/**
 * `src/posts/2026-06-11-this-blog-is-just-files.svx` → `this-blog-is-just-files`.
 * The date prefix keeps the folder sorted on disk but stays out of the URL.
 */
function slugFromPath(path: string): string {
	return path
		.split('/')
		.pop()!
		.replace(/\.svx$/, '')
		.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/**
 * A link post's URL leaves the site from every listing, so a typo would only surface as a
 * dead link in production. Fail the build instead — the same bargain as the title guard.
 */
function checkedLink(slug: string, link: string): string {
	let url: URL;
	try {
		url = new URL(link);
	} catch {
		throw new Error(`Post "${slug}" has a \`link\` that is not an absolute URL: ${link}`);
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		throw new Error(`Post "${slug}" has a \`link\` that is not http(s): ${link}`);
	}
	return link;
}

const entries: { post: Post; component: Component }[] = Object.entries(modules)
	.map(([path, mod]) => {
		const slug = slugFromPath(path);
		const meta = mod.metadata ?? {};

		if (!meta.title || !meta.date) {
			throw new Error(`Post "${slug}" is missing a title or date in its front-matter.`);
		}

		const post: Post = {
			slug,
			title: meta.title,
			date: meta.date,
			summary: meta.summary ?? '',
			tags: meta.tags ?? [],
			cover: meta.cover,
			coverAlt: meta.coverAlt,
			download: meta.download,
			downloadLabel: meta.downloadLabel,
			link: meta.link ? checkedLink(slug, meta.link) : undefined,
			linkLabel: meta.linkLabel,
			draft: meta.draft ?? false,
			nerdyness: meta.nerdyness,
			// Deliberately not defaulted: `undefined` and `false` mean different things here.
			ai: meta.ai,
			hero: meta.hero ?? false,
			readingMinutes: meta.readingMinutes ?? 1,
			// Only the post route reads this, but the eager glob means every page carries
			// every post's outline. It is a few dozen short strings per post — the same
			// bargain the glob already makes for titles and summaries, and it stays cheap
			// under the ~50-post ceiling noted above.
			headings: meta.headings ?? []
		};

		return { post, component: mod.default };
	})
	.filter(({ post }) => !(post.draft && import.meta.env.PROD))
	.sort((a, b) => b.post.date.localeCompare(a.post.date));

/** All published posts, newest first. */
export const posts: Post[] = entries.map((e) => e.post);

export function getPost(slug: string): Post | undefined {
	return entries.find((e) => e.post.slug === slug)?.post;
}

export function getPostComponent(slug: string): Component | undefined {
	return entries.find((e) => e.post.slug === slug)?.component;
}

/** Newer / older neighbours for the post footer, in reading order. */
export function getNeighbours(slug: string): { prev?: Post; next?: Post } {
	const i = posts.findIndex((p) => p.slug === slug);
	if (i === -1) return {};
	return { prev: posts[i - 1], next: posts[i + 1] };
}

/** Where a listing should send the reader: off-site for a link post, the post page otherwise. */
export function postHref(post: Pick<Post, 'slug' | 'link'>): string {
	return post.link ?? `/blog/${post.slug}`;
}

/** `https://www.example.com/x` → `example.com`, for the meta line where read time would be. */
export function linkHost(link: string): string {
	return new URL(link).hostname.replace(/^www\./, '');
}

export const allTags: string[] = [...new Set(posts.flatMap((p) => p.tags))].sort();

export function formatDate(iso: string): string {
	return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}
