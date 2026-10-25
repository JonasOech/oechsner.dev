<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { nav, site } from '$lib/data/site';
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * `nav[0]` (Writing) is the site's root and stays on the bar at every width; the rest
	 * fold behind "More" once the row would otherwise break onto two lines. On the bar they
	 * are menu titles; in the collapsed state "More" is a pull-down menu.
	 */
	const [primary, ...collapsible] = nav;

	/**
	 * Below this the labels no longer fit on one line — see DESIGN.md §10. Kept in `em`
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

<header class="menubar">
	<nav class="menubar__nav container" aria-label="Primary">
		<span class="menubar__mark" aria-hidden="true">
			<Icon name="disk" size={20} />
		</span>

		<a
			class="menu__item"
			href={primary.href}
			aria-current={isCurrent(primary.href) ? 'page' : undefined}
		>
			{primary.label}
		</a>

		<!-- `display: contents` above the breakpoint, so these links sit directly in the
		     bar and only become a pull-down once the bar runs out of width. -->
		<div class="more" data-open={moreOpen} bind:this={moreEl} onfocusout={onMoreFocusout}>
			<button
				class="menu__item more__button"
				type="button"
				bind:this={moreButton}
				aria-expanded={moreOpen}
				aria-controls="nav-more"
				data-current={moreHoldsCurrent ? 'true' : undefined}
				onclick={() => (moreOpen = !moreOpen)}
			>
				More
				<svg class="more__caret" viewBox="0 0 9 6" aria-hidden="true" focusable="false">
					<path d="M0 0h9L4.5 6z" fill="currentColor" />
				</svg>
			</button>

			<div class="more__panel" id="nav-more">
				{#each collapsible as item (item.href)}
					<a
						class="menu__item"
						href={item.href}
						aria-current={isCurrent(item.href) ? 'page' : undefined}
						onclick={() => (moreOpen = false)}
					>
						{item.label}
					</a>
				{/each}
			</div>
		</div>

		<span class="menubar__host" aria-hidden="true">{site.shortName}</span>
	</nav>
</header>

<style>
	.menubar {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--paper);
		border-bottom: 2px solid var(--ink);
	}

	.menubar__nav {
		display: flex;
		align-items: stretch;
		min-height: var(--header-h);
		padding-inline: var(--gutter);
	}

	.menubar__mark {
		display: flex;
		align-items: center;
		padding-right: var(--s-3);
		color: var(--ink);
	}

	.menubar__host {
		margin-left: auto;
		display: flex;
		align-items: center;
		font-family: var(--font-display);
		font-size: 1rem;
		color: var(--text-muted);
	}

	.menu__item {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		padding: 0 0.875rem;
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 600;
		line-height: 1;
		color: var(--ink);
		text-decoration: none;
		white-space: nowrap;
		background: none;
		border: 0;
		cursor: pointer;
	}

	@media (hover: hover) and (pointer: fine) {
		.menu__item:hover {
			background: var(--ink);
			color: var(--paper);
		}
	}

	.menu__item:active,
	.menu__item[aria-current='page'],
	.menu__item[data-current='true'] {
		background: var(--ink);
		color: var(--paper);
	}

	.menu__item:focus-visible {
		outline: 2px dotted var(--paper);
		outline-offset: -4px;
		background: var(--ink);
		color: var(--paper);
	}

	/* Wide: the wrapper and its panel dissolve, leaving the links as plain flex items. */
	.more,
	.more__panel {
		display: contents;
	}

	/* Two-class selectors throughout the pull-down, so a coarse-pointer rule cannot
	   resurrect the button on a wide touch screen. */
	.menubar .more__button {
		display: none;
	}

	.more__caret {
		width: 0.5625rem;
		height: 0.375rem;
	}

	.more[data-open='true'] .more__caret {
		transform: rotate(180deg);
	}

	/* `em`, not `px`: this tracks the label widths, which are `rem`-sized, so text-only zoom
	   collapses the bar instead of overflowing it. Mirrored by COLLAPSE_QUERY above. */
	@media (max-width: 35em) {
		.menubar__host {
			display: none;
		}

		.menubar .more {
			position: relative;
			display: flex;
		}

		.menubar .more__button {
			display: inline-flex;
		}

		.menubar .more__panel {
			display: grid;
			position: absolute;
			z-index: 1;
			top: calc(100% + 2px);
			left: 0;
			min-width: 11rem;
			background: var(--paper);
			border: 2px solid var(--ink);
			box-shadow: var(--shadow-3);
		}

		.menubar .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .menu__item {
			min-height: 2.75rem;
			padding: 0 var(--s-4);
			justify-content: flex-start;
		}

		/* The button lights up while its menu is open, as a pulled-down title does. */
		.menubar .more[data-open='true'] .more__button {
			background: var(--ink);
			color: var(--paper);
		}
	}
</style>
