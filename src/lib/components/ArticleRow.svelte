<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let { post, featured = false }: { post: Post; featured?: boolean } = $props();
</script>

<a class="card" class:card--featured={featured} class:card--noMedia={!post.cover} href="/blog/{post.slug}">
	<span class="card__icon" aria-hidden="true"><Icon name="doc" size={32} /></span>

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
	/* One row of the Finder's list view: document icon, name, a thumbnail as the preview.
	   Selecting a row (hover, focus, press) inverts it, as a selected Mac file does. */
	.card {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr) 7rem;
		gap: var(--s-4);
		align-items: start;
		padding: var(--s-4) var(--s-5);
		border-bottom: 1px dotted var(--ink);
		text-decoration: none;
		color: var(--text);
		background: var(--paper);
	}

	.card--noMedia {
		grid-template-columns: 2rem minmax(0, 1fr);
	}

	.card:last-child {
		border-bottom: 0;
	}

	.card__icon {
		color: var(--ink);
		padding-top: 0.125rem;
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			background: var(--ink);
		}
	}

	.card:active,
	.card:focus-visible {
		background: var(--ink);
	}

	.card:focus-visible {
		outline: 2px dotted var(--paper);
		outline-offset: -6px;
	}

	/* On the inverted row every inherited colour flips with it. */
	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__title,
		.card:hover .card__summary,
		.card:hover .meta,
		.card:hover .card__dot,
		.card:hover .card__icon {
			color: var(--paper);
		}
		.card:hover .card__media {
			border-color: var(--paper);
		}
	}

	.card:active .card__title,
	.card:active .card__summary,
	.card:active .meta,
	.card:active .card__dot,
	.card:active .card__icon,
	.card:focus-visible .card__title,
	.card:focus-visible .card__summary,
	.card:focus-visible .meta,
	.card:focus-visible .card__dot,
	.card:focus-visible .card__icon {
		color: var(--paper);
	}

	.card:focus-visible .card__media,
	.card:active .card__media {
		border-color: var(--paper);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-family: var(--font-display);
		font-size: 1.3125rem;
		font-weight: 700;
		line-height: 1.25;
		color: var(--text);
		margin: 0 0 var(--s-2);
	}

	.card__summary {
		color: var(--text-secondary);
		margin: 0 0 var(--s-2);
		font-size: 1rem;
		line-height: 1.55;
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.card__media {
		overflow: hidden;
		aspect-ratio: 4 / 3;
		border: 2px solid var(--ink);
		background: var(--paper);
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 767px) {
		.card {
			grid-template-columns: 1.75rem minmax(0, 1fr);
			padding: var(--s-4);
			gap: var(--s-3);
		}
		/* The preview drops out on a phone: the row is a line of text, not a card. */
		.card__media {
			display: none;
		}
	}
</style>
