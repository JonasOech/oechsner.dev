<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { nav, site } from '$lib/data/site';

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

<header class="header">
	<nav class="container nav" aria-label="Primary">
		<!-- The masthead stamp. It points home like the Writing link does, but it is the
		     name of the zine, so it earns its own place at the left. -->
		<a class="nav__brand" href="/" aria-label="{site.shortName} — home">
			<span class="nav__brand-tape" aria-hidden="true"></span>
			{site.shortName}
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
						<path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="2" />
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
	/* A static masthead — not sticky. Zines do not follow you down the page; the footer
	   repeats the navigation at the other end. */
	.header {
		position: relative;
		z-index: 50;
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
		padding-block: var(--s-5) var(--s-4);
	}

	/* The zine's name, typed on a strip of tape. */
	.nav__brand {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0.35rem 0.9rem 0.3rem;
		font-family: var(--font-type);
		font-size: 1rem;
		letter-spacing: 0.06em;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		transform: rotate(-2deg);
		transition: transform var(--dur-fast) var(--ease-snap);
	}

	.nav__brand-tape {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: rgba(var(--accent-rgb), 0.75);
		clip-path: var(--tape-cut);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__brand:hover {
			transform: rotate(0deg) scale(1.04);
		}
	}

	.nav__brand:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nav__links {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		align-items: center;
		gap: var(--s-1) var(--s-3);
	}

	/* Each link is a little cut label; the current page is the one marked with highlighter. */
	.nav__link {
		font-family: var(--font-head);
		font-size: 1.0625rem;
		font-weight: 400;
		line-height: 1;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		position: relative;
		padding: 0.55rem 0.55rem 0.45rem;
		border: 0;
		background: none;
		transform: rotate(var(--tilt, 0deg));
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-snap);
	}

	.nav__links > .nav__link:nth-child(odd) {
		--tilt: -1.2deg;
	}

	.nav__links > .nav__link:nth-child(even),
	.more__panel .nav__link:nth-child(even) {
		--tilt: 1deg;
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			background: var(--text);
			color: var(--paper);
			transform: rotate(0deg);
		}
	}

	.nav__link:active {
		background: var(--text);
		color: var(--paper);
	}

	.nav__link[aria-current='page'],
	.nav__link[data-current='true'] {
		background-image: linear-gradient(
			100deg,
			transparent 0.1em,
			rgba(var(--accent-rgb), 0.85) 0.3em,
			rgba(var(--accent-rgb), 0.85) calc(100% - 0.2em),
			transparent 100%
		);
		background-size: 100% 70%;
		background-position: 0 70%;
		background-repeat: no-repeat;
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
		cursor: pointer;
		align-items: center;
		gap: 0.3em;
	}

	.more__chevron {
		width: 0.75em;
		height: 0.75em;
		stroke-linecap: square;
		transition: transform var(--dur-base) var(--ease-out);
	}

	.more[data-open='true'] .more__chevron {
		transform: rotate(180deg);
	}

	/* `em`, not `px`: this tracks the label widths, so text-only zoom collapses the bar
	   instead of overflowing it. Mirrored by COLLAPSE_QUERY above. */
	@media (max-width: 35em) {
		.nav {
			flex-wrap: nowrap;
		}

		.nav__links {
			flex-wrap: nowrap;
			gap: var(--s-1);
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
			top: calc(100% + var(--s-2));
			right: 0;
			min-width: max-content;
			max-width: calc(100vw - 2 * var(--gutter));
			padding: var(--s-2);
			background: var(--surface);
			border: var(--border);
			box-shadow: var(--shadow-3);
			transform: rotate(0.8deg);
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.7rem var(--s-3);
			text-align: center;
			justify-content: center;
		}
	}

	@media (max-width: 23em) {
		.nav__brand {
			font-size: 0.875rem;
			padding-inline: 0.6rem;
		}
	}

	@media (pointer: coarse) {
		.nav__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding: 0 0.6rem;
		}
	}
</style>
