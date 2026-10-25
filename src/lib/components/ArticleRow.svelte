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
	/* A row in a ruled list: hairline above, title in the serif, thumbnail at the far edge.
	   Hover and focus only turn the title green. */
	.card {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 8.5rem;
		gap: var(--s-5);
		align-items: start;
		padding: var(--s-5) 0;
		border-top: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
	}

	.card:last-child {
		border-bottom: 1px solid var(--line);
	}

	/* No cover image means no media column. */
	.card--noMedia,
	.card--featured {
		grid-template-columns: minmax(0, 1fr);
	}

	.card--featured {
		gap: var(--s-4);
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-family: var(--font-display);
		font-variation-settings: var(--display-settings);
		font-size: 1.375rem;
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 0 0 var(--s-2);
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.18em;
		transition:
			color var(--dur-fast) var(--ease-out),
			text-decoration-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__title {
			color: var(--accent);
			text-decoration-color: var(--accent);
		}
	}

	.card:focus-visible .card__title {
		color: var(--accent);
	}

	.card--featured .card__title {
		font-size: 1.625rem;
	}

	.card__summary {
		color: var(--text-secondary);
		margin: 0 0 var(--s-3);
		max-width: 56ch;
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.card__media {
		overflow: hidden;
		border: 1px solid var(--line);
		aspect-ratio: 4 / 3;
		background: var(--plate);
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

	@media (max-width: 47.99em) {
		.card {
			grid-template-columns: minmax(0, 1fr) 6rem;
			gap: var(--s-4);
		}
	}

	@media (max-width: 29.99em) {
		/* Thumbnail drops below the text at full width. */
		.card {
			grid-template-columns: minmax(0, 1fr);
		}
		.card__media {
			aspect-ratio: 16 / 9;
		}
	}
</style>
