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
	/* A frosted card. The cover, when there is one, sits on top as a rounded window. */
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-4);
		border-radius: var(--r-lg);
		background: var(--glass);
		border: 1px solid var(--glass-border);
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
		backdrop-filter: blur(var(--glass-blur)) saturate(140%);
		box-shadow: var(--shadow-glass);
		text-decoration: none;
		color: inherit;
		transition:
			background-color 220ms var(--ease-out),
			border-color 220ms var(--ease-out),
			transform 220ms var(--ease-out),
			box-shadow 220ms var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			background: var(--glass-hover);
			border-color: var(--glass-edge);
			transform: translateY(-3px);
			box-shadow: var(--shadow-glass), 0 18px 48px rgba(var(--violet-rgb), 0.16);
		}
		.card:hover .card__img {
			transform: scale(1.04);
		}
		.card:hover .card__title {
			color: var(--accent);
		}
	}

	.card:active {
		background: var(--glass-strong);
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.card__text {
		min-width: 0;
		display: grid;
		align-content: start;
		gap: var(--s-2);
		padding: var(--s-1) var(--s-2) var(--s-2);
		flex: 1;
	}

	.card__title {
		font-size: 1.25rem;
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 0;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.card--featured .card__title {
		font-size: 1.5rem;
	}

	.card__summary {
		color: var(--text-secondary);
		font-weight: 300;
		margin: 0;
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	/* Cover first, whichever way the markup orders it. */
	.card__media {
		order: -1;
		overflow: hidden;
		border-radius: var(--r-md);
		aspect-ratio: 16 / 9;
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 480ms var(--ease-out);
	}
</style>
