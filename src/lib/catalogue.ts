import { posts } from '$lib/posts';

/**
 * The "catalogue" vocabulary the design borrows from museum records. Nothing here is stored:
 * an accession number is derived from the published posts, oldest first, numbered within
 * its year (`2026.003` = the third entry dated 2026). Publishing an older post later would
 * renumber the entries after it, which is acceptable for decoration but means the number is
 * not a permalink -- the slug is.
 */
const numbers: Map<string, string> = (() => {
	const perYear = new Map<string, number>();
	const out = new Map<string, string>();
	const oldestFirst = [...posts].sort(
		(a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug)
	);
	for (const post of oldestFirst) {
		const year = post.date.slice(0, 4);
		const n = (perYear.get(year) ?? 0) + 1;
		perYear.set(year, n);
		out.set(post.slug, `${year}.${String(n).padStart(3, '0')}`);
	}
	return out;
})();

/** `2026.003`, or an em dash for a slug that is not published. */
export function accession(slug: string): string {
	return numbers.get(slug) ?? '—';
}

/** Tags read as the "medium" line of a record: `machine learning, project`. */
export function medium(tags: string[]): string {
	return tags.length ? tags.join(', ') : 'text';
}
