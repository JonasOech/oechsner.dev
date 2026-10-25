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
	<!-- The intro is a short shell session. It stays small on purpose: DESIGN.md §11 keeps
	     the largest type on the page for the writing below it. -->
	<header class="intro enter" style="--i: 0">
		<p class="intro__cmd"><span class="ps1" aria-hidden="true">$</span> whoami</p>
		<h3 class="intro__greeting">{site.intro}</h3>
		<p class="intro__tagline">
			Applied CS at Uni Bamberg, currently TU Dublin<br />
			Software engineer &amp; AI tutor<br />
			Currently looking for an Internship in Dublin
		</p>
		<p class="intro__actions">
			<a class="inline-cta" href={cvPath} target="_blank" rel="noopener">
				<Icon name="arrow-down" size={14} />
				download cv
			</a>
			<a
				class="inline-cta"
				href={feeds.rss}
				type="application/rss+xml"
				data-sveltekit-reload
				onclick={() => trackFeed('open-rss', 'home-intro')}
			>
				<Icon name="rss" size={14} />
				subscribe
			</a>
		</p>
	</header>

	{#if lead}
		<article class="lead">
			<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
			     newest post on the site. -->
			<p class="lead__eyebrow enter" style="--i: 1">
				<span class="ps1" aria-hidden="true">$</span> cat featured.md
			</p>

			<h2 class="hero-title lead__title enter" style="--i: 2">
				<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
			</h2>

			{#if lead.summary}
				<p class="lead__summary enter" style="--i: 3">{lead.summary}</p>
			{/if}

			<p class="meta lead__meta enter" style="--i: 4">
				<time datetime={lead.date}>{formatDate(lead.date)}</time>
				<span class="lead__dot" aria-hidden="true">|</span>
				{lead.readingMinutes} min read
				{#if lead.nerdyness}
					<span class="lead__dot" aria-hidden="true">|</span>
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
				read the post
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

	<Rail label="ls -l writing/" id="writing" wide>
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

		<p class="articles__head" aria-hidden="true">
			<span>date</span><span>read</span><span>name</span>
		</p>
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
		<p class="articles__total" aria-hidden="true">total {listed.length}</p>
	</Rail>

	<Rail label="cat about.txt" id="about">
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
		display: block;
		padding-top: var(--s-6);
		padding-bottom: var(--s-5);
		border-bottom: 1px dashed var(--line-strong);
	}

	.intro__cmd {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text);
		margin-bottom: var(--s-2);
	}

	/* §11: stays well under .lead__title at every width. */
	.intro__greeting {
		font-size: clamp(1rem, 1.6vw, 1.125rem);
		font-weight: 500;
		line-height: 1.5;
		color: var(--text);
		margin: 0 0 var(--s-2);
	}

	.intro__tagline {
		color: var(--text-secondary);
		line-height: 1.7;
	}

	.intro__actions {
		margin: var(--s-3) 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--s-5);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--accent);
		font-weight: 700;
		font-size: 0.8125rem;
		text-decoration: underline;
		text-decoration-color: var(--accent-dim);
		text-underline-offset: 0.3em;
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			background: var(--accent);
			color: var(--text-inverse);
			text-decoration-color: transparent;
		}
	}

	.inline-cta:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.lead {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
		grid-template-areas:
			'eyebrow media'
			'title   media'
			'summary media'
			'meta    media'
			'cta     media';
		column-gap: var(--s-6);
		row-gap: var(--s-4);
		align-items: start;
		padding-top: var(--s-6);
		padding-bottom: var(--s-6);
	}

	.lead__title {
		grid-area: title;
		/* Still the largest type on the site — a post-page h1 tops out at 2.25rem. */
		margin: 0;
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text);
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			color: var(--accent);
		}
	}

	.lead__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.lead__cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: start;
		grid-area: cta;
		min-height: 44px;
		padding: 0 var(--s-4);
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--accent);
		text-decoration: none;
		border: 1px solid var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead:hover .lead__cta {
			background: var(--accent);
			color: var(--text-inverse);
		}
	}

	.lead__summary {
		grid-area: summary;
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--text-secondary);
		max-width: 62ch;
	}

	.lead__meta {
		grid-area: meta;
	}

	.lead__dot {
		margin-inline: 0.6ch;
		color: var(--line-strong);
	}

	.lead__media {
		grid-area: media;
		align-self: start;
		display: block;
		border: 1px solid var(--line-strong);
		padding: 4px;
		background: var(--bg-deep);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	.filter {
		margin-bottom: var(--s-4);
	}

	.articles__head {
		display: grid;
		grid-template-columns: 10ch 4ch minmax(0, 1fr);
		column-gap: 2ch;
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-bottom: var(--s-1);
		border-bottom: 1px solid var(--line-strong);
	}

	.articles__head span:nth-child(2) {
		text-align: right;
	}

	.articles {
		display: grid;
	}

	.articles__total {
		margin-top: var(--s-3);
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.empty {
		color: var(--text-muted);
		padding-block: var(--s-3);
	}

	.about__more {
		margin-top: var(--s-3);
	}

	@media (max-width: 1023px) {
		.lead {
			grid-template-columns: minmax(0, 1fr) 240px;
		}
	}

	@media (max-width: 767px) {
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

	@media (max-width: 599px) {
		.articles__head {
			display: none;
		}
	}
</style>
