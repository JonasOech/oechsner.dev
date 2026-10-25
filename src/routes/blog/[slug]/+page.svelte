<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import HumanWritten from '$lib/components/HumanWritten.svelte';
	import PostOutline from '$lib/components/PostOutline.svelte';
	import Subscribe from '$lib/components/Subscribe.svelte';
	import { formatDate, getPostComponent, getNeighbours } from '$lib/posts';
	import { site } from '$lib/data/site';
	import { accession } from '$lib/catalogue';
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

			<p class="post__kicker">Catalogue entry</p>

			<h1 class="post__title">{post.title}</h1>

			{#if post.summary}
				<p class="post__summary">{post.summary}</p>
			{/if}

			<!-- The label card: the facts of the piece, set like the card beside an exhibit. -->
			<section class="card" aria-label="Entry details">
				<dl class="card__facts">
					<div>
						<dt>Accession no.</dt>
						<dd>{accession(post.slug)}</dd>
					</div>
					<div>
						<dt>Date</dt>
						<dd><time datetime={post.date}>{formatDate(post.date)}</time></dd>
					</div>
					{#if post.tags.length}
						<div>
							<dt>Medium</dt>
							<dd class="card__tags">
								{#each post.tags as tag (tag)}
									<span class="tag">{tag}</span>
								{/each}
							</dd>
						</div>
					{/if}
					<div>
						<dt>Dimensions</dt>
						<dd>{post.readingMinutes} min read</dd>
					</div>
					{#if post.nerdyness}
						<div>
							<dt>Depth</dt>
							<dd><Nerdyness level={post.nerdyness} /></dd>
						</div>
					{/if}
				</dl>

				<!-- Strictly `=== false`: a post that never declared either way stays silent. -->
				{#if post.ai === false}
					<div class="card__seal">
						<HumanWritten />
					</div>
				{/if}
			</section>
		</header>

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
				{#if post.coverAlt}
					<figcaption><span>Plate.</span> {post.coverAlt}</figcaption>
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
					<span class="label">Newer entry</span>
					<span class="post__nav-title">{neighbours.prev.title}</span>
				</a>
			{:else}
				<span></span>
			{/if}

			{#if neighbours.next}
				<a class="post__nav-link post__nav-link--next" href="/blog/{neighbours.next.slug}">
					<span class="label">Older entry</span>
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
			   line whether or not an outline was rendered into the left. Both may shrink, so
			   the layout meets its breakpoint instead of overflowing just past it. */
			grid-template-columns:
				minmax(0, var(--outline-width))
				minmax(0, var(--measure-prose))
				minmax(0, var(--outline-width));
			justify-content: center;
			column-gap: var(--s-5);
		}
	}

	/* The one page that breaks §5's left-aligned rule: a post is a single column with
	   nothing beside it, so hanging it off the container's left edge left a wide empty
	   band on the right at desktop widths. Centred, the measure sits in the optical
	   middle of the page instead. */
	.post {
		grid-column: 2;
		padding-top: var(--s-9);
		max-width: var(--measure-prose);
		margin-inline: auto;
	}

	.post__header {
		display: grid;
		gap: var(--s-4);
		margin-bottom: var(--s-8);
	}

	.post__back {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		align-self: start;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.12em;
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
			color: var(--text);
		}
		.post__back:hover :global(svg) {
			transform: translateX(-3px);
		}
	}

	.post__back:active {
		color: var(--text-secondary);
	}

	.post__back:focus-visible {
		outline: none;
		border-radius: 3px;
		box-shadow: var(--focus-ring);
	}

	.post__kicker {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.post__title {
		font-size: clamp(2rem, 4.6vw, 2.875rem);
		font-weight: 600;
		font-variation-settings: 'opsz' 60;
		line-height: 1.12;
		letter-spacing: -0.02em;
	}

	.post__summary {
		font-family: var(--font-display);
		font-size: 1.1875rem;
		line-height: 1.55;
		color: var(--text-secondary);
	}

	/* The label card: surface paper, ruled rows, mono labels. */
	.card {
		display: flex;
		align-items: stretch;
		gap: var(--s-5);
		margin-top: var(--s-2);
		padding: var(--s-4) var(--s-5);
		background: var(--surface);
		border: 1px solid var(--text);
	}

	.card__facts {
		flex: 1 1 auto;
		min-width: 0;
		margin: 0;
	}

	.card__facts > div {
		display: grid;
		grid-template-columns: 8.5rem minmax(0, 1fr);
		gap: var(--s-3);
		padding: var(--s-2) 0;
		border-bottom: 1px solid var(--line);
		align-items: baseline;
	}

	.card__facts > div:last-child {
		border-bottom: 0;
	}

	.card__facts dt {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.card__facts dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}

	.card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.card__seal {
		flex: none;
		display: grid;
		place-items: center;
		padding-left: var(--s-5);
		border-left: 1px solid var(--line);
	}

	.post__plate {
		margin: 0 0 var(--s-8);
	}

	.post__cover {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border: 1px solid var(--text);
		background: var(--plate);
	}

	.post__plate figcaption {
		margin-top: var(--s-2);
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--text-muted);
	}

	.post__plate figcaption span {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-right: 0.4em;
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
		gap: var(--s-4);
		margin-top: var(--s-9);
		padding-top: var(--s-6);
		border-top: 2px solid var(--text);
		max-width: var(--measure-prose);
		margin-inline: auto;
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-2);
		padding: var(--s-3) 0;
		border-radius: 8px;
		border: 1px solid transparent;
		text-decoration: none;
		transition:
			background-color 220ms var(--ease-out),
			border-color 220ms var(--ease-out);
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
	}

	@media (hover: hover) and (pointer: fine) {
		.post__nav-link:hover {
			background: transparent;
		}
		.post__nav-link:hover .post__nav-title {
			text-decoration: underline;
			text-decoration-color: var(--accent);
			text-underline-offset: 0.2em;
		}
	}

	.post__nav-link:active {
		background: var(--surface-active);
	}

	.post__nav-link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		background: var(--surface);
	}

	.post__nav-title {
		color: var(--text);
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.35;
	}

	@media (max-width: 767px) {
		.post {
			padding-top: var(--s-6);
		}
		.card {
			flex-direction: column;
			padding: var(--s-3) var(--s-4);
		}
		.card__facts > div {
			grid-template-columns: 6.5rem minmax(0, 1fr);
		}
		.card__seal {
			padding: var(--s-3) 0 0;
			border-left: 0;
			border-top: 1px solid var(--line);
			place-items: start;
		}
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
