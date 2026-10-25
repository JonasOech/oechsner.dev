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
	/* Below the outline's breakpoint this is a single column and the `margin-inline` on the
	   children does the centring; above it, the explicit tracks take over. */
	.post-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.post-layout > :global(*) {
		min-width: 0;
	}

	@media (min-width: 1180px) {
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
		grid-column: 1;
		padding-top: var(--s-7);
		width: 100%;
		max-width: var(--measure-prose);
		margin-inline: auto;
	}

	/* The title block: a flat yellow slab, the loudest thing on the page. */
	.post__header {
		display: grid;
		gap: var(--s-4);
		margin-bottom: var(--s-7);
		padding: var(--s-6);
		background: var(--yellow);
		border: var(--bw) solid var(--ink);
		box-shadow: var(--shadow-4);
	}

	.post__back {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: start;
		font-size: 0.875rem;
		font-weight: 800;
		color: var(--ink);
		background: var(--surface);
		border: var(--bw-thin) solid var(--ink);
		border-radius: 999px;
		text-decoration: none;
		padding: 0.5rem 1rem 0.5rem 0.75rem;
		min-height: 44px;
		transform: rotate(-1.5deg);
		transition:
			transform var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
	}

	.post__back :global(svg) {
		stroke-width: 2.25;
		transition: transform 160ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.post__back:hover {
			background: var(--pink);
			transform: rotate(-1.5deg) translate(-1px, -1px);
			box-shadow: 3px 3px 0 var(--ink);
		}
		.post__back:hover :global(svg) {
			transform: translateX(-3px);
		}
	}

	.post__back:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.post__title {
		font-size: clamp(2rem, 5.6vw, 3.5rem);
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.035em;
		overflow-wrap: break-word;
	}

	.post__summary {
		font-size: 1.125rem;
		line-height: 1.55;
		font-weight: 500;
		color: var(--ink);
	}

	.post__dot {
		margin-inline: 0.4em;
	}

	.post__header .meta {
		color: var(--ink);
	}

	.post__facts {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-5);
		flex-wrap: wrap;
	}

	.post__facts-main {
		display: grid;
		gap: var(--s-4);
		min-width: min(100%, 22rem);
		flex: 1 1 22rem;
	}

	.post__tags {
		margin-top: var(--s-1);
	}

	.post__cover {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border: var(--bw) solid var(--ink);
		box-shadow: var(--shadow-3);
		margin-bottom: var(--s-7);
	}

	/* The article body sits on a white sheet with its own ink border and shadow. */
	.post__body {
		background: var(--surface);
		border: var(--bw) solid var(--ink);
		box-shadow: var(--shadow-3);
		padding: var(--s-7) var(--s-7);
	}

	.post__subscribe {
		grid-column: 1;
		width: 100%;
		max-width: var(--measure-prose);
		margin-inline: auto;
		margin-top: var(--s-8);
	}

	.post__nav {
		grid-column: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-6);
		margin-top: var(--s-8);
		max-width: var(--measure-prose);
		width: 100%;
		margin-inline: auto;
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-2);
		align-content: start;
		padding: var(--s-4) var(--s-5);
		background: var(--surface);
		border: var(--bw) solid var(--ink);
		box-shadow: var(--shadow-2);
		text-decoration: none;
		transition:
			transform var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out);
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
	}

	@media (hover: hover) and (pointer: fine) {
		.post__nav-link:hover {
			background: var(--blue);
			transform: translate(-2px, -2px);
			box-shadow: var(--shadow-3);
		}
		.post__nav-link--next:hover {
			background: var(--lime);
		}
	}

	.post__nav-link:active {
		transform: translate(4px, 4px);
		box-shadow: none;
	}

	.post__nav-link:focus-visible {
		outline: none;
		box-shadow: var(--shadow-2), var(--focus-ring);
	}

	.post__nav-title {
		color: var(--text);
		font-family: var(--font-display);
		font-size: 1.1875rem;
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	@media (max-width: 767px) {
		.post {
			padding-top: var(--s-5);
		}
		.post__header {
			padding: var(--s-5);
			box-shadow: var(--shadow-3);
		}
		.post__body {
			padding: var(--s-5) var(--s-4);
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

	@media (min-width: 1180px) {
		.post,
		.post__subscribe,
		.post__nav {
			grid-column: 2;
		}
	}
</style>
