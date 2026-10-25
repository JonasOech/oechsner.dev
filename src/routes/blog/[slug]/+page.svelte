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

			<h1 class="post__title"><span class="post__title-text">{post.title}</span></h1>

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
				style="--i: 1; --r0: -3deg"
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
		padding-top: var(--s-5);
		max-width: var(--measure-prose);
		margin-inline: auto;
		min-width: 0;
	}

	.post__header {
		display: grid;
		gap: var(--s-5);
		margin-bottom: var(--s-7);
	}

	/* "All articles" is a stamp, not a nav bar: small, crooked, and it turns upright
	   when you reach for it. */
	.post__back {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		align-self: start;
		justify-self: start;
		font-family: var(--font-type);
		font-size: 0.875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--blue);
		text-decoration: none;
		padding: 0.5rem 0.8rem;
		min-height: 44px;
		border: 2px solid var(--blue);
		outline: 1px dashed var(--blue);
		outline-offset: 2px;
		transform: rotate(-2deg);
		transition:
			transform var(--dur-fast) var(--ease-snap),
			background-color var(--dur-fast) var(--ease-out);
	}

	.post__back :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.post__back:hover {
			background: var(--blue-wash);
			transform: rotate(0deg);
		}
		.post__back:hover :global(svg) {
			transform: translateX(-3px);
		}
	}

	.post__back:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* A condensed headline with a highlighter strip run through its lower half. */
	.post__title {
		font-size: clamp(2.25rem, 6.2vw, 3.75rem);
		line-height: 1.12;
		letter-spacing: 0.015em;
		text-transform: uppercase;
	}

	.post__title-text {
		background-image: linear-gradient(
			100deg,
			transparent 0.15em,
			rgba(var(--accent-rgb), 0.7) 0.3em,
			rgba(var(--accent-rgb), 0.7) calc(100% - 0.2em),
			transparent 100%
		);
		background-size: 100% 0.42em;
		background-repeat: no-repeat;
		background-position: 0 88%;
		-webkit-box-decoration-break: clone;
		box-decoration-break: clone;
		padding-inline: 0.08em;
	}

	/* The summary is typed on a slip, with a heavy rule down the side like a margin. */
	.post__summary {
		font-family: var(--font-type);
		font-size: 1.125rem;
		line-height: 1.65;
		color: var(--text);
		padding: var(--s-3) var(--s-4);
		background: var(--surface);
		border-left: 6px solid var(--blue);
		box-shadow: 3px 3px 0 rgba(var(--text-rgb), 0.85);
		transform: rotate(0.3deg);
	}

	.post__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
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

	/* The cover is a photocopy taped to the page: white border, hard shadow, slight lean. */
	.post__cover {
		width: calc(100% - 1.2rem);
		margin: 0 auto var(--s-7);
		aspect-ratio: 16 / 9;
		object-fit: cover;
		padding: 0.6rem;
		background: var(--plate);
		border: 2px solid var(--text);
		box-shadow: var(--shadow-3);
		transform: rotate(-0.8deg);
		filter: grayscale(0.15) contrast(1.05);
	}

	.post__body {
		min-width: 0;
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
		gap: var(--s-6);
		margin-top: var(--s-8);
		padding-top: var(--s-6);
		border-top: 2px dashed var(--text-muted);
		max-width: var(--measure-prose);
		margin-inline: auto;
		width: 100%;
	}

	/* Newer / Older: two torn-off slips. */
	.post__nav-link {
		display: grid;
		gap: var(--s-2);
		align-content: start;
		padding: var(--s-4);
		background: var(--surface);
		border: 2px solid var(--text);
		box-shadow: 4px 4px 0 var(--text);
		text-decoration: none;
		transform: rotate(-0.6deg);
		transition:
			transform var(--dur-base) var(--ease-snap),
			box-shadow var(--dur-base) var(--ease-out);
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
		transform: rotate(0.6deg);
	}

	@media (hover: hover) and (pointer: fine) {
		.post__nav-link:hover {
			transform: rotate(0deg) translate(-2px, -2px);
			box-shadow: 7px 7px 0 var(--accent);
		}
	}

	.post__nav-link:active {
		transform: translate(2px, 2px);
		box-shadow: 1px 1px 0 var(--text);
	}

	.post__nav-link:focus-visible {
		outline: none;
		box-shadow: 4px 4px 0 var(--text), var(--focus-ring);
	}

	.post__nav-title {
		font-family: var(--font-head);
		font-size: 1.25rem;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text);
		line-height: 1.2;
	}

	@media (max-width: 767px) {
		.post {
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
