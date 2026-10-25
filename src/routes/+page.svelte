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
	 * The home page *is* the writing index, and the lead post takes the largest type on the
	 * site, so the content occupies the loudest slot. `hero` in the front-matter is what
	 * grants a post that slot: `posts` is sorted newest-first, so the newest one that opted
	 * in wins it and everything else stays a row. Filtering by tag drops the lead treatment
	 * — a filtered view is a list, not a front page.
	 */
	const lead = $derived(activeTag ? undefined : posts.find((p) => p.hero));
	// Not `slice(1)`: the lead is no longer necessarily the first post, so it has to be
	// removed by identity or it both duplicates itself and swallows the newest post.
	const listed = $derived(
		activeTag ? posts.filter((p) => p.tags.includes(activeTag!)) : posts.filter((p) => p !== lead)
	);

	/** Running number of a post, oldest = 1. Stable under filtering, so "07" is always the same post. */
	const numberOf = (post: (typeof posts)[number]) => posts.length - posts.indexOf(post);

	function toggleTag(tag: string) {
		activeTag = activeTag === tag ? null : tag;
	}
</script>

<Seo title={site.name} />

<div class="container">
	<header class="intro grid enter" style="--i: 0">
		<p class="intro__greeting">{site.intro}</p>
		<div class="intro__side">
			<p class="intro__tagline">
				Applied CS at Uni Bamberg, currently TU Dublin.<br />
				Software engineer &amp; AI tutor.<br />
				Currently looking for an Internship in Dublin.
			</p>
			<p class="intro__actions">
				<a class="inline-cta" href={cvPath} target="_blank" rel="noopener">
					Download CV
					<Icon name="arrow-right" size={14} />
				</a>
				<a
					class="inline-cta"
					href={feeds.rss}
					type="application/rss+xml"
					data-sveltekit-reload
					onclick={() => trackFeed('open-rss', 'home-intro')}
				>
					Subscribe
					<Icon name="rss" size={14} />
				</a>
			</p>
		</div>
	</header>

	{#if lead}
		<article class="lead grid">
			<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
			     newest post on the site. -->
			<p class="lead__eyebrow enter" style="--i: 1">
				<span class="lead__num" aria-hidden="true">{String(numberOf(lead)).padStart(2, '0')}</span>
				Featured post
			</p>

			<h2 class="hero-title lead__title enter" style="--i: 2">
				<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
			</h2>

			<div class="lead__side enter" style="--i: 3">
				<p class="meta lead__meta">
					<time datetime={lead.date}>{formatDate(lead.date)}</time>
					<span class="lead__dot" aria-hidden="true">/</span>
					{lead.readingMinutes} min read
					{#if lead.nerdyness}
						<span class="lead__dot" aria-hidden="true">/</span>
						<Nerdyness level={lead.nerdyness} />
					{/if}
				</p>
			</div>

			{#if lead.summary}
				<p class="lead__summary enter" style="--i: 3">{lead.summary}</p>
			{/if}

			<!-- The visible affordance. Not a tab stop: the title above is the accessible
			     link to the same post, and three tab stops to one destination is noise. -->
			<a
				class="lead__cta enter"
				style="--i: 4"
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
					class="lead__media enter"
					style="--i: 3"
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
						<ArticleRow {post} index={numberOf(post)} />
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
	/* The masthead is a single quiet row: who is writing, and where to follow. Both
	   halves are body-sized, so nothing above the lead post competes with it. */
	.intro {
		padding-top: var(--s-6);
		padding-bottom: var(--s-5);
		align-items: start;
		row-gap: var(--s-4);
	}

	.intro__greeting {
		grid-column: 1 / span 6;
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: -0.015em;
		color: var(--text);
		max-width: 28ch;
	}

	.intro__side {
		grid-column: 7 / span 6;
		display: grid;
		gap: var(--s-3);
	}

	.intro__tagline {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		line-height: 1.55;
	}

	.intro__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2) var(--s-6);
	}

	/* Two columns inside the 12: the writing across nine, a narrow facts column on the
	   left. The title spans nearly the full width, set as large as the grid allows. */
	.lead {
		row-gap: var(--s-5);
		padding-top: var(--s-6);
		border-top: 6px solid var(--line-strong);
		align-items: start;
		grid-template-areas:
			'eyebrow eyebrow eyebrow title title title title title title title title title'
			'side    side    side    summary summary summary summary summary summary media media media'
			'.       .       .       cta     cta     cta     cta     cta     cta     media media media';
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		font-size: 0.875rem;
		font-weight: 700;
		line-height: 1.2;
		color: var(--text);
		margin: 0;
	}

	/* The running number of the post: the big indexing numeral, in red. Smaller than the
	   title at every width, so the writing still sets the top of the scale. */
	.lead__num {
		font-size: clamp(3rem, 7vw, 6rem);
		font-weight: 800;
		line-height: 0.82;
		letter-spacing: -0.06em;
		font-feature-settings: 'tnum' 1;
		color: var(--accent);
	}

	.lead__title {
		grid-area: title;
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
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

	.lead__side {
		grid-area: side;
		padding-top: 0.3rem;
	}

	.lead__summary {
		grid-area: summary;
		font-size: clamp(1.125rem, 1.7vw, 1.375rem);
		font-weight: 500;
		line-height: 1.4;
		letter-spacing: -0.015em;
		color: var(--text);
		max-width: 38ch;
	}

	.lead__dot {
		margin-inline: 0.35em;
		color: var(--accent);
	}

	.lead__cta {
		grid-area: cta;
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: var(--s-5);
		min-height: 48px;
		padding: 0 var(--s-4);
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--text-inverse);
		background: var(--text);
		text-decoration: none;
		transition: background-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover {
			background: var(--accent);
		}
	}

	.lead__media {
		grid-area: media;
		align-self: start;
		display: block;
		overflow: hidden;
		background: var(--surface);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		transition: filter var(--dur-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__media:hover .lead__cover {
			filter: grayscale(0);
		}
	}

	.filter {
		margin-bottom: var(--s-6);
	}

	/* The index runs the full nine columns of the body. */
	.articles {
		display: grid;
		gap: 0;
	}

	.articles :global(.card:last-child) {
		border-bottom: 1px solid var(--line-strong);
	}

	.empty {
		color: var(--text-muted);
	}

	.about__text {
		font-size: 1.375rem;
		font-weight: 500;
		line-height: 1.4;
		letter-spacing: -0.015em;
		color: var(--text);
		max-width: 38ch;
	}

	.about__more {
		margin-top: var(--s-5);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--text);
		font-weight: 700;
		font-size: 0.9375rem;
		text-decoration: none;
		border-bottom: 2px solid var(--line-strong);
		transition:
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}
	}

	.inline-cta:active {
		color: var(--accent-dim);
	}

	.inline-cta:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.lead {
			grid-template-areas:
				'eyebrow eyebrow eyebrow title title title title title title title title title'
				'side    side    side    summary summary summary summary summary summary summary summary summary'
				'.       .       .       media   media   media   media   media   media   .       .       .'
				'.       .       .       cta     cta     cta     cta     cta     cta     cta     cta     cta';
		}
	}

	@media (max-width: 767px) {
		.intro {
			padding-top: var(--s-4);
		}
		.intro__greeting,
		.intro__side {
			grid-column: 1;
		}
		.lead {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'eyebrow'
				'title'
				'summary'
				'side'
				'media'
				'cta';
		}
		.lead__eyebrow {
			flex-direction: row;
			align-items: baseline;
		}
		.lead__num {
			font-size: 2.75rem;
		}
		.lead__side {
			padding-top: 0;
		}
		.lead__cover {
			aspect-ratio: 16 / 9;
		}
	}
</style>
