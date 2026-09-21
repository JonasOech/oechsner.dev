<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import HumanWritten from '$lib/components/HumanWritten.svelte';
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

<div class="container">
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
	/* The one page that breaks §5's left-aligned rule: a post is a single column with
	   nothing beside it, so hanging it off the container's left edge left a wide empty
	   band on the right at desktop widths. Centred, the measure sits in the optical
	   middle of the page instead. */
	.post {
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
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.11em;
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

	.post__title {
		font-size: clamp(1.875rem, 4.5vw, 2.75rem);
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.post__summary {
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--text-secondary);
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

	/* Keeps the header's row rhythm inside the new wrapper: the meta line and the tag row
	   still sit --s-4 apart, exactly as they did as siblings of the grid. */
	.post__facts-main {
		display: grid;
		gap: var(--s-4);
		/* Free to shrink so the badge stays on the row as long as it honestly fits, and
		   drops below the facts rather than crushing the wreath when it does not. */
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
		border-radius: 6px;
		border: 1px solid var(--line);
		margin-bottom: var(--s-8);
	}

	.post__nav {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-4);
		margin-top: var(--s-9);
		padding-top: var(--s-6);
		border-top: 1px solid var(--line);
		max-width: var(--measure-prose);
		margin-inline: auto;
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-2);
		padding: var(--s-4);
		margin: calc(var(--s-4) * -1);
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
			background: var(--surface);
			border-color: var(--line);
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
		font-weight: 700;
		line-height: 1.4;
	}

	@media (max-width: 767px) {
		.post {
			padding-top: var(--s-6);
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
