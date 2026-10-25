<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import HumanWritten from '$lib/components/HumanWritten.svelte';
	import PostOutline from '$lib/components/PostOutline.svelte';
	import Subscribe from '$lib/components/Subscribe.svelte';
	import { formatDate, getPostComponent, getNeighbours } from '$lib/posts';
	import { site } from '$lib/data/site';
	import type { PageProps } from './$types';
	// Math is rendered to static HTML at build time, so posts only need KaTeX's stylesheet —
	// scoped to this route so the woff2 faces aren't pulled in on pages without equations.
	import 'katex/dist/katex.min.css';

	let { data }: PageProps = $props();

	const post = $derived(data.post);
	const Content = $derived(getPostComponent(post.slug)!);
	const neighbours = $derived(getNeighbours(post.slug));

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

<!-- Twelve columns. The margin (columns 1-3) holds the way back, the facts and the outline,
     hung left like the rail labels elsewhere; the article takes columns 4-12 and sets its
     prose at the reading measure from the left edge of that block. Below 900px the margin
     collapses into a run of facts above the title. -->
<div class="container post-layout">
	<aside class="post__margin" aria-label="About this post">
		<a class="post__back" href="/">
			<Icon name="arrow-left" />
			All articles
		</a>

		<dl class="facts">
			<div class="facts__item">
				<dt class="label">Published</dt>
				<dd><time datetime={post.date}>{formatDate(post.date)}</time></dd>
			</div>
			<div class="facts__item">
				<dt class="label">Reading</dt>
				<dd>{post.readingMinutes} min read</dd>
			</div>
			{#if post.nerdyness}
				<div class="facts__item">
					<dt class="label">Depth</dt>
					<dd><Nerdyness level={post.nerdyness} /></dd>
				</div>
			{/if}
			{#if post.tags.length}
				<div class="facts__item facts__item--tags">
					<dt class="label">Topics</dt>
					<dd>
						<div class="tag-row">
							{#each post.tags as tag (tag)}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					</dd>
				</div>
			{/if}
		</dl>

		<!-- Strictly `=== false`: a post that never declared either way stays silent. -->
		{#if post.ai === false}
			<div class="post__human">
				<HumanWritten />
			</div>
		{/if}

		{#if outline.length}
			<PostOutline headings={outline} {activeId} />
		{/if}
	</aside>

	<article class="post">
		<header class="post__header enter" style="--i: 0">
			<h1 class="post__title">{post.title}</h1>

			{#if post.summary}
				<p class="post__summary">{post.summary}</p>
			{/if}
		</header>

		{#if post.cover}
			<img
				class="post__cover enter"
				style="--i: 1"
				src={post.cover}
				alt={post.coverAlt ?? ''}
				width="1200"
				height="675"
				decoding="async"
			/>
		{/if}

		<div class="prose post__body">
			<Content />
		</div>
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
	/* Single column by default; the twelve columns take over at 900px. */
	.post-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		padding-top: var(--s-5);
	}

	.post {
		min-width: 0;
		max-width: var(--measure-prose);
	}

	.post__margin {
		min-width: 0;
		margin-bottom: var(--s-5);
	}

	@media (min-width: 900px) {
		.post-layout {
			grid-template-columns: repeat(12, minmax(0, 1fr));
			column-gap: var(--col-gap);
			padding-top: var(--s-7);
		}

		.post__margin {
			grid-column: 1 / 4;
			grid-row: 1;
			margin-bottom: 0;
			/* Stretches to the article's height, so the outline has room to stick in. */
		}

		.post {
			grid-column: 4 / -1;
			grid-row: 1;
		}

		.post__subscribe,
		.post__nav {
			grid-column: 4 / -1;
		}
	}

	.post__back {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		text-decoration: none;
		min-height: 44px;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.post__back:hover {
			color: var(--accent);
		}
	}

	.post__back:active {
		color: var(--accent-dim);
	}

	.post__back:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	/* Left-hung metadata: a ruled list of label and value, one fact per hairline. */
	.facts {
		margin: var(--s-3) 0 0;
		display: grid;
		border-bottom: 1px solid var(--line);
	}

	.facts__item {
		display: grid;
		gap: 0.2rem;
		padding: var(--s-3) 0;
		border-top: 1px solid var(--line);
	}

	.facts__item:first-child {
		border-top: 1px solid var(--text);
	}

	.facts dd {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.4;
		color: var(--text);
		font-variant-numeric: tabular-nums lining-nums;
	}

	.post__human {
		margin-top: var(--s-5);
	}

	.post__header {
		display: grid;
		gap: var(--s-4);
		margin-bottom: var(--s-6);
	}

	.post__title {
		font-size: clamp(1.875rem, 4.2vw, 2.5rem);
		font-weight: 600;
		line-height: 1.12;
		letter-spacing: -0.025em;
	}

	.post__summary {
		font-size: 1.1875rem;
		line-height: 1.55;
		color: var(--text-secondary);
		text-wrap: pretty;
	}

	.post__cover {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border: 1px solid var(--line);
		margin-bottom: var(--s-7);
	}

	.post__subscribe {
		width: 100%;
		max-width: var(--measure-prose);
		margin-top: var(--s-8);
	}

	.post__nav {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-5);
		margin-top: var(--s-8);
		border-top: 1px solid var(--text);
		max-width: var(--measure-prose);
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-2);
		align-content: start;
		padding: var(--s-4) 0;
		text-decoration: none;
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
		grid-column: 2;
	}

	.post__nav-title {
		color: var(--text);
		font-weight: 600;
		line-height: 1.35;
		letter-spacing: -0.01em;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-decoration-color: transparent;
		text-underline-offset: 0.2em;
		transition:
			color var(--dur-fast) var(--ease-out),
			text-decoration-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.post__nav-link:hover .post__nav-title {
			color: var(--accent);
			text-decoration-color: currentColor;
		}
	}

	.post__nav-link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 899px) {
		/* The margin folds into a compact run of facts above the title. */
		.facts {
			display: flex;
			flex-wrap: wrap;
			gap: 0 var(--s-6);
			border-top: 1px solid var(--text);
			margin-top: 0;
		}
		.facts__item,
		.facts__item:first-child {
			border-top: 0;
			padding: var(--s-2) 0;
		}
		.facts__item--tags {
			flex-basis: 100%;
		}
		.post__human {
			margin-top: var(--s-3);
		}
	}

	@media (max-width: 767px) {
		.post__nav {
			grid-template-columns: 1fr;
			gap: 0;
		}
		.post__nav-link--next {
			text-align: left;
			justify-items: start;
			grid-column: 1;
			border-top: 1px solid var(--line);
		}
	}
</style>
