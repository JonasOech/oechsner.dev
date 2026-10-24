<script lang="ts">
	import { page } from '$app/state';
	import { nav, site } from '$lib/data/site';
	import Icon from '$lib/components/Icon.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	/**
	 * Navigation as a slim ice-blue rail down the left edge, after the reference spread: the
	 * home mark at the top, the name running up the middle, one square cell per section at
	 * the bottom. Each cell's label slides out on hover or focus. On phones the rail lies
	 * down as a bar across the top.
	 */
	const icons: Record<string, 'file-text' | 'user' | 'layers' | 'mail'> = {
		'/': 'file-text',
		'/about': 'user',
		'/skills': 'layers',
		'/contact': 'mail'
	};

	function isCurrent(href: string): boolean {
		return href === '/'
			? page.url.pathname === '/' || page.url.pathname.startsWith('/blog')
			: page.url.pathname.startsWith(href);
	}
</script>

<header class="rail-nav">
	<a class="rail-nav__home" href="/" aria-label="{site.name}, home">
		<Icon name="waves" size={20} />
	</a>

	<p class="rail-nav__name" aria-hidden="true">{site.name}</p>

	<nav class="rail-nav__links" aria-label="Primary">
		{#each nav as item (item.href)}
			<a class="rail-nav__cell" href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
				<Icon name={icons[item.href] ?? 'file-text'} size={18} />
				<span class="rail-nav__tip">{item.label}</span>
			</a>
		{/each}
	</nav>

	<div class="rail-nav__theme"><ThemeToggle class="rail-nav__toggle" /></div>
</header>

<style>
	.rail-nav {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		z-index: 60;
		display: flex;
		flex-direction: column;
		width: var(--rail-w);
		background: var(--rail-bg);
		border-right: 1px solid var(--rail-line);
		color: var(--rail-icon);
	}

	.rail-nav__home {
		display: grid;
		place-items: center;
		height: 96px;
		color: inherit;
		transition: color 0.2s;
	}

	.rail-nav__name {
		flex: 1 1 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		font-family: var(--font-display);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		white-space: nowrap;
		opacity: 0.8;
	}

	.rail-nav__links {
		display: flex;
		flex-direction: column;
	}

	.rail-nav__cell,
	.rail-nav__theme {
		position: relative;
		display: grid;
		place-items: center;
		height: 60px;
		border-top: 1px solid var(--rail-line);
	}

	.rail-nav__cell {
		color: inherit;
		text-decoration: none;
		transition:
			background-color 0.25s,
			color 0.25s;
	}

	/* The current section: a short bar on the inner edge, and full-strength ink. */
	.rail-nav__cell[aria-current='page'] {
		color: var(--text);
	}

	.rail-nav__cell[aria-current='page']::before {
		content: '';
		position: absolute;
		left: 0;
		top: 18px;
		bottom: 18px;
		width: 2px;
		background: var(--accent);
	}

	/* The label: a charcoal tab that slides out of the rail. It is also the link's name. */
	.rail-nav__tip {
		position: absolute;
		left: calc(100% + 1px);
		top: 50%;
		padding: 0.4rem 0.8rem;
		background: var(--panel-ink);
		color: var(--panel-ink-text);
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-style: italic;
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transform: translate(-8px, -50%);
		transition:
			opacity 0.2s,
			transform 0.3s var(--ease-out);
	}

	.rail-nav__cell:hover .rail-nav__tip,
	.rail-nav__cell:focus-visible .rail-nav__tip {
		opacity: 1;
		transform: translate(0, -50%);
	}

	@media (hover: hover) and (pointer: fine) {
		.rail-nav__cell:hover,
		.rail-nav__home:hover {
			background: var(--panel-ice);
			color: var(--text);
		}
	}

	.rail-nav__home:focus-visible,
	.rail-nav__cell:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px var(--accent);
	}

	.rail-nav__theme :global(.rail-nav__toggle) {
		width: 100%;
		height: 100%;
		border: 0;
		border-radius: 0;
		color: var(--rail-icon);
	}

	/* Phones: the rail becomes a bar across the top; the labels go visually hidden but stay
	   the links' names. */
	@media (max-width: 767px) {
		.rail-nav {
			bottom: auto;
			right: 0;
			width: auto;
			height: var(--bar-h);
			flex-direction: row;
			border-right: 0;
			border-bottom: 1px solid var(--rail-line);
		}

		.rail-nav__home {
			width: var(--bar-h);
			height: 100%;
		}

		.rail-nav__name {
			writing-mode: horizontal-tb;
			transform: none;
			justify-content: flex-start;
			letter-spacing: 0.2em;
			font-size: 0.68rem;
		}

		.rail-nav__links {
			flex-direction: row;
		}

		.rail-nav__cell,
		.rail-nav__theme {
			width: 48px;
			height: 100%;
			border-top: 0;
			border-left: 1px solid var(--rail-line);
		}

		.rail-nav__cell[aria-current='page']::before {
			top: auto;
			bottom: 0;
			left: 12px;
			right: 12px;
			width: auto;
			height: 2px;
		}

		.rail-nav__tip {
			clip: rect(0 0 0 0);
			clip-path: inset(50%);
			width: 1px;
			height: 1px;
			padding: 0;
			overflow: hidden;
		}
	}

	@media (max-width: 400px) {
		.rail-nav__name {
			display: none;
		}
		.rail-nav__links {
			margin-left: auto;
		}
	}
</style>
