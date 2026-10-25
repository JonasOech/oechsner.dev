<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Geometry from '$lib/components/Geometry.svelte';
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
<!-- The poster: a yellow slab with a diagonal foot, the title in the loudest type the post
     page allows, and the three shapes standing in the corner. -->
<header class="phead block block--yellow">
	<div class="container phead__inner">
		<div class="phead__text">
			<a class="post__back enter" style="--i: 0" href="/">
				<Icon name="arrow-left" />
				All articles
			</a>

			<h1 class="post__title enter" style="--i: 1">{post.title}</h1>

			{#if post.summary}
				<p class="post__summary enter" style="--i: 2">{post.summary}</p>
			{/if}
		</div>
		<Geometry variant="solo" class="phead__art" />
	</div>
</header>

<div class="container post-layout">
	{#if outline.length}
		<PostOutline headings={outline} {activeId} />
	{/if}

	<article class="post">
		<!-- The facts and the laurel share a row: neither the meta line nor the tags fill
		     the measure, and the badge claims the slack the two of them leave behind. -->
		<div class="post__facts enter" style="--i: 3">
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
	/* The poster header: yellow slab, diagonal foot, shapes at the right. */
	.phead {
		--cut: 3rem;
		padding-block: var(--s-6) calc(var(--s-8) + var(--cut));
		clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--cut)), 0 100%);
		margin-bottom: calc(var(--cut) * -1);
	}

	.phead__inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 260px);
		gap: var(--s-7);
		align-items: end;
	}

	.phead__text {
		display: grid;
		gap: var(--s-4);
		justify-items: start;
		min-width: 0;
	}

	/* Below the outline's breakpoint this is a single column and the `margin-inline` on the
	   children does the centring; above it, the explicit tracks take over. */
	.post-layout {
		display: grid;
		position: relative;
		z-index: 2;
	}

	@media (min-width: 1100px) {
		.post-layout {
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
		padding-top: var(--s-7);
		max-width: var(--measure-prose);
		margin-inline: auto;
		min-width: 0;
	}

	.post__back {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		font-size: 0.8125rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: none;
		padding: 0 var(--s-3);
		min-height: 44px;
		border: 3px solid var(--ink);
		background: var(--surface);
		box-shadow: 3px 3px 0 var(--ink);
		transition:
			transform var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
	}

	.post__back :global(svg) {
		stroke-width: 2.5;
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.post__back:hover {
			transform: translate(-2px, -2px);
			box-shadow: 5px 5px 0 var(--ink);
		}
		.post__back:hover :global(svg) {
			transform: translateX(-3px);
		}
	}

	.post__back:active {
		transform: translate(3px, 3px);
		box-shadow: none;
	}

	.post__back:focus-visible {
		outline: none;
		box-shadow:
			3px 3px 0 var(--ink),
			var(--focus-ring);
	}

	.post__title {
		color: var(--ink);
		font-size: clamp(2rem, 6vw, 4rem);
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.02em;
		text-transform: uppercase;
		overflow-wrap: anywhere;
		max-width: 20ch;
	}

	.post__summary {
		font-size: 1.25rem;
		line-height: 1.5;
		font-weight: 500;
		color: var(--ink);
		max-width: 52ch;
		padding-left: var(--s-4);
		border-left: var(--rule-w-thick) solid var(--ink);
	}

	.phead :global(.phead__art) {
		justify-self: end;
		width: 100%;
	}

	.post__dot {
		margin-inline: 0.4em;
	}

	.post__facts {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-5);
		flex-wrap: wrap;
		padding-bottom: var(--s-5);
		margin-bottom: var(--s-7);
		border-bottom: var(--rule-w) solid var(--ink);
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
		border: 3px solid var(--ink);
		box-shadow: 10px 10px 0 var(--yellow);
		margin-bottom: var(--s-8);
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
		max-width: var(--measure-prose);
		margin-inline: auto;
		width: 100%;
	}

	.post__nav-link {
		display: grid;
		align-content: start;
		gap: var(--s-2);
		padding: var(--s-4);
		border: 3px solid var(--ink);
		background: var(--surface);
		box-shadow: var(--shadow-1);
		text-decoration: none;
		transition:
			transform var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out);
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
		grid-column: 2;
	}

	@media (hover: hover) and (pointer: fine) {
		.post__nav-link:hover {
			background: var(--yellow);
			transform: translate(-2px, -2px);
			box-shadow: var(--shadow-2);
		}
		.post__nav-link:hover .label {
			color: var(--ink);
		}
	}

	.post__nav-link:active {
		transform: translate(3px, 3px);
		box-shadow: none;
	}

	.post__nav-link:focus-visible {
		outline: none;
		box-shadow:
			var(--shadow-1),
			var(--focus-ring);
	}

	.post__nav-title {
		color: var(--text);
		font-weight: 800;
		line-height: 1.25;
		font-size: 1.125rem;
	}

	@media (max-width: 767px) {
		.phead {
			--cut: 1.75rem;
			padding-block: var(--s-4) calc(var(--s-6) + var(--cut));
		}
		.phead__inner {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-5);
		}
		.phead :global(.phead__art) {
			width: 150px;
			justify-self: start;
			order: -1;
		}
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
			grid-column: auto;
		}
		.post__cover {
			box-shadow: 6px 6px 0 var(--yellow);
		}
	}
</style>
