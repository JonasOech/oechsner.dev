<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import Monogram from '$lib/components/Monogram.svelte';
	import { nav, site, contacts } from '$lib/data/site';

	/**
	 * `nav[0]` (Writing) is the site's root and stays on the bar at every width; the rest
	 * fold behind "More" once the row would otherwise break onto two lines.
	 */
	const [primary, ...collapsible] = nav;
	const email = contacts.find((c) => c.primary) ?? contacts[0];

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

<header class="letterhead">
	<div class="container">
		<div class="letterhead__top">
			<a class="brand" href="/" aria-label="{site.name} — home">
				<Monogram size={44} />
				<span class="brand__text">
					<span class="brand__name">{site.name}</span>
					<span class="brand__role">Applied Computer Science</span>
				</span>
			</a>
			<p class="letterhead__contact">
				<a href={email.href}>{email.value}</a>
				<span aria-hidden="true">·</span>
				<span>{site.shortName}</span>
			</p>
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
		</nav>
	</div>
</header>

<style>
	/* Letterhead: a name and a contact line over a hairline, then the nav ruled off beneath.
	   It is stationery, so it scrolls away with the page instead of following the reader. */
	.letterhead {
		position: relative;
		z-index: 50;
	}

	.letterhead__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-5);
		padding-top: var(--s-6);
		padding-bottom: var(--s-4);
		border-bottom: 1px solid var(--text);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--s-4);
		color: var(--text);
		text-decoration: none;
		min-width: 0;
	}

	.brand:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.brand__text {
		display: grid;
		gap: 0.2rem;
		min-width: 0;
	}

	.brand__name {
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		line-height: 1.2;
		color: var(--text);
	}

	.brand__role {
		font-size: 0.8125rem;
		font-style: italic;
		line-height: 1.2;
		color: var(--text-muted);
	}

	.letterhead__contact {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0 var(--s-2);
		font-size: 0.8125rem;
		letter-spacing: 0.04em;
		color: var(--text-muted);
		text-align: right;
	}

	.letterhead__contact a {
		color: inherit;
		text-decoration: none;
	}

	@media (hover: hover) and (pointer: fine) {
		.letterhead__contact a:hover {
			color: var(--text);
			text-decoration: underline;
			text-decoration-color: var(--accent);
			text-underline-offset: 3px;
		}
	}

	.letterhead__contact a:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 40em) {
		.letterhead__contact {
			display: none;
		}
		.letterhead__top {
			padding-top: var(--s-5);
		}
	}

	.nav {
		display: flex;
		justify-content: flex-start;
		gap: 1.75rem;
		padding-block: var(--s-2);
		border-bottom: 1px solid var(--line);
	}

	.nav__link {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
		text-decoration: none;
		white-space: nowrap;
		position: relative;
		padding: 0.5rem 0.125rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.nav__link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0.125rem;
		width: 100%;
		height: 1px;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: right;
		transition: transform var(--dur-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--text);
		}
		.nav__link:hover::after {
			transform: scaleX(1);
			transform-origin: left;
		}
	}

	.nav__link:active {
		color: var(--text);
	}

	.nav__link[aria-current='page'],
	.nav__link[data-current='true'] {
		color: var(--text);
	}

	.nav__link:focus-visible {
		outline: none;
		border-radius: 3px;
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
			top: calc(100% + var(--s-2));
			left: 0;
			min-width: max-content;
			max-width: calc(100vw - 2 * var(--gutter));
			padding: var(--s-2);
			/* Translucent, on the header's terms: same 12px blur cap, and a slightly heavier
			   tint than the bar's 0.78 so the labels keep their contrast over prose. */
			background: var(--surface);
			border: 1px solid var(--line-strong);
			border-radius: 0;
			box-shadow: var(--shadow-3);
		}

		.nav .more:not([data-open='true']) .more__panel {
			display: none;
		}

		.more__panel .nav__link {
			padding: 0.625rem var(--s-3);
			/* Grid blockifies the link; `justify-content` is the one that bites once the
			   coarse-pointer rule below turns it into a flex box. */
			text-align: left;
			justify-content: flex-start;
		}

		/* The underline is a bar affordance; inside the panel the row itself is the target. */
		.more__panel .nav__link::after {
			content: none;
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
