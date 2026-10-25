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

	const count = $derived(listed.length);

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
		<div class="pane">
			<div class="toolbar">
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
			</div>

			<div class="articles" use:reveal={{ stagger: true }}>
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

			<p class="statusbar" aria-live="polite">
				{count}
				{count === 1 ? 'post' : 'posts'}{activeTag ? ` tagged ${activeTag}` : ''}
			</p>
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
	/* The document's masthead: left-aligned, small. The lead post below carries the loudest
	   type (DESIGN.md section 11), never this greeting. */
	.intro {
		display: block;
		padding-top: var(--s-7);
		padding-bottom: var(--s-6);
	}

	.intro__greeting {
		font-family: var(--font-sans);
		font-size: 1.0625rem;
		font-weight: 500;
		line-height: 1.4;
		letter-spacing: -0.005em;
		text-wrap: balance;
		color: var(--text);
		margin: 0 0 var(--s-2);
	}

	.intro__tagline {
		margin: 0;
		max-width: 56ch;
		color: var(--text-secondary);
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.intro__actions {
		margin: var(--s-4) 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	/* The feed icon leads its label rather than trailing it, so it should not take the
	   arrow's nudge on hover. */
	.inline-cta--feed :global(svg) {
		color: var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta--feed:hover :global(svg) {
			transform: none;
		}
	}

	/* Two columns: the writing on the left, the cover beside it, like a document with its
	   preview. Explicit areas, so the mobile stack can put the image between the meta line
	   and the call to action without reordering the markup. */
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
		padding-top: var(--s-6);
		border-top: 1px solid var(--line);
	}

	.lead__title {
		grid-area: title;
		/* Still the largest type on the site (section 11); a post-page h1 tops out at 2.5rem. */
		font-size: clamp(1.875rem, 3.8vw, 3rem);
		margin: 0;
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		font-family: var(--font-sans);
		font-size: 0.6875rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent);
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		text-decoration-color: var(--accent);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.12em;
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
		margin-top: var(--s-2);
		min-height: 40px;
		padding: 0 1rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-inverse);
		background: var(--accent);
		border: 1px solid var(--accent-dim);
		border-radius: var(--radius);
		text-decoration: none;
		transition: background-color var(--dur-fast) var(--ease-out);
	}

	.lead__cta :global(svg) {
		transition: transform 180ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover {
			background: var(--accent-dim);
		}
		.lead__cta:hover :global(svg) {
			transform: translateX(2px);
		}
	}

	.lead__link:focus-visible {
		outline: none;
		border-radius: 4px;
		box-shadow: var(--focus-ring);
	}

	.lead__summary {
		grid-area: summary;
		font-size: 1.0625rem;
		line-height: 1.65;
		color: var(--text-secondary);
		max-width: 52ch;
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
		border-radius: var(--radius);
		overflow: hidden;
		border: 1px solid var(--line-strong);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	/* The list pane: toolbar on top, rows, a status bar underneath. */
	.pane {
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		background: var(--sheet);
		overflow: hidden;
	}

	.toolbar {
		padding: var(--s-2) var(--s-3);
		background: var(--surface);
		border-bottom: 1px solid var(--line-strong);
	}

	.articles {
		display: block;
	}

	.statusbar {
		margin: 0;
		padding: var(--s-2) var(--s-4);
		background: var(--surface);
		border-top: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	.empty {
		color: var(--text-muted);
		padding: var(--s-5) var(--s-4);
	}

	.about__more {
		margin-top: var(--s-4);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 36px;
		padding: 0 0.875rem;
		color: var(--text);
		font-weight: 500;
		font-size: 0.8125rem;
		text-decoration: none;
		background: var(--sheet);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		transition:
			background-color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.inline-cta :global(svg) {
		transition: transform 180ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			background: var(--surface-hover);
			border-color: var(--text-muted);
		}
		.inline-cta:hover :global(svg) {
			transform: translateX(2px);
		}
	}

	.inline-cta:active {
		background: var(--surface-active);
	}

	.inline-cta:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.lead {
			grid-template-columns: minmax(0, 1fr) 280px;
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
