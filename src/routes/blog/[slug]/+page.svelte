<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import HumanWritten from '$lib/components/HumanWritten.svelte';
	import PostOutline from '$lib/components/PostOutline.svelte';
	import Subscribe from '$lib/components/Subscribe.svelte';
	import Spread from '$lib/components/Spread.svelte';
	import Tile from '$lib/components/Tile.svelte';
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

<!-- The post as a spread: its cover, summary and outline hold still on the left while the
     text scrolls on the right; the neighbouring posts are the round tiles. -->
<Spread>
	{#snippet corner()}
		<a class="corner-btn" href="/" aria-label="Close, back to all writing">
			<Icon name="x" size={22} />
		</a>
	{/snippet}

	{#snippet story()}
		<p class="story-kicker">{post.tags[0] ?? 'Writing'}</p>
		<p class="story-sub"><time datetime={post.date}>{formatDate(post.date)}</time></p>
		{#if outline.length}
			<div class="post__outline">
				<PostOutline headings={outline} {activeId} />
			</div>
		{:else}
			<p class="story-headline">{post.readingMinutes} minutes, one idea.</p>
		{/if}
	{/snippet}

	{#snippet image()}
		{#if post.cover}
			<div class="image-fill">
				<img src={post.cover} alt={post.coverAlt ?? ''} decoding="async" />
			</div>
		{/if}
	{/snippet}

	{#snippet tiles()}
		{#if neighbours.prev}
			<Tile
				href="/blog/{neighbours.prev.slug}"
				image={neighbours.prev.cover}
				label={neighbours.prev.title}
				kicker="Newer"
			/>
		{/if}
		{#if neighbours.next}
			<Tile
				href="/blog/{neighbours.next.slug}"
				image={neighbours.next.cover}
				label={neighbours.next.title}
				kicker="Older"
			/>
		{/if}
	{/snippet}

	{#snippet quote()}
		{#if post.summary}<p class="quote-text">{post.summary}</p>{/if}
	{/snippet}

	<article class="post">
		<header class="post__header">
			<p class="eyebrow">What it’s about</p>
			<h1 class="post__title">{post.title}</h1>

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

		<div class="prose post__body">
			<Content />
		</div>

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
				{/if}
				{#if neighbours.next}
					<a class="post__nav-link" href="/blog/{neighbours.next.slug}">
						<span class="label">Older</span>
						<span class="post__nav-title">{neighbours.next.title}</span>
					</a>
				{/if}
			</nav>
		{/if}
	</article>
</Spread>

<style>
	.post {
		max-width: var(--measure-prose);
		animation: post-in 0.9s 0.35s var(--ease-out) both;
	}

	@keyframes post-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	.post__header {
		display: grid;
		gap: var(--s-4);
		margin-bottom: var(--s-7);
	}

	/* A step below the front page's lead title, which stays the largest type on the site. */
	.post__title {
		margin-top: var(--s-3);
		font-size: clamp(2.1rem, 3.4vw, 3rem);
		font-weight: 900;
		line-height: 1.05;
		letter-spacing: -0.01em;
	}

	.post__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.post__facts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.post__facts-main {
		display: grid;
		gap: var(--s-3);
	}

	/* The outline fills what is left of the story panel below its kicker. */
	.post__outline {
		display: flex;
		flex: 1 1 auto;
		min-height: 0;
		margin-top: var(--s-6);
	}

	@media (max-width: 1099px) {
		.post__outline {
			display: none;
		}
	}

	.post__subscribe {
		margin-top: var(--s-8);
	}

	.post__nav {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--s-4);
		margin-top: var(--s-7);
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-2);
		padding: var(--s-4) 0;
		border-top: 1px solid var(--line);
		color: inherit;
		text-decoration: none;
	}

	.post__nav-title {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--text);
		transition: color 0.2s;
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

	@media (prefers-reduced-motion: reduce) {
		.post {
			animation: none;
		}
	}
</style>
