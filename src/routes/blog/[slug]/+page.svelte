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
     right track is the marginalia column — the facts about the piece hang there on wide
     screens, and fall back into the flow above the cover on narrow ones. -->
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

			{#if post.tags.length}
				<p class="kicker">{post.tags.slice(0, 2).join(' · ')}</p>
			{/if}

			<h1 class="post__title">{post.title}</h1>

			{#if post.summary}
				<p class="post__summary">{post.summary}</p>
			{/if}

			<p class="meta post__byline">
				<span>By {site.name}</span>
				<span class="post__dot" aria-hidden="true">·</span>
				<time datetime={post.date}>{formatDate(post.date)}</time>
				<span class="post__dot" aria-hidden="true">·</span>
				<span>{post.readingMinutes} min read</span>
			</p>
		</header>

		<div class="post__main">
			<!-- Marginalia: filed-under tags, depth rating and the human-written laurel. -->
			<aside class="post__margin" aria-label="About this piece">
				{#if post.tags.length}
					<div class="post__note">
						<p class="label">Filed under</p>
						<div class="tag-row">
							{#each post.tags as tag (tag)}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if post.nerdyness}
					<div class="post__note">
						<p class="label">Depth</p>
						<p class="meta"><Nerdyness level={post.nerdyness} /></p>
					</div>
				{/if}

				<!-- Strictly `=== false`: a post that never declared either way stays silent. -->
				{#if post.ai === false}
					<div class="post__note">
						<HumanWritten />
					</div>
				{/if}
			</aside>

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
						<figcaption class="post__caption">{post.coverAlt}</figcaption>
					{/if}
				</figure>
			{/if}

			<div class="prose dropcap post__body">
				<Content />
			</div>
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
	/* Below the outline's breakpoint this is a single column and the `margin-inline` on the
	   children does the centring; above it, the explicit tracks take over. Written as a
	   min-width query so the narrow case is the default rather than an override. */
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
		min-width: 0;
		width: 100%;
	}

	/* The header is centred like a magazine opener. */
	.post__header {
		display: grid;
		justify-items: center;
		text-align: center;
		gap: var(--s-4);
		margin-bottom: var(--s-6);
	}

	.post__back {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: start;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--text-muted);
		text-decoration: none;
		padding: 0.5rem 0;
		min-height: 44px;
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
		color: var(--accent-dim);
	}

	.post__back:focus-visible {
		outline: none;
		border-radius: 3px;
		box-shadow: var(--focus-ring);
	}

	/* Smaller than the home page's lead title at every width — DESIGN.md §10. */
	.post__title {
		font-size: clamp(2rem, 6vw, 3.5rem);
		font-weight: 800;
		line-height: 1.06;
		letter-spacing: -0.025em;
		max-width: 22ch;
	}

	.post__summary {
		font-size: 1.3125rem;
		font-style: italic;
		line-height: 1.45;
		color: var(--text-secondary);
		max-width: 40ch;
		text-wrap: balance;
	}

	/* The byline sits between a heavy and a hairline rule, like the dateline of a column. */
	.post__byline {
		width: 100%;
		max-width: var(--measure-prose);
		padding-block: var(--s-3);
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--line-strong);
		margin-top: var(--s-2);
	}

	.post__dot {
		margin-inline: 0.4em;
	}

	.post__main {
		position: relative;
	}

	/* — Marginalia — */

	.post__margin {
		display: grid;
		gap: var(--s-4);
		margin-bottom: var(--s-6);
	}

	.post__margin:empty {
		display: none;
	}

	.post__note {
		display: grid;
		gap: var(--s-2);
		justify-items: start;
		padding-top: var(--s-3);
		border-top: 1px solid var(--line-strong);
	}

	@media (min-width: 1100px) {
		.post__margin {
			position: absolute;
			top: 0;
			left: calc(100% + var(--s-6));
			width: var(--outline-width);
			margin-bottom: 0;
		}
	}

	/* — Cover — a plate with a caption — */

	.post__figure {
		margin: 0 0 var(--s-6);
	}

	.post__cover {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border: 1px solid var(--line-strong);
		background: var(--plate);
	}

	.post__caption {
		margin-top: var(--s-2);
		font-size: 0.875rem;
		font-style: italic;
		line-height: 1.5;
		color: var(--text-muted);
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
		margin-top: var(--s-8);
		padding-top: var(--s-4);
		border-top: 4px double var(--rule);
		max-width: var(--measure-prose);
		width: 100%;
		margin-inline: auto;
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-2);
		align-content: start;
		text-decoration: none;
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
	}

	.post__nav-title {
		font-family: var(--font-display);
		font-size: 1.1875rem;
		font-weight: 700;
		color: var(--text);
		line-height: 1.25;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.16em;
		transition: text-decoration-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.post__nav-link:hover .post__nav-title {
			text-decoration-color: var(--accent);
		}
	}

	.post__nav-link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 767px) {
		.post__nav {
			grid-template-columns: 1fr;
			gap: var(--s-6);
		}
		.post__nav-link--next {
			text-align: left;
			justify-items: start;
		}
	}
</style>
