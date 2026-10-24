<script lang="ts">
	import { page } from '$app/state';
	import { nav, site } from '$lib/data/site';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import InkOwl from '$lib/components/InkOwl.svelte';

	/**
	 * After alexwang.ai: the name set large in Cormorant, a quiet row of italic links under
	 * it, and the ink owl hanging over the top right of every page. Not sticky — the header
	 * belongs to the top of the page. The owl has its own view-transition name, so it holds
	 * still while the page under it changes.
	 */

	function isCurrent(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}

	// On the front page the name is the page's heading; everywhere else the page has its own.
	const isHome = $derived(page.url.pathname === '/');
</script>

<header class="header">
	<div class="container header__bar">
		<div class="header__branding">
			{#if isHome}
				<h1 class="brand"><a href="/">{site.name}</a></h1>
			{:else}
				<p class="brand"><a href="/">{site.name}</a></p>
			{/if}
		</div>

		<div class="header__row">
			<nav class="nav" aria-label="Primary">
				{#each nav as item (item.href)}
					<a class="nav__link" href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
						{item.label}
					</a>
				{/each}
			</nav>
			<ThemeToggle class="header__toggle" />
		</div>

		<div class="header__owl"><InkOwl /></div>
	</div>
</header>

<style>
	.header {
		position: relative;
		z-index: 50;
	}

	.header__bar {
		position: relative;
		padding-top: 3rem;
	}

	/* The name stops short of the owl, which hangs over the right of the header. */
	.header__branding {
		max-width: 60%;
	}

	.brand {
		margin: 0 0 0.2rem;
		font-family: var(--font-display);
		font-size: 3rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.brand a {
		color: var(--text);
		text-decoration: none;
	}

	.brand a:focus-visible,
	.nav__link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.header__row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.1rem;
	}

	.nav__link {
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-style: italic;
		line-height: 1.6;
		color: var(--text-muted);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition:
			color 0.2s ease,
			border-color 0.2s ease;
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}
	}

	.nav__link[aria-current='page'] {
		color: var(--text);
	}

	/* The switch drawn like the rest of the ink: no ring, just the glyph. */
	.header__row :global(.header__toggle) {
		width: 32px;
		height: 32px;
		border-color: transparent;
		color: var(--text-muted);
	}

	.header__owl {
		position: absolute;
		top: calc(3rem - 50px);
		right: calc(var(--gutter) - 20px);
		z-index: 10;
		width: 300px;
		pointer-events: none;
		view-transition-name: ink-owl;
	}

	/* Narrow: the name and the bird share one row as tall as the bird, so the bird holds
	   still between pages and the links sit underneath. */
	@media (max-width: 960px) {
		.header__bar {
			padding-top: 1rem;
		}

		.header__branding {
			max-width: none;
			min-height: 120px;
			padding-right: 130px;
			display: flex;
			align-items: flex-end;
		}

		.brand {
			font-size: 2.25rem;
			margin-bottom: 0;
		}

		.header__owl {
			top: 1rem;
			right: var(--gutter);
			width: 120px;
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
