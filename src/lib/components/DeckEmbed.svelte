<script lang="ts">
	/**
	 * A slide deck from another origin, embedded with its own prev/next/open controls.
	 *
	 * The decks this points at (Quick Equipment Log, so far) are 1920×1080 stages that
	 * scale themselves to the viewport they are given, which is why the frame here is a
	 * plain 16:9 box with nothing to configure.
	 *
	 * Driving a cross-origin frame leaves exactly one lever: its URL. The deck reads the
	 * fragment as a slide index and listens for `hashchange`, so stepping is a navigation
	 * to `#n` — which lands as a cut rather than the deck's own animated transition. It is
	 * done through `location.replace`, one of the few members a page may touch on a
	 * cross-origin window, because setting `src` instead would push every slide onto the
	 * reader's Back button.
	 *
	 * The deck also has its own overlay controls and keyboard, and a reader who uses those
	 * moves the deck without telling us — `slide` is this component's idea of where the
	 * deck is, not a reading of it. The buttons stay useful either way; only the disabled
	 * state at the two ends can be briefly wrong.
	 */
	import type { Snippet } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	let {
		src,
		slides,
		title,
		children
	}: {
		/** The deck's URL, without a fragment. */
		src: string;
		/** How many stops the deck holds at, so the ends can be clamped. */
		slides: number;
		title: string;
		children?: Snippet;
	} = $props();

	let frame = $state<HTMLIFrameElement>();
	let slide = $state(0);

	const last = $derived(Math.max(0, slides - 1));
	const url = $derived(`${src}#${slide}`);

	function step(by: number) {
		const next = Math.min(last, Math.max(0, slide + by));
		if (next === slide) return;
		slide = next;
		frame?.contentWindow?.location.replace(`${src}#${next}`);
	}
</script>

<figure class="widget deck-embed">
	<div class="frame">
		<!-- `src` is written once, on purpose: every later move goes through `location.replace`. -->
		<iframe bind:this={frame} src={`${src}#0`} {title} loading="lazy" allow="fullscreen"
		></iframe>
	</div>

	<div class="controls">
		<button
			type="button"
			class="rpm-btn ghost"
			aria-label="Previous slide"
			disabled={slide === 0}
			onclick={() => step(-1)}
		>
			<Icon name="arrow-left" size={16} />
		</button>
		<button
			type="button"
			class="rpm-btn ghost"
			aria-label="Next slide"
			disabled={slide === last}
			onclick={() => step(1)}
		>
			<Icon name="arrow-right" size={16} />
		</button>
		<a
			class="rpm-btn ghost"
			href={url}
			target="_blank"
			rel="noopener"
			aria-label="Open the deck in its own tab"
		>
			<Icon name="maximize" size={16} />
		</a>
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

	.controls {
		display: flex;
		gap: var(--s-2);
		margin-top: var(--s-3);
	}

	/* The shared widget button, cut down to an icon square. */
	.rpm-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem 0.6rem;
		text-decoration: none;
	}

	.rpm-btn:disabled {
		opacity: 0.45;
		cursor: default;
	}

	/* The third control leaves the page, so it sits apart from the two that don't. */
	.controls a {
		margin-left: auto;
	}

	@media (pointer: coarse) {
		.rpm-btn {
			min-height: 44px;
			min-width: 44px;
		}
	}
</style>
