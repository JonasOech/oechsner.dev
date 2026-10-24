<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * The magazine spread every story page is built on. On a wide screen the left part is a
	 * composition of panels that stays put while the reading column on the right scrolls:
	 *
	 *   ┌──┬────────────┬───────┬───────┬──────────────┐
	 *   │  │      [ ✕ ] │ slate │  ice  │              │
	 *   │  │   story    ├───────┴───────┤   reading    │
	 *   │ic│ (charcoal) │     image     │    column    │
	 *   │e │            ├───────┬───────┤   (scrolls)  │
	 *   │  │            │ tiles │ quote │              │
	 *   └──┴────────────┴───────┴───────┴──────────────┘
	 *
	 * Narrower screens stack it: image, then tiles beside the quote, then the story, then
	 * the reading column. Panels slide down into place on first paint (`.panel-in`).
	 */
	let {
		story,
		corner,
		image,
		tiles,
		quote,
		children
	}: {
		story: Snippet;
		corner?: Snippet;
		image: Snippet;
		tiles?: Snippet;
		quote: Snippet;
		children: Snippet;
	} = $props();
</script>

<div class="spread">
	<div class="spread__visual">
		<div class="spread__strip panel-in" style="--d: 0" aria-hidden="true"></div>
		<div class="spread__story panel-in" style="--d: 1">
			{#if corner}<div class="spread__corner">{@render corner()}</div>{/if}
			<div class="spread__story-inner">{@render story()}</div>
		</div>
		<div class="spread__band spread__band--slate panel-in" style="--d: 2" aria-hidden="true"></div>
		<div class="spread__band spread__band--ice panel-in" style="--d: 3" aria-hidden="true"></div>
		<div class="spread__image panel-in" style="--d: 2">{@render image()}</div>
		<div class="spread__tiles panel-in" style="--d: 4">{@render tiles?.()}</div>
		<div class="spread__quote panel-in" style="--d: 5">{@render quote()}</div>
	</div>

	<div class="spread__read">
		{@render children()}
	</div>
</div>

<style>
	.spread {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.spread__visual {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		grid-template-areas:
			'image image'
			'tiles quote'
			'story story';
	}

	.spread__strip,
	.spread__band {
		display: none;
	}

	/* — The story panel: charcoal, with its own palette. Components rendered inside it
	     (the post outline) pick the panel colours up through the re-pointed tokens. — */
	.spread__story {
		grid-area: story;
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: 3.5rem 2rem 2rem;
		background: var(--panel-ink);
		color: var(--panel-ink-text);
		--text: var(--panel-ink-text);
		--text-secondary: var(--panel-ink-text);
		--text-muted: var(--panel-ink-muted);
		--line: var(--panel-ink-line);
		--surface-hover: rgba(255, 255, 255, 0.05);
		--accent: var(--panel-ice);
		--accent-wash: rgba(255, 255, 255, 0.06);
		--focus-ring: 0 0 0 2px var(--panel-ink), 0 0 0 4px var(--panel-ice);
	}

	.spread__story-inner {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
		max-width: 26rem;
	}

	.spread__corner {
		position: absolute;
		top: 0;
		right: 0;
		width: 57px;
		height: 57px;
		z-index: 2;
	}

	.spread__image {
		grid-area: image;
		position: relative;
		overflow: hidden;
		aspect-ratio: 4 / 3;
		background: var(--panel-slate);
	}

	.spread__tiles {
		grid-area: tiles;
		display: flex;
		flex-direction: column;
		background: var(--panel-slate);
	}

	.spread__quote {
		grid-area: quote;
		display: flex;
		align-items: flex-end;
		padding: 1.5rem;
		background:
			radial-gradient(120% 60% at 80% 0%, var(--panel-ice-soft), transparent 70%),
			var(--panel-ice);
		color: var(--panel-ice-text);
	}

	.spread__read {
		min-width: 0;
		padding: 3rem var(--gutter) 2rem;
		background: var(--bg);
	}

	/* — Shared typography for what pages put into the panels — */

	.spread :global(.story-kicker) {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--panel-ink-text);
	}

	.spread :global(.story-kicker)::before {
		content: '';
		display: block;
		width: 22px;
		height: 2px;
		margin-bottom: 0.6rem;
		background: currentColor;
	}

	.spread :global(.story-sub) {
		margin: 0.1rem 0 0;
		font-family: var(--font-display);
		font-style: italic;
		font-size: 0.95rem;
		color: var(--panel-ink-muted);
	}

	.spread :global(.story-headline) {
		margin: auto 0 0;
		padding-top: 2.5rem;
		font-family: var(--font-display);
		font-size: clamp(2rem, 3.2vw, 2.6rem);
		font-weight: 900;
		line-height: 1.05;
		color: var(--panel-ink-text);
	}

	.spread :global(.story-lede) {
		margin: 1.25rem 0 0;
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 700;
		line-height: 1.35;
		color: var(--panel-ink-text);
	}

	.spread :global(.story-text) {
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--panel-ink-muted);
	}

	.spread :global(.quote-text) {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-size: clamp(1.2rem, 1.65vw, 1.6rem);
		line-height: 1.3;
		color: var(--panel-ice-text);
	}

	/* The square in the story panel's corner: a hairline box with one glyph. */
	.spread :global(.corner-btn) {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		border: 1px solid rgba(255, 255, 255, 0.28);
		color: var(--panel-ink-text);
		text-decoration: none;
		transition:
			background-color 0.3s,
			border-color 0.3s;
	}

	.spread :global(.corner-btn svg) {
		transition: transform 0.5s var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.spread :global(.corner-btn:hover) {
			background: rgba(255, 255, 255, 0.08);
			border-color: rgba(255, 255, 255, 0.6);
		}
		.spread :global(.corner-btn:hover svg) {
			transform: rotate(90deg);
		}
	}

	.spread :global(.corner-btn:focus-visible) {
		outline: none;
		box-shadow: inset 0 0 0 2px var(--panel-ice);
	}

	/* The cover fills its panel and drifts in slowly while the pointer rests on it. */
	.spread :global(.image-fill) {
		position: absolute;
		inset: 0;
		display: block;
	}

	.spread :global(.image-fill img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 6s cubic-bezier(0.2, 0.6, 0.2, 1);
	}

	@media (hover: hover) and (pointer: fine) {
		.spread :global(.image-fill:hover img) {
			transform: scale(1.06);
		}
	}

	.spread :global(.image-fill:focus-visible) {
		outline: none;
		box-shadow: inset 0 0 0 3px var(--panel-ice);
	}

	@media (max-width: 599px) {
		.spread__visual {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'image'
				'tiles'
				'quote'
				'story';
		}
		.spread__tiles {
			flex-direction: row;
		}
		.spread__quote {
			min-height: 10rem;
		}
	}

	/* — Wide: the composition holds still beside the scrolling reading column. — */
	@media (min-width: 1100px) {
		.spread {
			grid-template-columns: minmax(0, 1fr) minmax(400px, 36%);
		}

		.spread__visual {
			position: sticky;
			top: 0;
			height: 100vh;
			height: 100dvh;
			grid-template-columns: 40px minmax(0, 1.3fr) minmax(0, 0.8fr) minmax(0, 0.8fr);
			grid-template-rows: 57px minmax(0, 1.15fr) minmax(0, 0.6fr) minmax(0, 0.6fr);
			grid-template-areas:
				'strip story slate ice'
				'strip story image image'
				'strip story tiles quote'
				'strip story tiles quote';
		}

		.spread__strip,
		.spread__band {
			display: block;
		}

		.spread__strip {
			grid-area: strip;
			background: var(--panel-ice-soft);
		}

		.spread__band--slate {
			grid-area: slate;
			background: var(--panel-slate);
		}

		.spread__band--ice {
			grid-area: ice;
			background: var(--panel-ice-soft);
		}

		.spread__story {
			padding: 2.75rem 2.25rem 2.25rem;
		}

		.spread__image {
			aspect-ratio: auto;
		}

		.spread__read {
			padding: 3.5rem clamp(2rem, 4vw, 3.75rem) 4rem;
			min-height: 100vh;
		}
	}
</style>
