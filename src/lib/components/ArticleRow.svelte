<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	/**
	 * One row of the writing index: a ruled line, a large index numeral, the title, and an
	 * optional thumbnail. `index` is the post's running number (oldest = 01); it is
	 * decorative, so it is hidden from assistive technology.
	 */
	let { post, index }: { post: Post; index?: number } = $props();

	const numeral = $derived(index === undefined ? '' : String(index).padStart(2, '0'));
</script>

<a class="card" class:card--noMedia={!post.cover} href="/blog/{post.slug}">
	{#if numeral}
		<span class="card__num" aria-hidden="true">{numeral}</span>
	{/if}

	<div class="card__text">
		<h3 class="card__title">{post.title}</h3>
		{#if post.summary}
			<p class="card__summary">{post.summary}</p>
		{/if}
		<p class="meta">
			<time datetime={post.date}>{formatDate(post.date)}</time>
			<span class="card__dot" aria-hidden="true">/</span>
			{post.readingMinutes} min read
			<!-- Separator lives inside the guard: a post without a nerdyness rating must not
			     leave a dangling mark at the end of the line. -->
			{#if post.nerdyness}
				<span class="card__dot" aria-hidden="true">/</span>
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
		grid-template-columns: 4.5rem minmax(0, 1fr) 160px;
		column-gap: var(--s-5);
		align-items: start;
		padding: var(--s-4) 0 var(--s-6);
		border-top: 1px solid var(--line-strong);
		text-decoration: none;
		color: inherit;
		transition: background-color var(--dur-fast) var(--ease-out);
	}

	.card--noMedia {
		grid-template-columns: 4.5rem minmax(0, 1fr);
	}

	.card__num {
		font-size: 2.75rem;
		font-weight: 800;
		line-height: 0.9;
		letter-spacing: -0.05em;
		font-feature-settings: 'tnum' 1;
		color: var(--text);
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__num,
		.card:hover .card__title {
			color: var(--accent);
		}
	}

	.card:active .card__title {
		color: var(--accent-dim);
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.card__text {
		min-width: 0;
	}

	.card__title {
		font-size: clamp(1.375rem, 2.4vw, 1.875rem);
		font-weight: 800;
		line-height: 1.08;
		letter-spacing: -0.035em;
		color: var(--text);
		margin: 0 0 var(--s-3);
		transition: color var(--dur-fast) var(--ease-out);
	}

	.card__summary {
		color: var(--text-secondary);
		margin: 0 0 var(--s-3);
		max-width: 56ch;
	}

	.card__dot {
		margin-inline: 0.35em;
		color: var(--accent);
	}

	.card__media {
		overflow: hidden;
		aspect-ratio: 4 / 3;
		background: var(--surface);
	}

	.card__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		transition: filter var(--dur-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__img {
			filter: grayscale(0);
		}
	}

	@media (max-width: 1023px) {
		.card {
			grid-template-columns: 3.5rem minmax(0, 1fr) 120px;
			column-gap: var(--s-4);
		}
		.card--noMedia {
			grid-template-columns: 3.5rem minmax(0, 1fr);
		}
		.card__num {
			font-size: 2.25rem;
		}
	}

	@media (max-width: 767px) {
		.card,
		.card--noMedia {
			grid-template-columns: 3rem minmax(0, 1fr);
			row-gap: var(--s-4);
		}
		.card__num {
			font-size: 1.75rem;
		}
		/* Thumbnail drops below the text, aligned with it. */
		.card__media {
			grid-column: 2;
			aspect-ratio: 16 / 9;
		}
	}
</style>
