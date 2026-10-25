<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { nav, site } from '$lib/data/site';

	let sentinel: HTMLElement;
	let scrolled = $state(false);

	/**
	 * `nav[0]` (Writing) is the site's root and stays on the bar at every width; the rest
	 * fold behind "More" once the row would otherwise break onto two lines.
	 */
	const [primary, ...collapsible] = nav;

	/**
	 * Below this the four labels no longer fit on one line — see DESIGN.md §9. Kept in `em`
	 * so it tracks the label widths under text-only zoom rather than the raw viewport, and
	 * duplicated in the stylesheet's media query: the two have to move together.
	 */
	const COLLAPSE_QUERY = '(max-width: 35em)';

	let moreOpen = $state(false);
	let moreEl: HTMLElement;
	let moreButton: HTMLButtonElement;

	/**
	 * Header scroll state via a 1px sentinel at the top of the document rather than a
	 * `scroll` listener — no per-frame work (DESIGN.md §7).
	 */
	$effect(() => {
		if (!sentinel || typeof IntersectionObserver === 'undefined') return;

		const observer = new IntersectionObserver(
			([entry]) => {
				scrolled = !entry.isIntersecting;
			},
			{ threshold: 0 }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});

	// Widening past the breakpoint puts the collapsed links back on the bar, so the
	// disclosure state they belonged to has to go with them.
	$effect(() => {
		const mq = window.matchMedia(COLLAPSE_QUERY);
		const sync = () => {
			if (!mq.matches) moreOpen = false;
		};
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	// Clicking the entry for the current page does not navigate, so the links close the
	// menu themselves as well.
	afterNavigate(() => {
		moreOpen = false;
	});

	$effect(() => {
		if (!moreOpen) return;
		const onPointerDown = (event: PointerEvent) => {
			if (!moreEl.contains(event.target as Node)) moreOpen = false;
		};
		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	});

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !moreOpen) return;
		moreOpen = false;
		moreButton.focus();
	}

	function onMoreFocusout(event: FocusEvent) {
		if (!moreEl.contains(event.relatedTarget as Node | null)) moreOpen = false;
	}

	function isCurrent(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}

	const moreHoldsCurrent = $derived(collapsible.some((item) => isCurrent(item.href)));
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div bind:this={sentinel} class="sentinel" aria-hidden="true"></div>

<header class="header" data-scrolled={scrolled}>
	<nav class="container nav" aria-label="Primary">
		<a class="nav__brand" href="/">{site.name}</a>

		<div class="nav__links">
			<a
				class="nav__link"
				href={primary.href}
				aria-current={isCurrent(primary.href) ? 'page' : undefined}
			>
				<span class="nav__num" aria-hidden="true">01</span>
				{primary.label}
			</a>

			<!-- `display: contents` above the breakpoint, so these links sit directly in the
			     nav row and only become a dropdown once the bar runs out of width. -->
			<div
				class="more"
				data-open={moreOpen}
				bind:this={moreEl}
				onfocusout={onMoreFocusout}
			>
				<button
					class="nav__link more__button"
					type="button"
					bind:this={moreButton}
					aria-expanded={moreOpen}
					aria-controls="nav-more"
					data-current={moreHoldsCurrent ? 'true' : undefined}
					onclick={() => (moreOpen = !moreOpen)}
				>
					More
					<svg class="more__chevron" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
						<path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
					</svg>
				</button>

				<div class="more__panel" id="nav-more">
					{#each collapsible as item, i (item.href)}
						<a
							class="nav__link"
							href={item.href}
							aria-current={isCurrent(item.href) ? 'page' : undefined}
							onclick={() => (moreOpen = false)}
						>
							<span class="nav__num" aria-hidden="true">0{i + 2}</span>
							{item.label}
						</a>
					{/each}
				</div>
			</div>
		</div>
	</nav>
</header>

<style>
	.sentinel {
		position: absolute;
		top: 0;
		left: 0;
		width: 1px;
		height: 1px;
		pointer-events: none;
	}

	/* A solid sheet with the page's one heavy rule on top and a hairline underneath.
	   The hairline only appears once the page has scrolled beneath it. */
	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg);
		border-top: 2px solid var(--text);
		border-bottom: 1px solid transparent;
		transition: border-color var(--dur-base) var(--ease-out);
	}

	.header[data-scrolled='true'] {
		border-bottom-color: var(--line-strong);
	}

	/* The bar is on the twelve-column grid: the name hangs in the first three columns,
	   the links start on the fourth. */
	.nav {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--col-gap);
		align-items: center;
		height: calc(var(--header-h) - 3px);
	}

	.nav__brand {
		grid-column: 1 / 4;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		padding-block: 0.5rem;
		justify-self: start;
	}

	.nav__links {
		grid-column: 4 / -1;
		display: flex;
		align-items: center;
		gap: var(--s-6);
	}

	.nav__link {
		display: inline-flex;
		align-items: baseline;
		gap: 0.45em;
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1;
		color: var(--text-secondary);
		text-decoration: none;
		white-space: nowrap;
		position: relative;
		padding: 0.5rem 0;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.nav__num {
		font-size: 0.6875rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
		transition: color var(--dur-fast) var(--ease-out);
	}

	.nav__link::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.1rem;
		height: 1px;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--dur-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--text);
		}
		.nav__link:hover .nav__num {
			color: var(--accent);
		}
		.nav__link:hover::after {
			transform: scaleX(1);
		}
	}

	.nav__link:active {
		color: var(--accent-dim);
	}

	.nav__link[aria-current='page'],
	.nav__link[data-current='true'] {
		color: var(--text);
	}

	.nav__link[aria-current='page'] .nav__num {
		color: var(--accent);
	}

	.nav__link[aria-current='page']::after {
		transform: scaleX(1);
	}

	.nav__brand:focus-visible,
	.nav__link:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	/* Wide: the wrapper and its panel dissolve, leaving the links as plain flex items. */
	.more,
	.more__panel {
		display: contents;
	}

	/* Two-class selectors throughout the disclosure, so the `pointer: coarse` block
	   further down cannot resurrect the button on a wide touch screen. */
	.nav .more__button {
		display: none;
		background: none;
		border: 0;
		cursor: pointer;
		align-items: center;
		gap: 0.3em;
	}

	.more__chevron {
		width: 0.75em;
		height: 0.75em;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform var(--dur-base) var(--ease-out);
	}

	.more[data-open='true'] .more__chevron {
		transform: rotate(180deg);
	}

	/* `em`, not `px`: this tracks the label widths, which are `rem`-sized, so text-only zoom
	   collapses the bar instead of overflowing it. Mirrored by COLLAPSE_QUERY above. */
	@media (max-width: 35em) {
		.nav {
			display: flex;
			flex-wrap: nowrap;
			justify-content: space-between;
		}

		.nav__links {
			gap: var(--s-5);
		}

		.nav .more {
			display: block;
			position: relative;
		}

		.nav .more__button {
			display: inline-flex;
		}

		/* A plain ruled sheet, flush to the right edge of the bar. */
		.nav .more__panel {
			display: grid;
			position: absolute;
			z-index: 1;
			top: calc(100% + var(--s-2));
			right: 0;
			min-width: 11rem;
			max-width: calc(100vw - 2 * var(--gutter));
			background: var(--bg);
			border: 1px solid var(--text);
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.875rem var(--s-4);
			border-bottom: 1px solid var(--line);
		}

		.more__panel .nav__link:last-child {
			border-bottom: 0;
		}

		/* The underline is a bar affordance; inside the panel the row itself is the target. */
		.more__panel .nav__link::after {
			content: none;
		}

		.more__panel .nav__link[aria-current='page'] {
			background: var(--surface);
		}
	}

	@media (pointer: coarse) {
		/* An explicit floor, not padding arithmetic — line-height is 1 here, so padding
		   alone lands at 36px and misses the 44px target. */
		.nav__link,
		.nav__brand {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
		}
	}
</style>
