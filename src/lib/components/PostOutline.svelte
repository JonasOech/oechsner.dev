<script lang="ts">
	import type { Heading } from '$lib/posts';

	let { headings, activeId }: { headings: Heading[]; activeId: string } = $props();

	// Overall progress through the article body, 0–1. Driven by a passive, rAF-throttled
	// scroll listener rather than the post page's IntersectionObserver — that one only knows
	// which heading was last passed, not how far through the whole piece the reader is.
	let progress = $state(0);
	let minutesLeft = $state<number | null>(null);

	$effect(() => {
		const body = document.querySelector<HTMLElement>('.post__body');

		// Word count is read once — it does not change while the reader scrolls — and the
		// ~230 wpm estimate is refined against remaining progress on every tick.
		const totalWords = body
			? (body.textContent ?? '').trim().split(/\s+/).filter(Boolean).length
			: 0;

		let ticking = false;

		function measure() {
			ticking = false;
			if (!body) return;
			const rect = body.getBoundingClientRect();
			const viewportTop = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
			const total = rect.height - (window.innerHeight - viewportTop);
			const read = total > 0 ? (viewportTop - rect.top) / total : 0;
			progress = Math.min(1, Math.max(0, read));
			minutesLeft = totalWords > 0 ? Math.max(0, Math.ceil(((1 - progress) * totalWords) / 230)) : null;
		}

		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(measure);
		}

		measure();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});

	function backToTop(event: MouseEvent) {
		event.preventDefault();
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
	}

	const readout = $derived(
		progress >= 0.995
			? 'Finished'
			: minutesLeft !== null
				? minutesLeft < 1
					? '<1 min left'
					: `${minutesLeft} min left`
				: `${Math.round(progress * 100)}%`
	);
</script>

<nav class="outline" aria-label="On this page">
	<div class="outline__head">
		<p class="outline__label"><span>On this page</span></p>
		<div class="outline__progress">
			<div class="outline__track" role="presentation">
				<div class="outline__fill" style="width: {progress * 100}%"></div>
			</div>
			<span class="outline__readout">{readout}</span>
		</div>
	</div>

	<div class="outline__scroll">
		<ol class="outline__list">
			{#each headings as heading (heading.id)}
				{@const active = activeId === heading.id}
				<li class:outline__item--sub={heading.depth === 3}>
					<a
						class="outline__link"
						class:is-active={active}
						aria-current={active ? 'location' : undefined}
						href="#{heading.id}"
					>
						<span class="outline__text">{heading.text}</span>
					</a>
				</li>
			{/each}
		</ol>
	</div>

	<div class="outline__foot">
		<a class="outline__top" href="#top" onclick={backToTop}>
			<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
				<path d="M8 13V3" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M3.5 7.5 8 3l4.5 4.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			Back to top
		</a>
	</div>
</nav>

<style>
	/* The outline is a small palette window: title bar, a progress gauge, the contents as a
	   list, a Back-to-top row. Sticky in the article's row, in the narrow flanking track. */
	.outline {
		grid-column: 1;
		grid-row: 1;
		position: sticky;
		align-self: start;
		top: calc(var(--header-h) + var(--s-5));
		margin-top: 0;
		max-height: calc(100dvh - var(--header-h) - var(--s-7));
		display: flex;
		flex-direction: column;
		background: var(--paper);
		border: 2px solid var(--ink);
		box-shadow: var(--shadow-3);
		overflow: hidden;
	}

	@media (max-width: 1099px) {
		.outline {
			display: none;
		}
	}

	.outline__head {
		flex: none;
	}

	.outline__label {
		position: relative;
		display: grid;
		place-items: center;
		height: var(--bar-h);
		margin: 0;
		border-bottom: 2px solid var(--ink);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		color: var(--ink);
		white-space: nowrap;
	}

	.outline__label::before {
		content: '';
		position: absolute;
		inset: 0.3rem 0.4rem;
		background: var(--stripes);
	}

	.outline__label span {
		position: relative;
		padding: 0 0.5rem;
		background: var(--paper);
	}

	.outline__progress {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding: var(--s-3) var(--s-3) var(--s-2);
	}

	.outline__track {
		flex: 1 1 auto;
		height: 0.625rem;
		border: 2px solid var(--ink);
		background: var(--paper);
		overflow: hidden;
	}

	.outline__fill {
		height: 100%;
		background: var(--ink);
	}

	.outline__readout {
		flex: none;
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.outline__scroll {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		padding: 0 0 var(--s-2);
		scrollbar-width: thin;
		scrollbar-color: var(--ink) var(--paper);
	}

	.outline__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}

	.outline__item--sub {
		padding-left: var(--s-4);
	}

	/* The selected row inverts, as a selected item does in a Finder list. */
	.outline__link {
		position: relative;
		display: block;
		padding: 0.4rem var(--s-3);
		font-size: 0.9375rem;
		line-height: 1.35;
		color: var(--text);
		text-decoration: none;
	}

	.outline__item--sub .outline__link {
		font-size: 0.875rem;
		padding-top: 0.32rem;
		padding-bottom: 0.32rem;
	}

	.outline__link.is-active {
		background: var(--ink);
		color: var(--paper);
	}

	@media (hover: hover) and (pointer: fine) {
		.outline__link:not(.is-active):hover {
			background: var(--surface-hover);
		}
	}

	.outline__link:active {
		background: var(--ink);
		color: var(--paper);
	}

	.outline__link:focus-visible {
		outline: 2px dotted var(--ink);
		outline-offset: -4px;
	}

	.outline__link.is-active:focus-visible {
		outline-color: var(--paper);
	}

	.outline__foot {
		flex: none;
		border-top: 2px solid var(--ink);
		background: var(--surface);
	}

	.outline__top {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		padding: 0.5rem var(--s-3);
		font-family: var(--font-display);
		font-size: 0.9375rem;
		color: var(--ink);
		text-decoration: none;
	}

	.outline__top svg {
		flex: none;
		width: 15px;
		height: 15px;
	}

	@media (hover: hover) and (pointer: fine) {
		.outline__top:hover {
			background: var(--ink);
			color: var(--paper);
		}
	}

	.outline__top:active {
		background: var(--ink);
		color: var(--paper);
	}

	.outline__top:focus-visible {
		outline: 2px dotted var(--ink);
		outline-offset: -4px;
	}
</style>
