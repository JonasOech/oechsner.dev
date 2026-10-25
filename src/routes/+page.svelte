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
	<!-- The introduction is deliberately small: the greeting hangs in the margin columns like
	     a rail label, the standfirst and the two links sit on the content columns. -->
	<header class="intro grid enter" style="--i: 0">
		<p class="intro__greeting">{site.intro}</p>
		<div class="intro__body">
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
		</div>
	</header>

	{#if lead}
		<article class="lead grid">
			<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
			     newest post on the site. -->
			<p class="eyebrow lead__eyebrow enter" style="--i: 1">Featured Blog Post</p>

			<h2 class="hero-title lead__title enter" style="--i: 2">
				<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
			</h2>

			{#if lead.summary}
				<p class="lead__summary enter" style="--i: 3">{lead.summary}</p>
			{/if}

			<p class="meta lead__meta enter" style="--i: 4">
				<time datetime={lead.date}>{lead.date}</time>
				<span>{lead.readingMinutes} min read</span>
				{#if lead.nerdyness}
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
	/* Small and quiet: §11 reserves the largest type on the page for the writing. */
	.intro {
		padding-top: var(--s-7);
		padding-bottom: var(--s-6);
		align-items: start;
	}

	.intro__greeting {
		grid-column: 1 / 4;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: -0.01em;
		color: var(--text);
		text-wrap: balance;
	}

	.intro__body {
		grid-column: 4 / 10;
	}

	.intro__tagline {
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

	/* The lead on the grid: facts hang in columns 1–3, the writing takes 4–8 and the
	   cover 9–12. Explicit rows rather than source order, so the mobile stack can put the
	   image between the meta line and the call to action without reordering the markup. */
	.lead {
		grid-template-rows: auto auto auto 1fr;
		border-top: 1px solid var(--text);
		padding-top: var(--s-3);
		padding-bottom: var(--s-5);
	}

	.lead__eyebrow {
		grid-column: 1 / 4;
		grid-row: 1;
		padding-top: 0.45rem;
		color: var(--accent);
	}

	.lead__meta {
		grid-column: 1 / 4;
		grid-row: 1;
		display: grid;
		gap: 0.2rem;
		justify-items: start;
		align-self: start;
		/* Shares row one with the kicker and sits just under it. */
		margin-top: 2.25rem;
	}

	.lead__title {
		grid-column: 4 / 9;
		grid-row: 1;
		padding-top: var(--s-2);
		text-wrap: balance;
	}

	.lead__link {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.12em;
		transition:
			color var(--dur-fast) var(--ease-out),
			text-decoration-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			color: var(--accent);
			text-decoration-color: currentColor;
		}
	}

	.lead__link:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	.lead__summary {
		grid-column: 4 / 9;
		grid-row: 2;
		margin-top: var(--s-4);
		font-size: 1.0625rem;
		line-height: 1.65;
		color: var(--text-secondary);
		text-wrap: pretty;
	}

	.lead__cta {
		grid-column: 4 / 9;
		grid-row: 3;
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		/* `.lead` is a grid: justify-self shrinks the box to its content, so the
		   bottom rule sits under the words rather than spanning the whole measure. */
		justify-self: start;
		margin-top: var(--s-4);
		min-height: 44px;
		font-size: 0.875rem;
		font-weight: 500;
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
		grid-column: 9 / -1;
		grid-row: 1 / span 4;
		align-self: start;
		display: block;
		margin-top: var(--s-2);
		border: 1px solid var(--line);
		background: var(--surface);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	/* The writing index: the filter sits on the content columns beside the label and the
	   rows run the full twelve, so their facts line up under the label. */
	.filter {
		grid-column: 4 / -1;
		grid-row: 1;
		margin-bottom: var(--s-6);
		align-self: start;
	}

	.articles {
		grid-column: 1 / -1;
		grid-row: 2;
		border-bottom: 1px solid var(--line);
	}

	.articles:empty {
		border-bottom: 0;
	}

	.empty {
		grid-column: 4 / -1;
		color: var(--text-muted);
		padding: var(--s-5) 0;
		border-top: 1px solid var(--line);
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
		font-weight: 500;
		font-size: 0.875rem;
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition:
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.inline-cta :global(svg) {
		color: var(--accent);
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
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.lead__title,
		.lead__summary,
		.lead__cta {
			grid-column: 4 / 10;
		}
		.lead__media {
			grid-column: 10 / -1;
		}
	}

	@media (max-width: 767px) {
		.intro {
			padding-top: var(--s-5);
			padding-bottom: var(--s-5);
			row-gap: var(--s-2);
		}
		.intro__greeting,
		.intro__body {
			grid-column: 1 / -1;
		}

		/* Stack, with the cover sitting between the meta line and the CTA. */
		.lead {
			grid-template-rows: none;
			row-gap: 0;
		}
		.lead__eyebrow,
		.lead__title,
		.lead__summary,
		.lead__meta,
		.lead__media,
		.lead__cta {
			grid-column: 1 / -1;
			grid-row: auto;
		}
		.lead__eyebrow {
			padding-top: 0;
			margin-bottom: var(--s-2);
		}
		.lead__title {
			padding-top: 0;
		}
		.lead__meta {
			display: flex;
			flex-wrap: wrap;
			gap: 0 var(--s-4);
			align-items: center;
			margin-top: var(--s-3);
		}
		.lead__media {
			margin-top: var(--s-4);
			order: 1;
		}
		.lead__cta {
			order: 2;
		}
		.lead__cover {
			aspect-ratio: 16 / 9;
		}

		.filter,
		.articles,
		.empty {
			grid-column: 1;
		}
		.filter {
			grid-row: auto;
		}
		.articles {
			grid-row: auto;
		}
	}
</style>
