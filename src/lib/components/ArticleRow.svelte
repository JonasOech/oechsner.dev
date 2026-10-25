<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	/** `index` is the clipping's number on the page, shown as "No. 03". Omit to hide it. */
	let {
		post,
		featured = false,
		index
	}: { post: Post; featured?: boolean; index?: number } = $props();
</script>

<a
	class="card"
	class:card--featured={featured}
	class:card--noMedia={!post.cover}
	href="/blog/{post.slug}"
>
	{#if index !== undefined}
		<span class="card__no" aria-hidden="true">No. {String(index).padStart(2, '0')}</span>
	{/if}

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
		<h3 class="card__title"><span class="card__title-text">{post.title}</span></h3>
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
	/* A clipping: a slip of lighter stock with a hard edge, laid a degree or so off-square.
	   Hover straightens it and lifts it off the page. */
	.card {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 190px;
		gap: var(--s-5) var(--s-6);
		align-items: start;
		padding: var(--s-5) var(--s-5) var(--s-5);
		background: var(--surface);
		border: 2px solid var(--text);
		box-shadow: 5px 5px 0 var(--text);
		text-decoration: none;
		color: inherit;
		transform: rotate(var(--tilt, 0deg));
		transition:
			transform var(--dur-base) var(--ease-snap),
			box-shadow var(--dur-base) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out);
	}

	.card:nth-child(odd) {
		--tilt: -0.5deg;
	}

	.card:nth-child(even) {
		--tilt: 0.45deg;
	}

	/* No cover image means no media column — never a solid block standing in for a photo. */
	.card--noMedia,
	.card--featured {
		grid-template-columns: minmax(0, 1fr);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			transform: rotate(0deg) translate(-3px, -3px);
			box-shadow: 8px 8px 0 var(--accent);
			background: var(--surface-hover);
		}
		.card:hover .card__title-text {
			background-size: 100% 100%;
		}
	}

	.card:active {
		transform: translate(2px, 2px);
		box-shadow: 2px 2px 0 var(--text);
	}

	.card:focus-visible {
		outline: none;
		box-shadow: 5px 5px 0 var(--text), var(--focus-ring);
	}

	/* The clipping number, typed in the corner. */
	.card__no {
		position: absolute;
		top: -0.85rem;
		right: 1rem;
		padding: 0.15rem 0.5rem;
		background: var(--text);
		color: var(--paper);
		font-family: var(--font-type);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		transform: rotate(2.5deg);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-family: var(--font-head);
		font-size: clamp(1.5rem, 3vw, 1.875rem);
		font-weight: 400;
		line-height: 1.12;
		letter-spacing: 0.015em;
		text-transform: uppercase;
		color: var(--text);
		margin: 0 0 var(--s-3);
	}

	/* The highlighter swipes in under the title on hover. */
	.card__title-text {
		background-image: linear-gradient(
			transparent 60%,
			rgba(var(--accent-rgb), 0.65) 60%,
			rgba(var(--accent-rgb), 0.65) 92%,
			transparent 92%
		);
		background-repeat: no-repeat;
		background-size: 0% 100%;
		transition: background-size 360ms var(--ease-out);
		-webkit-box-decoration-break: clone;
		box-decoration-break: clone;
	}

	.card__summary {
		color: var(--text-secondary);
		margin: 0 0 var(--s-3);
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	/* The thumbnail is a photocopy pasted in with a white border. */
	.card__media {
		overflow: hidden;
		aspect-ratio: 4 / 3;
		border: 2px solid var(--text);
		background: var(--plate);
		transform: rotate(1.4deg);
	}

	.card__media--wide {
		aspect-ratio: 16 / 9;
		order: -1;
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(0.25) contrast(1.05);
	}

	@media (max-width: 1023px) {
		.card {
			grid-template-columns: minmax(0, 1fr) 150px;
		}
	}

	@media (max-width: 767px) {
		.card {
			grid-template-columns: minmax(0, 1fr);
			padding: var(--s-4);
		}
		/* Thumbnail drops below the text at full width. */
		.card__media {
			aspect-ratio: 16 / 9;
			transform: rotate(-0.8deg);
		}
	}
</style>
