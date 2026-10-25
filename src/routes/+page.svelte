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
			<p class="lead__eyebrow enter" style="--i: 1">Featured post</p>

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

	<Rail label="Contents" id="writing" wide>
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
	/* The title page: a small, centred imprint, ruled off from the first chapter below. */
	.intro {
		display: block;
		padding-top: var(--s-7);
		padding-bottom: var(--s-6);
		text-align: center;
	}

	/* Small caps, not a headline: §11 reserves the largest type for the writing. */
	.intro__greeting {
		font-family: var(--font-serif);
		font-size: 1.125rem;
		font-weight: 500;
		line-height: 1.4;
		letter-spacing: 0.14em;
		font-variant-caps: all-small-caps;
		text-wrap: balance;
		color: var(--text);
		margin: 0 0 var(--s-2);
	}

	.intro__tagline {
		margin: 0 auto;
		max-width: 46ch;
		color: var(--text-muted);
		font-style: italic;
		line-height: 1.5;
		text-wrap: balance;
	}

	.intro__actions {
		margin: var(--s-3) 0 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0 var(--s-6);
	}

	/* A double rule closes the title page, the way a book's half-title is closed. */
	.intro::after {
		content: '';
		display: block;
		height: 3px;
		margin: var(--s-6) auto 0;
		border-top: 1px solid var(--text);
		border-bottom: 1px solid var(--text);
	}

	.inline-cta--feed :global(svg) {
		color: var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta--feed:hover :global(svg) {
			transform: none;
		}
	}

	/* The first chapter: text on the left, its plate on the right. Explicit areas so the
	   mobile stack can put the image between the meta line and the call to action. */
	.lead {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 17rem;
		grid-template-areas:
			'eyebrow media'
			'title   media'
			'summary media'
			'meta    media'
			'cta     media';
		grid-template-rows: auto auto auto auto 1fr;
		column-gap: var(--s-7);
		row-gap: var(--s-4);
		align-items: start;
		padding-top: var(--s-7);
	}

	.lead__title {
		grid-area: title;
		/* The largest type on the site, and always a piece of writing. */
		font-size: clamp(2.25rem, 5.2vw, 3.75rem);
		margin: 0;
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		font-size: 1rem;
		font-weight: 500;
		line-height: 1.4;
		letter-spacing: 0.12em;
		font-variant-caps: all-small-caps;
		color: var(--accent);
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		text-decoration-color: var(--accent-dim);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.12em;
		transition: text-decoration-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			text-decoration-line: underline;
		}
	}

	.lead__cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: start;
		grid-area: cta;
		margin-top: var(--s-1);
		min-height: 44px;
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		font-variant-caps: all-small-caps;
		color: var(--text);
		text-decoration: none;
		border-bottom: 1px solid var(--line-strong);
		transition:
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.lead__cta :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}
		.lead__cta:hover :global(svg) {
			transform: translateX(3px);
		}
	}

	.lead__cta:active {
		color: var(--accent-press);
	}

	.lead__link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.lead__summary {
		grid-area: summary;
		font-size: 1.3125rem;
		font-style: italic;
		line-height: 1.45;
		color: var(--text-secondary);
		max-width: 34rem;
	}

	.lead__meta {
		grid-area: meta;
	}

	.lead__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.lead__media {
		grid-area: media;
		align-self: start;
		display: block;
		border: 1px solid var(--line-strong);
		background: var(--plate);
		padding: var(--s-2);
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
		gap: 0;
		max-width: var(--measure);
	}

	.empty {
		color: var(--text-muted);
		font-style: italic;
	}

	.about__more {
		margin-top: var(--s-3);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--text);
		font-weight: 500;
		font-size: 1rem;
		letter-spacing: 0.1em;
		font-variant-caps: all-small-caps;
		text-decoration: none;
		border-bottom: 1px solid var(--line-strong);
		transition:
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.inline-cta :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}
		.inline-cta:hover :global(svg) {
			transform: translateX(3px);
		}
	}

	.inline-cta:active {
		color: var(--accent-press);
	}

	.inline-cta:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.lead {
			grid-template-columns: minmax(0, 1fr) 13rem;
			column-gap: var(--s-6);
		}
	}

	@media (max-width: 767px) {
		.intro {
			padding-top: var(--s-5);
			padding-bottom: var(--s-5);
		}
		.lead {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto;
			grid-template-areas:
				'eyebrow'
				'title'
				'summary'
				'meta'
				'media'
				'cta';
			padding-top: var(--s-5);
		}
		.lead__cover {
			aspect-ratio: 16 / 9;
		}
		.lead__summary {
			font-size: 1.1875rem;
		}
	}
</style>
