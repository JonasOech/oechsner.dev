<script lang="ts">
	import type { Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post, featured = false }: { post: Post; featured?: boolean } = $props();
</script>

<!-- One row of the index, on the page's twelve columns: the facts hang in the first three,
     the title and summary take the next seven, the thumbnail the last two. The whole row is
     the link; the date is the ISO form on purpose, because it is the column that sorts. -->
<a class="row" class:row--featured={featured} class:row--noMedia={!post.cover} href="/blog/{post.slug}">
	<p class="row__meta meta">
		<time datetime={post.date}>{post.date}</time>
		<span class="row__read">{post.readingMinutes} min read</span>
		<!-- Inside the guard: a post without a nerdyness rating leaves no empty line. -->
		{#if post.nerdyness}
			<Nerdyness level={post.nerdyness} />
		{/if}
	</p>

	<div class="row__text">
		<h3 class="row__title">{post.title}</h3>
		{#if post.summary}
			<p class="row__summary">{post.summary}</p>
		{/if}
	</div>

	{#if post.cover}
		<div class="row__media">
			<img
				class="row__img"
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
	.row {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--col-gap);
		align-items: start;
		padding: var(--s-5) 0;
		border-top: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
	}

	.row__meta {
		grid-column: 1 / 4;
		display: grid;
		gap: 0.2rem;
		justify-items: start;
		padding-top: 0.3rem;
	}

	.row__text {
		grid-column: 4 / 11;
		min-width: 0;
	}

	.row--noMedia .row__text {
		grid-column: 4 / -1;
	}

	.row__media {
		grid-column: 11 / -1;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border: 1px solid var(--line);
		background: var(--surface);
	}

	.row__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.row__title {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: -0.015em;
		color: var(--text);
		margin: 0 0 var(--s-2);
		text-wrap: balance;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-decoration-color: transparent;
		text-underline-offset: 0.2em;
		transition:
			color var(--dur-fast) var(--ease-out),
			text-decoration-color var(--dur-fast) var(--ease-out);
	}

	.row__summary {
		color: var(--text-secondary);
		max-width: 60ch;
		text-wrap: pretty;
	}

	@media (hover: hover) and (pointer: fine) {
		.row:hover .row__title {
			color: var(--accent);
			text-decoration-color: currentColor;
		}
	}

	.row:active .row__title {
		color: var(--accent-dim);
	}

	.row:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 1023px) {
		.row__text {
			grid-column: 4 / 10;
		}
		.row__media {
			grid-column: 10 / -1;
		}
	}

	/* One column: the facts become a single line above the title, and the thumbnail
	   drops to the right of the text it belongs to. */
	@media (max-width: 767px) {
		.row {
			grid-template-columns: minmax(0, 1fr) 5.5rem;
			row-gap: var(--s-2);
			padding: var(--s-4) 0;
		}
		.row__meta {
			grid-column: 1 / -1;
			display: flex;
			flex-wrap: wrap;
			gap: 0 var(--s-4);
			align-items: center;
			padding-top: 0;
		}
		.row__text,
		.row--noMedia .row__text {
			grid-column: 1;
			grid-row: 2;
		}
		.row__media {
			grid-column: 2;
			grid-row: 2;
		}
		.row--noMedia .row__text {
			grid-column: 1 / -1;
		}
		.row__title {
			font-size: 1.125rem;
		}
	}
</style>
