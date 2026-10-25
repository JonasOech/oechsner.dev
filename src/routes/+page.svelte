<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ArticleRow from '$lib/components/ArticleRow.svelte';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import { reveal } from '$lib/actions/reveal';
	import Icon from '$lib/components/Icon.svelte';
	import { site, cvPath, feeds, contacts } from '$lib/data/site';
	import { about, skills } from '$lib/data/resume';
	import { posts, allTags, formatDate } from '$lib/posts';
	import { trackFeed } from '$lib/track';

	let activeTag = $state<string | null>(null);

	/**
	 * The home page *is* the writing index, and the lead post takes the largest type on
	 * the site (DESIGN.md §11), so the content occupies the loudest slot. `hero` in the
	 * front-matter is what grants a post that slot: `posts` is sorted newest-first, so the
	 * newest one that opted in wins it and everything else stays a row. Filtering by tag
	 * drops the lead card — a filtered view is a list, not a front page.
	 */
	const lead = $derived(activeTag ? undefined : posts.find((p) => p.hero));
	// Removed by identity, not `slice(1)`: the lead is not necessarily the first post.
	const listed = $derived(
		activeTag ? posts.filter((p) => p.tags.includes(activeTag!)) : posts.filter((p) => p !== lead)
	);

	const mail = contacts.find((c) => c.primary);
	// A short cut of the skills list for the bento tile; the full list lives on /skills.
	const skillChips = [
		...(skills.find((g) => g.label === 'Languages')?.items.slice(0, 3) ?? []),
		...(skills.find((g) => g.label === 'Libraries & Tools')?.items.slice(0, 3) ?? []),
		...(skills.find((g) => g.label === 'Concepts')?.items.slice(0, 2) ?? [])
	];

	function toggleTag(tag: string) {
		activeTag = activeTag === tag ? null : tag;
	}
</script>

<Seo title={site.name} />

