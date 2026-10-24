<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Spread from '$lib/components/Spread.svelte';
	import Tile from '$lib/components/Tile.svelte';
	import { site, cvPath } from '$lib/data/site';
	import { about } from '$lib/data/resume';
	import { posts, formatDate } from '$lib/posts';

	/**
	 * The front page as a magazine spread. The cover story is the newest post that opted
	 * into the lead slot (`hero: true`): its cover fills the image panel and its title is the
	 * largest type on the page (DESIGN.md §11 still holds here). The next two posts become
	 * the round tiles; everything else is listed in the reading column.
	 */
	const lead = posts.find((p) => p.hero) ?? posts[0];
	const others = posts.filter((p) => p !== lead);
	const tilePosts = others.slice(0, 2);
</script>

<Seo title={site.name} />

<Spread>
	{#snippet corner()}
		{#if lead}
			<a class="corner-btn" href="/blog/{lead.slug}" aria-label="Read “{lead.title}”">
				<Icon name="arrow-right" size={20} />
			</a>
		{/if}
	{/snippet}

	{#snippet story()}
		<p class="story-kicker">Writing</p>
		<p class="story-sub">and notes</p>
		<p class="story-headline">Concepts behind the software.</p>
		<p class="story-lede">An applied computer science degree, worked through in public.</p>
		<p class="story-text">
			Applied CS at Uni Bamberg, currently at TU Dublin. Software engineer and AI tutor,
			looking for an internship in Dublin.
		</p>
	{/snippet}

	{#snippet image()}
		{#if lead?.cover}
			<a class="image-fill" href="/blog/{lead.slug}" tabindex="-1" aria-hidden="true">
				<img src={lead.cover} alt="" decoding="async" />
			</a>
		{/if}
	{/snippet}

	{#snippet tiles()}
		{#each tilePosts as post (post.slug)}
			<Tile href="/blog/{post.slug}" image={post.cover} label={post.title} />
		{/each}
	{/snippet}

	{#snippet quote()}
		<p class="quote-text">
			Machine learning, statistics and distributed systems, worked through until they make
			sense.
		</p>
	{/snippet}

	<div class="read">
		{#if lead}
			<article class="lead">
				<p class="eyebrow">Worth a read</p>
				<h1 class="hero-title lead__title">
					<a href="/blog/{lead.slug}">{lead.title}</a>
				</h1>
				<h2 class="lead__sub">{lead.tags[0] ?? 'From the notebook'}</h2>
				{#if lead.summary}<p>{lead.summary}</p>{/if}
				<p class="meta">
					<time datetime={lead.date}>{formatDate(lead.date)}</time> · {lead.readingMinutes} min read
				</p>
				<a class="btn btn--primary" href="/blog/{lead.slug}">Read the post</a>
			</article>
		{/if}

		{#if others.length}
			<section class="more" aria-labelledby="more-writing">
				<h2 class="section-title" id="more-writing">More writing</h2>
				<ol class="more__list">
					{#each others as post (post.slug)}
						<li>
							<a class="more__link" href="/blog/{post.slug}">
								<span class="more__title">{post.title}</span>
								{#if post.summary}<span class="more__summary">{post.summary}</span>{/if}
								<span class="meta">{formatDate(post.date)} · {post.readingMinutes} min read</span>
							</a>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		<section class="more" aria-labelledby="about-me">
			<h2 class="section-title" id="about-me">About</h2>
			<p>{about[0]}</p>
			<div class="btn-row about__actions">
				<a class="btn btn--primary" href="/about">Background</a>
				<a class="btn btn--secondary" href={cvPath} target="_blank" rel="noopener">CV (PDF)</a>
			</div>
		</section>
	</div>
</Spread>

<style>
	.read {
		display: grid;
		gap: 3.5rem;
		max-width: 34rem;
		animation: read-in 0.9s 0.35s var(--ease-out) both;
	}

	@keyframes read-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	.lead {
		display: grid;
		gap: 1rem;
		justify-items: start;
	}

	.lead__title {
		margin-top: 1.25rem;
	}

	.lead__title a {
		color: inherit;
		text-decoration: none;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.12em;
	}

	@media (hover: hover) and (pointer: fine) {
		.lead__title a:hover {
			text-decoration-line: underline;
		}
	}

	/* "LAY YOUR HEAD IN ICELAND": a bold serif standfirst in capitals. */
	.lead__sub {
		margin-top: 1.25rem;
		font-size: 1.3rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: 0.01em;
		text-transform: uppercase;
	}

	.lead .btn {
		margin-top: 0.75rem;
	}

	/* "CAMPING", "HOTELS": small bold capitals over each section. */
	.section-title {
		margin: 0 0 1.25rem;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.more__list {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.more__link {
		display: grid;
		gap: 0.35rem;
		padding: 1.1rem 0;
		border-top: 1px solid var(--line);
		color: inherit;
		text-decoration: none;
	}

	.more__list li:last-child .more__link {
		border-bottom: 1px solid var(--line);
	}

	.more__title {
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1.25;
		color: var(--text);
		transition: color 0.2s;
	}

	.more__summary {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		font-size: 0.95rem;
		color: var(--text-secondary);
	}

	@media (hover: hover) and (pointer: fine) {
		.more__link:hover .more__title {
			color: var(--accent);
		}
	}

	.more__link:focus-visible,
	.lead__title a:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.about__actions {
		margin-top: 1.5rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.read {
			animation: none;
		}
	}
</style>
