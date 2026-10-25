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
	/* A boxed card. `--tone` is set by whoever lays the cards out (the home page cycles
	   it through the sticker palette); the fallback keeps a lone card on-palette. */
	.card {
		--tone: var(--yellow);
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--surface);
		border: var(--bw) solid var(--ink);
		box-shadow: var(--shadow-3);
		text-decoration: none;
		color: inherit;
		transition:
			transform var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			transform: translate(-3px, -3px) rotate(-0.6deg);
			box-shadow: var(--shadow-4);
		}
		.card:hover .card__img {
			transform: scale(1.05);
		}
		.card:hover .card__title {
			text-decoration: underline;
			text-decoration-thickness: 4px;
			text-decoration-color: var(--tone);
			text-underline-offset: 4px;
			text-decoration-skip-ink: none;
		}
	}

	.card:active {
		transform: translate(6px, 6px);
		box-shadow: 0 0 0 var(--ink);
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--shadow-3), var(--focus-ring);
	}

	.card__text {
		display: grid;
		align-content: start;
		gap: var(--s-3);
		min-width: 0;
		padding: var(--s-5);
		flex: 1 1 auto;
	}

	.card__title {
		font-size: 1.4375rem;
		font-weight: 800;
		line-height: 1.12;
		letter-spacing: -0.02em;
		color: var(--text);
		margin: 0;
	}

	.card--featured .card__title {
		font-size: 1.75rem;
	}

	.card__summary {
		color: var(--text-secondary);
		margin: 0;
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	/* Cover on top, bar of colour when there is none. */
	.card__media {
		order: -1;
		overflow: hidden;
		aspect-ratio: 16 / 9;
		background: var(--tone);
		border-bottom: var(--bw) solid var(--ink);
	}

	.card--noMedia::before {
		content: '';
		order: -1;
		height: 1.1rem;
		background: var(--tone);
		border-bottom: var(--bw) solid var(--ink);
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 360ms var(--ease-out);
	}
</style>
