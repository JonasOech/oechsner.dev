<script lang="ts">
	import { formatDate, type Post } from '$lib/posts';
	import Nerdyness from '$lib/components/Nerdyness.svelte';

	let { post }: { post: Post } = $props();
</script>

<!-- One line of a table of contents: the title, a dotted leader, and where it falls in
     time. The summary and reading time sit beneath, set smaller, like a chapter synopsis. -->
<a class="row" href="/blog/{post.slug}">
	<div class="row__line">
		<h3 class="row__title">{post.title}</h3>
		<span class="row__leader" aria-hidden="true"></span>
		<time class="row__date num" datetime={post.date}>{formatDate(post.date)}</time>
	</div>

	{#if post.summary}
		<p class="row__summary">{post.summary}</p>
	{/if}

	<p class="meta row__meta">
		{post.readingMinutes} min read
		<!-- Separator lives inside the guard: a post without a nerdyness rating must not
		     leave a dangling dot at the end of the line. -->
		{#if post.nerdyness}
			<span class="row__dot" aria-hidden="true">·</span>
			<Nerdyness level={post.nerdyness} />
		{/if}
	</p>
</a>

<style>
	.row {
		display: grid;
		gap: var(--s-1);
		padding: var(--s-4) 0;
		border-top: 1px solid var(--line);
		text-decoration: none;
		color: inherit;
	}

	.row:last-child {
		border-bottom: 1px solid var(--line);
	}

	.row__line {
		display: flex;
		align-items: baseline;
		gap: var(--s-2);
	}

	.row__title {
		flex: 0 1 auto;
		min-width: 0;
		font-size: 1.375rem;
		font-weight: 500;
		line-height: 1.25;
		color: var(--text);
		margin: 0;
		text-wrap: pretty;
		transition: color var(--dur-fast) var(--ease-out);
	}

	/* The dotted leader fills whatever the title and date leave, sitting on the baseline. */
	.row__leader {
		flex: 1 1 1.5rem;
		min-width: 1.5rem;
		height: 0.7em;
		border-bottom: 2px dotted var(--line-strong);
		align-self: baseline;
		transform: translateY(-0.1em);
	}

	.row__date {
		flex: none;
		font-size: 1rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.row__summary {
		max-width: 32rem;
		color: var(--text-secondary);
		font-style: italic;
		line-height: 1.4;
	}

	.row__dot {
		margin-inline: 0.4em;
	}

	@media (hover: hover) and (pointer: fine) {
		.row:hover .row__title {
			color: var(--accent);
		}
		.row:hover .row__leader {
			border-bottom-color: var(--accent);
		}
	}

	.row:active .row__title {
		color: var(--accent-press);
	}

	.row:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 479px) {
		/* The date drops under the title: a leader needs room, a phone has none. */
		.row__line {
			flex-wrap: wrap;
			column-gap: var(--s-2);
		}
		.row__leader {
			display: none;
		}
		.row__date {
			flex-basis: 100%;
			font-size: 0.9375rem;
		}
		.row__title {
			flex: 1 1 100%;
		}
	}
</style>
