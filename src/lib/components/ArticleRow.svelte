<script lang="ts">
	import type { Post } from '$lib/posts';
	import { entryNumber } from '$lib/entry';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post, featured = false }: { post: Post; featured?: boolean } = $props();
</script>

<!-- One line of the index: entry number and date in the margin, the title on the ruled
     line, a small mounted thumbnail at the far edge. -->
<a class="card" class:card--featured={featured} class:card--noMedia={!post.cover} href="/blog/{post.slug}">
	<p class="card__ref meta">
		<span class="card__no">No.&nbsp;{entryNumber(post.slug)}</span>
		<time datetime={post.date}>{post.date}</time>
	</p>

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
		grid-template-columns: 7.5rem minmax(0, 1fr) 150px;
		column-gap: var(--s-5);
		align-items: start;
		padding: var(--s-5) 0;
		border-top: 1px solid var(--line-strong);
		text-decoration: none;
		color: inherit;
		transition: background-color var(--dur-fast) var(--ease-out);
	}

	.card--noMedia {
		grid-template-columns: 7.5rem minmax(0, 1fr);
	}

	.card__ref {
		display: grid;
		gap: 0.15rem;
		padding-top: 0.35rem;
	}

	.card__no {
		color: var(--accent);
		font-weight: 500;
		letter-spacing: 0.06em;
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__title {
			color: var(--accent);
			text-decoration: underline;
			text-decoration-thickness: 1px;
			text-underline-offset: 0.2em;
		}
		.card:hover {
			background: var(--accent-wash);
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
		font-size: 1.375rem;
		font-weight: 600;
		line-height: 1.25;
		letter-spacing: -0.012em;
		color: var(--text);
		margin: 0 0 var(--s-2);
		transition: color var(--dur-fast) var(--ease-out);
	}

	.card__summary {
		color: var(--text-secondary);
		font-size: 1rem;
		line-height: 1.6;
		margin: 0 0 var(--s-3);
	}

	.card__dot {
		margin-inline: 0.4em;
	}

	/* A photo-corner mount: paper-white margin and a pencil border round the thumbnail. */
	.card__media {
		overflow: hidden;
		aspect-ratio: 4 / 3;
		border: 1px solid var(--line-strong);
		border-radius: 2px;
		padding: 3px;
		background: var(--plate);
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 1023px) {
		.card {
			grid-template-columns: 6.5rem minmax(0, 1fr) 120px;
		}
		.card--noMedia {
			grid-template-columns: 6.5rem minmax(0, 1fr);
		}
	}

	/* Phone: the margin reference becomes a header line above the title. */
	@media (max-width: 639px) {
		.card,
		.card--noMedia {
			grid-template-columns: minmax(0, 1fr);
			row-gap: var(--s-2);
		}
		.card__ref {
			display: flex;
			gap: var(--s-4);
			padding-top: 0;
		}
		.card__media {
			aspect-ratio: 16 / 9;
			order: 3;
			margin-top: var(--s-2);
		}
	}
</style>
