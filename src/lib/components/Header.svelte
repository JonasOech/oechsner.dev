<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import CommandMenu from '$lib/components/CommandMenu.svelte';
	import { nav, site } from '$lib/data/site';

	let sentinel: HTMLElement;
	let scrolled = $state(false);
	let paletteOpen = $state(false);

	/**
	 * Header scroll state via a 1px sentinel at the top of the document rather than a
	 * `scroll` listener — no per-frame work.
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
		return href === '/'
			? page.url.pathname === '/' || page.url.pathname.startsWith('/blog')
			: page.url.pathname.startsWith(href);
	}
</script>

<div bind:this={sentinel} class="sentinel" aria-hidden="true"></div>

<header class="header" data-scrolled={scrolled}>
	<div class="container bar">
		<a class="brand" href="/" aria-label="{site.name} — home">
			<span class="brand__mark" aria-hidden="true">JÖ</span>
			<span class="brand__name">{site.shortName}</span>
		</a>

		<nav class="nav" aria-label="Primary">
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

		<button
			class="hint"
			type="button"
			aria-haspopup="dialog"
			aria-label="Jump to a page or post"
			onclick={() => (paletteOpen = true)}
		>
			<Icon name="search" size={14} />
			<span class="hint__text">Jump to…</span>
			<kbd class="hint__kbd" aria-hidden="true">Ctrl K</kbd>
		</button>
	</div>
</header>

<CommandMenu bind:open={paletteOpen} />

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
		background: rgba(var(--bg-rgb), 0.78);
		backdrop-filter: blur(12px) saturate(1.4);
		border-bottom: 1px solid transparent;
		transition:
			border-color var(--dur-base) var(--ease-out),
			background-color var(--dur-base) var(--ease-out);
	}

	@supports not (backdrop-filter: blur(12px)) {
		.header {
			background: var(--bg);
		}
	}

	.header[data-scrolled='true'] {
		border-bottom-color: var(--line);
		background: rgba(var(--surface-rgb), 0.82);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: var(--s-4);
		min-height: var(--header-h);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		text-decoration: none;
		color: var(--text);
		font-weight: 650;
		font-size: 0.9375rem;
		letter-spacing: -0.01em;
		border-radius: var(--r-sm);
	}

	.brand__mark {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 9px;
		background: var(--grad);
		color: var(--text-inverse);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0;
		box-shadow: var(--shadow-1);
	}

	.nav {
		display: flex;
		gap: 2px;
		margin-left: var(--s-3);
	}

	.nav__link {
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		padding: 0 var(--s-3);
		border-radius: var(--r-sm);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.nav__link[aria-current='page'] {
		color: var(--text);
		background: var(--surface);
		box-shadow:
			0 0 0 1px var(--line),
			var(--shadow-1);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--text);
			background: rgba(var(--text-rgb), 0.05);
		}
		.nav__link[aria-current='page']:hover {
			background: var(--surface);
		}
	}

	.hint {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-height: 36px;
		padding: 0 var(--s-2) 0 var(--s-3);
		border: 1px solid var(--line-strong);
		border-radius: var(--r-sm);
		background: var(--surface);
		color: var(--text-muted);
		font: inherit;
		font-size: 0.8125rem;
		cursor: pointer;
		box-shadow: var(--shadow-1);
		transition:
			border-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.hint__text {
		min-width: 5.5rem;
		text-align: left;
	}

	.hint__kbd {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		padding: 0.2rem 0.4rem;
		border-radius: var(--r-xs);
		background: var(--bg);
		border: 1px solid var(--line);
		color: var(--text-muted);
	}

	@media (hover: hover) and (pointer: fine) {
		.hint:hover {
			border-color: var(--accent);
			color: var(--text);
		}
	}

	.brand:focus-visible,
	.nav__link:focus-visible,
	.hint:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* Narrow: brand and the jump button share the first row, the nav drops to a second
	   row of its own so four labels never fight for 360px. */
	@media (max-width: 719px) {
		:root {
			--header-h: 5.5rem;
		}

		.bar {
			flex-wrap: wrap;
			row-gap: 0;
			padding-block: var(--s-2) var(--s-2);
			min-height: 0;
		}

		.nav {
			order: 3;
			flex: 0 0 100%;
			margin-left: 0;
			overflow-x: auto;
			scrollbar-width: none;
			padding-bottom: 2px;
		}

		.nav__link {
			min-height: 40px;
		}

		.hint__kbd {
			display: none;
		}

		.hint__text {
			min-width: 0;
		}
	}
</style>
