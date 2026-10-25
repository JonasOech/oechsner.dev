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
		<p class="intro__kicker"><span class="intro__pulse" aria-hidden="true"></span>Open to an internship in Dublin</p>
		<h3 class="intro__greeting">{site.intro}</h3>
		<p class="intro__tagline">
			Applied CS at Uni Bamberg, currently TU Dublin<br />
			Software engineer &amp; AI tutor
		</p>
		<p class="intro__actions">
			<a class="inline-cta inline-cta--primary" href={cvPath} target="_blank" rel="noopener">
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
	.intro {
		display: grid;
		justify-items: center;
		padding-top: var(--s-8);
		padding-bottom: var(--s-6);
		text-align: center;
	}

	/* A small status pill above the greeting: the one place the page says what the author
	   is after right now. Edit the sentence in the markup above. */
	.intro__kicker {
		display: inline-flex;
		align-items: center;
		gap: 0.6em;
		margin: 0 0 var(--s-4);
		padding: 0.5rem 1rem;
		border-radius: var(--r-pill);
		background: var(--glass);
		border: 1px solid var(--glass-border);
		-webkit-backdrop-filter: blur(14px);
		backdrop-filter: blur(14px);
		box-shadow: var(--shadow-inset);
		font-size: 0.8125rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		color: var(--text);
	}

	.intro__pulse {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--success);
		box-shadow: 0 0 0 0 rgba(var(--success-rgb), 0.6);
		animation: pulse 2.6s var(--ease-out) infinite;
	}

	@keyframes pulse {
		to {
			box-shadow: 0 0 0 9px rgba(var(--success-rgb), 0);
		}
	}

	/* Light, small and quiet: §11 reserves the largest type on the page for the writing,
	   never a greeting. Capped well under `.lead__title` at every viewport width. */
	.intro__greeting {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 2.2vw, 1.75rem);
		font-weight: 300;
		line-height: 1.4;
		text-wrap: balance;
		color: var(--text);
		margin: 0 0 var(--s-3);
	}

	.intro__tagline {
		margin: 0 auto;
		max-width: 46ch;
		color: var(--text-secondary);
		line-height: 1.6;
		text-wrap: balance;
	}

	.intro__actions {
		margin: var(--s-5) 0 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--s-3);
	}

	/* The lead: one big frosted card. Explicit areas rather than source order, so the
	   mobile stack can put the image between the meta line and the call to action. */
	.lead {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 380px;
		grid-template-areas:
			'eyebrow media'
			'title   media'
			'summary media'
			'meta    media'
			'cta     media';
		align-content: start;
		column-gap: var(--s-7);
		row-gap: var(--s-4);
		align-items: start;
		margin-top: var(--s-6);
		padding: var(--s-7);
		border-radius: var(--r-xl);
		background: var(--glass);
		border: 1px solid var(--glass-border);
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
		backdrop-filter: blur(var(--glass-blur)) saturate(140%);
		box-shadow: var(--shadow-glass), 0 30px 80px rgba(var(--violet-rgb), 0.12);
	}

	.lead__title {
		grid-area: title;
		/* The largest type on the site, by design: a post page h1 tops out at 2.75rem. */
		font-size: clamp(2.125rem, 4.4vw, 3.5rem);
		margin: 0;
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		justify-self: start;
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent);
		padding: 0.5rem 0.9rem;
		border-radius: var(--r-pill);
		background: var(--accent-wash);
		border: 1px solid rgba(var(--accent-rgb), 0.3);
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
	}

	/* The whole title links; the focus ring is the visible affordance on keyboard. */
	.lead__link:focus-visible {
		outline: none;
		border-radius: var(--r-sm);
		box-shadow: var(--focus-ring);
	}

	.lead__cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: start;
		grid-area: cta;
		margin-top: var(--s-2);
		min-height: 44px;
		padding: 0.7rem 1.4rem;
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--text-inverse);
		text-decoration: none;
		border-radius: var(--r-pill);
		background: var(--grad-accent);
		box-shadow:
			0 8px 24px rgba(var(--violet-rgb), 0.3),
			inset 0 1px 0 rgba(var(--text-bright-rgb), 0.5);
		transition:
			box-shadow var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);
	}

	.lead__cta :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover {
			transform: translateY(-1px);
			box-shadow:
				0 12px 32px rgba(var(--violet-rgb), 0.45),
				inset 0 1px 0 rgba(var(--text-bright-rgb), 0.6);
		}
		.lead__cta:hover :global(svg) {
			transform: translateX(3px);
		}
	}

	.lead__summary {
		grid-area: summary;
		font-size: 1.0625rem;
		font-weight: 300;
		line-height: 1.7;
		color: var(--text-secondary);
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
		align-self: stretch;
		display: block;
		border-radius: var(--r-lg);
		overflow: hidden;
		border: 1px solid var(--glass-border);
		box-shadow: var(--shadow-3);
	}

	.lead__cover {
		width: 100%;
		height: 100%;
		min-height: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		transition: transform 480ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__media:hover .lead__cover {
			transform: scale(1.03);
		}
	}

	.filter {
		margin-bottom: var(--s-5);
	}

	/* Frosted cards, two to a row; one column once there is no room for a readable card. */
	.articles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--s-4);
	}

	.empty {
		color: var(--text-muted);
	}

	.about__more {
		margin-top: var(--s-5);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		padding: 0.6rem 1.25rem;
		color: var(--text);
		font-weight: 500;
		font-size: 0.875rem;
		letter-spacing: 0.02em;
		text-decoration: none;
		border-radius: var(--r-pill);
		background: var(--glass);
		border: 1px solid var(--glass-border);
		-webkit-backdrop-filter: blur(14px);
		backdrop-filter: blur(14px);
		box-shadow: var(--shadow-inset);
		transition:
			background-color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);
	}

	.inline-cta--primary {
		color: var(--text-inverse);
		background: var(--grad-accent);
		border-color: transparent;
		box-shadow:
			0 8px 24px rgba(var(--violet-rgb), 0.28),
			inset 0 1px 0 rgba(var(--text-bright-rgb), 0.5);
	}

	.inline-cta :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	.inline-cta--feed :global(svg) {
		color: var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			background: var(--glass-hover);
			border-color: var(--glass-edge);
			transform: translateY(-1px);
		}
		.inline-cta--primary:hover {
			background: var(--grad-accent-hover);
			border-color: transparent;
		}
		.inline-cta:hover :global(svg) {
			transform: translateX(3px);
		}
		.inline-cta--feed:hover :global(svg) {
			transform: none;
		}
	}

	.inline-cta:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.lead {
			grid-template-columns: minmax(0, 1fr) 260px;
			column-gap: var(--s-6);
			padding: var(--s-6);
		}
	}

	@media (max-width: 767px) {
		.intro {
			padding-top: var(--s-5);
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
			padding: var(--s-5);
			border-radius: var(--r-lg);
		}
		.lead__media {
			align-self: start;
		}
		.lead__cover {
			height: auto;
			min-height: 0;
			aspect-ratio: 16 / 9;
		}
	}
</style>
