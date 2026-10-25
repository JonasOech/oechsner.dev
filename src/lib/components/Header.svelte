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
	 * Below this the four labels no longer fit on one line — see DESIGN.md. Kept in `em`
	 * so it tracks the label widths under text-only zoom rather than the raw viewport, and
	 * duplicated in the stylesheet's media query: the two have to move together.
	 */
	const COLLAPSE_QUERY = '(max-width: 19em)';

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

<header class="masthead">
	<div class="container">
		<div class="masthead__title">
			<p class="masthead__dateline masthead__dateline--left">Bamberg &amp; Dublin</p>
			<a class="masthead__name" href="/" aria-label="{site.name}, home">{site.name}</a>
			<p class="masthead__dateline masthead__dateline--right">Est. {site.startYear}</p>
		</div>
		<nav class="nav" aria-label="Primary">
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
	</div>
</header>

<style>
	/* The masthead is a printed nameplate: dateline left, name centred, dateline right,
	   then one ruled strip of section links. It scrolls away with the page. */
	.masthead {
		position: relative;
		z-index: 5;
		padding-top: var(--s-5);
	}

	.masthead__title {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: baseline;
		gap: var(--s-4);
		padding-bottom: var(--s-3);
	}

	.masthead__name {
		font-family: var(--font-serif);
		font-size: clamp(1.5rem, 2.4vw, 1.875rem);
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: -0.005em;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		border-radius: 2px;
	}

	.masthead__name:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (hover: hover) and (pointer: fine) {
		.masthead__name:hover {
			color: var(--accent);
		}
	}

	.masthead__dateline {
		margin: 0;
		font-size: 0.9375rem;
		font-variant-caps: all-small-caps;
		letter-spacing: var(--caps-tracking);
		color: var(--text-muted);
	}

	.masthead__dateline--right {
		text-align: right;
		font-variant-numeric: tabular-nums lining-nums;
	}

	/* The ruled strip: hairlines above and below, spanning the content width. */
	.nav {
		display: flex;
		justify-content: center;
		gap: 2rem;
		border-block: 1px solid var(--line-strong);
		padding-block: 0.125rem;
	}

	.nav__link {
		font-family: var(--font-serif);
		font-size: 1.0625rem;
		font-weight: 500;
		font-variant-caps: all-small-caps;
		line-height: 1;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		text-decoration: none;
		white-space: nowrap;
		position: relative;
		padding: 0.625rem 0.125rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	/* The current section carries a single oxblood hairline; hover only shifts colour. */
	.nav__link::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.375rem;
		height: 1px;
		background: var(--accent);
		opacity: 0;
		transition: opacity var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--accent);
		}
	}

	.nav__link:active {
		color: var(--accent-dim);
	}

	.nav__link[aria-current='page'],
	.nav__link[data-current='true'] {
		color: var(--text);
	}

	.nav__link[aria-current='page']::after,
	.nav__link[data-current='true']::after {
		opacity: 1;
	}

	.nav__link:focus-visible {
		outline: none;
		border-radius: 2px;
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

	/* `em`, not `px`: this tracks the label widths, so text-only zoom collapses the bar
	   instead of overflowing it. Mirrored by COLLAPSE_QUERY above. */
	@media (max-width: 19em) {
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
			top: calc(100% + var(--s-2));
			left: 50%;
			transform: translateX(-50%);
			min-width: max-content;
			max-width: calc(100vw - 2 * var(--gutter));
			padding: var(--s-2);
			background: var(--bg);
			border: 1px solid var(--line-strong);
			border-radius: 2px;
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.625rem var(--s-3);
			text-align: center;
			justify-content: center;
		}

		.more__panel .nav__link::after {
			content: none;
		}
	}

	@media (max-width: 599px) {
		.masthead__dateline {
			display: none;
		}

		.masthead__title {
			grid-template-columns: minmax(0, 1fr);
			justify-items: center;
		}

		.nav {
			gap: 1.25rem;
		}
	}

	@media (pointer: coarse) {
		.nav__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding: 0 0.375rem;
		}

		.nav__link::after {
			bottom: 0.625rem;
		}
	}
</style>
