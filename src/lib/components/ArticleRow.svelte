<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post, featured = false }: { post: Post; featured?: boolean } = $props();
</script>

<!-- One entry in a table of contents: number, title, leader, date; the abstract and
     the facts hang beneath, and the cover is a small figure at the right margin. -->
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
		<div class="card__head">
			<h3 class="card__title">{post.title}</h3>
			<span class="card__leader" aria-hidden="true"></span>
			<time class="card__date" datetime={post.date}>{formatDate(post.date)}</time>
		</div>
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
		grid-template-columns: 2.75rem minmax(0, 1fr) 120px;
		column-gap: var(--s-3);
		align-items: start;
		padding: var(--s-4) 0;
		text-decoration: none;
		color: inherit;
		counter-increment: entry;
	}

	/* 1.1, 1.2 … — the entry's number inside the section it sits in. */
	.card::before {
		content: counter(section) '.' counter(entry);
		grid-column: 1;
		grid-row: 1;
		font-variant-numeric: lining-nums tabular-nums;
		color: var(--text-muted);
		line-height: 1.45;
	}

	.card__text {
		grid-column: 2;
		min-width: 0;
	}

	.card__media {
		grid-column: 3;
		grid-row: 1;
	}

	/* No cover image means no media column. */
	.card--noMedia,
	.card--featured {
		grid-template-columns: 2.75rem minmax(0, 1fr);
	}

	.card__head {
		display: flex;
		align-items: last baseline;
		gap: var(--s-2);
		margin: 0 0 var(--s-1);
	}

	.card__title {
		flex: 0 1 auto;
		font-size: 1.1875rem;
		font-weight: 600;
		line-height: 1.35;
		color: var(--text);
		margin: 0;
		transition: color var(--dur-fast) var(--ease-out);
	}

	/* The dotted leader that carries the eye from title to date. */
	.card__leader {
		flex: 1 1 1.5rem;
		min-width: 1rem;
		border-bottom: 2px dotted var(--line-strong);
		transform: translateY(-0.3em);
	}

	.card__date {
		flex: none;
		font-variant-numeric: lining-nums tabular-nums;
		color: var(--text-muted);
		white-space: nowrap;
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover .card__title {
			color: var(--accent);
			text-decoration: underline;
			text-decoration-thickness: 1px;
			text-underline-offset: 0.18em;
		}
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.card:focus-visible .card__title {
		color: var(--accent);
	}

	.card__summary {
		color: var(--text-secondary);
		font-size: 1rem;
		line-height: 1.5;
		margin: 0 0 var(--s-2);
	}

	.card__dot {
		margin-inline: 0.4em;
		color: var(--text-muted);
	}

	/* The cover as a small figure: plate, hairline, no radius. */
	.card__media {
		overflow: hidden;
		aspect-ratio: 4 / 3;
		border: 1px solid var(--line);
		background: var(--plate);
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

	@media (max-width: 767px) {
		.card {
			grid-template-columns: 2.25rem minmax(0, 1fr) 88px;
			column-gap: var(--s-2);
		}
		.card--noMedia,
		.card--featured {
			grid-template-columns: 2.25rem minmax(0, 1fr);
		}
	}

	@media (max-width: 539px) {
		/* Thumbnail drops below the text, inside the text column. */
		.card {
			grid-template-columns: 2.25rem minmax(0, 1fr);
		}
		.card__media {
			grid-column: 2;
			grid-row: 2;
			margin-top: var(--s-3);
			max-width: 14rem;
		}
		.card__head {
			flex-wrap: wrap;
		}
		.card__title {
			flex: 1 1 100%;
		}
		.card__leader {
			display: none;
		}
	}
</style>
