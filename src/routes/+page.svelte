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
	<!-- Masthead: the site's greeting and standfirst, ruled off with a double rule the way a
	     paper's title block is. Small and quiet — the writing below is the loudest thing here. -->
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
	</header>

	{#if lead}
		<!-- The title page of the featured post: title, author block, abstract, figure. -->
		<article class="lead">
			<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
			     newest post on the site. -->
			<p class="lead__eyebrow enter" style="--i: 1">Featured Blog Post</p>

			<h2 class="hero-title lead__title enter" style="--i: 2">
				<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
			</h2>

			<p class="lead__author enter" style="--i: 3">
				<span class="lead__name">{site.name}</span>
				<span class="lead__affil">{site.role}</span>
			</p>

			<p class="meta lead__meta enter" style="--i: 3">
				<time datetime={lead.date}>{formatDate(lead.date)}</time>
				<span class="lead__dot" aria-hidden="true">·</span>
				{lead.readingMinutes} min read
				{#if lead.nerdyness}
					<span class="lead__dot" aria-hidden="true">·</span>
					<Nerdyness level={lead.nerdyness} />
				{/if}
			</p>

			<div class="lead__body enter" style="--i: 4">
				{#if lead.summary}
					<div class="lead__abstract">
						<p class="lead__abstract-label">Abstract</p>
						<p class="lead__summary">{lead.summary}</p>
						<!-- The visible affordance. Not a tab stop: the title above is the accessible
						     link to the same post, and three tab stops to one destination is noise. -->
						<a class="lead__cta" href="/blog/{lead.slug}" tabindex="-1" aria-hidden="true">
							Read the post
							<Icon name="arrow-right" size={15} />
						</a>
					</div>
				{/if}

				{#if lead.cover}
					<figure class="lead__figure">
						<!-- Decorative: the title above is the accessible link to the same post. -->
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
							<figcaption class="lead__caption">
								<span class="lead__fig">Figure 1.</span>
								{lead.coverAlt}.
							</figcaption>
						{/if}
					</figure>
				{/if}
			</div>
		</article>
	{/if}

	<Rail label="Writing" id="writing" wide>
		{#if allTags.length}
			<div class="keywords filter">
				<span class="keywords__label" id="kw-label">Keywords</span>
				<div class="tag-row" role="group" aria-labelledby="kw-label">
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
		<p class="about__text">{about[0]}</p>
		<p class="about__more">
			<a class="inline-cta" href="/about">
				Background, projects and CV
				<Icon name="arrow-right" size={14} />
			</a>
		</p>
	</Rail>
</div>

<style>
	/* Double rule under the masthead: \hrule\vspace\hrule. */
	.intro {
		display: block;
		padding-top: var(--s-6);
		padding-bottom: var(--s-5);
		border-bottom: 3px double var(--text);
		text-align: center;
	}

	/* Small and italic: §11 reserves the largest type on the page for the writing, never a
	   greeting. */
	.intro__greeting {
		font-family: var(--font-serif);
		font-size: 1.25rem;
		font-style: italic;
		font-weight: 400;
		line-height: 1.4;
		text-wrap: balance;
		color: var(--text);
		margin: 0 0 var(--s-2);
		text-align: center;
	}

	.intro__tagline {
		margin: 0 auto;
		max-width: 46ch;
		color: var(--text-secondary);
		line-height: 1.5;
		text-align: center;
		text-wrap: balance;
	}

	.intro__actions {
		margin: var(--s-3) 0 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0 var(--s-6);
	}

	.inline-cta--feed :global(svg) {
		color: var(--accent);
	}

	/* The lead is a paper's first page: everything centred on one axis, then the abstract. */
	.lead {
		display: block;
		padding-top: var(--s-7);
		text-align: center;
	}

	.lead__title {
		font-size: clamp(1.875rem, 4.6vw, 3rem);
		margin: var(--s-2) auto 0;
		max-width: 22ch;
	}

	.lead__eyebrow {
		font-size: 1rem;
		font-variant-caps: all-small-caps;
		letter-spacing: 0.12em;
		color: var(--text-muted);
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		text-decoration-color: var(--accent);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.12em;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			color: var(--accent);
			text-decoration-line: underline;
		}
	}

	.lead__link:focus-visible {
		outline: none;
		border-radius: 1px;
		box-shadow: var(--focus-ring);
	}

	/* Author block */
	.lead__author {
		display: grid;
		gap: 0.1rem;
		margin-top: var(--s-5);
	}

	.lead__name {
		font-size: 1.125rem;
		color: var(--text);
	}

	.lead__affil {
		font-style: italic;
		color: var(--text-muted);
		font-size: 0.9375rem;
	}

	.lead__meta {
		margin-top: var(--s-2);
	}

	.lead__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.lead__body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 17rem;
		column-gap: var(--s-6);
		align-items: start;
		margin-top: var(--s-6);
		padding-top: var(--s-5);
		border-top: 1px solid var(--line);
		text-align: left;
	}

	/* Abstract: bold small-caps head, the summary set justified one step smaller. */
	.lead__abstract-label {
		font-size: 1rem;
		font-weight: 700;
		font-variant-caps: all-small-caps;
		letter-spacing: 0.1em;
		color: var(--text);
		margin: 0 0 var(--s-2);
	}

	.lead__summary {
		font-size: 1.0625rem;
		line-height: 1.55;
		color: var(--text-secondary);
		text-align: justify;
		text-align-last: left;
		hyphens: auto;
	}

	.lead__cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		margin-top: var(--s-3);
		min-height: 44px;
		color: var(--accent);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.18em;
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover {
			color: var(--accent-dim);
		}
	}

	.lead__figure {
		margin: 0;
	}

	.lead__media {
		display: block;
		border: 1px solid var(--line);
		background: var(--plate);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	.lead__caption {
		margin-top: var(--s-2);
		font-size: 0.9375rem;
		line-height: 1.4;
		color: var(--text-secondary);
	}

	.lead__fig {
		font-weight: 700;
		color: var(--text);
	}

	/* Keywords line above the contents. */
	.filter {
		margin-bottom: var(--s-4);
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--s-1) var(--s-3);
	}

	.keywords__label {
		font-style: italic;
		color: var(--text-muted);
	}

	.keywords__label::after {
		content: ':';
	}

	.articles {
		display: grid;
		counter-reset: entry;
		max-width: 52rem;
	}

	.empty {
		color: var(--text-muted);
	}

	.about__more {
		margin-top: var(--s-3);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--accent);
		font-size: 1rem;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.18em;
		text-decoration-color: rgba(var(--accent-rgb), 0.45);
		transition: text-decoration-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			text-decoration-color: currentColor;
		}
	}

	.inline-cta:active {
		color: var(--accent-dim);
	}

	.inline-cta:focus-visible {
		outline: none;
		border-radius: 1px;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 767px) {
		.intro {
			padding-top: var(--s-4);
			padding-bottom: var(--s-4);
		}
		.lead {
			padding-top: var(--s-6);
		}
		.lead__body {
			grid-template-columns: minmax(0, 1fr);
			row-gap: var(--s-5);
		}
		.lead__figure {
			max-width: 22rem;
		}
	}

	@media (max-width: 479px) {
		.lead__summary {
			text-align: left;
		}
	}
</style>
