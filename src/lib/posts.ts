import type { Component } from 'svelte';

export type PostMeta = {
	title: string;
	date: string;
	summary: string;
	tags: string[];
	cover?: string;
	coverAlt?: string;
	draft?: boolean;
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
};

export type Post = PostMeta & {
	slug: string;
	readingMinutes: number;
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
			draft: meta.draft ?? false,
			nerdyness: meta.nerdyness,
			// Deliberately not defaulted: `undefined` and `false` mean different things here.
			ai: meta.ai,
			hero: meta.hero ?? false,
			readingMinutes: meta.readingMinutes ?? 1
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

export const allTags: string[] = [...new Set(posts.flatMap((p) => p.tags))].sort();

export function formatDate(iso: string): string {
	return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}
