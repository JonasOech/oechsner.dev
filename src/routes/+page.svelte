<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Window from '$lib/components/Window.svelte';
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
	 * The home page *is* the writing index, and the lead post takes the display face at the
	 * largest size on the site, so the content occupies the loudest slot. `hero` in the
	 * front-matter is what grants a post that slot: `posts` is sorted newest-first, so the
	 * newest one that opted in wins it and everything else stays a row. Filtering by tag
	 * drops the lead treatment — a filtered view is a list, not a front page.
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

<div class="container page home">
	<h1 class="sr-only">{site.name} — writing and portfolio</h1>

	<div class="home__lead">
		{#if lead}
			<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
			     newest post on the site. -->
			<Window title="Featured Blog Post" id="featured" enter={0}>
				<article class="lead">
					<p class="lead__eyebrow">
						<Icon name="doc" size={20} />
						<time datetime={lead.date}>{formatDate(lead.date)}</time>
					</p>

					<h3 class="hero-title lead__title">
						<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
					</h3>

					{#if lead.summary}
						<p class="lead__summary">{lead.summary}</p>
					{/if}

					<p class="meta lead__meta">
						{lead.readingMinutes} min read
						{#if lead.nerdyness}
							<span class="lead__dot" aria-hidden="true">·</span>
							<Nerdyness level={lead.nerdyness} />
						{/if}
					</p>

					<!-- The visible affordance. Not a tab stop: the title above is the accessible
					     link to the same post, and three tab stops to one destination is noise. -->
					<a
						class="btn btn--primary lead__cta"
						href="/blog/{lead.slug}"
						tabindex="-1"
						aria-hidden="true"
					>
						Open post
						<Icon name="arrow-right" size={15} />
					</a>

					{#if lead.cover}
						<!-- Decorative: the title above is the accessible link to the same post. -->
						<a
							class="lead__media"
							href="/blog/{lead.slug}"
							tabindex="-1"
							aria-hidden="true"
						>
							<img
								class="lead__cover"
								src={lead.cover}
								alt=""
								width="720"
								height="540"
								decoding="async"
							/>
						</a>
					{/if}
				</article>
			</Window>
		{/if}
	</div>

	<aside class="home__side" aria-label="About this site">
		<Window title="Read Me" id="readme" enter={1}>
			<p class="readme__greeting">{site.intro}</p>
			<p class="readme__tagline">
				Applied CS at Uni Bamberg, currently TU Dublin<br />
				Software engineer &amp; AI tutor <br />
				Currently looking for an Internship in Dublin
			</p>

			<ul class="tiles">
				<li>
					<a class="tile" href={cvPath} target="_blank" rel="noopener">
						<Icon name="pdf" size={40} />
						<span class="tile__name">Download CV</span>
					</a>
				</li>
				<li>
					<a
						class="tile"
						href={feeds.rss}
						type="application/rss+xml"
						data-sveltekit-reload
						onclick={() => trackFeed('open-rss', 'home-intro')}
					>
						<Icon name="rss-file" size={40} />
						<span class="tile__name">Subscribe</span>
					</a>
				</li>
				<li>
					<a class="tile" href="/about">
						<Icon name="folder" size={40} />
						<span class="tile__name">About</span>
					</a>
				</li>
			</ul>
		</Window>

		<Window title="About" id="about">
			<p>{about[0]}</p>
			<p class="about__more">
				<a class="link" href="/about">Background, projects and CV</a>
			</p>
		</Window>
	</aside>

	<div class="home__finder">
		<Window title="Writing" id="writing" flush>
			{#if allTags.length}
				<div class="toolbar" role="group" aria-label="Filter posts by tag">
					<span class="toolbar__label" aria-hidden="true">Show</span>
					<div class="tag-row">
						<button
							type="button"
							class="tag"
							aria-pressed={activeTag === null}
							onclick={() => (activeTag = null)}
						>
							All
						</button>
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

			{#snippet status()}
				<span>{listed.length} {listed.length === 1 ? 'item' : 'items'}</span>
				<span>{activeTag ? `tagged ${activeTag}` : 'sorted by date'}</span>
			{/snippet}
		</Window>
	</div>
</div>

<style>
	/* Mobile first: one column, the writing before the author. */
	.home {
		grid-template-columns: minmax(0, 1fr);
		grid-template-areas:
			'lead'
			'side'
			'finder';
	}

	.home__lead {
		grid-area: lead;
		min-width: 0;
	}
	.home__side {
		grid-area: side;
		display: grid;
		gap: var(--gap-section);
		align-content: start;
		min-width: 0;
	}
	.home__finder {
		grid-area: finder;
		min-width: 0;
	}

	@media (min-width: 960px) {
		.home {
			grid-template-columns: minmax(0, 1fr) 19rem;
			grid-template-areas:
				'lead side'
				'finder finder';
			align-items: start;
		}
	}

	/* The lead post. Everything here stays smaller than the title: §4 of DESIGN.md —
	   the largest type on the site is always a piece of writing. */
	.lead {
		display: grid;
		gap: var(--s-4);
		justify-items: start;
	}

	.lead__eyebrow {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		font-family: var(--font-display);
		font-size: 1rem;
		color: var(--text-muted);
		margin: 0;
	}

	.lead__title {
		font-size: clamp(2.125rem, 5.2vw, 3.5rem);
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			background: var(--ink);
			color: var(--paper);
		}
	}

	.lead__link:focus-visible {
		outline: 3px solid var(--ink);
		outline-offset: 3px;
	}

	.lead__summary {
		font-size: 1.1875rem;
		line-height: 1.6;
		color: var(--text-secondary);
		max-width: 56ch;
	}

	.lead__dot {
		margin-inline: 0.4em;
	}

	.lead__cta {
		margin-top: var(--s-2);
	}

	.lead__media {
		display: block;
		width: 100%;
		margin-top: var(--s-2);
		border: 2px solid var(--ink);
		box-shadow: var(--shadow-2);
		background: var(--paper);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 16 / 8;
		object-fit: cover;
	}

	/* — Read Me — */
	.readme__greeting {
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 600;
		line-height: 1.3;
		color: var(--text);
		margin-bottom: var(--s-3);
		text-wrap: balance;
	}

	.readme__tagline {
		color: var(--text-secondary);
		line-height: 1.6;
		font-size: 1rem;
	}

	/* Desktop icons: a file, a feed, a folder. Captions invert when selected. */
	.tiles {
		list-style: none;
		margin: var(--s-5) 0 0;
		padding: var(--s-4) 0 0;
		border-top: 1px dotted var(--ink);
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--s-2);
	}

	.tile {
		display: grid;
		justify-items: center;
		gap: var(--s-2);
		padding: var(--s-2) 0;
		min-height: 44px;
		text-decoration: none;
		color: var(--ink);
		text-align: center;
	}

	.tile__name {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		line-height: 1.2;
		padding: 0.125rem 0.375rem;
	}

	@media (hover: hover) and (pointer: fine) {
		.tile:hover .tile__name {
			background: var(--ink);
			color: var(--paper);
		}
	}

	.tile:active .tile__name {
		background: var(--ink);
		color: var(--paper);
	}

	.tile:focus-visible {
		outline: 2px dotted var(--ink);
		outline-offset: 2px;
	}

	.about__more {
		margin-top: var(--s-3);
	}

	/* — Finder — */
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2) var(--s-3);
		padding: var(--s-3) var(--s-5);
		background: var(--surface);
		border-bottom: 2px solid var(--ink);
	}

	.toolbar__label {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text);
	}

	.articles {
		display: block;
	}

	.empty {
		padding: var(--s-5);
		color: var(--text-muted);
	}

	@media (max-width: 767px) {
		.toolbar {
			padding-inline: var(--s-4);
		}
		.tiles {
			gap: 0;
		}
		.tile__name {
			font-size: 0.875rem;
		}
	}
</style>
