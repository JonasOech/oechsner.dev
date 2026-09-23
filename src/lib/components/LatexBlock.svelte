<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * The plate a display formula sits on. Posts never write this tag themselves: the
	 * `latexBlocks` remark plugin in svelte.config.js wraps every `$$…$$` in one and
	 * injects the import, so a post stays plain markdown that Obsidian still renders.
	 *
	 * The children are the KaTeX output (already rendered to static HTML at build time)
	 * and, when the author wrote one, the note's `<figcaption>` after it. The component
	 * adds only what markup alone cannot: a scroll box that keeps a wide equation off the
	 * page's own scrollbar, and a maximise button for the ones that are wide *and* dense.
	 *
	 * Maximising moves no DOM and renders nothing twice — the same figure is promoted to a
	 * fixed overlay — so the equation keeps its one copy of MathML and the button keeps
	 * focus across the toggle, which is what lets Escape hand the reader back where they
	 * were.
	 */
	let { children }: { children: Snippet } = $props();

	let expanded = $state(false);
	let figure: HTMLElement;

	$effect(() => {
		if (!expanded) return;

		// `.container` is `position: relative; z-index: 1` (app.css), so everything inside a
		// page's column — this overlay included — is stacked as one unit *below* the sticky
		// header's z-index 50. No z-index here can climb out of that, so the column itself is
		// lifted for as long as a formula is maximised, and put back the moment it is not.
		const stack = figure.closest<HTMLElement>('.container');
		const stackZ = stack?.style.zIndex ?? '';
		if (stack) stack.style.zIndex = '300';

		// Nothing behind the overlay should scroll either: the pointer is over the backdrop,
		// and a wheel there would otherwise move the article the reader is coming back to.
		const bodyOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			if (stack) stack.style.zIndex = stackZ;
			document.body.style.overflow = bodyOverflow;
		};
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (expanded && event.key === 'Escape') expanded = false;
	}}
/>

{#if expanded}
	<!-- Dismiss-on-click, not a control in its own right: the button beside the formula
	     says the same thing to the keyboard, so this one stays out of the tab order. -->
	<button
		class="latex__backdrop"
		type="button"
		tabindex="-1"
		aria-hidden="true"
		onclick={() => (expanded = false)}
	></button>
{/if}

<figure class="latex" class:latex--max={expanded} bind:this={figure}>
	<!-- First child, so the `figcaption` the plugin appends is still the figure's last. -->
	<button
		class="latex__zoom"
		type="button"
		aria-expanded={expanded}
		title={expanded ? 'Close' : 'Maximise'}
		aria-label={expanded ? 'Close the maximised formula' : 'Maximise the formula'}
		onclick={() => (expanded = !expanded)}
	>
		<Icon name={expanded ? 'minimize' : 'maximize'} />
	</button>

	{@render children()}
</figure>

<style>
	/* The same plate the interactive figures use (app.css, `.prose .widget`) — an equation
	   is one more figure in the column, not a new kind of surface. */
	.latex {
		position: relative;
		margin: var(--s-6) 0;
		padding: var(--s-5);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 10px;
	}

	/* KaTeX's display block already scrolls sideways under app.css (`.prose .katex-display`).
	   On a plate it owns both axes, so a tall `aligned` environment is capped as well and the
	   page never grows a screen-high formula. */
	.latex :global(.katex-display) {
		overflow: auto;
		overscroll-behavior: contain;
		max-height: min(60vh, 24rem);
		/* Its 1em block margins are the plate's padding's job. */
		margin: 0;
	}

	/* A note that fits on one line is a caption and sits under the middle of the formula; one
	   that does not is a paragraph and reads as one. Shrink-wrapping does both: the box is as
	   wide as the text until the text is wider than the plate, and auto margins only have
	   slack to centre in the first case. The same trick app.css plays on `.katex-display`. */
	.latex :global(.latex-note) {
		width: fit-content;
		max-width: 100%;
		margin-inline: auto;
	}

	/* Over the corner rather than in the flow, so the plate keeps the symmetric padding the
	   centring below depends on. A formula wide enough to scroll passes under it; the solid
	   fill and the hairline are what keep the button legible when it does. */
	.latex__zoom {
		position: absolute;
		top: var(--s-3);
		right: var(--s-3);
		z-index: 1;
		box-shadow: var(--shadow-1);
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--surface-active);
		color: var(--text-muted);
		cursor: pointer;
		transition:
			color var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.latex__zoom:hover {
			background: var(--surface-hover);
			border-color: var(--line-strong);
			color: var(--text);
		}
	}

	.latex__zoom:active {
		background: var(--surface-active);
		color: var(--text-pressed);
	}

	.latex__zoom:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* — Maximised: the figure itself is promoted, so nothing is duplicated — */

	.latex--max {
		position: fixed;
		inset: var(--s-4);
		z-index: 200;
		margin: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: auto;
		box-shadow: var(--shadow-4);
		/* The whole point of maximising: KaTeX measures in em, so the formula grows with
		   the plate instead of merely gaining white space around it. */
		font-size: clamp(1.125rem, 3vw, 2rem);
	}

	.latex--max :global(.katex-display) {
		max-height: none;
	}

	.latex__backdrop {
		position: fixed;
		inset: 0;
		z-index: 190;
		width: 100%;
		padding: 0;
		border: 0;
		background: rgba(var(--bg-deep-rgb), 0.72);
		backdrop-filter: blur(3px);
		cursor: zoom-out;
	}

	@media (max-width: 767px) {
		.latex {
			padding: var(--s-4);
		}

		.latex--max {
			inset: var(--s-2);
			padding: var(--s-4);
		}
	}
</style>
