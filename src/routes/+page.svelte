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
	import { accession, medium } from '$lib/catalogue';
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
		<!-- An index card for the lead piece. Not "Latest": the lead is the newest *hero*
		     post, which is not always the newest post on the site. -->
		<article class="lead enter" style="--i: 1">
			<header class="lead__bar">
				<span>Featured entry</span>
				<span>No.&nbsp;{accession(lead.slug)}</span>
			</header>

			<div class="lead__body">
				<div class="lead__text">
					<h2 class="hero-title lead__title">
						<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
					</h2>

					{#if lead.summary}
						<p class="lead__summary">{lead.summary}</p>
					{/if}

					<dl class="lead__facts">
						<div>
							<dt>Date</dt>
							<dd><time datetime={lead.date}>{formatDate(lead.date)}</time></dd>
						</div>
						<div>
							<dt>Medium</dt>
							<dd>{medium(lead.tags)}</dd>
						</div>
						<div>
							<dt>Dimensions</dt>
							<dd>{lead.readingMinutes} min read</dd>
						</div>
						{#if lead.nerdyness}
							<div>
								<dt>Depth</dt>
								<dd><Nerdyness level={lead.nerdyness} /></dd>
							</div>
						{/if}
					</dl>

					<!-- The visible affordance. Not a tab stop: the title above is the accessible
					     link to the same post. -->
					<a class="lead__cta" href="/blog/{lead.slug}" tabindex="-1" aria-hidden="true">
						Read the entry
						<Icon name="arrow-right" size={15} />
					</a>
				</div>

				{#if lead.cover}
					<!-- Decorative: the title is the accessible link to the same post. -->
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
				{/if}
			</div>
		</article>
	{/if}

	<Rail label="The collection" id="writing" wide>
		{#if allTags.length}
			<div class="tag-row filter" role="group" aria-label="Filter posts by tag">
				<span class="label filter__label" aria-hidden="true">Filter by medium</span>
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

		<div class="articles-head" aria-hidden="true">
			<span>No.</span>
			<span>Entry</span>
			<span>Date / extent</span>
		</div>

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

	<Rail label="Curator's note" id="about">
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
	/* The author line is small and left-aligned: the largest type on the page is always a
	   piece of writing (DESIGN.md §11). */
	.intro {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--s-3) var(--s-7);
		align-items: end;
		padding-top: var(--s-7);
		padding-bottom: var(--s-6);
	}

	.intro__greeting {
		grid-column: 1;
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 500;
		line-height: 1.35;
		color: var(--text);
		margin: 0;
	}

	.intro__tagline {
		grid-column: 1;
		margin: 0;
		max-width: 52ch;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.intro__actions {
		grid-column: 2;
		grid-row: 1 / span 2;
		margin: 0;
		display: grid;
		gap: 0 var(--s-6);
		justify-items: start;
	}

	.inline-cta--feed :global(svg) {
		color: var(--accent);
	}

	/* The index card: a hairline frame, a title strip in mono, then the entry itself. */
	.lead {
		background: var(--surface);
		border: 1px solid var(--text);
	}

	.lead__bar {
		display: flex;
		justify-content: space-between;
		gap: var(--s-4);
		padding: var(--s-2) var(--s-5);
		border-bottom: 1px solid var(--text);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}

	.lead__body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 340px;
		align-items: stretch;
	}

	.lead__text {
		display: grid;
		align-content: start;
		gap: var(--s-4);
		padding: var(--s-6) var(--s-5) var(--s-5);
	}

	.lead__title {
		font-size: clamp(1.875rem, 3.8vw, 3rem);
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		text-decoration-color: var(--accent);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.14em;
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			text-decoration-line: underline;
		}
	}

	.lead__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.lead__summary {
		font-size: 1.0625rem;
		line-height: 1.65;
		color: var(--text-secondary);
		max-width: 56ch;
	}

	/* Label card facts: ruled rows, label left in mono, value right. */
	.lead__facts {
		margin: var(--s-2) 0 0;
		max-width: 28rem;
		border-top: 1px solid var(--line-strong);
	}

	.lead__facts > div {
		display: grid;
		grid-template-columns: 7rem minmax(0, 1fr);
		gap: var(--s-3);
		padding: var(--s-2) 0;
		border-bottom: 1px solid var(--line);
		align-items: baseline;
	}

	.lead__facts dt {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.lead__facts dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}

	.lead__cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: start;
		min-height: 44px;
		font-size: 0.875rem;
		font-weight: 500;
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

	/* The plate: the cover is mounted on its own paper, hairline-ruled from the text. */
	.lead__media {
		display: block;
		border-left: 1px solid var(--text);
		background: var(--plate);
		overflow: hidden;
	}

	.lead__cover {
		width: 100%;
		height: 100%;
		min-height: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	.filter {
		margin-bottom: var(--s-6);
		align-items: center;
	}

	.filter__label {
		margin-right: var(--s-2);
	}

	.articles-head {
		display: grid;
		grid-template-columns: 4.5rem minmax(0, 1fr) 7.5rem 96px;
		column-gap: var(--s-5);
		padding: var(--s-2) 0;
		border-bottom: 1px solid var(--text);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.articles {
		display: block;
	}

	.empty {
		color: var(--text-muted);
		padding: var(--s-5) 0;
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
		font-weight: 500;
		font-size: 0.875rem;
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
		color: var(--accent-dim);
	}

	.inline-cta:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.lead__body {
			grid-template-columns: minmax(0, 1fr) 240px;
		}
		.articles-head {
			grid-template-columns: 4.5rem minmax(0, 1fr) 7rem;
		}
		.articles-head span:nth-child(4) {
			display: none;
		}
	}

	@media (max-width: 767px) {
		.intro {
			grid-template-columns: minmax(0, 1fr);
			padding-top: var(--s-5);
		}
		.intro__actions {
			grid-column: 1;
			grid-row: auto;
			grid-auto-flow: column;
			justify-content: start;
		}
		.lead__body {
			grid-template-columns: minmax(0, 1fr);
		}
		.lead__media {
			order: -1;
			border-left: 0;
			border-bottom: 1px solid var(--text);
		}
		.lead__cover {
			aspect-ratio: 16 / 9;
		}
		.lead__text {
			padding: var(--s-5) var(--s-4);
		}
		.lead__bar {
			padding-inline: var(--s-4);
		}
		.articles-head {
			display: none;
		}
	}
</style>
