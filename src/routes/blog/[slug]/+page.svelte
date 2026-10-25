<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import HumanWritten from '$lib/components/HumanWritten.svelte';
	import PostOutline from '$lib/components/PostOutline.svelte';
	import Subscribe from '$lib/components/Subscribe.svelte';
	import { formatDate, getPostComponent, getNeighbours, posts } from '$lib/posts';
	import { site } from '$lib/data/site';
	import type { PageProps } from './$types';
	// Math is rendered to static HTML at build time, so posts only need KaTeX's stylesheet —
	// scoped to this route so the woff2 faces aren't pulled in on pages without equations.
	import 'katex/dist/katex.min.css';

	let { data }: PageProps = $props();

	const post = $derived(data.post);
	const Content = $derived(getPostComponent(post.slug)!);
	const neighbours = $derived(getNeighbours(post.slug));

	/** The post's place in the book: oldest published post is chapter one. */
	const chapterNumber = $derived(posts.length - posts.findIndex((p) => p.slug === post.slug));
	const chapter = $derived(roman(chapterNumber));

	function roman(n: number): string {
		const table: [number, string][] = [
			[10, 'X'],
			[9, 'IX'],
			[5, 'V'],
			[4, 'IV'],
			[1, 'I']
		];
		let out = '';
		for (const [value, glyph] of table) {
			while (n >= value) {
				out += glyph;
				n -= value;
			}
		}
		return out;
	}

	// A single heading is not an outline, it is a label — nothing to navigate between.
	const outline = $derived(post.headings.length > 1 ? post.headings : []);

	/** The heading the reader is under, so the outline says where they are, not just where they can go. */
	let activeId = $state('');

	$effect(() => {
		// Re-run on navigation between posts: a new outline means new elements to watch.
		if (!outline.length) return;

		const targets = outline
			.map((h) => document.getElementById(h.id))
			.filter((el): el is HTMLElement => el !== null);

		// The band is the top of the reading area down to a third of the viewport. A heading
		// inside it is the one being read; of several, the last, since that is the one the
		// reader has most recently passed.
		const observer = new IntersectionObserver(
			() => {
				const top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
				const passed = targets.filter((el) => el.getBoundingClientRect().top <= top + 8);
				// Above the first heading nothing is marked, rather than the outline claiming
				// the reader is in a section they have not reached.
				activeId = passed.at(-1)?.id ?? '';
			},
			// A threshold at every step keeps the callback firing through a long section,
			// rather than only when a heading crosses the edge of the viewport.
			{ rootMargin: '0px 0px -66% 0px', threshold: [0, 0.5, 1] }
		);

		targets.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});
</script>

<Seo
	title={post.title}
	description={post.summary}
	type="article"
	published={post.date}
	image={post.cover ?? '/img/og.svg'}
