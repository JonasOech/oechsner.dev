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

<!-- Three tracks, the outer two the same width: the post keeps the centred position it has
     without an outline, and the left track is simply filled when there is one to show. The
     right track stays empty on purpose — it is the counterweight that does the centring. -->
<div class="container post-layout">
	{#if outline.length}
		<PostOutline headings={outline} {activeId} />
	{/if}

	<article class="post">
		<header class="post__header enter" style="--i: 0">
			<a class="post__back" href="/">
				<Icon name="arrow-left" size={13} />
				All writing
			</a>

			<h1 class="post__title">{post.title}</h1>

			{#if post.summary}
				<p class="post__summary">{post.summary}</p>
			{/if}

			<!-- The facts and the laurel share a row: neither the meta line nor the tags fill
			     the measure, and the badge claims the slack the two of them leave behind. -->
			<div class="post__facts">
				<div class="post__facts-main">
					<p class="meta">
						<time datetime={post.date}>{formatDate(post.date)}</time>
						<span class="post__dot" aria-hidden="true">·</span>
						{post.readingMinutes} min read
						{#if post.nerdyness}
							<span class="post__dot" aria-hidden="true">·</span>
							<Nerdyness level={post.nerdyness} />
						{/if}
					</p>

					{#if post.tags.length}
						<div class="tag-row post__tags">
							{#each post.tags as tag (tag)}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Strictly `=== false`: a post that never declared either way stays silent. -->
				{#if post.ai === false}
					<HumanWritten />
				{/if}
			</div>
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
	/* One column. At 1100px and up the outline gets a margin of its own on the left; the
	   right track is the empty counterweight that keeps the text on the page's centre line. */
	.post-layout {
		display: grid;
	}

	@media (min-width: 1100px) {
		.post-layout {
			max-width: calc(
				var(--measure-prose) + 2 * var(--outline-width) + 2 * var(--s-6) + 2 * var(--gutter)
			);
			grid-template-columns:
				minmax(0, var(--outline-width))
				minmax(0, var(--measure-prose))
				minmax(0, var(--outline-width));
			justify-content: center;
			column-gap: var(--s-6);
		}
	}

	.post {
		grid-column: 2;
		padding-top: var(--s-8);
		max-width: var(--measure-prose);
		margin-inline: auto;
		width: 100%;
	}

	.post__header {
		display: grid;
		gap: var(--s-3);
		margin-bottom: var(--s-7);
	}

	.post__back {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		align-self: start;
		justify-self: start;
		font-size: 1rem;
		color: var(--text-muted);
		text-decoration: none;
		padding-block: 0.4rem;
		margin-bottom: var(--s-4);
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.post__back:hover {
			color: var(--text);
		}
	}

	.post__back:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.post__title {
		font-size: clamp(1.875rem, 6vw, 2.5rem);
		font-weight: 600;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.post__summary {
		font-size: 1.1875rem;
		font-style: italic;
		line-height: 1.55;
		color: var(--text-secondary);
		text-wrap: pretty;
	}

	.post__dot {
		margin-inline: 0.4em;
	}

	.post__facts {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
		flex-wrap: wrap;
		margin-top: var(--s-2);
	}

	.post__facts-main {
		display: grid;
		gap: var(--s-1);
		min-width: min(100%, 16rem);
		flex: 1 1 16rem;
	}

	.post__cover {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border-radius: 2px;
		margin-bottom: var(--s-7);
	}

	.post__subscribe {
		grid-column: 2;
		width: 100%;
		max-width: var(--measure-prose);
		margin-inline: auto;
		margin-top: var(--s-8);
	}

	.post__nav {
		grid-column: 2;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-5);
		margin-top: var(--s-7);
		padding-top: var(--s-5);
		border-top: 1px solid var(--line);
		max-width: var(--measure-prose);
		width: 100%;
		margin-inline: auto;
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-1);
		align-content: start;
		text-decoration: none;
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
	}

	.post__nav-title {
		color: var(--accent);
		line-height: 1.4;
		text-decoration: underline;
		text-decoration-color: rgba(var(--accent-rgb), 0.4);
		text-underline-offset: 0.2em;
		text-decoration-thickness: 1px;
	}

	@media (hover: hover) and (pointer: fine) {
		.post__nav-link:hover .post__nav-title {
			color: var(--accent-dim);
			text-decoration-color: currentColor;
		}
	}

	.post__nav-link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 599px) {
		.post {
			padding-top: var(--s-6);
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
