<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post, featured = false }: { post: Post; featured?: boolean } = $props();
</script>

<!-- One line of the table of correspondence: date | subject and summary | enclosure. -->
<a class="card" class:card--featured={featured} class:card--noMedia={!post.cover} href="/blog/{post.slug}">
	<time class="card__date" datetime={post.date}>{formatDate(post.date)}</time>

	<div class="card__text">
		<h3 class="card__title">{post.title}</h3>
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
	.card {
		display: grid;
		grid-template-columns: 7.5rem minmax(0, 1fr) 132px;
		gap: var(--s-5);
		align-items: start;
		padding: var(--s-5) 0;
		border-top: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
	}

	:global(.articles) > .card:last-child {
		border-bottom: 1px solid var(--line);
	}

	/* No cover image means no media column — never a solid block standing in for a photo. */
	.card--noMedia {
		grid-template-columns: 7.5rem minmax(0, 1fr);
	}

	.card__date {
		font-size: 0.875rem;
		line-height: 1.5;
		padding-top: 0.2rem;
		font-variant-numeric: tabular-nums lining-nums;
		color: var(--text-muted);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__title {
			text-decoration-line: underline;
		}
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-size: 1.3125rem;
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 0 0 var(--s-2);
		text-decoration-line: none;
		text-decoration-color: var(--accent);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.2em;
	}

	.card__summary {
		color: var(--text-secondary);
		font-size: 1rem;
		line-height: 1.6;
		margin: 0 0 var(--s-2);
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.card__media {
		overflow: hidden;
		border: 1px solid var(--line);
		aspect-ratio: 4 / 3;
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 767px) {
		.card {
			grid-template-columns: minmax(0, 1fr) 96px;
			gap: var(--s-1) var(--s-4);
		}
		.card--noMedia {
			grid-template-columns: minmax(0, 1fr);
		}
		/* Date on its own line above the subject; the enclosure shrinks to a stamp at the side. */
		.card__date {
			grid-column: 1 / -1;
			padding-top: 0;
		}
		.card__media {
			grid-column: 2;
			grid-row: 2;
		}
	}
</style>
