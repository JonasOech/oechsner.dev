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

<!-- Twelve columns. The header hangs its facts in columns 1-3 and sets the title across 4-12;
     below it the outline (sticky) takes 1-3 and the prose column takes 4-10 at desktop widths.
     Under 1100px the outline is hidden and everything is a single column. -->
<div class="container post-layout">
	<article class="post">
		<header class="post__header grid">
			<a class="post__back enter" style="--i: 0" href="/">
				<Icon name="arrow-left" />
				All articles
			</a>

			<h1 class="post__title enter" style="--i: 1">{post.title}</h1>

			<div class="post__facts enter" style="--i: 2">
				<dl class="post__dl">
					<div>
						<dt>Date</dt>
						<dd><time datetime={post.date}>{formatDate(post.date)}</time></dd>
					</div>
					<div>
						<dt>Reading time</dt>
						<dd>{post.readingMinutes} min</dd>
					</div>
					{#if post.nerdyness}
						<div>
							<dt>Depth</dt>
							<dd><Nerdyness level={post.nerdyness} /></dd>
						</div>
					{/if}
				</dl>

				{#if post.tags.length}
					<div class="tag-row post__tags">
						{#each post.tags as tag (tag)}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}

				<!-- Strictly `=== false`: a post that never declared either way stays silent. -->
				{#if post.ai === false}
					<div class="post__laurel">
						<HumanWritten />
					</div>
				{/if}
			</div>

			{#if post.summary}
				<p class="post__summary enter" style="--i: 2">{post.summary}</p>
			{/if}
		</header>

		<div class="post__main">
			{#if outline.length}
				<PostOutline headings={outline} {activeId} />
			{/if}

			<div class="post__col">
				{#if post.cover}
					<img
						class="post__cover enter"
						style="--i: 3"
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
	.post {
		padding-top: var(--s-5);
	}

	.post__header {
		row-gap: var(--s-5);
		align-items: start;
		padding-bottom: var(--s-7);
		border-bottom: 6px solid var(--line-strong);
		grid-template-areas:
			'back  back  back  title title title title title title title title title'
			'facts facts facts summary summary summary summary summary summary summary summary summary';
	}

	.post__back {
		grid-area: back;
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: start;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text);
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
		box-shadow: var(--focus-ring);
	}

	/* Large, but under the home page's lead title: DESIGN.md §11 puts the front page first. */
	.post__title {
		grid-area: title;
		font-size: clamp(2.25rem, 6.4vw, 5.25rem);
		font-weight: 800;
		line-height: 0.96;
		letter-spacing: -0.05em;
	}

	.post__summary {
		grid-area: summary;
		font-size: clamp(1.125rem, 1.8vw, 1.5rem);
		font-weight: 500;
		line-height: 1.4;
		letter-spacing: -0.015em;
		color: var(--text);
		max-width: 46ch;
	}

	.post__facts {
		grid-area: facts;
		display: grid;
		gap: var(--s-4);
		align-content: start;
	}

	.post__dl {
		margin: 0;
		display: grid;
		gap: 0;
	}

	.post__dl > div {
		display: grid;
		gap: 0.125rem;
		padding: var(--s-2) 0;
		border-top: 1px solid var(--line-strong);
	}

	.post__dl dt {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-muted);
	}

	.post__dl dd {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text);
		font-feature-settings: 'tnum' 1;
	}

	.post__laurel {
		justify-self: start;
	}

	.post__main {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--col-gap);
		padding-top: var(--s-7);
	}

	.post__col {
		grid-column: 4 / span 7;
		min-width: 0;
	}

	.post__cover {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border: 1px solid var(--line);
		margin-bottom: var(--s-7);
	}

	.post__subscribe,
	.post__nav {
		margin-left: calc((100% - 11 * var(--col-gap)) / 12 * 3 + 3 * var(--col-gap));
		max-width: var(--measure-prose);
	}

	.post__subscribe {
		margin-top: var(--s-8);
	}

	.post__nav {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--s-5);
		margin-top: var(--s-8);
		padding-top: var(--s-4);
		border-top: 2px solid var(--line-strong);
		max-width: calc(var(--measure-prose) + 8rem);
	}

	.post__nav-link {
		display: grid;
		gap: var(--s-2);
		align-content: start;
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.post__nav-link--next {
		text-align: right;
		justify-items: end;
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

	.post__nav-title {
		color: var(--text);
		font-size: 1.25rem;
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.03em;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (max-width: 1099px) {
		.post__col {
			grid-column: 1 / -1;
		}
		.post__subscribe,
		.post__nav {
			margin-left: 0;
		}
	}

	@media (max-width: 767px) {
		.post__header {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'back'
				'title'
				'summary'
				'facts';
		}
		.post__main {
			grid-template-columns: minmax(0, 1fr);
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
