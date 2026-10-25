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
		<a class="brand" href="/" aria-label="{site.shortName}, home">
			<span class="brand__mark" aria-hidden="true"></span>
			{site.shortName}
		</a>

		<a
			class="nav__link"
			href={primary.href}
			aria-current={isCurrent(primary.href) ? 'page' : undefined}
		>
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

	/* The menu bar: a slim full-width strip, like the one above a native document window. */
	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--surface);
		border-bottom: 1px solid var(--line-strong);
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.25rem;
		height: var(--header-h);
		padding-block: 0;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-right: auto;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		padding: 0.25rem 0.25rem;
		border-radius: var(--radius);
	}

	/* A small blue square, the one place the accent is used as a fill. It is the document
	   icon in the title bar. */
	.brand__mark {
		width: 0.625rem;
		height: 0.75rem;
		background: var(--accent);
		border-radius: 1px;
	}

	.brand:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nav__link {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1;
		color: var(--text-secondary);
		text-decoration: none;
		white-space: nowrap;
		position: relative;
		padding: 0.4375rem 0.625rem;
		border-radius: var(--radius);
		transition:
			color var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--text);
			background: var(--surface-active);
		}
	}

	.nav__link:active {
		background: var(--surface-active);
	}

	.nav__link[aria-current='page'],
	.nav__link[data-current='true'] {
		color: var(--accent-dim);
		background: var(--accent-wash);
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
		/* The glyph rides above the letterspacing's trailing gap; nudge it back to centre. */
		margin-left: -0.11em;
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
		/* Scoped to the collapsed bar, where two items leave ~140px of slack at 320px. The
		   wide bar keeps `wrap`, so a future fifth entry degrades to a second row rather
		   than to horizontal overflow (DESIGN.md §9). */
		.nav {
			flex-wrap: nowrap;
		}

		.nav .more {
			display: block;
			position: relative;
		}

		.nav .more__button {
			display: inline-flex;
		}

		.nav .more__panel {
			display: grid;
			position: absolute;
			z-index: 1;
			top: calc(100% + var(--s-1));
			right: 0;
			min-width: 9rem;
			max-width: calc(100vw - 2 * var(--gutter));
			padding: var(--s-1);
			/* A menu is a small sheet: opaque white, hairline, the site's one shadow. */
			background: var(--sheet);
			border: 1px solid var(--line-strong);
			border-radius: var(--radius);
			box-shadow: var(--shadow-sheet);
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.625rem var(--s-3);
			text-align: left;
			justify-content: flex-start;
		}
	}

	@media (pointer: coarse) {
		/* An explicit floor, not padding arithmetic — line-height is 1 here, so padding
		   alone lands at 36px and misses the 44px target. */
		.nav__link {
			display: inline-flex;
			align-items: center;
			min-height: 40px;
			padding: 0 0.625rem;
		}
	}
</style>
