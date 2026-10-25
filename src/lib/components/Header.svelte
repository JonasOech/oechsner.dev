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
		<a class="brand" href="/" aria-label="{site.shortName} — home">
			<svg class="brand__mark" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
				<circle cx="10" cy="11" r="8" fill="var(--red)" stroke="var(--ink)" stroke-width="3" />
				<rect x="16" y="4" width="16" height="16" fill="var(--yellow)" stroke="var(--ink)" stroke-width="3" />
				<polygon points="6,33 18,15 30,33" fill="var(--blue)" stroke="var(--ink)" stroke-width="3" />
			</svg>
			<span class="brand__name">{site.shortName}</span>
		</a>

		<a
			class="nav__link nav__link--first"
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

	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg);
		border-bottom: var(--rule-w) solid var(--ink);
		transition: box-shadow var(--dur-base) var(--ease-out);
	}

	/* Once the page has moved, the bar lifts off it on a hard yellow edge. */
	.header[data-scrolled='true'] {
		box-shadow: 0 6px 0 var(--yellow);
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--s-1);
		min-height: calc(var(--header-h) - var(--rule-w));
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--s-3);
		margin-right: auto;
		color: var(--text);
		text-decoration: none;
		min-height: 44px;
	}

	.brand__mark {
		width: 2.25rem;
		height: 2.25rem;
		flex: none;
		transition: transform var(--dur-base) var(--ease-out);
	}

	.brand__name {
		font-size: 1.125rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		line-height: 1;
	}

	@media (hover: hover) and (pointer: fine) {
		.brand:hover .brand__mark {
			transform: rotate(-12deg);
		}
	}

	.brand:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.nav__link {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 800;
		line-height: 1;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text);
		text-decoration: none;
		white-space: nowrap;
		padding: 0.75rem 0.875rem;
		border: 3px solid transparent;
		background: transparent;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			background: var(--yellow);
		}
	}

	.nav__link:active {
		background: var(--red);
		color: var(--text-inverse);
	}

	.nav__link[aria-current='page'],
	.nav__link[data-current='true'] {
		background: var(--ink);
		color: var(--text-inverse);
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
		gap: 0.4em;
		font-family: var(--font-sans);
	}

	.more__chevron {
		width: 0.75em;
		height: 0.75em;
		stroke-width: 2.25;
		stroke-linecap: square;
		transition: transform var(--dur-base) var(--ease-out);
	}

	.more[data-open='true'] .more__chevron {
		transform: rotate(180deg);
	}

	/* `em`, not `px`: tracks the label widths so text-only zoom collapses the bar instead of
	   overflowing it. Mirrored by COLLAPSE_QUERY above. */
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

		.nav__link {
			padding-inline: 0.625rem;
		}

		.nav .more__panel {
			display: grid;
			position: absolute;
			z-index: 1;
			top: calc(100% + var(--s-3));
			right: 0;
			min-width: 11rem;
			padding: var(--s-2);
			background: var(--yellow);
			border: 3px solid var(--ink);
			box-shadow: var(--shadow-3);
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.875rem var(--s-3);
			text-align: left;
		}

		@media (hover: hover) and (pointer: fine) {
			.more__panel .nav__link:hover {
				background: var(--surface);
			}
		}
	}

	/* The wordmark gives way to the mark alone before it can crowd the links. */
	@media (max-width: 30em) {
		.brand__name {
			display: none;
		}
	}

	@media (pointer: coarse) {
		.nav__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
		}
	}
</style>
