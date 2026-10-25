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
	.card {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 132px;
		gap: var(--s-4);
		align-items: center;
		padding: var(--s-3) var(--s-3);
		margin-inline: calc(var(--s-3) * -1);
		border-radius: var(--r-md);
		background: transparent;
		border: 1px solid transparent;
		text-decoration: none;
		color: inherit;
		transition:
			background-color var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out),
			transform var(--dur-base) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out);
	}

	.card--noMedia,
	.card--featured {
		grid-template-columns: minmax(0, 1fr);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			background: var(--surface-hover);
			border-color: var(--line);
			transform: translateY(-2px);
			box-shadow: var(--shadow-2);
		}
		.card:hover .card__img {
			transform: scale(1.04);
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
		box-shadow: var(--focus-ring);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-size: 1.0625rem;
		font-weight: 650;
		line-height: 1.35;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 0 0 var(--s-1);
		transition: color var(--dur-fast) var(--ease-out);
	}

	.card--featured .card__title {
		font-size: 1.25rem;
	}

	.card__summary {
		color: var(--text-secondary);
		font-size: 0.875rem;
		line-height: 1.55;
		margin: 0 0 var(--s-2);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.card__media {
		overflow: hidden;
		border-radius: var(--r-sm);
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
		transition: transform 480ms var(--ease-out);
	}

	@media (max-width: 479px) {
		.card {
			grid-template-columns: minmax(0, 1fr) 84px;
			gap: var(--s-3);
		}
	}
</style>
