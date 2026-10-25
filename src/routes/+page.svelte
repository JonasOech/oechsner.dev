<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import ArticleRow from '$lib/components/ArticleRow.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import { reveal } from '$lib/actions/reveal';
	import Icon from '$lib/components/Icon.svelte';
	import { site, cvPath, feeds } from '$lib/data/site';
	import { about } from '$lib/data/resume';
	import { posts, allTags, formatDate } from '$lib/posts';
	import { trackFeed } from '$lib/track';

	let activeTag = $state<string | null>(null);

	/**
	 * The home page *is* the writing index, and the lead post takes the loudest slot on the
	 * site, so the content outranks the author's name. `hero` in the front-matter is what
	 * grants a post that slot: `posts` is sorted newest-first, so the newest one that opted
	 * in wins it and everything else stays a card. Filtering by tag drops the lead
	 * treatment — a filtered view is a list, not a front page.
	 */
	const lead = $derived(activeTag ? undefined : posts.find((p) => p.hero));
	// Not `slice(1)`: the lead is no longer necessarily the first post, so it has to be
	// removed by identity or it both duplicates itself and swallows the newest post.
	const listed = $derived(
		activeTag ? posts.filter((p) => p.tags.includes(activeTag!)) : posts.filter((p) => p !== lead)
	);

	function toggleTag(tag: string) {
		activeTag = activeTag === tag ? null : tag;
	}
</script>

<Seo title={site.name} />

