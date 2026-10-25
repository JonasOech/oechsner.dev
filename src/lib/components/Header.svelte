<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { nav, site } from '$lib/data/site';

	/**
	 * The prompt shows where the reader is as a shell path: `/` is `~/writing`, a post is
	 * `~/writing/<slug>`, everything else is `~/<first segment>`.
	 */
	const cwd = $derived.by(() => {
		const parts = page.url.pathname.split('/').filter(Boolean);
		if (parts.length === 0) return '~/writing';
		if (parts[0] === 'blog') return parts[1] ? `~/writing/${parts[1]}` : '~/writing';
		return `~/${parts[0]}`;
	});

	function isCurrent(href: string): boolean {
		const path = page.url.pathname;
		return href === '/' ? path === '/' || path.startsWith('/blog') : path.startsWith(href);
	}

	/** Number keys jump to the nav entries; the footer advertises them. Never while typing. */
	function onWindowKeydown(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		const target = event.target as HTMLElement | null;
		if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
		const index = Number(event.key) - 1;
		if (Number.isInteger(index) && index >= 0 && index < nav.length) {
			event.preventDefault();
			goto(nav[index].href);
		}
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<header class="header">
	<div class="status" aria-hidden="true">
		<div class="container status__row">
			<span>{site.shortName}</span>
			<span class="status__mid">tty1</span>
			<span>{cwd}</span>
		</div>
	</div>

	<nav class="container nav" aria-label="Primary">
		<span class="nav__prompt" aria-hidden="true">
			<span class="nav__user">jonas@{site.shortName}</span><span class="nav__colon">:</span><span class="nav__cwd">{cwd}</span>
			<span class="ps1">$</span>
		</span>
		<ul class="nav__list">
			{#each nav as item, i (item.href)}
				<li>
					<a
						class="nav__link"
						href={item.href}
						aria-current={isCurrent(item.href) ? 'page' : undefined}
					>
						<span class="nav__key" aria-hidden="true">{i + 1}</span>{item.label.toLowerCase()}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg);
		border-bottom: 1px solid var(--line-strong);
	}

	/* The status bar: one inverse line, the way tmux or vim draws it. */
	.status {
		background: var(--accent);
		color: var(--text-inverse);
		font-size: 0.6875rem;
		font-weight: 700;
		line-height: 1.6;
		letter-spacing: 0.04em;
	}

	.status__row {
		display: flex;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.status__row span {
		white-space: nowrap;
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0 var(--s-5);
		padding-block: var(--s-2);
	}

	.nav__prompt {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.nav__user {
		color: var(--accent);
	}

	.nav__cwd {
		color: var(--series-cool);
	}

	.nav__list {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--s-3);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav__link {
		display: inline-block;
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1;
		color: var(--text-secondary);
		text-decoration: none;
		white-space: nowrap;
		padding: 0.625rem 0.75ch;
	}

	.nav__key {
		color: var(--prompt);
		margin-right: 0.75ch;
		font-weight: 700;
	}

	.nav__key::before {
		content: '[';
		color: var(--line-strong);
	}

	.nav__key::after {
		content: ']';
		color: var(--line-strong);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover {
			color: var(--text-bright);
			background: var(--surface-active);
		}
	}

	.nav__link[aria-current='page'] {
		background: var(--text);
		color: var(--text-inverse);
	}

	.nav__link[aria-current='page'] .nav__key,
	.nav__link[aria-current='page'] .nav__key::before,
	.nav__link[aria-current='page'] .nav__key::after {
		color: var(--text-inverse);
	}

	.nav__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.nav__link {
			min-height: 44px;
			display: inline-flex;
			align-items: center;
		}
	}

	@media (max-width: 767px) {
		.header {
			position: static;
		}

		.nav {
			padding-block: var(--s-2) 0;
		}

		.nav__prompt {
			width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.status__mid {
			display: none;
		}
	}
</style>
