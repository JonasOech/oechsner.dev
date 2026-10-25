<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post }: { post: Post } = $props();
</script>

<a class="card" class:card--noMedia={!post.cover} href="/blog/{post.slug}">
	<div class="card__text">
		<div class="card__head">
			<h3 class="card__title">{post.title}</h3>
			<time class="card__date" datetime={post.date}>{formatDate(post.date)}</time>
		</div>
		{#if post.summary}
			<p class="card__summary">{post.summary}</p>
		{/if}
		<p class="meta">
			{post.readingMinutes} min read
			<!-- Separator lives inside the guard: a post without a nerdyness rating must not
			     leave a dangling dot at the end of the line. -->
			{#if post.nerdyness}
				<span class="card__dot" aria-hidden="true">·</span>
				<Nerdyness level={post.nerdyness} />
			{/if}
		</p>
	</div>

	{#if post.cover}
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
	/* One row of the list pane: thumbnail, then title / summary / meta, the date set apart
	   in mono at the right edge. Hairline between rows; the hover wash is the selection. */
	.card {
		display: grid;
		grid-template-columns: 112px minmax(0, 1fr);
		grid-template-areas: 'media text';
		gap: var(--s-4);
		align-items: start;
		padding: var(--s-4);
		background: transparent;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
		transition: background-color var(--dur-fast) var(--ease-out);
	}

	.card:last-child {
		border-bottom: 0;
	}

	/* No cover image means no media column — never a solid block standing in for a photo. */
	.card--noMedia {
		grid-template-columns: minmax(0, 1fr);
		grid-template-areas: 'text';
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			background: var(--accent-wash);
		}
		.card:hover .card__title {
			color: var(--accent-dim);
		}
	}

	.card:active {
		background: var(--surface-active);
	}

	.card:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px rgba(var(--accent-rgb), 0.8);
		background: var(--accent-wash);
	}

	.card__text {
		grid-area: text;
		min-width: 0;
		display: grid;
		gap: var(--s-1);
	}

	.card__head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		column-gap: var(--s-4);
		row-gap: 0;
	}

	.card__title {
		flex: 1 1 16rem;
		min-width: 0;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: -0.005em;
		color: var(--text);
		margin: 0;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.card__date {
		flex: none;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.card__summary {
		font-size: 0.875rem;
		line-height: 1.55;
		color: var(--text-secondary);
		margin: 0 0 var(--s-1);
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.card__media {
		grid-area: media;
		overflow: hidden;
		border-radius: 2px;
		border: 1px solid var(--line);
		aspect-ratio: 4 / 3;
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 599px) {
		.card {
			grid-template-columns: 76px minmax(0, 1fr);
			gap: var(--s-3);
			padding: var(--s-3);
		}
		.card--noMedia {
			grid-template-columns: minmax(0, 1fr);
		}
		.card__head {
			flex-direction: column;
		}
		.card__title {
			flex-basis: auto;
		}
	}
</style>
