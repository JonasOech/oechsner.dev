<script lang="ts">
	import { page } from '$app/state';
	import { nav, site } from '$lib/data/site';

	function isCurrent(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}
</script>

<header class="header">
	<div class="container header__inner">
		<a class="header__name" href="/" aria-label="{site.name} — home">{site.name}</a>

		<!-- Plain inline text links. At phone width the row simply wraps under the name;
		     nothing collapses, nothing opens. -->
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
	</div>
</header>

<style>
	.header {
		padding-block: var(--s-6) 0;
	}

	.header__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-1) var(--s-5);
	}

	.header__name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		padding-block: 0.4rem;
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--s-5);
	}

	.nav__link {
		font-size: 1rem;
		color: var(--text-muted);
		text-decoration: none;
		padding-block: 0.4rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.nav__link:hover,
		.header__name:hover {
			color: var(--text);
			text-decoration: underline;
			text-decoration-thickness: 1px;
			text-underline-offset: 0.25em;
		}
	}

	.nav__link[aria-current='page'] {
		color: var(--text);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.25em;
	}

	.nav__link:focus-visible,
	.header__name:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.nav__link,
		.header__name {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding-block: 0;
		}
	}

	@media (max-width: 479px) {
		.nav {
			gap: 0 var(--s-4);
		}
	}
</style>
