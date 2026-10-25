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

	/* The bar itself is invisible and click-through; only the pill inside it is a surface. */
	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		padding: var(--s-3) var(--gutter) 0;
		pointer-events: none;
	}

	.nav {
		pointer-events: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-1);
		width: fit-content;
		max-width: 100%;
		margin-inline: auto;
		padding: var(--s-1);
		border-radius: var(--r-pill);
		background: var(--glass);
		border: 1px solid var(--glass-border);
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(150%);
		backdrop-filter: blur(var(--glass-blur)) saturate(150%);
		box-shadow: var(--shadow-glass);
		transition:
			background-color var(--dur-base) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out);
	}

	/* Once the page has scrolled under it the pill takes a darker tint, so the labels keep
	   their contrast over whatever prose or card is passing behind. */
	.header[data-scrolled='true'] .nav {
		background: var(--glass-tint);
		box-shadow: var(--shadow-3), inset 0 1px 0 rgba(var(--text-bright-rgb), 0.16);
	}

	@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
		.nav {
			background: var(--surface);
		}
	}

	.nav__link {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 0.03em;
		color: var(--text-secondary);
		text-decoration: none;
		white-space: nowrap;
		position: relative;
		padding: 0.8rem 1.15rem;
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		transition:
			color var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--text);
			background: var(--glass-hover);
		}
	}

	.nav__link:active {
		background: var(--glass-strong);
	}

	.nav__link[aria-current='page'],
	.nav__link[data-current='true'] {
		color: var(--text-inverse);
		background: var(--grad-accent);
		box-shadow: 0 4px 16px rgba(var(--violet-rgb), 0.35);
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
		cursor: pointer;
		align-items: center;
		gap: 0.3em;
	}

	.nav .more__button[data-current='true'] {
		background: var(--grad-accent);
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
			top: calc(100% + var(--s-3));
			right: 0;
			min-width: max-content;
			max-width: calc(100vw - 2 * var(--gutter));
			padding: var(--s-2);
			gap: var(--s-1);
			background: var(--glass-tint);
			-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(150%);
			backdrop-filter: blur(var(--glass-blur)) saturate(150%);
			border: 1px solid var(--glass-border);
			border-radius: var(--r-lg);
			box-shadow: var(--shadow-4), inset 0 1px 0 rgba(var(--text-bright-rgb), 0.16);
		}

		@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
			.nav .more__panel {
				background: var(--surface);
			}
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.8rem var(--s-5);
			text-align: center;
			justify-content: center;
		}

		.nav__link {
			padding-inline: 1rem;
		}
	}

	@media (pointer: coarse) {
		/* An explicit floor — line-height is 1 here, so padding alone misses the 44px target. */
		.nav__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
		}
	}
</style>
