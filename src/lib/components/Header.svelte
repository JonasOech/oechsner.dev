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
	const COLLAPSE_QUERY = '(max-width: 21em)';

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
	<div class="container masthead__head">
		<p class="masthead__strap">
			<span>Writing &amp; portfolio</span>
			<span class="masthead__est">Est. {site.startYear}</span>
			<span>Bamberg · Dublin</span>
		</p>

		<a class="masthead__name" href="/">{site.name}</a>
		<p class="masthead__tagline">Notes on machine learning, statistics and distributed systems</p>
	</div>

	<nav class="container nav" aria-label="Primary">
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
	/* The masthead: a heavy rule, a small-caps strap line, the name set in the display
	   face (deliberately modest — the writing below outranks it, DESIGN.md §10), and the
	   navigation between two hairlines like the section strip of a broadsheet. It scrolls
	   away with the page; nothing sticks. */
	.masthead {
		position: relative;
		z-index: 50;
		border-top: 6px solid var(--rule);
		padding-top: var(--s-3);
	}

	.masthead__head {
		display: grid;
		justify-items: center;
		text-align: center;
	}

	.masthead__strap {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: baseline;
		width: 100%;
		margin: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.masthead__strap span:first-child {
		text-align: left;
	}

	.masthead__strap span:last-child {
		text-align: right;
	}

	.masthead__est {
		text-align: center;
	}

	.masthead__name {
		margin-top: var(--s-3);
		font-family: var(--font-display);
		font-size: clamp(1.625rem, 4.4vw, 2.5rem);
		font-weight: 800;
		font-style: italic;
		line-height: 1.1;
		letter-spacing: -0.02em;
		color: var(--text);
		text-decoration: none;
		border-radius: 2px;
	}

	.masthead__name:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.masthead__tagline {
		margin: var(--s-1) 0 var(--s-4);
		font-size: 0.9375rem;
		font-style: italic;
		line-height: 1.4;
		color: var(--text-secondary);
		text-wrap: balance;
	}

	.nav {
		display: flex;
		justify-content: center;
		gap: 2rem;
		padding-block: 0;
		/* Hairlines run the width of the page, not of the container. */
		border-top: 1px solid var(--rule);
		border-bottom: 1px solid var(--rule);
		width: calc(100% - 2 * var(--gutter));
		max-width: calc(var(--container) - 2 * var(--gutter));
		padding-inline: 0;
	}

	.nav__link {
		font-family: var(--font-text);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--text-secondary);
		text-decoration: none;
		white-space: nowrap;
		position: relative;
		padding: 0.9rem 0.125rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	/* The current page is marked by an ink bar sitting on the lower hairline. */
	.nav__link::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 3px;
		background: var(--accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--dur-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
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
		margin-left: -0.11em;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform var(--dur-base) var(--ease-out);
	}

	.more[data-open='true'] .more__chevron {
		transform: rotate(180deg);
	}

	@media (max-width: 40em) {
		.nav {
			gap: 0.6rem;
			justify-content: space-between;
		}
		.nav__link {
			letter-spacing: 0.1em;
			font-size: 0.6875rem;
		}
		.masthead__strap span:last-child {
			display: none;
		}
		.masthead__strap {
			grid-template-columns: 1fr auto;
		}
	}

	/* `em`, not `px`: this tracks the label widths, which are `rem`-sized, so text-only zoom
	   collapses the bar instead of overflowing it. Mirrored by COLLAPSE_QUERY above. */
	@media (max-width: 21em) {
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
			top: 100%;
			left: 50%;
			transform: translateX(-50%);
			min-width: max-content;
			max-width: calc(100vw - 2 * var(--gutter));
			padding: var(--s-2);
			background: var(--bg);
			border: 1px solid var(--rule);
			box-shadow: var(--shadow-3);
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.75rem var(--s-3);
			text-align: center;
			justify-content: center;
		}

		.more__panel .nav__link::after {
			content: none;
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
