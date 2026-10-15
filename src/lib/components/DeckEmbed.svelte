<script lang="ts">
	/**
	 * A slide deck from another origin, embedded as a plain frame.
	 *
	 * The decks this points at (Quick Equipment Log, so far) are 1920×1080 stages that
	 * scale themselves to the viewport they are given and bring their own overlay controls
	 * and keyboard, so the frame here is a plain 16:9 box with nothing of its own to drive.
	 *
	 * The deck reads its URL fragment as a 0-based slide index, which is how `slide` picks
	 * the one the frame opens on.
	 */
	import type { Snippet } from 'svelte';

	let {
		src,
		slide = 0,
		title,
		children
	}: {
		/** The deck's URL, without a fragment. */
		src: string;
		/** The 0-based slide the frame opens on. */
		slide?: number;
		title: string;
		children?: Snippet;
	} = $props();
</script>

<figure class="widget deck-embed">
	<div class="frame">
		<iframe src={`${src}#${slide}`} {title} loading="lazy" allow="fullscreen"></iframe>
	</div>

	{#if children}
		<figcaption>{@render children()}</figcaption>
	{/if}
</figure>

<style>
	.frame {
		aspect-ratio: 16 / 9;
		border: 1px solid var(--line);
		border-radius: 8px;
		overflow: hidden;
		/* The decks are light-plate documents, so the box shows that rather than the page
		   while the frame is still loading. */
		background: var(--plate);
	}

	.frame iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
	}
</style>