<div class="container">
	<!-- The front page. Source order is the reading order on a phone: the lead story, then
	     the author's note. From 1024px the note moves to the left-hand column. -->
	<div class="front">
		{#if lead}
			<article class="lead">
				<div class="lead__text">
					<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
					     newest post on the site. -->
					<p class="kicker enter" style="--i: 1">Featured Blog Post</p>

					<h2 class="hero-title lead__title enter" style="--i: 2">
						<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
					</h2>

					{#if lead.summary}
						<p class="lead__summary enter" style="--i: 3">{lead.summary}</p>
					{/if}

					<p class="meta lead__meta enter" style="--i: 4">
						<time datetime={lead.date}>{formatDate(lead.date)}</time>
						<span class="lead__dot" aria-hidden="true">·</span>
						{lead.readingMinutes} min read
						{#if lead.nerdyness}
							<span class="lead__dot" aria-hidden="true">·</span>
							<Nerdyness level={lead.nerdyness} />
						{/if}
					</p>

					<!-- The visible affordance. Not a tab stop: the title above is the accessible
					     link to the same post, and three tab stops to one destination is noise. -->
					<a
						class="inline-cta lead__cta enter"
						style="--i: 5"
						href="/blog/{lead.slug}"
						tabindex="-1"
						aria-hidden="true"
					>
						Continue reading
						<Icon name="arrow-right" size={14} />
					</a>
				</div>

				{#if lead.cover}
					<!-- Decorative: the title is the accessible link to the same post. -->
					<figure class="lead__figure enter" style="--i: 2">
						<a class="lead__media" href="/blog/{lead.slug}" tabindex="-1" aria-hidden="true">
							<img
								class="lead__cover"
								src={lead.cover}
								alt=""
								width="720"
								height="540"
								decoding="async"
							/>
						</a>
						{#if lead.coverAlt}
							<figcaption class="lead__caption">{lead.coverAlt}</figcaption>
						{/if}
					</figure>
				{/if}
			</article>
		{/if}

		<aside class="author enter" style="--i: 1" aria-labelledby="author-h">
			<p class="kicker">From the author</p>
			<h2 class="author__greeting" id="author-h">{site.intro}</h2>
			<p class="author__tagline">
				Applied CS at Uni Bamberg, currently TU Dublin. Software engineer &amp; AI tutor.
				Currently looking for an Internship in Dublin.
			</p>
			<p class="author__actions">
				<a class="inline-cta" href={cvPath} target="_blank" rel="noopener">
					Download CV
					<Icon name="arrow-right" size={14} />
				</a>
				<a
					class="inline-cta inline-cta--feed"
					href={feeds.rss}
					type="application/rss+xml"
					data-sveltekit-reload
					onclick={() => trackFeed('open-rss', 'home-intro')}
				>
					<Icon name="rss" size={14} />
					Subscribe
				</a>
			</p>
		</aside>
	</div>

	<Rail label="Writing" id="writing" wide>
		{#if allTags.length}
			<div class="filter">
				<p class="label" id="filter-label">Filter by topic</p>
				<div class="tag-row" role="group" aria-labelledby="filter-label">
					{#each allTags as tag (tag)}
						<button
							type="button"
							class="tag"
							aria-pressed={activeTag === tag}
							onclick={() => toggleTag(tag)}
						>
							{tag}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<div class="articles" aria-live="polite" use:reveal={{ stagger: true }}>
			{#if listed.length === 0}
				<p class="empty">
					{#if activeTag}
						Nothing tagged “{activeTag}” yet.
					{:else}
						That's the whole archive so far.
					{/if}
				</p>
			{:else}
				{#key activeTag}
					{#each listed as post (post.slug)}
						<ArticleRow {post} />
					{/each}
				{/key}
			{/if}
		</div>
	</Rail>

	<Rail label="About" id="about">
		<p class="dropcap about__lede">{about[0]}</p>
		<p class="about__more">
			<a class="inline-cta" href="/about">
				Background, projects and CV
				<Icon name="arrow-right" size={14} />
			</a>
		</p>
	</Rail>
</div>

<style>
	/* Twelve-column front page from 1024px; below that everything stacks, lead first. */
	.front {
		display: grid;
		gap: var(--s-7);
		padding-top: var(--s-6);
	}

	/* — Lead story — */

	.lead {
		display: grid;
		gap: var(--s-5);
		min-width: 0;
	}

	.lead__text {
		display: grid;
		gap: var(--s-4);
		align-content: start;
		min-width: 0;
	}

	/* The loudest type on the site, and it is a piece of writing (DESIGN.md §10). */
	.lead__title {
		margin: 0;
		font-size: clamp(2.375rem, 8.2vw, 4.5rem);
	}

	.lead__link {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 3px;
		text-underline-offset: 0.1em;
		transition: text-decoration-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			text-decoration-color: var(--accent);
		}
	}

	.lead__link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.lead__summary {
		font-size: 1.3125rem;
		font-style: italic;
		line-height: 1.45;
		color: var(--text-secondary);
		max-width: 38ch;
	}

	.lead__dot {
		margin-inline: 0.4em;
	}

	.lead__figure {
		margin: 0;
		display: grid;
		gap: var(--s-2);
		align-content: start;
	}

	.lead__media {
		display: block;
		overflow: hidden;
		border: 1px solid var(--line-strong);
		background: var(--plate);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		transition: transform 480ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__media:hover .lead__cover {
			transform: scale(1.02);
		}
	}

	.lead__caption {
		font-size: 0.8125rem;
		font-style: italic;
		line-height: 1.4;
		color: var(--text-muted);
	}

	/* — Author's note — a ruled box in the margin column — */

	.author {
		display: grid;
		gap: var(--s-3);
		align-content: start;
		padding-top: var(--s-4);
		border-top: 1px solid var(--rule);
	}

	.author__greeting {
		font-size: 1.625rem;
		font-style: italic;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.author__tagline {
		font-size: 1rem;
		line-height: 1.5;
		color: var(--text-secondary);
	}

	.author__actions {
		display: grid;
		justify-items: start;
		gap: 0;
		margin-top: var(--s-2);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--text);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		text-decoration: none;
		border-bottom: 1px solid var(--rule);
		transition:
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.author__actions .inline-cta {
		border-bottom: 0;
		min-height: 36px;
	}

	.inline-cta :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	.inline-cta--feed :global(svg) {
		color: var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}
		.inline-cta:hover :global(svg) {
			transform: translateX(3px);
		}
		.inline-cta--feed:hover :global(svg) {
			transform: none;
		}
	}

	.inline-cta:active {
		color: var(--accent-dim);
	}

	.inline-cta:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.lead__cta {
		justify-self: start;
	}

	/* — Archive — */

	.filter {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3) var(--s-4);
		margin-bottom: var(--s-6);
	}

	.articles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
		gap: var(--s-7) var(--s-6);
	}

	.empty {
		color: var(--text-muted);
		font-style: italic;
	}

	.about__more {
		margin-top: var(--s-4);
	}

	@media (min-width: 1024px) {
		.front {
			grid-template-columns: repeat(12, minmax(0, 1fr));
			column-gap: var(--s-6);
			align-items: start;
		}

		.lead {
			grid-column: 4 / -1;
			grid-row: 1;
			grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
			column-gap: var(--s-6);
			align-items: start;
		}

		.author {
			grid-column: 1 / 4;
			grid-row: 1;
			padding-right: var(--s-5);
			border-right: 1px solid var(--line-strong);
			padding-bottom: var(--s-6);
			align-self: stretch;
		}

		.lead__figure {
			padding-top: var(--s-2);
		}
	}

	@media (max-width: 767px) {
		.front {
			padding-top: var(--s-5);
		}
	}
</style>
