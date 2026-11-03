<script lang="ts">
	import { formatDate, linkHost, postHref, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';
	import Icon from '$lib/components/Icon.svelte';

	let { post, featured = false }: { post: Post; featured?: boolean } = $props();
</script>

<!-- A link post leaves the site, so it opens in a new tab and says where it goes. -->
<a
	class="card"
	class:card--featured={featured}
	class:card--noMedia={!post.cover}
	href={postHref(post)}
	target={post.link ? '_blank' : undefined}
	rel={post.link ? 'noopener' : undefined}
>
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
			{#if post.link}
				<span class="card__host">
					{linkHost(post.link)}
					<Icon name="external" size={12} />
				</span>
			{:else}
				{post.readingMinutes} min read
			{/if}
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
		grid-template-columns: minmax(0, 1fr) 190px;
		gap: var(--s-6);
		align-items: start;
		padding: var(--s-5);
		margin-inline: calc(var(--s-5) * -1);
		border-radius: 8px;
		background: transparent;
		border: 1px solid transparent;
		text-decoration: none;
		color: inherit;
		transition:
			background-color 220ms var(--ease-out),
			border-color 220ms var(--ease-out);
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
		.card:hover {
			background: var(--surface);
			border-color: var(--line);
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

	.card--featured .card__title {
		font-size: 1.375rem;
	}

	.card__summary {
		color: var(--text-secondary);
		margin: 0 0 var(--s-3);
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	.card__host {
		display: inline-flex;
		align-items: center;
		gap: 0.3em;
	}

	.card__media {
		overflow: hidden;
		border-radius: 4px;
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

	@media (max-width: 1023px) {
		.card {
			grid-template-columns: minmax(0, 1fr) 150px;
		}
	}

	@media (max-width: 767px) {
		.card {
			grid-template-columns: minmax(0, 1fr);
		}
		/* Thumbnail drops below the text at full width. */
		.card__media {
			aspect-ratio: 16 / 9;
		}
	}
</style>
