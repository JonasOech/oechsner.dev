/**
 * Helpers shared by the RSS (/rss.xml) and Atom (/atom.xml) feeds, so the two stay in
 * lockstep — same escaping, same permalinks, same dates. The XML templates themselves
 * live in their routes, since that is the part that legitimately differs.
 */
import { site } from '$lib/data/site';
import type { Post } from '$lib/posts';

export const escapeXml = (s: string) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

export const postUrl = (slug: string) => `${site.url}/blog/${slug}`;

/** Post dates are `YYYY-MM-DD`; feeds treat them as midnight UTC (RFC 3339). */
export const postInstant = (date: string) => `${date}T00:00:00Z`;

/** RFC 3339 instant for the newest post (posts are newest-first), or build time if none. */
export const feedUpdated = (posts: Pick<Post, 'date'>[]) =>
	posts.length ? postInstant(posts[0].date) : new Date().toISOString();
