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

	// The numbers the prose's CSS counters give the same headings (app.css, `.prose h2` / `h3`).
	const numbered = $derived.by(() => {
		let sec = 0;
		let sub = 0;
		return headings.map((heading) => {
			if (heading.depth === 3) {
				sub += 1;
				return { ...heading, num: `${sec}.${sub}` };
			}
			sec += 1;
			sub = 0;
			return { ...heading, num: `${sec}` };
		});
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
		<p class="outline__label">Contents</p>
		<div class="outline__progress">
			<div class="outline__track" role="presentation">
				<div class="outline__fill" style="width: {progress * 100}%"></div>
			</div>
			<span class="outline__readout">{readout}</span>
		</div>
	</div>

	<div class="outline__scroll">
		<ol class="outline__list">
			{#each numbered as heading (heading.id)}
				{@const active = activeId === heading.id}
				<li class:outline__item--sub={heading.depth === 3}>
					<a
						class="outline__link"
						class:is-active={active}
						aria-current={active ? 'location' : undefined}
						href="#{heading.id}"
					>
						<span class="outline__num">{heading.num}</span>
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
	/* The table of contents, set in the margin: no panel, a hairline at its left edge and
	   the section numbers the prose uses. Sticky beside the article. */
	.outline {
		grid-column: 1;
		grid-row: 1;
		position: sticky;
		align-self: start;
		top: calc(var(--header-h) + var(--s-5));
		margin-top: var(--s-9);
		max-height: calc(100dvh - var(--header-h) - var(--s-7));
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--line);
		padding-left: var(--s-3);
	}

	@media (max-width: 1099px) {
		.outline {
			display: none;
		}
	}

	.outline__head {
		flex: none;
		padding-bottom: var(--s-2);
	}

	.outline__label {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.3;
		font-variant-caps: all-small-caps;
		letter-spacing: 0.1em;
		color: var(--text);
		margin: 0 0 var(--s-2);
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
		background: var(--accent);
		transition: width 120ms var(--ease-out);
	}

	.outline__readout {
		flex: none;
		font-size: 0.875rem;
		font-variant-numeric: lining-nums tabular-nums;
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
		gap: 2px;
	}

	.outline__item--sub {
		padding-left: var(--s-4);
	}

	.outline__link {
		position: relative;
		display: grid;
		grid-template-columns: 1.75rem minmax(0, 1fr);
		padding: 0.2rem 0;
		font-size: 0.9375rem;
		line-height: 1.35;
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.outline__item--sub .outline__link {
		grid-template-columns: 2.25rem minmax(0, 1fr);
	}

	.outline__num {
		font-variant-numeric: lining-nums tabular-nums;
	}

	/* The section the reader is in: ink, bold, and a bar on the hairline. */
	.outline__link::before {
		content: '';
		position: absolute;
		left: calc(var(--s-3) * -1 - 1px);
		top: 3px;
		bottom: 3px;
		width: 2px;
		background: var(--accent);
		opacity: 0;
		transition: opacity var(--dur-fast) var(--ease-out);
	}

	.outline__item--sub .outline__link::before {
		left: calc((var(--s-3) + var(--s-4)) * -1 - 1px);
	}

	.outline__link.is-active {
		color: var(--text);
		font-weight: 600;
	}

	.outline__link.is-active::before {
		opacity: 1;
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
	}

	.outline__foot {
		flex: none;
		padding-top: var(--s-2);
	}

	.outline__top {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		padding: 0.4rem 0;
		font-size: 0.9375rem;
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.outline__top svg {
		flex: none;
		width: 15px;
		height: 15px;
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
