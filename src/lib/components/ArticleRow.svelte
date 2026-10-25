<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import { accession, medium } from '$lib/catalogue';

	let { post }: { post: Post } = $props();
</script>

<a class="row" href="/blog/{post.slug}">
	<span class="row__no">{accession(post.slug)}</span>

	<span class="row__main">
		<span class="row__title">{post.title}</span>
		{#if post.summary}
			<span class="row__summary">{post.summary}</span>
		{/if}
		<span class="row__medium">{medium(post.tags)}</span>
	</span>

	<span class="row__facts">
		<time datetime={post.date}>{formatDate(post.date)}</time>
		<span>{post.readingMinutes} min read</span>
	</span>

	{#if post.cover}
		<span class="row__media" aria-hidden="true">
			<img
				class="row__img"
				src={post.cover}
				alt=""
				width="240"
				height="180"
				loading="lazy"
				decoding="async"
			/>
		</span>
	{/if}
</a>

<style>
	/* One catalogue record: number, description, facts, plate. Rows are separated by
	   hairlines only; hover moves the number to the accent and underlines the title. */
	.row {
		display: grid;
		grid-template-columns: 4.5rem minmax(0, 1fr) 7.5rem 96px;
		column-gap: var(--s-5);
		align-items: start;
		padding: var(--s-5) 0;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
	}

	.row:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.row__no,
	.row__facts,
	.row__medium {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.5;
		letter-spacing: 0.02em;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}

	.row__no {
		padding-top: 0.35rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.row__main {
		display: grid;
		gap: var(--s-2);
		min-width: 0;
	}

	.row__title {
		font-family: var(--font-display);
		font-size: 1.3125rem;
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: -0.01em;
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.2em;
		transition: text-decoration-color var(--dur-fast) var(--ease-out);
	}

	.row__summary {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.row__medium::before {
		content: 'Medium: ';
		letter-spacing: 0.06em;
	}

	.row__facts {
		display: grid;
		gap: 0.1rem;
		padding-top: 0.35rem;
	}

	.row__media {
		display: block;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border: 1px solid var(--line);
		background: var(--plate);
	}

	.row__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (hover: hover) and (pointer: fine) {
		.row:hover .row__no {
			color: var(--accent);
		}
		.row:hover .row__title {
			text-decoration-color: var(--accent);
		}
	}

	@media (max-width: 1023px) {
		.row {
			grid-template-columns: 4.5rem minmax(0, 1fr) 7rem;
		}
		.row__media {
			display: none;
		}
	}

	/* Phone: number and facts share the first line, the record follows. */
	@media (max-width: 639px) {
		.row {
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-areas:
				'no    facts'
				'main  main';
			row-gap: var(--s-2);
			padding: var(--s-4) 0;
		}
		.row__no {
			grid-area: no;
			padding-top: 0;
		}
		.row__facts {
			grid-area: facts;
			display: flex;
			flex-wrap: wrap;
			gap: 0 var(--s-3);
			justify-content: flex-end;
			padding-top: 0;
		}
		.row__main {
			grid-area: main;
		}
	}
</style>
