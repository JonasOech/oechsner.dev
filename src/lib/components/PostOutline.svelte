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
	/* The outline as a contained object rather than a bare list floating in the track:
	   a bordered panel, sticky in the article's row, bled slightly toward the page edge
	   so its padding does not eat further into the already-narrow 180px track. */
	.outline {
		grid-column: 1;
		grid-row: 1;
		position: sticky;
		align-self: start;
		top: calc(var(--header-h) + var(--s-5));
		margin-top: var(--s-9);
		margin-left: -0.75rem;
		width: calc(100% + 0.75rem);
		max-height: calc(100dvh - var(--header-h) - var(--s-7));
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border: 0;
		border-radius: 0;
		box-shadow: var(--shadow-inset);
		overflow: hidden;
	}

	@media (max-width: 1099px) {
		.outline {
			display: none;
		}
	}

	.outline__head {
		flex: none;
		padding: var(--s-4) var(--s-4) var(--s-3);
	}

	.outline__label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 400;
		line-height: 1.3;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 var(--s-3);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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
		border-radius: 1px;
		overflow: hidden;
	}

	.outline__fill {
		height: 100%;
		background: var(--accent);
		border-radius: 1px;
		transition: width 120ms var(--ease-out);
	}

	.outline__readout {
		flex: none;
		font-size: 0.6875rem;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.outline__scroll {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		padding: 0 var(--s-2) var(--s-2);
		scrollbar-width: thin;
	}

	.outline__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 1px;
	}

	.outline__item--sub {
		padding-left: var(--s-4);
	}

	/* The lit-key row: a full-width hit area rather than a bare underlined link, so the
	   active heading reads as a switched-on panel segment, not just coloured text. */
	.outline__link {
		position: relative;
		display: block;
		padding: 0.4rem var(--s-3) 0.4rem calc(var(--s-3) + 2px);
		border-radius: 0;
		font-size: 0.8125rem;
		line-height: 1.35;
		color: var(--text-muted);
		text-decoration: none;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.outline__item--sub .outline__link {
		font-size: 0.75rem;
		padding-top: 0.32rem;
		padding-bottom: 0.32rem;
	}

	.outline__link::before {
		content: '';
		position: absolute;
		left: 0;
		top: 3px;
		bottom: 3px;
		width: 2px;
		border-radius: 1px;
		background: var(--accent);
		transform: scaleY(0);
		transition: transform var(--dur-base) var(--ease-out);
	}

	.outline__link.is-active {
		background: var(--accent-wash);
		color: var(--text);
	}

	.outline__link.is-active::before {
		transform: scaleY(1);
	}

	@media (hover: hover) and (pointer: fine) {
		.outline__link:not(.is-active):hover {
			background: var(--surface-hover);
			color: var(--text);
		}
	}

	.outline__link:active {
		color: var(--text-secondary);
	}

	.outline__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.outline__foot {
		flex: none;
		border-top: 1px solid var(--line);
		padding: var(--s-2);
	}

	.outline__top {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		padding: 0.5rem var(--s-2);
		border-radius: 0;
		font-size: 0.75rem;
		color: var(--text-muted);
		text-decoration: none;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.outline__top svg {
		flex: none;
		width: 15px;
		height: 15px;
	}

	@media (hover: hover) and (pointer: fine) {
		.outline__top:hover {
			background: var(--surface-hover);
			color: var(--text);
		}
	}

	.outline__top:active {
		color: var(--text-secondary);
	}

	.outline__top:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (prefers-reduced-motion: reduce) {
		.outline__fill,
		.outline__link,
		.outline__link::before,
		.outline__top {
			transition: none;
		}
	}
</style>
