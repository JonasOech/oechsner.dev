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
				<Icon name="arrow-left" />
				All articles
			</a>

			<h1 class="post__title">{post.title}</h1>

			<!-- Author block, as under a paper's title. -->
			<p class="post__author">
				<span class="post__name">{site.name}</span>
				<span class="post__affil">{site.role}</span>
			</p>

			<p class="meta post__meta">
				<time datetime={post.date}>{formatDate(post.date)}</time>
				<span class="post__dot" aria-hidden="true">·</span>
				{post.readingMinutes} min read
				{#if post.nerdyness}
					<span class="post__dot" aria-hidden="true">·</span>
					<Nerdyness level={post.nerdyness} />
				{/if}
			</p>

			{#if post.summary || post.tags.length || post.ai === false}
				<div class="post__abstract">
					{#if post.summary}
						<p class="post__abstract-label">Abstract</p>
						<p class="post__summary">{post.summary}</p>
					{/if}

					<!-- The keywords and the laurel share a row: neither fills the measure, and
					     the badge claims the slack the keywords leave behind. -->
					<div class="post__facts">
						{#if post.tags.length}
							<p class="post__keywords">
								<span class="post__keywords-label">Keywords:</span>
								{#each post.tags as tag (tag)}
									<span class="tag">{tag}</span>
								{/each}
							</p>
						{/if}

						<!-- Strictly === false: a post that never declared either way stays silent. -->
						{#if post.ai === false}
							<HumanWritten />
						{/if}
					</div>
				</div>
			{/if}
		</header>

		{#if post.cover}
			<figure class="post__figure enter" style="--i: 1">
				<img
					class="post__cover"
					src={post.cover}
					alt={post.coverAlt ?? ''}
					width="1200"
					height="675"
					decoding="async"
				/>
				{#if post.coverAlt}
					<figcaption class="post__caption">{post.coverAlt}.</figcaption>
				{/if}
			</figure>
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
	/* Below the outline's breakpoint this is a single column and the margin-inline on the
	   children does the centring; above it, the explicit tracks take over. */
	.post-layout {
		display: grid;
	}

	@media (min-width: 1100px) {
		.post-layout {
			/* The two flanking tracks are equal, so the middle one lands on the page's centre
			   line whether or not an outline was rendered into the left. */
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
		padding-top: var(--s-6);
		max-width: var(--measure-prose);
		margin-inline: auto;
	}

	.post__header {
		display: grid;
		justify-items: center;
		text-align: center;
		gap: var(--s-2);
		margin-bottom: var(--s-6);
	}

	.post__back {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		font-size: 1rem;
		font-variant-caps: all-small-caps;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		text-decoration: none;
		padding: 0.5rem 0;
		min-height: 44px;
		margin-bottom: var(--s-4);
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
		border-radius: 1px;
		box-shadow: var(--focus-ring);
	}

	.post__title {
		font-size: clamp(1.75rem, 4.2vw, 2.5rem);
		font-weight: 500;
		line-height: 1.15;
		letter-spacing: -0.005em;
		max-width: 24ch;
	}

	.post__author {
		display: grid;
		gap: 0.1rem;
		margin-top: var(--s-3);
	}

	.post__name {
		font-size: 1.125rem;
		color: var(--text);
	}

	.post__affil {
		font-style: italic;
		font-size: 0.9375rem;
		color: var(--text-muted);
	}

	.post__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	/* The abstract: ruled above and below, inset from the column on both sides. */
	.post__abstract {
		width: 100%;
		margin-top: var(--s-5);
		padding: var(--s-4) var(--s-5);
		border-top: 1px solid var(--text);
		border-bottom: 1px solid var(--line);
		text-align: left;
	}

	.post__abstract-label {
		text-align: center;
		font-size: 1rem;
		font-weight: 700;
		font-variant-caps: all-small-caps;
		letter-spacing: 0.1em;
		color: var(--text);
		margin: 0 0 var(--s-2);
	}

	.post__summary {
		font-size: 1rem;
		line-height: 1.55;
		color: var(--text-secondary);
		text-align: justify;
		text-align-last: left;
		hyphens: auto;
	}

	.post__facts {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
		flex-wrap: wrap;
		margin-top: var(--s-3);
	}

	.post__keywords {
		flex: 1 1 14rem;
		min-width: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 var(--s-3);
	}

	.post__keywords-label {
		font-style: italic;
		color: var(--text-muted);
	}

	.post__figure {
		margin: 0 0 var(--s-7);
	}

	.post__cover {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border: 1px solid var(--line);
		background: var(--plate);
	}

	.post__caption {
		margin-top: var(--s-2);
		font-size: 0.9375rem;
		line-height: 1.45;
		color: var(--text-secondary);
	}

	.post__caption::before {
		content: 'Cover.\00a0';
		font-weight: 700;
		color: var(--text);
	}

	.post__subscribe {
		grid-column: 2;
		width: 100%;
		max-width: var(--measure-prose);
		margin-inline: auto;
		margin-top: var(--s-7);
	}

	.post__nav {
		grid-column: 2;
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-5);
		margin-top: var(--s-8);
		padding-top: var(--s-4);
		border-top: 1px solid var(--text);
		max-width: var(--measure-prose);
		margin-inline: auto;
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-1);
		text-decoration: none;
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
	}

	@media (hover: hover) and (pointer: fine) {
		.post__nav-link:hover .post__nav-title {
			color: var(--accent);
			text-decoration: underline;
			text-underline-offset: 0.18em;
			text-decoration-thickness: 1px;
		}
	}

	.post__nav-link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.post__nav-title {
		color: var(--text);
		font-weight: 600;
		line-height: 1.35;
	}

	@media (max-width: 767px) {
		.post {
			padding-top: var(--s-3);
		}
		.post__abstract {
			padding-inline: 0;
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

	@media (max-width: 479px) {
		.post__summary {
			text-align: left;
		}
	}
</style>
