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
	import { entryNumber } from '$lib/entry';
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
	<!-- The flyleaf: who owns the notebook, in the margin column, and a short hello beside
	     it. Small on purpose — the largest type on the page is the lead entry (DESIGN.md §6). -->
	<header class="intro rail enter" style="--i: 0">
		<p class="rail__label">Notebook of<br />{site.name}</p>
		<div class="intro__body">
			<h1 class="intro__greeting">{site.intro}</h1>
			<p class="intro__tagline">
				Applied CS at Uni Bamberg, currently TU Dublin<br />
				Software engineer &amp; AI tutor<br />
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
		</div>
	</header>

	{#if lead}
		<article class="lead">
			<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
			     newest post on the site. -->
			<p class="lead__eyebrow enter" style="--i: 1">
				<span class="lead__no">Entry {entryNumber(lead.slug)}</span>
				<span aria-hidden="true">/</span>
				<time datetime={lead.date}>{lead.date}</time>
				<span aria-hidden="true">/</span>
				Featured
			</p>

			<h2 class="hero-title lead__title enter" style="--i: 2">
				<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
			</h2>

			{#if lead.summary}
				<p class="lead__summary enter" style="--i: 3">{lead.summary}</p>
			{/if}

			<p class="meta lead__meta enter" style="--i: 4">
				{formatDate(lead.date)}
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

	<Rail label="Index" id="writing" wide>
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
	/* The flyleaf. Same two-column rail as every other section, so the margin label and
	   the margin rule line up all the way down the page. */
	.intro {
		padding-top: var(--s-8);
		padding-bottom: var(--s-6);
		border-bottom: 1px solid var(--line-strong);
	}

	.intro .rail__label {
		padding-top: 0.45rem;
	}

	/* Small by design: a greeting, not a masthead. §11 reserves the largest type for
	   the writing. */
	.intro__greeting {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 2.2vw, 1.5rem);
		font-weight: 500;
		font-style: italic;
		line-height: 1.35;
		color: var(--text);
		margin: 0 0 var(--s-3);
	}

	.intro__tagline {
		max-width: 46ch;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.intro__actions {
		margin: var(--s-3) 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-1) var(--s-6);
	}

	.inline-cta--feed :global(svg) {
		color: var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta--feed:hover :global(svg) {
			transform: none;
		}
	}

	/* The lead entry: header strip in the margin voice, the title as the loudest type on
	   the site, the cover mounted on the right. */
	.lead {
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
		padding-top: var(--s-7);
	}

	.lead__title {
		grid-area: title;
		font-size: clamp(2rem, 4vw, 3.5rem);
		margin: 0;
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--s-2);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 400;
		line-height: 1.4;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
		margin: 0;
		padding-bottom: var(--s-3);
		border-bottom: 1px solid var(--line);
	}

	.lead__no {
		color: var(--accent);
		font-weight: 500;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		text-decoration-color: var(--accent);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.12em;
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			text-decoration-line: underline;
			color: var(--accent);
		}
	}

	.lead__link:focus-visible {
		outline: none;
		border-radius: 2px;
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
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent);
		text-decoration: none;
		border-bottom: 1px solid var(--accent);
	}

	.lead__cta :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover :global(svg) {
			transform: translateX(3px);
		}
	}

	.lead__summary {
		grid-area: summary;
		font-size: 1.125rem;
		line-height: 1.65;
		color: var(--text-secondary);
		max-width: 52ch;
	}

	.lead__meta {
		grid-area: meta;
	}

	.lead__dot {
		margin-inline: 0.4em;
	}

	/* Mounted like a photo in the book: paper-white mat inside a pencil border. */
	.lead__media {
		grid-area: media;
		align-self: start;
		display: block;
		overflow: hidden;
		border: 1px solid var(--line-strong);
		border-radius: 2px;
		padding: 6px;
		background: var(--plate);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	.filter {
		margin-bottom: var(--s-5);
	}

	.articles {
		display: grid;
		max-width: none;
		border-bottom: 1px solid var(--line-strong);
	}

	.empty {
		color: var(--text-muted);
		padding: var(--s-5) 0;
	}

	.about__more {
		margin-top: var(--s-4);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.inline-cta :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			border-bottom-color: currentColor;
		}
		.inline-cta:hover :global(svg) {
			transform: translateX(3px);
		}
	}

	.inline-cta:active {
		color: var(--text);
	}

	.inline-cta:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.lead {
			grid-template-columns: minmax(0, 1fr) 250px;
			column-gap: var(--s-6);
		}
		.intro {
			grid-template-columns: minmax(0, 1fr);
		}
		.intro .rail__label {
			margin-bottom: var(--s-3);
		}
	}

	@media (max-width: 767px) {
		.intro {
			padding-top: var(--s-6);
			padding-bottom: var(--s-5);
		}
		.lead {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'eyebrow'
				'title'
				'summary'
				'meta'
				'media'
				'cta';
		}
		.lead__cover {
			aspect-ratio: 16 / 9;
		}
	}
</style>
