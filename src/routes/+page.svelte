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
	 * The home page *is* the writing index, and the lead post takes the display face that
	 * used to carry the author's name, so the content occupies the loudest slot on the
	 * site. `hero` in the front-matter is what grants a post that slot: `posts` is sorted
	 * newest-first, so the newest one that opted in wins it and everything else stays a
	 * row. Filtering by tag drops the lead treatment — a filtered view is a list, not a
	 * front page.
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
	<!-- Greeting and byline are one unit: tight internally, ruled off from the lead
	     below. Previously they sat 6rem apart with only 2rem before the post, so the
	     byline read as the post's standfirst rather than as the author line. -->
	
	<header class="intro enter" style="--i: 0">
		<h3 class="intro__greeting">{site.intro}</h3>
		<p class="intro__tagline">
			Applied CS at Uni Bamberg, currently TU Dublin<br />
			Software engineer &amp; AI tutor <br />
			Currently looking for an Internship in Dublin
		</p>
		<p class="intro__actions">
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
		<!-- <p class="intro__prebyline">{site.prebyline}</p>
		<p class="intro__byline">{site.byline}</p> -->
	</header>

	{#if lead}
		<article class="lead">
			<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
			     newest post on the site. -->
			<p class="lead__eyebrow enter" style="--i: 1">Featured Blog Post</p>

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
				class="lead__cta enter"
				style="--i: 5"
				href="/blog/{lead.slug}"
				tabindex="-1"
				aria-hidden="true"
			>
				Read the post
				<Icon name="arrow-right" size={15} />
			</a>

			{#if lead.cover}
				<!-- Decorative: the title above is the accessible link to the same post. -->
				<a
					class="lead__media enter"
					style="--i: 2"
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
	{/if}

	<Rail label="Writing" id="writing" wide>
		{#if allTags.length}
			<div class="tag-row filter" role="group" aria-label="Filter posts by tag">
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
		<p>{about[0]}</p>
		<p class="about__more">
			<a class="inline-cta" href="/about">
				Background, projects and CV
				<Icon name="arrow-right" size={14} />
			</a>
		</p>
	</Rail>
</div>

<style>
	/* The author's name lives in the rail now, so the home page opens with a plain,
	   quiet greeting and goes straight to the writing. Fluid, but capped well below
	   `.lead__title` at every width: the largest type on the page is a piece of writing. */
	.intro {
		display: grid;
		gap: var(--s-3);
		padding-top: var(--s-7);
		max-width: var(--measure);
	}

	.intro__greeting {
		font-family: var(--font-display);
		font-variation-settings: var(--display-settings);
		font-size: 1.25rem;
		font-style: italic;
		font-weight: 400;
		line-height: 1.4;
		color: var(--text);
		margin: 0;
	}

	.intro__tagline {
		color: var(--text-secondary);
		line-height: 1.65;
	}

	.intro__actions {
		margin: var(--s-2) 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--s-6);
	}

	.inline-cta--feed :global(svg) {
		color: var(--accent);
	}

	/* The lead: kicker, title across the full measure, then summary beside the cover. */
	.lead {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 17rem;
		grid-template-areas:
			'eyebrow eyebrow'
			'title   title'
			'summary media'
			'meta    media'
			'cta     media';
		grid-template-rows: auto auto auto auto 1fr;
		column-gap: var(--s-6);
		row-gap: var(--s-4);
		align-items: start;
		margin-top: var(--s-7);
		padding-top: var(--s-5);
		border-top: 2px solid var(--text);
	}

	.lead__title {
		grid-area: title;
		/* Still the largest type on the site: a post-page h1 tops out at 2.75rem. */
		font-size: clamp(2.25rem, 5.2vw, 3.5rem);
		margin: 0 0 var(--s-2);
		max-width: 20ch;
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		font-family: var(--font-sans);
		font-size: 0.6875rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.12em;
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
		grid-area: summary;
		font-family: var(--font-display);
		font-size: 1.1875rem;
		line-height: 1.6;
		color: var(--text-secondary);
		max-width: 48ch;
	}

	.lead__meta {
		grid-area: meta;
	}

	.lead__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.lead__cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: start;
		grid-area: cta;
		min-height: 44px;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		border-bottom: 1px solid var(--text);
		transition:
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}
	}

	.lead__media {
		grid-area: media;
		align-self: start;
		display: block;
		border: 1px solid var(--line);
		background: var(--plate);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	.filter {
		margin-bottom: var(--s-6);
	}

	.articles {
		display: grid;
		max-width: none;
	}

	.empty {
		color: var(--text-muted);
	}

	.about__more {
		margin-top: var(--s-4);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--text);
		font-weight: 600;
		font-size: 0.8125rem;
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.inline-cta :global(svg) {
		transition: transform var(--dur-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			color: var(--accent);
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

	@media (max-width: 47.99em) {
		.intro {
			padding-top: var(--s-6);
		}
		/* Stack, with the cover sitting between the meta line and the CTA. */
		.lead {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'eyebrow'
				'title'
				'summary'
				'meta'
				'media'
				'cta';
			grid-template-rows: none;
		}
		.lead__cover {
			aspect-ratio: 16 / 9;
		}
	}
</style>
