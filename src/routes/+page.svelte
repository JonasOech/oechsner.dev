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
		<div class="intro__card">
			<h3 class="intro__greeting">{site.intro}</h3>
			<ul class="intro__facts">
				<li>Applied CS at Uni Bamberg, currently TU Dublin</li>
				<li>Software engineer &amp; AI tutor</li>
				<li>Currently looking for an Internship in Dublin</li>
			</ul>
		</div>
		<p class="intro__actions">
			<a class="btn btn--secondary" href={cvPath} target="_blank" rel="noopener">
				Download CV
				<Icon name="arrow-right" size={14} />
			</a>
			<a
				class="btn btn--secondary"
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
			<a class="btn btn--primary" href="/about">
				Background, projects and CV
				<Icon name="arrow-right" size={14} />
			</a>
		</p>
	</Rail>
</div>

<style>
	/* Greeting card + the two utility buttons: a compact name tag, deliberately small.
	   DESIGN.md §10: the largest type on the page is always the writing. */
	.intro {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-5) var(--s-6);
		padding-top: var(--s-7);
	}

	.intro__card {
		background: var(--blue);
		border: var(--bw) solid var(--ink);
		box-shadow: var(--shadow-3);
		padding: var(--s-5) var(--s-5) var(--s-5);
		transform: rotate(-1deg);
		max-width: 38rem;
	}

	/* Capped well below `.lead__title` at every viewport width. */
	.intro__greeting {
		font-size: clamp(1.25rem, 2.2vw, 1.75rem);
		line-height: 1.15;
		letter-spacing: -0.02em;
		color: var(--ink);
		margin: 0 0 var(--s-4);
	}

	.intro__facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2) var(--s-3);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.intro__facts li {
		font-size: 0.875rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--ink);
		background: var(--surface);
		border: var(--bw-thin) solid var(--ink);
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
	}

	.intro__facts li:nth-child(2) {
		background: var(--lime);
		transform: rotate(1.5deg);
	}

	.intro__facts li:nth-child(3) {
		background: var(--yellow);
		transform: rotate(-1deg);
	}

	.intro__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-4);
		margin: 0;
	}

	/* The lead post: one oversized sticker. Explicit grid areas so the mobile stack can
	   slot the image between the meta line and the call to action. */
	.lead {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 380px;
		grid-template-areas:
			'eyebrow media'
			'title   media'
			'summary media'
			'meta    media'
			'cta     media';
		column-gap: var(--s-7);
		row-gap: var(--s-4);
		align-items: start;
		margin-top: var(--s-8);
		padding: var(--s-7) var(--s-7) var(--s-7);
		background: var(--yellow);
		border: var(--bw) solid var(--ink);
		box-shadow: var(--shadow-4);
	}

	.lead__title {
		grid-area: title;
		font-size: clamp(2.25rem, 5.4vw, 4.75rem);
		margin: 0;
		overflow-wrap: break-word;
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		justify-self: start;
		font-size: 0.8125rem;
		font-weight: 800;
		line-height: 1;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-inverse);
		background: var(--ink);
		padding: 0.55rem 0.8rem;
		margin: 0;
		transform: rotate(-2deg);
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		text-decoration-thickness: 6px;
		text-underline-offset: 0.1em;
		text-decoration-color: var(--ink);
		text-decoration-skip-ink: none;
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
		grid-area: summary;
		font-size: 1.1875rem;
		line-height: 1.55;
		font-weight: 500;
		color: var(--ink);
		max-width: 52ch;
	}

	.lead__meta {
		grid-area: meta;
		color: var(--ink);
	}

	.lead__dot {
		margin-inline: 0.4em;
	}

	/* Looks like a button, is not a tab stop: the title is the accessible link. */
	.lead__cta {
		grid-area: cta;
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		margin-top: var(--s-3);
		min-height: 52px;
		padding: 0.8rem 1.4rem;
		font-weight: 800;
		color: var(--text-inverse);
		background: var(--ink);
		border: var(--bw) solid var(--ink);
		box-shadow: 5px 5px 0 var(--surface);
		text-decoration: none;
		transition:
			transform var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.lead__cta :global(svg) {
		stroke-width: 2.25;
		transition: transform 160ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover {
			transform: translate(-2px, -2px);
			box-shadow: 8px 8px 0 var(--surface);
			background: var(--pink);
			color: var(--ink);
		}
		.lead__cta:hover :global(svg) {
			transform: translateX(4px);
		}
	}

	.lead__media {
		grid-area: media;
		align-self: start;
		display: block;
		overflow: hidden;
		border: var(--bw) solid var(--ink);
		box-shadow: var(--shadow-3);
		background: var(--surface);
		transform: rotate(2deg);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		transition: transform 360ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__media:hover .lead__cover {
			transform: scale(1.05);
		}
	}

	:global(#writing) {
		--tone: var(--pink);
	}

	:global(#about) {
		--tone: var(--lime);
	}

	.filter {
		margin-bottom: var(--s-7);
	}

	/* Two columns of boxed cards, colour cycling through the sticker palette. */
	.articles {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr));
		gap: var(--s-7) var(--s-6);
		align-items: stretch;
	}

	.articles :global(.card:nth-child(4n + 1)) {
		--tone: var(--pink);
	}
	.articles :global(.card:nth-child(4n + 2)) {
		--tone: var(--blue);
	}
	.articles :global(.card:nth-child(4n + 3)) {
		--tone: var(--lime);
	}
	.articles :global(.card:nth-child(4n + 4)) {
		--tone: var(--orange);
	}

	.empty {
		grid-column: 1 / -1;
		font-weight: 700;
		color: var(--text-secondary);
	}

	.about__more {
		margin-top: var(--s-5);
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
			margin-top: var(--s-7);
			box-shadow: var(--shadow-3);
		}
		.lead__cover {
			aspect-ratio: 16 / 9;
		}
		.lead__media {
			transform: rotate(1deg);
			margin-block: var(--s-2);
		}
	}
</style>
