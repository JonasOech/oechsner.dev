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
	 * Below this the brand and four labels no longer fit on one line — see DESIGN.md §9.
	 * Kept in `em` so it tracks the label widths under text-only zoom rather than the raw
	 * viewport, and duplicated in the stylesheet's media query: the two have to move together.
	 */
	const COLLAPSE_QUERY = '(max-width: 40em)';

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
		<a class="brand" href="/">
			<span class="brand__mark" aria-hidden="true"></span>
			{site.name}
		</a>

		<div class="nav__links">
			<a
				class="nav__link"
				href={primary.href}
				aria-current={isCurrent(primary.href) ? 'page' : undefined}
			>
				{primary.label}
			</a>

			<!-- `display: contents` above the breakpoint, so these links sit directly in the
			     nav row and only become a dropdown once the bar runs out of width. -->
			<div class="more" data-open={moreOpen} bind:this={moreEl} onfocusout={onMoreFocusout}>
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
					{#each collapsible as item (item.href)}
						<a
							class="nav__link"
							href={item.href}
							aria-current={isCurrent(item.href) ? 'page' : undefined}
							onclick={() => (moreOpen = false)}
						>
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

	/* A solid white bar. Its rule is the only thing that changes on scroll: a hairline
	   at rest, full black once the page has moved. */
	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg);
		border-bottom: 1px solid var(--line);
		transition: border-color var(--dur-base) var(--ease-out);
	}

	.header[data-scrolled='true'] {
		border-bottom-color: var(--line-strong);
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-5);
		min-height: calc(var(--header-h) - 1px);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		font-size: 0.9375rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		min-height: 44px;
	}

	/* The signal-red square: the site's one mark. */
	.brand__mark {
		width: 0.75rem;
		height: 0.75rem;
		background: var(--accent);
		flex: none;
	}

	@media (hover: hover) and (pointer: fine) {
		.brand:hover {
			color: var(--accent);
		}
	}

	.brand:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nav__links {
		display: flex;
		align-items: center;
		gap: 1.75rem;
	}

	.nav__link {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		font-weight: 600;
		line-height: 1;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		position: relative;
		padding: 0.5rem 0;
		transition: color var(--dur-fast) var(--ease-out);
	}

	/* A 2px red bar: always drawn under the current page, drawn on hover elsewhere. */
	.nav__link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 2px;
		background: var(--accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--dur-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover::after {
			transform: scaleX(1);
		}
	}

	.nav__link:active {
		color: var(--accent);
	}

	.nav__link[aria-current='page']::after,
	.nav__link[data-current='true']::after {
		transform: scaleX(1);
	}

	.nav__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* Wide: the wrapper and its panel dissolve, leaving the links as plain flex items. */
	.more,
	.more__panel {
		display: contents;
	}

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
		stroke-linecap: square;
		stroke-linejoin: miter;
		transition: transform var(--dur-base) var(--ease-out);
	}

	.more[data-open='true'] .more__chevron {
		transform: rotate(180deg);
	}

	/* `em`, not `px`: tracks the label widths so text-only zoom collapses the bar instead
	   of overflowing it. Mirrored by COLLAPSE_QUERY above. */
	@media (max-width: 40em) {
		.nav {
			flex-wrap: nowrap;
			gap: var(--s-3);
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

		/* A white box with a black frame, hung off the right edge. */
		.nav .more__panel {
			display: grid;
			position: absolute;
			z-index: 1;
			top: calc(100% + var(--s-3));
			right: 0;
			min-width: 11rem;
			max-width: calc(100vw - 2 * var(--gutter));
			background: var(--bg);
			border: 2px solid var(--line-strong);
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.9375rem var(--s-4);
			border-top: 1px solid var(--line);
		}

		.more__panel .nav__link:first-child {
			border-top: 0;
		}

		/* Inside the panel the marker is a red bar on the row's left edge. */
		.more__panel .nav__link::after {
			width: 4px;
			height: 100%;
			bottom: auto;
			top: 0;
		}
	}

	@media (pointer: coarse) {
		.nav__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding-block: 0;
		}
	}
</style>
