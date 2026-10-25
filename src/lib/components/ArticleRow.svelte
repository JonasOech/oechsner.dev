<script lang="ts">
	import { type Post } from '$lib/posts';

	let { post }: { post: Post } = $props();
</script>

<!-- One entry of the plain dated list: ISO date, then the title. The summary is a quiet
     second line. No cover, no card, no hover fill. -->
<a class="row" href="/blog/{post.slug}">
	<time class="row__date" datetime={post.date}>{post.date}</time>
	<span class="row__text">
		<span class="row__title">{post.title}</span>
		{#if post.summary}
			<span class="row__summary">{post.summary}</span>
		{/if}
	</span>
</a>

<style>
	.row {
		display: grid;
		grid-template-columns: 6.75rem minmax(0, 1fr);
		column-gap: var(--s-3);
		padding-block: var(--s-3);
		color: inherit;
		text-decoration: none;
	}

	.row__date {
		font-size: 0.9375rem;
		/* Matches the title's line box (1.65 × 19px) so the two share a baseline. */
		line-height: 2.09;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}

	.row__text {
		display: grid;
		gap: var(--s-1);
		min-width: 0;
	}

	.row__title {
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.2em;
		transition: text-decoration-color var(--dur-fast) var(--ease-out);
	}

	.row__summary {
		font-size: 0.9375rem;
		line-height: 1.55;
		color: var(--text-muted);
	}

	@media (hover: hover) and (pointer: fine) {
		.row:hover .row__title {
			text-decoration-color: var(--accent);
			color: var(--accent);
		}
	}

	.row:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 479px) {
		.row {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 0;
			padding-block: var(--s-3);
		}
		.row__date {
			line-height: 1.4;
		}
	}
</style>
