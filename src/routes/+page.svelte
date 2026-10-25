<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import ArticleRow from '$lib/components/ArticleRow.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import { reveal } from '$lib/actions/reveal';
	import Icon from '$lib/components/Icon.svelte';
	import Geometry from '$lib/components/Geometry.svelte';
	import { site, cvPath, feeds } from '$lib/data/site';
	import { about } from '$lib/data/resume';
	import { posts, allTags, formatDate } from '$lib/posts';
	import { trackFeed } from '$lib/track';

	let activeTag = $state<string | null>(null);

	/**
	 * The home page *is* the writing index, and the lead post takes the loudest type on the
	 * site, so the content outranks the author's name. `hero` in the front-matter is what
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

	function toggleTag(tag: string) {
		activeTag = activeTag === tag ? null : tag;
	}
</script>

<Seo title={site.name} />

<header class="container intro">
	<div class="intro__text">
		<p class="intro__greeting enter" style="--i: 0">{site.intro}</p>
		<p class="intro__tagline enter" style="--i: 1">
			Applied CS at Uni Bamberg, currently TU Dublin<br />
			Software engineer &amp; AI tutor <br />
			Currently looking for an Internship in Dublin
		</p>
		<p class="intro__actions enter" style="--i: 2">
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
	<Geometry variant="hero" class="intro__art" />
</header>

{#if lead}
	<article class="lead block block--blue" class:lead--bare={!lead.cover}>
		<div class="container lead__inner">
			<div class="lead__text">
				<!-- Not "Latest": the lead is the newest *hero* post, which is not always the
				     newest post on the site. -->
				<p class="lead__eyebrow enter" style="--i: 1">Featured Blog Post</p>

				<h1 class="hero-title lead__title enter" style="--i: 2">
					<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
				</h1>

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
					<Icon name="arrow-right" size={16} />
				</a>
			</div>

			{#if lead.cover}
				<!-- Decorative: the title is the accessible link to the same post. -->
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
		</div>
	</article>
{/if}

<div class="container">
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
</div>

<section class="aboutband block block--yellow" id="about" aria-labelledby="about-label">
	<div class="container aboutband__inner">
		<h2 class="aboutband__label" id="about-label">About</h2>
		<div class="aboutband__body">
			<p class="aboutband__text">{about[0]}</p>
			<a class="btn btn--primary" href="/about">
				Background, projects and CV
				<Icon name="arrow-right" size={14} />
			</a>
		</div>
	</div>
</section>

<style>
	/* Greeting and tagline sit beside the composition. The greeting is deliberately modest:
	   the largest type on the page is the lead post's title (DESIGN.md §6). */
	.intro {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 300px);
		gap: var(--s-7);
		align-items: center;
		padding-top: var(--s-7);
		padding-bottom: calc(var(--s-7) + 2rem);
	}

	.intro__greeting {
		font-size: clamp(1.375rem, 2.6vw, 2.125rem);
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text);
		margin: 0 0 var(--s-4);
		max-width: 20ch;
		text-wrap: balance;
	}

	.intro__tagline {
		max-width: 44ch;
		color: var(--text-secondary);
		font-size: 1.1875rem;
		line-height: 1.6;
		font-weight: 500;
	}

	.intro__actions {
		margin: var(--s-4) 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2) var(--s-6);
	}

	.intro :global(.intro__art) {
		justify-self: end;
		width: 100%;
	}

	.inline-cta--feed :global(svg) {
		color: var(--accent);
	}

	/* The lead: a full-bleed blue slab cut on the diagonal at both edges. */
	.lead {
		--cut: 3.5rem;
		clip-path: polygon(0 var(--cut), 100% 0, 100% calc(100% - var(--cut)), 0 100%);
		padding-block: calc(var(--cut) + var(--s-8));
		margin-top: calc(var(--cut) * -1);
	}

	.lead__inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 400px);
		gap: var(--s-8);
		align-items: center;
	}

	.lead--bare .lead__inner {
		grid-template-columns: minmax(0, 1fr);
	}

	.lead__text {
		display: grid;
		gap: var(--s-4);
		justify-items: start;
	}

	.lead__title {
		color: var(--text-inverse);
		font-size: clamp(2.25rem, 6.4vw, 5rem);
		margin: 0;
		overflow-wrap: anywhere;
	}

	.lead__eyebrow {
		font-size: 0.8125rem;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		background: var(--yellow);
		color: var(--ink);
		border: 3px solid var(--ink);
		padding: 0.4rem 0.75rem;
		margin: 0;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		background-image: linear-gradient(var(--yellow), var(--yellow));
		background-size: 0% 0.12em;
		background-repeat: no-repeat;
		background-position: 0 100%;
		transition: background-size var(--dur-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__link:hover {
			background-size: 100% 0.12em;
		}
	}

	.lead__link:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 3px var(--blue),
			0 0 0 6px var(--yellow);
	}

	.lead__summary {
		font-size: 1.1875rem;
		line-height: 1.6;
		font-weight: 500;
		color: var(--text-inverse);
		max-width: 52ch;
	}

	.lead .meta {
		color: var(--text-inverse);
	}

	.lead__dot {
		margin-inline: 0.4em;
	}

	.lead__cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		margin-top: var(--s-2);
		min-height: 48px;
		padding: 0.75rem 1.25rem;
		font-size: 0.875rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background: var(--yellow);
		color: var(--ink);
		border: 3px solid var(--ink);
		box-shadow: 5px 5px 0 var(--ink);
		text-decoration: none;
		transition:
			transform var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
	}

	.lead__cta :global(svg) {
		stroke-width: 2.5;
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover {
			transform: translate(-2px, -2px);
			box-shadow: 8px 8px 0 var(--ink);
		}
		.lead__cta:hover :global(svg) {
			transform: translateX(3px);
		}
	}

	/* The cover sits on a yellow offset plate with a red circle peeking from behind. */
	.lead__media {
		position: relative;
		display: block;
		border: 4px solid var(--paper);
		box-shadow: 12px 12px 0 var(--yellow);
		background: var(--paper);
	}

	.lead__media::before {
		content: '';
		position: absolute;
		z-index: -1;
		top: -2.5rem;
		left: -2.5rem;
		width: 6.5rem;
		height: 6.5rem;
		border-radius: 50%;
		background: var(--red);
		border: 4px solid var(--ink);
	}

	.lead__media::after {
		content: '';
		position: absolute;
		z-index: 1;
		right: -1.75rem;
		bottom: -2.5rem;
		width: 4rem;
		height: 4rem;
		background: var(--ink);
		clip-path: polygon(50% 0, 100% 100%, 0 100%);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	.filter {
		margin-bottom: var(--s-6);
	}

	.articles {
		display: grid;
		gap: 0;
	}

	.empty {
		color: var(--text-muted);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 44px;
		color: var(--text);
		font-weight: 800;
		font-size: 0.875rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		text-decoration: none;
		border-bottom: 3px solid var(--ink);
		transition: background-color var(--dur-fast) var(--ease-out);
	}

	.inline-cta :global(svg) {
		stroke-width: 2.5;
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta:hover {
			background: var(--yellow);
		}
		.inline-cta:hover :global(svg) {
			transform: translateX(3px);
		}
	}

	.inline-cta:active {
		background: var(--red);
		color: var(--text-inverse);
	}

	.inline-cta:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* The About teaser: a yellow slab with a diagonal top and a big red disc behind the copy. */
	.aboutband {
		--cut: 3rem;
		margin-top: var(--gap-section);
		padding-block: calc(var(--cut) + var(--s-7)) var(--s-8);
		clip-path: polygon(0 var(--cut), 100% 0, 100% 100%, 0 100%);
		overflow: hidden;
	}

	.aboutband::after {
		content: '';
		position: absolute;
		z-index: -1;
		right: -4rem;
		bottom: -5rem;
		width: 18rem;
		height: 18rem;
		border-radius: 50%;
		background: var(--red);
		border: 6px solid var(--ink);
	}

	.aboutband__inner {
		display: grid;
		grid-template-columns: var(--rail-width) minmax(0, 1fr);
		gap: 0 var(--s-5);
	}

	.aboutband__label {
		font-size: 1rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink);
		display: flex;
		align-items: center;
		gap: var(--s-3);
		align-self: start;
		min-height: 2rem;
	}

	.aboutband__label::before {
		content: '';
		width: 1.5rem;
		height: 1.5rem;
		background: var(--ink);
		clip-path: polygon(50% 0, 100% 100%, 0 100%);
	}

	.aboutband__body {
		display: grid;
		gap: var(--s-5);
		justify-items: start;
		max-width: 46rem;
	}

	.aboutband__text {
		font-size: clamp(1.25rem, 2.2vw, 1.625rem);
		line-height: 1.45;
		font-weight: 600;
		color: var(--ink);
	}

	@media (max-width: 1023px) {
		.lead__inner {
			grid-template-columns: minmax(0, 1fr) minmax(0, 300px);
			gap: var(--s-7);
		}
		.aboutband__inner {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-5);
		}
	}

	@media (max-width: 767px) {
		.intro {
			grid-template-columns: minmax(0, 1fr) 96px;
			gap: var(--s-4);
			align-items: start;
			padding-top: var(--s-5);
			padding-bottom: calc(var(--s-6) + 1.5rem);
		}
		.lead {
			--cut: 2rem;
			padding-block: calc(var(--cut) + var(--s-6));
		}
		.lead__inner {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-7);
		}
		.lead__media {
			order: 2;
			margin: var(--s-3) var(--s-4) var(--s-4) var(--s-4);
			box-shadow: 8px 8px 0 var(--yellow);
		}
		.lead__media::before {
			top: -1.75rem;
			left: -1.75rem;
			width: 4.5rem;
			height: 4.5rem;
		}
		.lead__cover {
			aspect-ratio: 16 / 10;
		}
		.aboutband {
			--cut: 1.75rem;
			padding-bottom: calc(var(--s-8) + 3rem);
		}
		.aboutband::after {
			width: 9rem;
			height: 9rem;
			right: -2.5rem;
			bottom: -3.5rem;
		}
	}
</style>
