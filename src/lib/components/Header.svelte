<script lang="ts">
	import { page } from '$app/state';
	import { nav } from '$lib/data/site';

	let sentinel: HTMLElement;
	let scrolled = $state(false);

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

	function isCurrent(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}
</script>

<div bind:this={sentinel} class="sentinel" aria-hidden="true"></div>

<header class="header" data-scrolled={scrolled}>
	<nav class="container nav" aria-label="Primary">
		{#each nav as item (item.href)}
			<a
				class="nav__link"
				href={item.href}
				aria-current={isCurrent(item.href) ? 'page' : undefined}
			>
				{item.label}
			</a>
		{/each}
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
		background: transparent;
		border-bottom: 1px solid transparent;
		transition:
			background-color var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out);
	}

	.header[data-scrolled='true'] {
		background: rgba(var(--bg-rgb), 0.78);
		/* Capped at 12px and confined to a thin bar — DESIGN.md §8, Don't #3. */
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom-color: var(--line);
		box-shadow: var(--shadow-3);
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.75rem;
		padding-block: var(--s-5);
	}

	.nav__link {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: var(--text-muted);
		text-decoration: none;
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
			color: var(--text-secondary);
		}
		.nav__link:hover::after {
			transform: scaleX(1);
			transform-origin: left;
		}
	}

	.nav__link:active {
		color: var(--text);
	}

	.nav__link[aria-current='page'] {
		color: var(--text);
	}

	.nav__link:focus-visible {
		outline: none;
		border-radius: 3px;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 479px) {
		.nav {
			gap: var(--s-3) var(--s-5);
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
