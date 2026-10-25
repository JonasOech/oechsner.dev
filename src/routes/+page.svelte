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

	// The three newest remaining pieces run down the right-hand column of the front page;
	// the archive below carries the rest. A filtered view is just the archive.
	// Up to three, but always leaving at least two for the archive's two columns.
	const latestCount = $derived(activeTag ? 0 : Math.min(3, Math.max(0, listed.length - 2)));
	const latest = $derived(listed.slice(0, latestCount));
	const archive = $derived(listed.slice(latestCount));

	function toggleTag(tag: string) {
		activeTag = activeTag === tag ? null : tag;
	}
</script>

<Seo title={site.name} />

<div class="container front">
	<div class="front__grid" class:front__grid--solo={!lead}>
		{#if lead}
			<article class="lead">
				<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
				     newest post on the site. -->
				<p class="eyebrow lead__eyebrow enter" style="--i: 0">Featured</p>

				<h1 class="hero-title lead__title enter" style="--i: 1">
					<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
				</h1>

				{#if lead.summary}
					<p class="lead__summary enter" style="--i: 2">{lead.summary}</p>
				{/if}

				<p class="meta lead__meta enter" style="--i: 3">
					<time datetime={lead.date}>{formatDate(lead.date)}</time>
					<span class="lead__dot" aria-hidden="true">·</span>
					{lead.readingMinutes} min read
					{#if lead.nerdyness}
						<span class="lead__dot" aria-hidden="true">·</span>
						<Nerdyness level={lead.nerdyness} />
					{/if}
				</p>

				{#if lead.cover}
					<!-- Decorative: the title above is the accessible link to the same post. -->
					<a
						class="lead__media enter"
						style="--i: 4"
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

				<!-- The visible affordance. Not a tab stop: the title above is the accessible
				     link to the same post, and three tab stops to one destination is noise. -->
				<a
					class="inline-cta lead__cta enter"
					style="--i: 5"
					href="/blog/{lead.slug}"
					tabindex="-1"
					aria-hidden="true"
				>
					Read the post
					<Icon name="arrow-right" size={14} />
				</a>
			</article>
		{/if}

		<aside class="side" aria-label="About the author">
			<section class="side__block enter" style="--i: 2">
				<p class="eyebrow">From the author</p>
				<p class="side__greeting">{site.intro}</p>
				<p class="side__tagline">
					Applied CS at Uni Bamberg, currently TU Dublin. Software engineer &amp; AI tutor.
					Currently looking for an internship in Dublin.
				</p>
				<p class="side__actions">
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
						<Icon name="rss" size={14} />
						Subscribe
					</a>
				</p>
			</section>

			{#if latest.length}
				<section class="side__block enter" style="--i: 3" aria-labelledby="latest-label">
					<h2 class="eyebrow" id="latest-label">Also recent</h2>
					<ol class="latest">
						{#each latest as post (post.slug)}
							<li class="latest__item">
								<a class="latest__link" href="/blog/{post.slug}">
									<span class="latest__title">{post.title}</span>
									<time class="meta" datetime={post.date}>{formatDate(post.date)}</time>
								</a>
							</li>
						{/each}
					</ol>
				</section>
			{/if}
		</aside>
	</div>

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
			{#if archive.length === 0}
				<p class="empty">
					{#if activeTag}
						Nothing tagged “{activeTag}” yet.
					{:else}
						That's the whole archive so far.
					{/if}
				</p>
			{:else}
				{#key activeTag}
					{#each archive as post (post.slug)}
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
	.front {
		padding-top: var(--s-6);
	}

	/* The front page: the lead story in the wide column, a ruled column of the author's
	   note and the latest pieces beside it. */
	.front__grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 17.5rem;
		column-gap: var(--s-6);
		align-items: start;
	}

	.front__grid--solo {
		grid-template-columns: minmax(0, 1fr);
	}

	.lead {
		display: grid;
		gap: var(--s-3);
		padding-right: var(--s-6);
		padding-bottom: var(--s-6);
		border-right: 1px solid var(--line);
		min-width: 0;
	}

	.lead__title {
		font-size: clamp(2.375rem, 4.6vw, 3.625rem);
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		border-radius: 2px;
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

	/* The standfirst: italic, a step above body, in secondary ink. */
	.lead__summary {
		font-size: 1.3125rem;
		font-style: italic;
		line-height: 1.45;
		color: var(--text-secondary);
		max-width: 38em;
	}

	.lead__dot {
		margin-inline: 0.35em;
		color: var(--text-muted);
	}

	.lead__media {
		display: block;
		margin-top: var(--s-3);
		border: 1px solid var(--line);
		overflow: hidden;
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 3 / 2;
		object-fit: cover;
	}

	.lead__cta {
		justify-self: start;
		margin-top: var(--s-2);
	}

	.side {
		display: grid;
		gap: var(--s-6);
		align-content: start;
	}

	.side__block {
		display: grid;
		gap: var(--s-3);
		align-content: start;
	}

	.side__block + .side__block {
		padding-top: var(--s-5);
		border-top: 1px solid var(--line);
	}

	.side__greeting {
		font-size: 1.5rem;
		font-style: italic;
		font-weight: 450;
		line-height: 1.25;
		color: var(--text);
		text-wrap: balance;
	}

	.side__tagline {
		font-size: 1rem;
		line-height: 1.55;
		color: var(--text-secondary);
	}

	.side__actions {
		display: grid;
		justify-items: start;
		gap: 0;
	}

	.latest {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}

	.latest__item + .latest__item {
		border-top: 1px solid var(--line);
	}

	.latest__link {
		display: grid;
		gap: var(--s-1);
		padding-block: var(--s-3);
		text-decoration: none;
	}

	.latest__title {
		font-size: 1.1875rem;
		font-weight: 500;
		line-height: 1.25;
		color: var(--text);
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.latest__link:hover .latest__title {
			color: var(--accent);
		}
	}

	.latest__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.filter {
		margin-bottom: var(--s-5);
	}

	/* Two newspaper columns; each item carries its own hairline. */
	.articles {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: var(--s-7);
	}

	.empty {
		grid-column: 1 / -1;
		color: var(--text-muted);
		font-style: italic;
	}

	.about__more {
		margin-top: var(--s-3);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--text);
		font-family: var(--font-serif);
		font-size: 1.0625rem;
		font-weight: 500;
		font-variant-caps: all-small-caps;
		letter-spacing: 0.09em;
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.inline-cta :global(svg) {
		color: var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			color: var(--accent);
		}
	}

	.inline-cta:active {
		color: var(--accent-dim);
	}

	.inline-cta:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.front__grid {
			grid-template-columns: minmax(0, 1fr) 15rem;
		}
	}

	@media (max-width: 799px) {
		.front__grid {
			grid-template-columns: minmax(0, 1fr);
		}

		.lead {
			padding-right: 0;
			border-right: 0;
			border-bottom: 1px solid var(--line);
			margin-bottom: var(--s-5);
		}

		.articles {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 767px) {
		.front {
			padding-top: var(--s-4);
		}

		.lead__summary {
			font-size: 1.1875rem;
		}
	}
</style>
