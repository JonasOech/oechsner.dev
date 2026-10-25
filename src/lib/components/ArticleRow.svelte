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
	/* A row is a title, a standfirst, a line of facts and, if the post has one, a small
	   cover at the right. Rows are divided by hairlines; the only hover is the title. */
	.card {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 5.5rem;
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

	/* No cover image means no media column — never a solid block standing in for a photo. */
	.card--noMedia,
	.card--featured {
		grid-template-columns: minmax(0, 1fr);
	}

	.card--featured {
		gap: var(--s-5);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__title {
			color: var(--accent);
		}
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-size: 1.3125rem;
		font-weight: 600;
		line-height: 1.28;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 0 0 var(--s-2);
		transition: color var(--dur-fast) var(--ease-out);
	}

	.card--featured .card__title {
		font-size: 1.5rem;
	}

	.card__summary {
		font-size: 1rem;
		line-height: 1.55;
		color: var(--text-secondary);
		margin: 0 0 var(--s-3);
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.card__media {
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		aspect-ratio: 4 / 3;
		margin-top: 0.3rem;
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

	@media (min-width: 40em) {
		.card {
			grid-template-columns: minmax(0, 1fr) 7.5rem;
		}
	}
</style>
