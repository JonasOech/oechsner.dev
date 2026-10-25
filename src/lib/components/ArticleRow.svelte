<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post, featured = false }: { post: Post; featured?: boolean } = $props();
</script>

<a class="card" class:card--featured={featured} class:card--noMedia={!post.cover} href="/blog/{post.slug}">
	<span class="card__shape" aria-hidden="true"></span>

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
	/* A row on a thick rule: marker shape, text, thumbnail. The marker cycles through the
	   three primaries and three shapes down the list, so the list reads as a sequence. */
	.card {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr) 200px;
		gap: var(--s-5);
		align-items: start;
		padding: var(--s-6) var(--s-4);
		border-top: 3px solid var(--ink);
		text-decoration: none;
		color: inherit;
		position: relative;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			padding var(--dur-base) var(--ease-out);
	}

	.card:last-child {
		border-bottom: 3px solid var(--ink);
	}

	.card--noMedia,
	.card--featured {
		grid-template-columns: 2rem minmax(0, 1fr);
	}

	.card__shape {
		display: block;
		width: 1.75rem;
		height: 1.75rem;
		margin-top: 0.2rem;
		background: var(--red);
		border: 3px solid var(--ink);
		border-radius: 50%;
		transition: transform var(--dur-base) var(--ease-out);
	}

	.card:nth-child(3n + 2) .card__shape {
		background: var(--yellow);
		border-radius: 0;
	}

	.card:nth-child(3n) .card__shape {
		background: var(--blue);
		border: 0;
		border-radius: 0;
		clip-path: polygon(50% 0, 100% 100%, 0 100%);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			background: var(--yellow);
			padding-left: var(--s-5);
		}
		.card:hover .card__shape {
			transform: rotate(90deg) scale(1.1);
		}
		.card:hover .card__img {
			transform: scale(1.04);
		}
	}

	.card:active {
		background: var(--surface-active);
	}

	.card:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 4px var(--blue);
		background: var(--yellow);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-size: clamp(1.375rem, 2.4vw, 1.75rem);
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 0 0 var(--s-3);
	}

	.card--featured .card__title {
		font-size: 2rem;
	}

	.card__summary {
		color: var(--text-secondary);
		margin: 0 0 var(--s-3);
		max-width: 60ch;
	}

	/* On a hovered yellow row the muted meta ink would drop under AA; step it up. */
	@media (hover: hover) and (pointer: fine) {
		.card:hover .meta {
			color: var(--text);
		}
	}

	.card__dot {
		margin-inline: 0.4em;
	}

	.card__media {
		overflow: hidden;
		border: 3px solid var(--ink);
		aspect-ratio: 4 / 3;
		background: var(--surface);
	}

	.card__media--wide {
		aspect-ratio: 16 / 9;
		order: -1;
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 480ms var(--ease-out);
	}

	@media (max-width: 1023px) {
		.card {
			grid-template-columns: 2rem minmax(0, 1fr) 150px;
		}
	}

	@media (max-width: 767px) {
		.card {
			grid-template-columns: 1.75rem minmax(0, 1fr);
			gap: var(--s-4);
			padding-inline: 0;
		}
		.card__shape {
			width: 1.5rem;
			height: 1.5rem;
		}
		/* Thumbnail drops below the text, aligned with it. */
		.card__media {
			grid-column: 2;
			aspect-ratio: 16 / 9;
		}
	}
</style>
