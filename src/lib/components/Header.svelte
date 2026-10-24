<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { site } from '$lib/data/site';
	import { palette } from '$lib/palette.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	/**
	 * After aanandmadhav.com: a monogram and the name with a small mono role line on the
	 * left, a quiet row of links in the middle with the current one in rust, and on the
	 * right the ⌘K search box, the theme switch and the one ink-filled call to action.
	 * Below 900px the links fold into a menu.
	 */
	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/#writing', label: 'Writing' },
		{ href: '/about', label: 'About' },
		{ href: '/skills', label: 'Projects' },
		{ href: '/contact', label: 'Contact' }
	];

	let menuOpen = $state(false);

	afterNavigate(() => {
		menuOpen = false;
	});

	function isCurrent(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		if (href === '/#writing') return path.startsWith('/blog');
		return path.startsWith(href);
	}
</script>

<header class="header" data-open={menuOpen}>
	<div class="container header__bar">
		<a class="brand" href="/" aria-label="{site.name}, home">
			<span class="brand__mono" aria-hidden="true">JÖ</span>
			<span class="brand__text">
				<span class="brand__name">{site.name}</span>
				<span class="brand__role">Applied CS · ML</span>
			</span>
		</a>

		<nav class="nav" id="site-nav" aria-label="Primary">
			{#each links as l (l.href)}
				<a class="nav__link" href={l.href} aria-current={isCurrent(l.href) ? 'page' : undefined}>{l.label}</a>
			{/each}
			<a class="btn btn--primary nav__cta" href="/contact">Let’s work together →</a>
		</nav>

		<div class="header__end">
			<button type="button" class="search" onclick={() => (palette.open = true)} aria-label="Search (⌘K)">
				<span aria-hidden="true">⌕</span>
				<span class="search__kbd" aria-hidden="true">⌘K</span>
			</button>
			<ThemeToggle class="header__toggle" />
			<a class="btn btn--primary header__cta" href="/contact">Let’s work together →</a>
			<button
				type="button"
				class="burger"
				aria-expanded={menuOpen}
				aria-controls="site-nav"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span></span><span></span><span></span>
			</button>
		</div>
	</div>
</header>

<style>
	.header {
		position: relative;
		z-index: 50;
	}

	.header__bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 16px;
		min-height: 64px;
		padding-block: 10px;
	}

	.brand {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		color: var(--text);
		text-decoration: none;
	}

	.brand__mono {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border: 1px solid var(--line-strong);
		border-radius: 50%;
		font-family: var(--font-display);
		font-size: 0.95rem;
		line-height: 1;
	}

	.brand__text {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.brand__name {
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.005em;
	}

	.brand__role {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		line-height: 1;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.nav {
		display: flex;
		gap: 2px;
	}

	.nav__link {
		padding: 8px 14px;
		font-size: 0.875rem;
		letter-spacing: -0.005em;
		color: var(--text-muted);
		text-decoration: none;
		transition: color 0.15s;
	}

	.nav__link[aria-current='page'] {
		color: var(--accent-dim);
		font-weight: 600;
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--text);
		}
	}

	.nav__cta,
	.burger {
		display: none;
	}

	.header__end {
		justify-self: end;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.search {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 34px;
		padding: 0 10px;
		border: 1px solid var(--line);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		font-size: 0.8125rem;
		transition: border-color 0.15s;
	}

	.search__kbd {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
	}

	@media (hover: hover) and (pointer: fine) {
		.search:hover {
			border-color: var(--text);
		}
	}

	.header__end :global(.header__toggle) {
		width: 34px;
		height: 34px;
		border-radius: 0;
	}

	.header__cta {
		min-height: 0;
		padding-block: 10px;
	}

	.brand:focus-visible,
	.nav__link:focus-visible,
	.search:focus-visible,
	.burger:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* Narrow: the links fold behind a three-line button into a full-width panel. */
	@media (max-width: 899px) {
		.header__bar {
			grid-template-columns: 1fr auto;
		}

		.header__cta {
			display: none;
		}

		.burger {
			display: flex;
			flex-direction: column;
			justify-content: center;
			gap: 5px;
			width: 40px;
			height: 40px;
			padding: 9px;
			border: 0;
			background: none;
			cursor: pointer;
		}

		.burger span {
			display: block;
			height: 1.5px;
			background: var(--text);
			transition: transform 0.25s var(--ease-out), opacity 0.2s;
		}

		.header[data-open='true'] .burger span:nth-child(1) {
			transform: translateY(6.5px) rotate(45deg);
		}
		.header[data-open='true'] .burger span:nth-child(2) {
			opacity: 0;
		}
		.header[data-open='true'] .burger span:nth-child(3) {
			transform: translateY(-6.5px) rotate(-45deg);
		}

		.nav {
			display: none;
			grid-column: 1 / -1;
			flex-direction: column;
			gap: 0;
			padding: 8px 0 20px;
		}

		.header[data-open='true'] .nav {
			display: flex;
		}

		.nav__link {
			padding: 14px 0;
			border-bottom: 1px solid var(--line);
			font-size: 1.125rem;
			color: var(--text);
		}

		.nav__link[aria-current='page'] {
			color: var(--accent);
		}

		.nav__cta {
			display: inline-flex;
			margin-top: 20px;
			width: 100%;
		}
	}

	@media (max-width: 420px) {
		.search__kbd {
			display: none;
		}
	}
</style>
