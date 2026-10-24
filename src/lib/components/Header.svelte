<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { nav, site } from '$lib/data/site';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import WayfinderMark from '$lib/components/WayfinderMark.svelte';

	/**
	 * `nav[0]` (Writing) is the site's root and stays on the bar at every width; the rest
	 * fold behind "More" once the row would otherwise break onto two lines. Contact is not
	 * a nav item here: it is the pill on the right.
	 */
	const [primary, ...collapsible] = nav.filter((item) => item.href !== '/contact');

	/**
	 * Below this the three labels no longer fit on one line — see DESIGN.md §9. Kept in `em`
	 * so it tracks the label widths under text-only zoom rather than the raw viewport, and
	 * duplicated in the stylesheet's media query: the two have to move together.
	 */
	const COLLAPSE_QUERY = '(max-width: 22em)';

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
	<div class="container header__bar">
	<a class="brand" href="/" aria-label="{site.name}, home">
		<WayfinderMark size={26} />
		<span class="brand__name">{site.name}</span>
	</a>

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

	<div class="header__end">
		<a class="header__cta" href="/contact" aria-current={isCurrent('/contact') ? 'page' : undefined}>
			Get in touch
		</a>
		<ThemeToggle />
	</div>
	</div>
</header>

<style>
	/* After georgesiosi.com: not sticky, no bar. The brand on the left, a quiet row of
	   links in the middle, the one call to action as a copper pill on the right. */
	.header {
		position: relative;
		z-index: 50;
	}

	.header__bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: var(--s-4);
		padding-block: 28px 8px;
	}

	.brand {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		color: var(--text);
		text-decoration: none;
	}

	.brand :global(svg) {
		color: var(--accent);
	}

	.brand__name {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.brand:focus-visible,
	.header__cta:focus-visible {
		outline: none;
		border-radius: 999px;
		box-shadow: var(--focus-ring);
	}

	.header__end {
		justify-self: end;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.header__cta {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		padding: 0 18px;
		border-radius: 999px;
		background: var(--accent);
		color: var(--text-inverse);
		font-size: 0.85rem;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
		transition: background-color 0.2s;
	}

	@media (hover: hover) and (pointer: fine) {
		.header__cta:hover {
			background: var(--accent-dim);
		}
	}

	.nav {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
	}

	.nav__link {
		font-family: var(--font-sans);
		font-size: 0.92rem;
		font-weight: 400;
		line-height: 1;
		color: var(--text-secondary);
		text-decoration: none;
		white-space: nowrap;
		padding: 0.5rem 0.125rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--accent);
		}
	}

	.nav__link[aria-current='page'],
	.nav__link[data-current='true'] {
		color: var(--text);
		font-weight: 500;
	}

	.nav__link:focus-visible {
		outline: none;
		border-radius: 3px;
		box-shadow: var(--focus-ring);
	}

	/* Narrow: brand and switch share the top row, the links drop to a row of their own. */
	@media (max-width: 760px) {
		.header__bar {
			grid-template-columns: 1fr auto;
			row-gap: var(--s-2);
		}
		.nav {
			grid-row: 2;
			grid-column: 1 / -1;
			justify-content: flex-start;
		}
	}

	@media (max-width: 420px) {
		.header__cta {
			display: none;
		}
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
	@media (max-width: 22em) {
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
			top: calc(100% + var(--s-2));
			left: 50%;
			transform: translateX(-50%);
			min-width: max-content;
			max-width: calc(100vw - 2 * var(--gutter));
			padding: var(--s-2);
			/* Translucent, on the header's terms: same 12px blur cap, and a slightly heavier
			   tint than the bar's 0.78 so the labels keep their contrast over prose. */
			background: rgba(var(--surface-rgb), 0.82);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
			border: 1px solid var(--line);
			border-radius: 6px;
			box-shadow: var(--shadow-3);
		}

		/* Without backdrop-filter the tint alone would let text show through, so fall back
		   to the opaque surface. */
		@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
			.nav .more__panel {
				background: var(--surface);
			}
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.625rem var(--s-3);
			/* Grid blockifies the link; `justify-content` is the one that bites once the
			   coarse-pointer rule below turns it into a flex box. */
			text-align: center;
			justify-content: center;
		}
	}

	@media (pointer: coarse) {
		/* An explicit floor, not padding arithmetic — line-height is 1 here, so padding
		   alone lands at 36px and misses the 44px target. */
		.nav__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding: 0 0.5rem;
		}
	}
</style>
