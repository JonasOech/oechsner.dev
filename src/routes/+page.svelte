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
			Software engineer &amp; AI tutor
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
	/* The breathing room now sits above the pair rather than between them, and a rule
	   closes the block off from the lead post. */
	.intro {
		display: block;
		padding-top: var(--s-8);
		padding-bottom: var(--s-6);
		border-bottom: 1px solid var(--line);
		text-align: center;
	}

	/* Keeps the serif of `.eyebrow`, but at full ink instead of --text-secondary.
	   Contrast, not size, is what lifts it: §11 reserves the largest type on the page
	   for the writing, never a greeting. The old fixed 3rem broke that ordering on
	   desktop and inverted it outright on mobile, where it sat at 47px against a 30px
	   lead title. Fluid now, and capped below `.lead__title`
	   (`clamp(1.875rem, 3.6vw, 3.25rem)`) at every viewport width. */
	.intro__greeting {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 2.6vw, 2.5rem);
		font-weight: 400;
		line-height: 1.4;
		/* No tracking. Letterspaced uppercase is what made this overflow narrow
		   viewports; the base rule had already dropped it, only the mobile override
		   still put it back. */
		text-transform: uppercase;
		text-wrap: balance;
		color: var(--text);
		margin: 0 0 var(--s-3);
		text-align: center;
	}
	/* Short standfirst under the greeting: who I am and what I do, kept to two lines so
	   it stays a caption rather than a wall. Secondary ink so the greeting still leads. */
	.intro__tagline {
		margin: 0 auto;
		max-width: 46ch;
		color: var(--text-secondary);
		line-height: 1.6;
		text-align: center;
		text-wrap: balance;
	}

	/* Centres the inline CV and feed links under the tagline. */
	.intro__actions {
		margin: var(--s-4) 0 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--s-2) var(--s-6);
	}

	/* The feed icon leads its label rather than trailing it, so it should not take the
	   arrow's nudge to the right on hover. */
	.inline-cta--feed :global(svg) {
		color: var(--accent-dim);
	}

	@media (hover: hover) and (pointer: fine) {
		.inline-cta--feed:hover :global(svg) {
			transform: none;
			color: var(--accent);
		}
	}

	.intro__prebyline {
		display: block;
		width: 60%;
		max-width: none;
		margin: 0 auto;
		color: var(--text-secondary);
		text-align: center;
		hyphens: auto;
	}

	/* Still the single line of 15px body copy §11 specifies for the author. Set
	   justified rather than centred — hyphenation is on because a justified column this
	   narrow opens rivers between words without it. */
	.intro__byline {
		display: block;
		width: 60%;
		max-width: none;
		margin: 0 auto;
		color: var(--text-secondary);
		text-align: justify;
		hyphens: auto;
	}

	/* Two columns: the writing on the left, the cover beside it. Explicit areas rather
	   than source order, so the mobile stack can put the image between the meta line
	   and the call to action without reordering the markup. */
	.lead {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 360px;
		grid-template-areas:
			'eyebrow media'
			'title   media'
			'summary media'
			'meta    media'
			'cta     media';
		column-gap: var(--s-7);
		row-gap: var(--s-4);
		align-items: start;
		/* Wider than the intro's own bottom padding, so the rule reads as belonging to
		   the block above it and the post clearly starts a new zone. */
		padding-top: var(--s-7);
	}

	/* The lead title inherits the display face and the one permitted text treatment from
	   .hero-title. Left-aligned, not centred — it is content now, and content on this
	   site aligns to the rail. */
	.lead__title {
		grid-area: title;
		/* Smaller than the old full-bleed hero, but still the largest type on the site —
		   a post-page h1 tops out at 2.75rem. DESIGN.md §11 depends on that ordering. */
		font-size: clamp(1.875rem, 3.6vw, 3.25rem);
		margin: 0;
	}

	.lead__eyebrow {
		grid-area: eyebrow;
		font-family: var(--font-display);
		font-size: 0.8125rem;
		font-weight: 400;
		line-height: 1.4;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 calc(var(--s-1) * -1);
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		/* Underline only on hover — a rule under four lines of 68px Didone is heavy
		   at rest, and the persistent CTA below already carries the affordance. */
		text-decoration-color: var(--accent-dim);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.14em;
		transition: text-decoration-color var(--dur-fast) var(--ease-out);
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
		/* `.lead` is a grid: justify-self shrinks the box to its content, so the
		   bottom rule sits under the words rather than spanning the whole measure. */
		justify-self: start;
		grid-area: cta;
		margin-top: var(--s-2);
		min-height: 44px;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		border-bottom: 1px solid var(--line-strong);
		transition:
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.lead__cta :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__cta:hover {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}
		.lead__cta:hover :global(svg) {
			transform: translateX(3px);
		}
	}

	.lead__cta:active {
		color: var(--accent-dim);
	}

	.lead__link:focus-visible {
		outline: none;
		border-radius: 4px;
		box-shadow: var(--focus-ring);
	}

	.lead__summary {
		grid-area: summary;
		font-size: 1rem;
		line-height: 1.7;
		color: var(--text-secondary);
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
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid var(--line);
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		transition: transform 480ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__media:hover .lead__cover {
			transform: scale(1.02);
		}
	}

	.filter {
		margin-bottom: var(--s-7);
	}

	.articles {
		display: grid;
		gap: var(--s-2);
		max-width: var(--measure);
	}

	.empty {
		color: var(--text-muted);
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
		border-radius: 3px;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.lead {
			grid-template-columns: minmax(0, 1fr) 260px;
			column-gap: var(--s-6);
		}
	}

	@media (max-width: 767px) {
		.intro {
			padding-top: var(--s-6);
			padding-bottom: var(--s-5);
		}
		/* Both lines under the greeting are dropped below 767px: 190 characters of
		   secondary copy is a wall on a phone, and the lead post should be the first
		   thing in view. Both survive on /about. */
		.intro__prebyline,
		.intro__byline {
			display: none;
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
		}
		.lead__cover {
			aspect-ratio: 16 / 9;
		}
	}
</style>
