<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { nav } from '$lib/data/site';

	let sentinel: HTMLElement;
	let scrolled = $state(false);

	/**
	 * `nav[0]` (Writing) is the site's root and stays on the bar at every width; the rest
	 * fold behind "More" once the row would otherwise break onto two lines.
	 */
	const [primary, ...collapsible] = nav;

	/**
	 * Below this the tabs no longer fit on one line — see DESIGN.md §9. Kept in `em`
	 * so it tracks the label widths under text-only zoom rather than the raw viewport, and
	 * duplicated in the stylesheet's media query: the two have to move together.
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
		<span class="brand" aria-hidden="true">oechsner.dev</span>

		<div class="tabs">
			<a
				class="nav__link"
				href={primary.href}
				aria-current={isCurrent(primary.href) ? 'page' : undefined}
			>
				{primary.label}
			</a>

			<!-- `display: contents` above the breakpoint, so these links sit directly in the
			     tab row and only become a dropdown once the bar runs out of width. -->
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

	/* The index bar: tabs hang from one baseline rule, like the cut edges of a bound
	   notebook's index. Solid paper; no blur, no shadow. */
	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg);
		border-bottom: 1px solid var(--line-strong);
	}

	.nav {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--s-4);
		padding-top: var(--s-3);
	}

	.brand {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-bottom: 0.7rem;
		white-space: nowrap;
	}

	.tabs {
		display: flex;
		align-items: flex-end;
		gap: 0.25rem;
		/* The baseline rule runs under the tabs; the current one sits over it. */
		margin-bottom: -1px;
	}

	.nav__link {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
		text-decoration: none;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
		padding: 0 0.875rem;
		background: var(--surface-hover);
		border: 1px solid var(--line-strong);
		border-radius: 3px 3px 0 0;
		transition:
			color var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--accent);
			background: var(--bg);
		}
	}

	.nav__link:active {
		color: var(--text);
	}

	/* The open page: paper-coloured, joined to the leaf below, topped with a pen stroke. */
	.nav__link[aria-current='page'],
	.nav__link[data-current='true'] {
		color: var(--text);
		background: var(--bg);
		border-bottom-color: var(--bg);
		box-shadow: inset 0 2px 0 var(--accent);
	}

	.nav__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		position: relative;
		z-index: 1;
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

	/* `em`, not `px`, so text-only zoom collapses the bar instead of overflowing it.
	   Mirrored by COLLAPSE_QUERY above. */
	@media (max-width: 40em) {
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
			top: calc(100% + 1px);
			right: 0;
			min-width: max-content;
			max-width: calc(100vw - 2 * var(--gutter));
			padding: var(--s-1);
			background: var(--bg);
			border: 1px solid var(--line-strong);
			border-radius: 2px;
			box-shadow: var(--shadow-2);
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		/* Inside the dropdown the links are plain rows, not tabs. */
		.more__panel .nav__link {
			background: transparent;
			border: 0;
			border-radius: 2px;
			min-height: 2.5rem;
			box-shadow: none;
			justify-content: flex-start;
		}

		.more__panel .nav__link[aria-current='page'] {
			color: var(--accent);
			background: var(--accent-wash);
		}
	}

	@media (max-width: 26em) {
		.brand {
			display: none;
		}

		.nav {
			justify-content: flex-end;
		}
	}

	@media (pointer: coarse) {
		/* An explicit 44px floor on the tab. */
		.nav__link {
			min-height: 44px;
		}
	}
</style>