<div class="container home">
	<div class="bento" class:bento--nolead={!lead}>
		{#if lead}
			<!-- The lead: the newest `hero` post. Not "Latest" — it is not always the newest. -->
			<article class="tile lead enter" style="--i: 0">
				{#if lead.cover}
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

				<div class="lead__body">
					<p class="lead__chips">
						<span class="chip chip--accent">Featured post</span>
						{#each lead.tags.slice(0, 2) as tag (tag)}
							<span class="chip">{tag}</span>
						{/each}
					</p>

					<h2 class="lead__title">
						<a class="lead__link" href="/blog/{lead.slug}">{lead.title}</a>
					</h2>

					{#if lead.summary}
						<p class="lead__summary">{lead.summary}</p>
					{/if}

					<p class="meta lead__meta">
						<time datetime={lead.date}>{formatDate(lead.date)}</time>
						<span class="dot" aria-hidden="true">·</span>
						{lead.readingMinutes} min read
						{#if lead.nerdyness}
							<span class="dot" aria-hidden="true">·</span>
							<Nerdyness level={lead.nerdyness} />
						{/if}
					</p>

					<a class="lead__cta" href="/blog/{lead.slug}" tabindex="-1" aria-hidden="true">
						Read the post
						<Icon name="arrow-right" size={15} />
					</a>
				</div>
			</article>
		{/if}

		<section class="tile intro enter" style="--i: 1" aria-labelledby="intro-h">
			<span class="mark" aria-hidden="true">JÖ</span>
			<h1 class="intro__greeting" id="intro-h">{site.intro}</h1>
			<p class="intro__tagline">
				Software engineer &amp; AI tutor. Applied CS at Uni Bamberg, currently at TU Dublin.
			</p>
		</section>

		<section class="tile now enter" style="--i: 2" aria-labelledby="now-h">
			<h2 class="tile__label" id="now-h">Now</h2>
			<ul class="now__list">
				<li>
					<span class="now__icon"><Icon name="pin" size={15} /></span>
					<span>Dublin, Ireland <span class="now__sub">Bavaria, Germany at home</span></span>
				</li>
				<li>
					<span class="now__icon"><Icon name="layers" size={15} /></span>
					<span>Applied CS, B.Sc. <span class="now__sub">Universität Bamberg</span></span>
				</li>
				<li>
					<span class="now__icon"><Icon name="search" size={15} /></span>
					<span>
						Internship in Dublin
						<span class="chip chip--live now__chip">Looking</span>
					</span>
				</li>
			</ul>
		</section>

		<section class="tile writing" aria-labelledby="writing-h" use:reveal>
			<div class="tile__head">
				<h2 class="tile__label" id="writing-h">Writing</h2>
				<span class="chip">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
			</div>

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
		</section>

		<div class="side">
			<section class="tile" aria-labelledby="skills-h" use:reveal>
				<div class="tile__head">
					<h2 class="tile__label" id="skills-h">Stack</h2>
					<a class="tile__more" href="/skills">
						All
						<Icon name="arrow-right" size={13} />
					</a>
				</div>
				<div class="tag-row">
					{#each skillChips as chip (chip)}
						<span class="tag">{chip}</span>
					{/each}
				</div>
			</section>

			<section class="tile" aria-labelledby="about-h" use:reveal>
				<div class="tile__head">
					<h2 class="tile__label" id="about-h">About</h2>
				</div>
				<p class="about__text">{about[0]}</p>
				<a class="tile__more tile__more--block" href="/about">
					Background, projects and CV
					<Icon name="arrow-right" size={13} />
				</a>
			</section>
		</div>

		<a class="tile tile--link tile--cv" href={cvPath} target="_blank" rel="noopener" use:reveal>
			<span class="tile__icon"><Icon name="file" size={18} /></span>
			<span class="tile__title">Download CV</span>
			<span class="tile__sub">One-page résumé, PDF</span>
			<span class="tile__go"><Icon name="download" size={16} /></span>
		</a>

		<a class="tile tile--link" href={mail ? mail.href : '/contact'} use:reveal>
			<span class="tile__icon"><Icon name="mail" size={18} /></span>
			<span class="tile__title">Say hello</span>
			<span class="tile__sub">{mail ? mail.value : 'Contact'}</span>
			<span class="tile__go"><Icon name="arrow-right" size={16} /></span>
		</a>

		<a
			class="tile tile--link"
			href={feeds.rss}
			type="application/rss+xml"
			data-sveltekit-reload
			onclick={() => trackFeed('open-rss', 'home-intro')}
			use:reveal
		>
			<span class="tile__icon"><Icon name="rss" size={18} /></span>
			<span class="tile__title">Subscribe</span>
			<span class="tile__sub">New posts via RSS</span>
			<span class="tile__go"><Icon name="arrow-right" size={16} /></span>
		</a>
	</div>
</div>

<style>
	.home {
		padding-top: var(--s-4);
	}

	.bento {
		align-items: stretch;
	}

	/* — The tile: every card on this page — */
	.tile {
		position: relative;
		grid-column: span 12;
		min-width: 0;
		padding: var(--s-5);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-1);
		transition:
			transform var(--dur-base) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out);
	}

	.tile__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		margin-bottom: var(--s-4);
	}

	.tile__label {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0;
		color: var(--text);
	}

	.tile__label::before {
		content: '';
		width: 8px;
		height: 8px;
		border-radius: 3px;
		background: var(--grad);
	}

	.tile__more {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--accent);
		text-decoration: none;
		border-radius: var(--r-xs);
	}

	.tile__more--block {
		margin-top: var(--s-4);
	}

	.tile__more :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.tile__more:hover {
			color: var(--accent-dim);
		}
		.tile__more:hover :global(svg) {
			transform: translateX(3px);
		}
	}

	.tile__more:focus-visible,
	.lead__link:focus-visible,
	.tile--link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	/* — Lead: the featured post, widest tile and the largest type on the site — */
	.lead {
		padding: 0;
		overflow: hidden;
		display: grid;
		grid-template-rows: auto 1fr;
		background: var(--surface);
	}

	.lead::before {
		content: '';
		position: absolute;
		inset: 0 0 auto 0;
		height: 3px;
		z-index: 2;
		background: var(--grad);
	}

	.lead__media {
		display: block;
		background: var(--grad-soft);
		border-bottom: 1px solid var(--line);
		overflow: hidden;
	}

	.lead__cover {
		width: 100%;
		aspect-ratio: 16 / 7;
		object-fit: cover;
		transition: transform 600ms var(--ease-out);
	}

	.lead__body {
		display: grid;
		align-content: start;
		gap: var(--s-3);
		padding: var(--s-5) var(--s-6) var(--s-6);
	}

	.lead__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.lead__title {
		/* The largest type on the site. A post-page h1 tops out at 2.5rem and the
		   intro greeting sits at 1.25rem; DESIGN.md §11 depends on that ordering. */
		font-size: clamp(1.875rem, 3.6vw, 3rem);
		font-weight: 700;
		line-height: 1.08;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}

	.lead__link {
		color: inherit;
		text-decoration: none;
		border-radius: var(--r-xs);
	}

	/* The whole tile is the target: the title link stretches over it. */
	.lead__link::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.lead__summary {
		max-width: 58ch;
		font-size: 1.0625rem;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	.lead__cta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		justify-self: start;
		margin-top: var(--s-2);
		padding: 0.625rem 0.9rem;
		border-radius: var(--r-sm);
		background: var(--text);
		color: var(--text-inverse);
		font-size: 0.8125rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);
	}

	.lead__cta :global(svg) {
		transition: transform 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.lead:hover {
			transform: translateY(-3px);
			box-shadow: var(--shadow-3);
			border-color: var(--line-strong);
		}
		.lead:hover .lead__cover {
			transform: scale(1.025);
		}
		.lead:hover .lead__cta {
			background: var(--accent-dim);
		}
		.lead:hover .lead__cta :global(svg) {
			transform: translateX(3px);
		}
	}

	/* — Intro — */
	.intro {
		display: grid;
		align-content: start;
		gap: var(--s-3);
		background: var(--grad-soft), var(--surface);
		background-blend-mode: normal;
	}

	.mark {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 13px;
		background: var(--grad);
		color: var(--text-inverse);
		font-size: 0.8125rem;
		font-weight: 700;
		box-shadow: var(--shadow-2);
	}

	.intro__greeting {
		font-size: 1.25rem;
		font-weight: 650;
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.intro__tagline {
		color: var(--text-secondary);
		line-height: 1.55;
	}

	/* — Now — */
	.now__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--s-3);
	}

	.now__list li {
		display: flex;
		gap: var(--s-3);
		align-items: flex-start;
		color: var(--text);
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.4;
	}

	.now__icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 28px;
		height: 28px;
		border-radius: var(--r-xs);
		background: var(--accent-wash);
		color: var(--accent-dim);
	}

	.now__sub {
		display: block;
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--text-muted);
	}

	.now__chip {
		margin-left: var(--s-1);
		vertical-align: 1px;
	}

	/* — Writing — */
	.filter {
		margin-bottom: var(--s-3);
	}

	.articles {
		display: grid;
		gap: 2px;
	}

	.empty {
		color: var(--text-muted);
	}

	.side {
		grid-column: span 12;
		display: grid;
		gap: var(--bento-gap);
		align-content: start;
	}

	.about__text {
		display: -webkit-box;
		-webkit-line-clamp: 6;
		line-clamp: 6;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	/* — Link tiles (CV, contact, feed) — */
	.tile--link {
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-areas:
			'icon title go'
			'icon sub   go';
		column-gap: var(--s-4);
		align-items: center;
		text-decoration: none;
		color: inherit;
	}

	.tile__icon {
		grid-area: icon;
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: var(--r-sm);
		background: var(--accent-wash);
		color: var(--accent-dim);
	}

	.tile__title {
		grid-area: title;
		font-weight: 650;
		color: var(--text);
		letter-spacing: -0.01em;
	}

	.tile__sub {
		grid-area: sub;
		font-size: 0.8125rem;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tile__go {
		grid-area: go;
		color: var(--text-muted);
		transition:
			transform 220ms var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.tile--cv {
		background: var(--text);
		border-color: var(--text);
	}

	.tile--cv .tile__title {
		color: var(--text-inverse);
	}

	.tile--cv .tile__sub,
	.tile--cv .tile__go {
		color: rgba(var(--text-inverse-rgb), 0.78);
	}

	.tile--cv .tile__icon {
		background: var(--grad);
		color: var(--text-inverse);
	}

	@media (hover: hover) and (pointer: fine) {
		.tile--link:hover {
			transform: translateY(-3px);
			box-shadow: var(--shadow-3);
			border-color: rgba(var(--accent-rgb), 0.4);
		}
		.tile--link:hover .tile__go {
			color: var(--accent);
			transform: translateX(3px);
		}
		.tile--cv:hover .tile__go {
			color: var(--text-inverse);
			transform: translateY(2px);
		}
	}

	/* — Placement — */
	@media (min-width: 900px) {
		.lead {
			grid-column: 1 / 9;
			grid-row: 1 / 3;
		}
		.intro,
		.now {
			grid-column: 9 / 13;
		}
		.intro {
			grid-row: 1;
		}
		.now {
			grid-row: 2;
		}
		.writing {
			grid-column: 1 / 9;
		}
		.side {
			grid-column: 9 / 13;
		}
		.tile--link {
			grid-column: span 4;
		}

		/* A tag filter removes the lead; the two small tiles share the first row. */
		.bento--nolead .intro,
		.bento--nolead .now {
			grid-column: span 6;
			grid-row: auto;
		}
	}

	@media (min-width: 600px) and (max-width: 899px) {
		.intro,
		.now {
			grid-column: span 6;
		}
		.tile--link {
			grid-column: span 4;
		}
		.tile--link {
			grid-template-columns: 1fr auto;
			grid-template-areas:
				'icon go'
				'title title'
				'sub sub';
			row-gap: var(--s-1);
		}
		.tile__icon {
			margin-bottom: var(--s-2);
		}
	}

	@media (max-width: 599px) {
		.tile {
			padding: var(--s-4);
			border-radius: var(--r-md);
		}
		.lead__body {
			padding: var(--s-4) var(--s-4) var(--s-5);
		}
		.lead__cover {
			aspect-ratio: 16 / 9;
		}
	}
</style>
