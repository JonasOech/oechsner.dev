<script lang="ts">
	import { page } from '$app/state';
	import { nav, site } from '$lib/data/site';

	function isCurrent(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' || page.url.pathname.startsWith('/blog') : page.url.pathname.startsWith(href);
	}
</script>

<!-- The site index. A slim sticky rail at the left on wide screens; on phones the same
     links collapse to a single line across the top. No script involved either way. -->
<header class="index">
	<div class="index__inner">
		<a class="index__name" href="/" aria-label="{site.name} — home">{site.name}</a>

		<nav class="index__nav" aria-label="Primary">
			{#each nav as item (item.href)}
				<a
					class="index__link"
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
	.index {
		padding: var(--s-5) var(--gutter) 0;
	}

	.index__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: var(--s-5);
		row-gap: var(--s-1);
		max-width: calc(var(--col) + 0px);
	}

	.index__name {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.005em;
		line-height: 1.5;
		color: var(--text);
		text-decoration: none;
		padding-block: 0.5rem;
		margin-right: var(--s-2);
	}

	.index__nav {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--s-4);
	}

	.index__link {
		position: relative;
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 400;
		line-height: 1.5;
		color: var(--text-muted);
		text-decoration: none;
		padding-block: 0.5rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.index__link:hover {
			color: var(--accent);
		}
		.index__name:hover {
			color: var(--accent);
		}
	}

	.index__link:active {
		color: var(--accent-dim);
	}

	.index__link[aria-current='page'] {
		color: var(--text);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.45em;
		text-decoration-color: var(--text);
	}

	.index__link:focus-visible,
	.index__name:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.index__link,
		.index__name {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding-block: 0;
		}
	}

	/* Wide: the rail. Sticky so the index stays in reach down a long post; the name sits
	   over a short hairline, the links stack beneath it, and the current one is marked by a
	   rule drawn into the margin. */
	@media (min-width: 56em) {
		.index {
			position: sticky;
			top: 0;
			align-self: start;
			height: 100dvh;
			padding: var(--s-9) 0 var(--s-6);
			overflow-y: auto;
		}

		.index__inner {
			display: grid;
			align-content: start;
			gap: var(--s-6);
			max-width: none;
		}

		.index__name {
			display: block;
			padding: 0 0 var(--s-4);
			margin: 0;
			border-bottom: 1px solid var(--line);
		}

		.index__nav {
			display: grid;
			gap: 0;
		}

		.index__link {
			padding: 0.3rem 0 0.3rem 1.375rem;
			font-size: 0.875rem;
		}

		.index__link[aria-current='page'] {
			text-decoration: none;
		}

		.index__link[aria-current='page']::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			width: 0.875rem;
			height: 1px;
			background: var(--text);
		}
	}
</style>
