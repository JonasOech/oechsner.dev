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
		<p class="outline__label">On this page</p>
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
	/* Marginalia, not a panel: a sticky list in the right margin, hung from a hairline.
	   It only exists where the margin track does (see the post route). */
	.outline {
		grid-column: 2;
		grid-row: 1;
		position: sticky;
		align-self: start;
		top: var(--s-6);
		margin-top: calc(var(--s-9) + 44px + var(--s-4));
		max-height: calc(100dvh - var(--s-7));
		display: none;
		flex-direction: column;
		font-family: var(--font-sans);
	}

	@media (min-width: 72em) {
		.outline {
			display: flex;
		}
	}

	.outline__head {
		flex: none;
		padding-bottom: var(--s-3);
	}

	.outline__label {
		font-size: 0.6875rem;
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 var(--s-3);
	}

	.outline__progress {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	.outline__track {
		flex: 1 1 auto;
		height: 1px;
		background: var(--line);
		overflow: hidden;
	}

	.outline__fill {
		height: 100%;
		background: var(--text);
		transition: width 120ms var(--ease-out);
	}

	.outline__readout {
		flex: none;
		font-size: 0.6875rem;
		font-variant-numeric: tabular-nums lining-nums;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.outline__scroll {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		scrollbar-width: thin;
	}

	.outline__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}

	.outline__item--sub {
		padding-left: var(--s-3);
	}

	.outline__link {
		position: relative;
		display: block;
		padding: 0.3rem 0 0.3rem var(--s-3);
		border-left: 1px solid var(--line);
		font-size: 0.8125rem;
		line-height: 1.4;
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.outline__item--sub .outline__link {
		font-size: 0.75rem;
	}

	.outline__link.is-active {
		color: var(--text);
		border-left-color: var(--text);
	}

	@media (hover: hover) and (pointer: fine) {
		.outline__link:not(.is-active):hover {
			color: var(--accent);
		}
	}

	.outline__link:active {
		color: var(--accent-dim);
	}

	.outline__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius);
	}

	.outline__foot {
		flex: none;
		padding-top: var(--s-3);
	}

	.outline__top {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		font-size: 0.75rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.outline__top svg {
		flex: none;
		width: 13px;
		height: 13px;
	}

	@media (hover: hover) and (pointer: fine) {
		.outline__top:hover {
			color: var(--accent);
		}
	}

	.outline__top:active {
		color: var(--accent-dim);
	}

	.outline__top:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius);
	}

	@media (prefers-reduced-motion: reduce) {
		.outline__fill,
		.outline__link,
		.outline__top {
			transition: none;
		}
	}
</style>
