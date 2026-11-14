<script lang="ts">
	import { untrack } from 'svelte';
	import type { Heading } from '$lib/posts';
	import { entryBoxes, followTarget } from '$lib/outline-follow';

	let { headings, activeId }: { headings: Heading[]; activeId: string } = $props();

	// A clicked entry lights at once and stays lit while the page glides to it, instead of
	// the highlight flicking through every section on the way. The hold ends once the page
	// has rested for REST_MS — a timer rather than `scrollend`, which not every Safari has.
	// `''` holds with nothing lit (Back to top).
	const REST_MS = 150;
	let heldId = $state<string | null>(null);
	let restTimer: ReturnType<typeof setTimeout> | undefined;

	/** The entry the panel shows as lit. Everything below uses this, never `activeId`. */
	const current = $derived(heldId ?? activeId);

	/** The page came to rest at its very end with a hold in place; see `release`. */
	let heldAtEnd = false;

	function release() {
		// At the very end of the page the last sections can be too short for their headings
		// ever to reach the reading line, so tracking would hand the highlight back to an
		// earlier entry. There the hold stays until the reader moves the page again.
		const end = document.documentElement.scrollHeight - window.innerHeight;
		if (window.scrollY >= end - 1) {
			heldAtEnd = true;
			return;
		}
		heldId = null;
	}

	function armRest() {
		clearTimeout(restTimer);
		restTimer = setTimeout(release, REST_MS);
	}

	function hold(id: string) {
		heldId = id;
		heldAtEnd = false;
		armRest();
	}

	// The list follows the reader: it keeps SCROLLOFF entries visible on each side of the lit
	// one (nvim's `scrolloff`, see $lib/outline-follow), resting while there is room and
	// moving just far enough when there is not. It moves with `scroller.scrollTo`, on the list
	// alone — never `scrollIntoView`, which scrolls every scrollable ancestor, the page
	// included, and would fight the reader's own scroll.
	const SCROLLOFF = 3;
	let nav: HTMLElement;
	let scroller: HTMLElement;
	/** Whether the list has been placed since load or since the last change of post. */
	let placed = false;

	// The list backs off while the reader is using the panel, and does not catch up when the
	// pause ends: it follows from the next section change.
	const BACK_OFF_MS = 3000;
	let lastManualScroll = -Infinity;

	function pausedNow(): boolean {
		return (
			// Hover-capable devices only, so the sticky :hover a tap leaves on a touch screen
			// does not pause following.
			(matchMedia('(hover: hover)').matches && nav.matches(':hover')) ||
			// Keyboard focus only: a mouse click focuses the link in Chrome, and :focus-within
			// would pause following for the rest of the read.
			nav.querySelector(':focus-visible') !== null ||
			performance.now() - lastManualScroll < BACK_OFF_MS
		);
	}

	$effect(() => {
		const handScrolled = () => (lastManualScroll = performance.now());
		// A press on the list itself, not on an entry, is a drag of its scrollbar; a press on
		// an entry is a click.
		const onPointerDown = (event: PointerEvent) => {
			if (event.target === scroller) handScrolled();
		};
		scroller.addEventListener('wheel', handScrolled, { passive: true });
		scroller.addEventListener('touchmove', handScrolled, { passive: true });
		scroller.addEventListener('pointerdown', onPointerDown, { passive: true });
		return () => {
			scroller.removeEventListener('wheel', handScrolled);
			scroller.removeEventListener('touchmove', handScrolled);
			scroller.removeEventListener('pointerdown', onPointerDown);
		};
	});

	function follow(id: string) {
		if (!scroller || id === '') return;
		// `placed` is left alone, so the first real placement still jumps.
		if (pausedNow()) return;
		const index = headings.findIndex((h) => h.id === id);
		if (index === -1) return;
		const items = scroller.querySelectorAll('.outline__list > li');
		const target = followTarget(entryBoxes(scroller, items), index, scroller, SCROLLOFF);
		// The first placement (a reload part-way down, a deep link) jumps: there is nothing
		// for the eye to follow yet. Reduced motion always jumps.
		const behavior =
			!placed || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
		placed = true;
		if (target !== null) scroller.scrollTo({ top: target, behavior });
	}

	// The instance survives client-side navigation between posts, so a new outline starts
	// from scratch: list at the top, nothing held, the next placement a jump. Declared before
	// the follow effect so it runs first.
	$effect(() => {
		void headings;
		untrack(() => {
			scroller?.scrollTo({ top: 0, behavior: 'instant' });
			placed = false;
			lastManualScroll = -Infinity;
			heldId = null;
			heldAtEnd = false;
			clearTimeout(restTimer);
		});
	});

	// Edge fade: whichever end of the list has more entries beyond it fades into the panel.
	// A sentinel at each end of the list, watched with the list as root, says when an end is
	// out of view — no scroll listener. Both start false, so the prerendered HTML shows no fade.
	let topEdge: HTMLElement;
	let bottomEdge: HTMLElement;
	let moreAbove = $state(false);
	let moreBelow = $state(false);

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.target === topEdge) moreAbove = !entry.isIntersecting;
					else if (entry.target === bottomEdge) moreBelow = !entry.isIntersecting;
				}
			},
			{ root: scroller }
		);
		observer.observe(topEdge);
		observer.observe(bottomEdge);
		return () => observer.disconnect();
	});

	// Re-runs only when the lit entry changes; a hold released onto the same id does not.
	$effect(() => {
		const id = current;
		untrack(() => follow(id));
	});

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
			// Every scroll event of a held glide pushes the release back, so the hold ends
			// REST_MS after the page stops — or, if it stopped at the very end, on the reader's
			// next move.
			if (heldAtEnd) {
				heldAtEnd = false;
				heldId = null;
			} else if (heldId !== null) armRest();
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(measure);
		}

		// Untracked: `measure` reads `progress` as well as writing it, and a tracked read would
		// re-run this effect on every scroll frame — re-counting the words and, through the
		// cleanup, cancelling a hold's release.
		untrack(measure);
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});

	// Teardown only: a pending release must not outlive the component.
	$effect(() => () => clearTimeout(restTimer));

	function backToTop(event: MouseEvent) {
		event.preventDefault();
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		hold('');
		// The native jump to #top would take focus off the link; preventing it leaves focus
		// there, and a mouse-focused link starts matching :focus-visible at the first key
		// press — which would pause following for the rest of the read.
		(event.currentTarget as HTMLElement).blur();
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

<nav class="outline" aria-label="On this page" bind:this={nav}>
	<div class="outline__head">
		<p class="outline__label">On this page</p>
		<div class="outline__progress">
			<div class="outline__track" role="presentation">
				<div class="outline__fill" style="width: {progress * 100}%"></div>
			</div>
			<span class="outline__readout">{readout}</span>
		</div>
	</div>

	<div class="outline__viewport" data-more-above={moreAbove} data-more-below={moreBelow}>
		<div class="outline__scroll" bind:this={scroller}>
			<div class="outline__edge" aria-hidden="true" bind:this={topEdge}></div>
			<ol class="outline__list">
				{#each headings as heading (heading.id)}
					{@const active = current === heading.id}
					<li class:outline__item--sub={heading.depth === 3}>
						<a
							class="outline__link"
							class:is-active={active}
							aria-current={active ? 'location' : undefined}
							href="#{heading.id}"
							onclick={() => hold(heading.id)}
						>
							<span class="outline__text">{heading.text}</span>
						</a>
					</li>
				{/each}
			</ol>
			<div class="outline__edge" aria-hidden="true" bind:this={bottomEdge}></div>
		</div>
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
		border: 1px solid var(--line);
		border-radius: 8px;
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
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 400;
		line-height: 1.3;
		letter-spacing: 0.24em;
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

	/* Takes the list's flex role in the panel, so the fades can sit over the scrolling list
	   without scrolling with it. */
	.outline__viewport {
		position: relative;
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.outline__viewport::before,
	.outline__viewport::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		height: var(--s-5);
		pointer-events: none;
		z-index: 1;
		opacity: 0;
		transition: opacity var(--dur-fast) var(--ease-out);
	}

	.outline__viewport::before {
		top: 0;
		background: linear-gradient(to bottom, var(--surface), rgba(var(--surface-rgb), 0));
	}

	.outline__viewport::after {
		bottom: 0;
		background: linear-gradient(to top, var(--surface), rgba(var(--surface-rgb), 0));
	}

	.outline__viewport[data-more-above='true']::before,
	.outline__viewport[data-more-below='true']::after {
		opacity: 1;
	}

	.outline__edge {
		height: 1px;
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
		border-radius: 5px;
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
		border-radius: 5px;
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
		.outline__top,
		.outline__viewport::before,
		.outline__viewport::after {
			transition: none;
		}
	}
</style>
