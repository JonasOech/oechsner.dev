<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post }: { post: Post } = $props();
</script>

<a class="card" href="/blog/{post.slug}">
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
</a>

<style>
	/* A tile: cover on top, text below, every tile in a row stretched to the same height
	   by the parent grid. */
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		height: 100%;
		padding: var(--s-4);
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
		transition:
			background-color 220ms var(--ease-out),
			border-color 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			border-color: var(--line-strong);
		}
		.card:hover .card__img {
			transform: scale(1.03);
		}
	}

	.card:active {
		background: var(--surface-active);
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		background: var(--surface);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-size: 1.1875rem;
		font-weight: 700;
		line-height: 1.35;
		letter-spacing: -0.005em;
		color: var(--text);
		margin: 0 0 var(--s-3);
		transition: color var(--dur-fast) var(--ease-out);
	}

	.card__summary {
		color: var(--text-secondary);
		margin: 0 0 var(--s-3);
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.card__media {
		overflow: hidden;
		border-radius: 4px;
		aspect-ratio: 16 / 9;
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 480ms var(--ease-out);
	}
</style>
