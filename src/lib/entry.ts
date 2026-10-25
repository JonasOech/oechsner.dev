import { posts } from '$lib/posts';

/**
 * Notebook entry number for a post: the oldest published post is Entry 001 and the
 * newest carries the highest number. Derived from the (newest-first) `posts` list, so
 * nothing is stored in front-matter.
 */
export function entryNumber(slug: string): string {
	const i = posts.findIndex((p) => p.slug === slug);
	return String(i === -1 ? 0 : posts.length - i).padStart(3, '0');
}
