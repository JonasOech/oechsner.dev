<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import ArticleRow from '$lib/components/ArticleRow.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import Ransom from '$lib/components/Ransom.svelte';
	import { reveal } from '$lib/actions/reveal';
	import Icon from '$lib/components/Icon.svelte';
	import { site, cvPath, feeds } from '$lib/data/site';
	import { about } from '$lib/data/resume';
	import { posts, allTags, formatDate } from '$lib/posts';
	import { trackFeed } from '$lib/track';

	let activeTag = $state<string | null>(null);

	/**
	 * The home page *is* the writing index, and the lead post takes the loudest type on
	 * the site — a ransom-note headline — so the content occupies the biggest slot, never
	 * the author's name. `hero` in the front-matter is what grants a post that slot:
	 * `posts` is sorted newest-first, so the newest one that opted in wins it and
	 * everything else stays a clipping. Filtering by tag drops the lead treatment — a
	 * filtered view is a list, not a front page.
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
	<!-- The cover of the zine: a greeting scrawled in marker, a typed slip saying who and
	     what, and a stamp counting the clippings inside. Content comes next, bigger. -->
	<header class="intro">
		<div class="intro__main">
			<h1 class="intro__greeting enter" style="--i: 0">{site.intro}</h1>

			<div class="intro__slip slip taped taped--one enter" style="--i: 1; --r0: -2deg">
				<p class="intro__tagline">
					Applied CS at Uni Bamberg, currently TU Dublin<br />
					Software engineer &amp; AI tutor<br />
					<span class="hl">Currently looking for an Internship in Dublin</span>
				</p>
			</div>

			<p class="intro__actions enter" style="--i: 2">
				<a class="btn btn--secondary" href={cvPath} target="_blank" rel="noopener">
					Download CV
					<Icon name="arrow-right" size={16} />
				</a>
				<a
					class="btn btn--secondary intro__feed"
					href={feeds.rss}
					type="application/rss+xml"
					data-sveltekit-reload
					onclick={() => trackFeed('open-rss', 'home-intro')}
				>
					<Icon name="rss" size={16} />
					Subscribe
				</a>
			</p>
		</div>

		<div class="intro__issue enter" style="--i: 3; --r0: 8deg" aria-hidden="true">
			<span class="stamp intro__stamp">Issue Nº {posts.length}</span>
			<span class="scrawl intro__note">{posts.length} stories inside</span>
		</div>
	</header>

	{#if lead}
		<article class="lead">
			<span class="staple lead__staple" aria-hidden="true"></span>

			<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
			     newest post on the site. -->
			<p class="lead__eyebrow enter" style="--i: 1">
				<span class="stamp">Featured Blog Post</span>
			</p>

			<h2 class="lead__title enter" style="--i: 2">
				<a class="lead__link" href="/blog/{lead.slug}"><Ransom text={lead.title} /></a>
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
				class="btn btn--primary lead__cta enter"
				style="--i: 5"
				href="/blog/{lead.slug}"
				tabindex="-1"
				aria-hidden="true"
			>
				Read the post
				<Icon name="arrow-right" size={16} />
			</a>

			{#if lead.cover}
				<!-- Decorative: the title above is the accessible link to the same post. -->
				<a
					class="lead__media taped enter"
					style="--i: 2; --r0: 4deg"
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
					{#each listed as post, i (post.slug)}
						<ArticleRow {post} index={listed.length - i} />
					{/each}
				{/key}
			{/if}
		</div>
	</Rail>

	<Rail label="About" id="about">
		<div class="about slip">
			<p class="about__text">{about[0]}</p>
		</div>
		<p class="about__more">
			<a class="btn btn--secondary" href="/about">
				Background, projects and CV
				<Icon name="arrow-right" size={16} />
			</a>
		</p>
	</Rail>
</div>

<style>
	/* — The cover — */
	.intro {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--s-6);
		padding-top: var(--s-5);
		padding-bottom: var(--s-7);
	}

	.intro__main {
		display: grid;
		gap: var(--s-5);
		justify-items: start;
	}

	/* A greeting in marker. Capped well under the lead title (§11): it is a line of
	   handwriting, and the writing below is always the largest type on the page. */
	.intro__greeting {
		font-family: var(--font-marker);
		font-size: clamp(1.5rem, 3.4vw, 2.25rem);
		font-weight: 400;
		line-height: 1.2;
		letter-spacing: 0;
		color: var(--blue);
		transform: rotate(-1.5deg);
		margin: 0;
	}

	.intro__slip {
		padding: var(--s-4) var(--s-5);
		max-width: 34rem;
		transform: rotate(0.6deg);
	}

	.intro__tagline {
		font-family: var(--font-type);
		font-size: 1.0625rem;
		line-height: 1.75;
		color: var(--text);
	}

	.intro__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-4) var(--s-5);
		margin: 0;
	}

	.intro__issue {
		display: grid;
		justify-items: center;
		gap: var(--s-4);
		padding-right: var(--s-4);
	}

	.intro__stamp {
		font-size: 1rem;
		padding: 0.5em 0.9em;
		transform: rotate(7deg);
	}

	.intro__note {
		font-size: 1.125rem;
		transform: rotate(-5deg);
	}

	/* — The lead clipping: two columns, the headline on the left, the cover beside it —
	   explicit areas so the mobile stack can slot the image between meta and CTA. */
	.lead {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 340px;
		grid-template-areas:
			'eyebrow media'
			'title   media'
			'summary media'
			'meta    media'
			'cta     media';
		column-gap: var(--s-7);
		row-gap: var(--s-4);
		align-items: start;
		margin-top: var(--s-4);
		padding: var(--s-7) var(--s-7) var(--s-6);
		background: var(--surface);
		border: 2px solid var(--text);
		box-shadow: var(--shadow-orange), 5px 5px 0 1px var(--text);
		transform: rotate(-0.4deg);
	}

	.lead__staple {
		top: 0.9rem;
		left: 1.2rem;
	}

	/* The largest type on the site, per DESIGN.md §11 — and it is a piece of writing. */
	.lead__title {
		grid-area: title;
		font-size: clamp(2.25rem, 5.6vw, 4.25rem);
		line-height: 1.3;
		margin: 0;
		text-transform: none;
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		margin: 0;
	}

	.lead__link {
		display: block;
		color: inherit;
		text-decoration: none;
	}

	.lead__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.lead__summary {
		grid-area: summary;
		font-size: 1.1875rem;
		line-height: 1.65;
		color: var(--text-secondary);
		max-width: 46ch;
	}

	.lead__meta {
		grid-area: meta;
	}

	.lead__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.lead__cta {
		grid-area: cta;
		justify-self: start;
		margin-top: var(--s-2);
	}

	/* The cover is a photocopy taped down, a little crooked, on a white border. */
	.lead__media {
		grid-area: media;
		align-self: start;
		display: block;
		padding: 0.6rem;
		background: var(--plate);
		border: 2px solid var(--text);
		box-shadow: var(--shadow-3);
		transform: rotate(2.2deg);
		transition: transform var(--dur-base) var(--ease-snap);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		filter: grayscale(0.2) contrast(1.05);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__media:hover {
			transform: rotate(0deg) scale(1.02);
		}
	}

	.filter {
		margin-bottom: var(--s-7);
	}

	.articles {
		display: grid;
		gap: var(--s-6);
		max-width: 52rem;
		/* Room for the number tabs that hang above each clipping. */
		padding-top: var(--s-3);
	}

	.empty {
		font-family: var(--font-type);
		color: var(--text-muted);
	}

	.about {
		padding: var(--s-5);
		transform: rotate(0.4deg);
	}

	.about__text {
		font-size: 1.1875rem;
		color: var(--text);
	}

	.about__more {
		margin-top: var(--s-6);
	}

	@media (max-width: 1023px) {
		.lead {
			grid-template-columns: minmax(0, 1fr) 250px;
			column-gap: var(--s-6);
			padding: var(--s-6);
		}
	}

	@media (max-width: 767px) {
		.intro {
			grid-template-columns: minmax(0, 1fr);
			padding-bottom: var(--s-6);
		}

		.intro__issue {
			grid-auto-flow: column;
			justify-content: start;
			justify-items: start;
			align-items: center;
			gap: var(--s-5);
			padding: var(--s-2) 0 0 var(--s-2);
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
			padding: var(--s-6) var(--s-4) var(--s-5);
			box-shadow: 4px 4px 0 var(--accent), 4px 4px 0 1px var(--text);
		}

		.lead__cover {
			aspect-ratio: 16 / 9;
		}

		.lead__media {
			margin: var(--s-2) var(--s-2) var(--s-3);
		}
	}
</style>