/>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.summary,
		datePublished: post.date,
		author: { '@type': 'Person', name: site.name, url: site.url },
		keywords: post.tags.join(', ')
	})}<\/script>`}
</svelte:head>

<!-- Two tracks: the text, and a wide right margin that carries the sidenotes (the facts about
     the post) and the contents. Below 1100px the margin folds into a block under the chapter
     opening and the contents drop out. -->
<div class="container post-layout">
	<header class="post__header enter" style="--i: 0">
		<div class="post__runhead">
			<a class="post__back" href="/">
				<Icon name="arrow-left" size={14} />
				Contents
			</a>
			<span class="post__runhead-title">{site.name}</span>
		</div>

		<p class="post__chapter">Chapter {chapter}</p>
		<h1 class="post__title">{post.title}</h1>

		{#if post.summary}
			<p class="post__summary">{post.summary}</p>
		{/if}

		<span class="post__rule" aria-hidden="true"></span>
	</header>

	<aside class="margin" aria-label="About this post">
		<dl class="notes">
			<div class="notes__item">
				<dt>Written</dt>
				<dd><time class="num" datetime={post.date}>{formatDate(post.date)}</time></dd>
			</div>
			<div class="notes__item">
				<dt>Length</dt>
				<dd>{post.readingMinutes} min read</dd>
			</div>
			{#if post.nerdyness}
				<div class="notes__item">
					<dt>Depth</dt>
					<dd><Nerdyness level={post.nerdyness} /></dd>
				</div>
			{/if}
			{#if post.tags.length}
				<div class="notes__item">
					<dt>Subjects</dt>
					<dd class="tag-row post__tags">
						{#each post.tags as tag (tag)}
							<span class="tag">{tag}</span>
						{/each}
					</dd>
				</div>
			{/if}
		</dl>

		<!-- Strictly `=== false`: a post that never declared either way stays silent. -->
		{#if post.ai === false}
			<div class="margin__laurel">
				<HumanWritten />
			</div>
		{/if}

		{#if outline.length}
			<PostOutline headings={outline} {activeId} />
		{/if}
	</aside>

	<article class="post">
		{#if post.cover}
			<figure class="post__plate enter" style="--i: 1">
				<img
					class="post__cover"
					src={post.cover}
					alt={post.coverAlt ?? ''}
					width="1200"
					height="675"
					decoding="async"
				/>
			</figure>
		{/if}

		<div class="prose post__body">
			<Content />
		</div>

		<p class="post__folio num" aria-hidden="true">{chapterNumber}</p>
	</article>

	<div class="post__subscribe">
		<Subscribe />
	</div>

	{#if neighbours.prev || neighbours.next}
		<nav class="post__nav" aria-label="More articles">
			{#if neighbours.prev}
				<a class="post__nav-link" href="/blog/{neighbours.prev.slug}">
					<span class="label">Newer</span>
					<span class="post__nav-title">{neighbours.prev.title}</span>
				</a>
			{:else}
				<span></span>
			{/if}

			{#if neighbours.next}
				<a class="post__nav-link post__nav-link--next" href="/blog/{neighbours.next.slug}">
					<span class="label">Older</span>
					<span class="post__nav-title">{neighbours.next.title}</span>
				</a>
			{/if}
		</nav>
	{/if}
</div>

<style>
	/* One column by default (the margin folds in under the header); two from 1100px. The
	   pair is centred as a unit, so the text sits slightly left of the page's centre line,
	   which is where a margin-note layout puts it. */
	.post-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-areas:
			'head'
			'margin'
			'body'
			'subscribe'
			'nav';
		justify-content: center;
	}

	@media (min-width: 1100px) {
		.post-layout {
			grid-template-columns: minmax(0, var(--measure-prose)) minmax(0, var(--margin-width));
			grid-template-areas:
				'head      margin'
				'body      margin'
				'subscribe .'
				'nav       .';
			column-gap: var(--s-8);
			grid-template-rows: auto 1fr auto auto;
		}
	}

	/* — Chapter opening — */

	.post__header {
		grid-area: head;
		display: grid;
		justify-items: center;
		text-align: center;
		gap: var(--s-4);
		padding-top: var(--s-5);
		margin-bottom: var(--s-6);
		min-width: 0;
	}

	/* The running head: where you are, and the way back. A hairline under it. */
	.post__runhead {
		justify-self: stretch;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-4);
		padding-bottom: var(--s-2);
		margin-bottom: var(--s-6);
		border-bottom: 1px solid var(--line);
		font-size: 1rem;
		letter-spacing: 0.1em;
		font-variant-caps: all-small-caps;
		color: var(--text-muted);
	}

	.post__runhead-title {
		font-style: italic;
		font-variant-caps: normal;
		letter-spacing: 0.01em;
	}

	.post__back {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		color: var(--text-muted);
		text-decoration: none;
		min-height: 44px;
		margin-block: -0.75rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.post__back :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.post__back:hover {
			color: var(--accent);
		}
		.post__back:hover :global(svg) {
			transform: translateX(-3px);
		}
	}

	.post__back:active {
		color: var(--accent-press);
	}

	.post__back:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.post__chapter {
		font-size: 1.0625rem;
		letter-spacing: 0.14em;
		font-variant-caps: all-small-caps;
		color: var(--accent);
		font-weight: 500;
	}

	.post__title {
		font-size: clamp(2.125rem, 5vw, 3.125rem);
		font-weight: 400;
		line-height: 1.12;
		letter-spacing: -0.01em;
	}

	.post__summary {
		max-width: 30rem;
		font-size: 1.25rem;
		font-style: italic;
		line-height: 1.45;
		color: var(--text-secondary);
	}

	.post__rule {
		display: block;
		width: 3rem;
		height: 3px;
		margin-top: var(--s-2);
		border-top: 1px solid var(--text);
		border-bottom: 1px solid var(--text);
	}

	/* — Sidenotes — */

	.margin {
		grid-area: margin;
		min-width: 0;
		display: grid;
		gap: var(--s-5);
		align-content: start;
		margin-bottom: var(--s-6);
	}

	.notes {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: var(--s-3) var(--s-5);
		padding-block: var(--s-3);
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
	}

	.notes__item {
		min-width: 0;
	}

	.notes dt {
		font-size: 0.9375rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		font-variant-caps: all-small-caps;
		color: var(--text-muted);
		line-height: 1.3;
	}

	.notes dd {
		margin: 0;
		color: var(--text);
		line-height: 1.35;
	}

	.post__tags {
		margin-top: 0;
		gap: 0 var(--s-3);
	}

	.margin__laurel {
		justify-self: start;
	}

	@media (min-width: 1100px) {
		.margin {
			position: sticky;
			top: calc(var(--header-h) + var(--s-5));
			align-self: start;
			max-height: calc(100dvh - var(--header-h) - var(--s-6));
			overflow-y: auto;
			scrollbar-width: thin;
			/* The first sidenote lines up with the chapter number, not the running head. */
			margin-top: 5.5rem;
			margin-bottom: 0;
			padding-bottom: var(--s-4);
		}

		.notes {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-3);
			border-top: 0;
			padding-block: 0 var(--s-4);
			padding-left: var(--s-4);
			border-left: 1px solid var(--line-strong);
			border-bottom: 0;
		}
	}

	/* — Body — */

	.post {
		grid-area: body;
		min-width: 0;
		padding-top: var(--s-2);
	}

	.post__plate {
		margin: 0 0 var(--s-7);
		padding: var(--s-2);
		background: var(--plate);
		border: 1px solid var(--line-strong);
	}

	.post__cover {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}

	/* Opening of the chapter: the first line in small capitals, and a drop initial where the
	   browser can raise one. Only a plain paragraph that opens the text gets either. */
	.post__body > :global(p:first-child)::first-line {
		font-variant-caps: small-caps;
		letter-spacing: 0.04em;
		color: var(--text);
	}

	@supports (initial-letter: 3) {
		.post__body > :global(p:first-child)::first-letter {
			initial-letter: 3 2;
			font-weight: 500;
			color: var(--accent);
			margin-right: 0.12em;
		}
	}

	/* The folio: the chapter's number, centred at the foot of the text like a page number. */
	.post__folio {
		margin-top: var(--s-7);
		text-align: center;
		font-size: 1rem;
		letter-spacing: 0.1em;
		color: var(--text-muted);
	}

	.post__folio::before,
	.post__folio::after {
		content: '\2014';
		margin-inline: 0.75em;
		color: var(--line-strong);
	}

	.post__subscribe {
		grid-area: subscribe;
		width: 100%;
		max-width: var(--measure-prose);
		margin-top: var(--s-7);
	}

	.post__nav {
		grid-area: nav;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-5);
		margin-top: var(--s-8);
		padding-top: var(--s-4);
		border-top: 1px solid var(--line-strong);
		max-width: var(--measure-prose);
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-1);
		align-content: start;
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
	}

	@media (hover: hover) and (pointer: fine) {
		.post__nav-link:hover .post__nav-title {
			color: var(--accent);
		}
	}

	.post__nav-link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.post__nav-title {
		color: var(--text);
		font-size: 1.1875rem;
		font-weight: 500;
		line-height: 1.3;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (max-width: 767px) {
		.post__header {
			padding-top: var(--s-3);
		}
		.post__nav {
			grid-template-columns: 1fr;
			gap: var(--s-5);
		}
		.post__nav-link--next {
			text-align: left;
			justify-items: start;
		}
	}
</style>
