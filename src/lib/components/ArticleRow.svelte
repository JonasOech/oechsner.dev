<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post }: { post: Post } = $props();
</script>

<!-- One row of an `ls -l` listing: date, size (read time), then the name. The title is the
     file name, the summary its first line. -->
<a class="row" href="/blog/{post.slug}">
	<time class="row__date" datetime={post.date}>{post.date}<span class="sr-only"> ({formatDate(post.date)})</span></time>
	<span class="row__size">{post.readingMinutes}m</span>
	<span class="row__text">
		<span class="row__title">{post.title}</span>
		{#if post.summary}
			<span class="row__summary">{post.summary}</span>
		{/if}
		<span class="row__meta">
			{#each post.tags as tag (tag)}<span class="row__tag">{tag}</span>{/each}
			{#if post.nerdyness}
				<Nerdyness level={post.nerdyness} />
			{/if}
		</span>
	</span>
</a>

<style>
	.row {
		display: grid;
		grid-template-columns: 10ch 4ch minmax(0, 1fr);
		column-gap: 2ch;
		align-items: baseline;
		padding: var(--s-3) 1ch;
		margin-inline: -1ch;
		border-bottom: 1px dashed var(--line);
		text-decoration: none;
		color: inherit;
	}

	.row:last-child {
		border-bottom: 0;
	}

	.row__date,
	.row__size {
		font-size: 0.8125rem;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.row__size {
		text-align: right;
	}

	.row__text {
		display: grid;
		gap: 0.2rem;
		min-width: 0;
	}

	.row__title {
		font-size: 0.9375rem;
		font-weight: 700;
		line-height: 1.45;
		color: var(--text);
		text-wrap: balance;
	}

	.row__summary {
		font-size: 0.8125rem;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	.row__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0 1.5ch;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.row__meta:empty {
		display: none;
	}

	.row__tag::before {
		content: '#';
		color: var(--accent-dim);
	}

	@media (hover: hover) and (pointer: fine) {
		.row:hover {
			background: var(--surface-active);
		}
		.row:hover .row__title {
			color: var(--accent);
		}
	}

	.row:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		background: var(--surface-active);
	}

	.row:focus-visible .row__title {
		color: var(--accent);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (max-width: 599px) {
		.row {
			grid-template-columns: 1fr auto;
			row-gap: 0.15rem;
		}

		.row__date {
			grid-column: 1;
		}

		.row__size {
			grid-column: 2;
		}

		.row__text {
			grid-column: 1 / -1;
		}
	}
</style>
