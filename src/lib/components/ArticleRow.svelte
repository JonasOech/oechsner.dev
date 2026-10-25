<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post, featured = false }: { post: Post; featured?: boolean } = $props();
</script>

<a class="card" class:card--featured={featured} class:card--noMedia={!post.cover} href="/blog/{post.slug}">
	{#if featured && post.cover}
		<div class="card__media card__media--wide">
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
		<h3 class="card__title">{post.title}</h3>
		{#if post.summary}
			<p class="card__summary">{post.summary}</p>
		{/if}
		<p class="meta">
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

	{#if !featured && post.cover}
		<div class="card__media">
			<img
				class="card__img"
				src={post.cover}
				alt={post.coverAlt ?? ''}
				width="380"
				height="285"
				loading="lazy"
				decoding="async"
			/>
		</div>
	{/if}
</a>

<style>
	/* A column item in the archive: hairline above, headline, summary, byline, and a small
	   cover to the side. No card, no fill — hover shifts the headline to oxblood. */
	.card {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 128px;
		gap: var(--s-5);
		align-items: start;
		padding-block: var(--s-4) var(--s-5);
		border-top: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
	}

	.card--noMedia,
	.card--featured {
		grid-template-columns: minmax(0, 1fr);
	}

	.card--featured {
		gap: var(--s-4);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__title {
			color: var(--accent);
		}
	}

	.card:active .card__title {
		color: var(--accent-dim);
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-size: 1.4375rem;
		font-weight: 500;
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 0 0 var(--s-2);
		transition: color var(--dur-fast) var(--ease-out);
	}

	.card--featured .card__title {
		font-size: 1.75rem;
	}

	.card__summary {
		font-size: 1rem;
		line-height: 1.5;
		color: var(--text-secondary);
		margin: 0 0 var(--s-3);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card__dot {
		margin-inline: 0.35em;
		color: var(--text-muted);
	}

	.card__media {
		overflow: hidden;
		border: 1px solid var(--line);
		aspect-ratio: 4 / 3;
	}

	.card__media--wide {
		aspect-ratio: 16 / 9;
		order: -1;
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 479px) {
		.card {
			grid-template-columns: minmax(0, 1fr) 96px;
			gap: var(--s-4);
		}
	}
</style>
