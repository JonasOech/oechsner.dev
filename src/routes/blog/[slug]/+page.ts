import { error } from '@sveltejs/kit';
import { getPost, posts } from '$lib/posts';
import type { EntryGenerator, PageLoad } from './$types';

/** Tells the prerenderer which slugs exist, so every post becomes a static HTML file. */
export const entries: EntryGenerator = () => posts.map((post) => ({ slug: post.slug }));

export const load: PageLoad = ({ params }) => {
	const post = getPost(params.slug);
	if (!post) error(404, `No post called “${params.slug}”.`);

	// Only serialisable metadata crosses the load boundary — the post component itself is
	// resolved synchronously in +page.svelte, so prerendered data stays plain JSON.
	return { post };
};
