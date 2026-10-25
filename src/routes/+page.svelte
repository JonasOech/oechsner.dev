<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import ArticleRow from '$lib/components/ArticleRow.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
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
	<header class="intro enter" style="--i: 0">
		<p class="intro__greeting">{site.intro}</p>
		<p class="intro__tagline">
			Applied CS at Uni Bamberg, currently TU Dublin. Software engineer &amp; AI tutor. Currently
			looking for an internship in Dublin.
		</p>
		<p class="intro__links">
			<a href={cvPath} target="_blank" rel="noopener">CV (PDF)</a>
			<span aria-hidden="true">·</span>
			<a
				href={feeds.rss}
				type="application/rss+xml"
				data-sveltekit-reload
				onclick={() => trackFeed('open-rss', 'home-intro')}>Subscribe</a
			>
		</p>
	</header>

	{#if lead}
		<article class="lead enter" style="--i: 1">
			<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
			     newest post on the site. -->
			<p class="lead__eyebrow">Featured</p>

			<h2 class="hero-title lead__title">
				<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
			</h2>

			{#if lead.summary}
				<p class="lead__summary">{lead.summary}</p>
			{/if}

			<p class="meta lead__meta">
				<time datetime={lead.date}>{formatDate(lead.date)}</time>
				<span class="lead__dot" aria-hidden="true">·</span>
				{lead.readingMinutes} min read
				{#if lead.nerdyness}
					<span class="lead__dot" aria-hidden="true">·</span>
					<Nerdyness level={lead.nerdyness} />
				{/if}
			</p>
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

		<div class="articles" aria-live="polite">
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
			<a href="/about">Background, projects and CV</a>
		</p>
	</Rail>
</div>

<style>
	.intro {
		padding-top: var(--s-9);
		display: grid;
		gap: var(--s-2);
	}

	/* A sentence, not a banner: body size, regular weight. §11 — the author's name never
	   outranks a piece of writing. */
	.intro__greeting {
		color: var(--text);
	}

	.intro__tagline {
		color: var(--text-muted);
		font-size: 1rem;
		text-wrap: pretty;
	}

	.intro__links {
		font-size: 1rem;
		color: var(--text-muted);
		display: flex;
		gap: var(--s-3);
	}

	.lead {
		margin-top: var(--s-9);
		display: grid;
		gap: var(--s-3);
	}

	.lead__eyebrow {
		font-size: 1rem;
		font-style: italic;
		color: var(--text-muted);
	}

	.lead__title {
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.14em;
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			text-decoration-line: underline;
			text-decoration-color: var(--accent);
		}
	}

	.lead__link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.lead__summary {
		color: var(--text-secondary);
		text-wrap: pretty;
	}

	.lead__dot {
		margin-inline: 0.4em;
	}

	.filter {
		margin-bottom: var(--s-4);
	}

	.articles {
		display: grid;
		max-width: var(--measure);
		margin-inline: calc(var(--s-3) * 0);
	}

	.empty {
		color: var(--text-muted);
	}

	.about__more {
		margin-top: var(--s-3);
	}

	.about__more a,
	.intro__links a {
		color: var(--accent);
	}
</style>
