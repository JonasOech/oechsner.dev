<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post, featured = false }: { post: Post; featured?: boolean } = $props();
</script>

<!-- A column of the archive: cover plate, kicker, headline, standfirst, byline. The whole
     card is the link, so there is exactly one tab stop per post. -->
<a class="card" class:card--featured={featured} href="/blog/{post.slug}">
	{#if post.cover}
		<div class="card__media">
			<img
				class="card__img"
				src={post.cover}
				alt={post.coverAlt ?? ''}
				width="720"
				height="405"
				loading="lazy"
				decoding="async"
			/>
		</div>
	{/if}

	<div class="card__text">
		{#if post.tags.length}
			<p class="kicker card__kicker">{post.tags.slice(0, 2).join(' · ')}</p>
		{/if}
		<h3 class="card__title">{post.title}</h3>
		{#if post.summary}
			<p class="card__summary">{post.summary}</p>
		{/if}
		<p class="meta card__meta">
			<time datetime={post.date}>{formatDate(post.date)}</time>
			<span class="card__dot" aria-hidden="true">·</span>
			{post.readingMinutes} min read
			<!-- Separator lives inside the guard: a post without a nerdyness rating must not
			     leave a dangling dot at the end of the line. -->
			{#if post.nerdyness}
				<span class="card__dot" aria-hidden="true">·</span>
				<Nerdyness level={post.nerdyness} />
			{/if}
		</p>
	</div>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		height: 100%;
		padding-top: var(--s-4);
		border-top: 1px solid var(--rule);
		text-decoration: none;
		color: inherit;
	}

	.card__text {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		min-width: 0;
		flex: 1 1 auto;
	}

	.card__kicker {
		font-size: 0.6875rem;
	}

	.card__title {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.015em;
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.16em;
		transition: text-decoration-color var(--dur-fast) var(--ease-out);
	}

	.card__summary {
		font-size: 1rem;
		line-height: 1.5;
		color: var(--text-secondary);
	}

	.card__meta {
		margin-top: auto;
		padding-top: var(--s-2);
	}

	.card__dot {
		margin-inline: 0.4em;
	}

	.card__media {
		overflow: hidden;
		aspect-ratio: 3 / 2;
		border: 1px solid var(--line-strong);
		background: var(--plate);
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 480ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__title {
			text-decoration-color: var(--accent);
		}
		.card:hover .card__img {
			transform: scale(1.03);
		}
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.card:focus-visible .card__title {
		text-decoration-color: var(--accent);
	}

	.card--featured .card__title {
		font-size: 1.875rem;
	}
</style>
