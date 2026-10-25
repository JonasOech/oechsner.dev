<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import { nav, site, contacts, feeds } from '$lib/data/site';
	import { trackFeed } from '$lib/track';

	/**
	 * The left column of the split page. At 64em and wider it is a fixed full-height rail
	 * carrying the name, a one-line description, the nav and the contact links; below that
	 * it is an ordinary header at the top of the page (name, then nav on one wrapping row).
	 *
	 * On post pages the outline is drawn into the rail's empty middle. It stays in the
	 * article's own markup (so it prerenders and needs no script) and is positioned over the
	 * column with `position: fixed`, which is why the rail trims its description there.
	 */
	function isCurrent(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}

	const isPost = $derived(page.url.pathname.startsWith('/blog/'));

	/** The three channels worth a permanent place in the rail; the university address stays on /contact. */
	const railContacts = contacts.filter((c) => c.primary || c.icon !== 'mail');
</script>

<header class="side" data-post={isPost}>
	<div class="side__inner">
		<div class="side__id">
			<a class="side__name" href="/">{site.name}</a>
			<p class="side__desc">{site.description}</p>
		</div>

		<nav class="side__nav" aria-label="Primary">
			{#each nav as item (item.href)}
				<a
					class="side__link"
					href={item.href}
					aria-current={isCurrent(item.href) ? 'page' : undefined}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<ul class="side__contact" aria-label="Contact">
			{#each railContacts as channel (channel.href)}
				<li>
					<a
						class="side__contact-link"
						href={channel.href}
						target={channel.href.startsWith('http') ? '_blank' : undefined}
						rel={channel.href.startsWith('http') ? 'noreferrer noopener' : undefined}
					>
						<Icon name={channel.icon} size={14} />
						{channel.label}
					</a>
				</li>
			{/each}
			<li>
				<a
					class="side__contact-link"
					href={feeds.rss}
					type="application/rss+xml"
					data-sveltekit-reload
					onclick={() => trackFeed('open-rss', 'side-rail')}
				>
					<Icon name="rss" size={14} />
					RSS
				</a>
			</li>
		</ul>
	</div>
</header>

<style>
	/* — Collapsed (default): a plain top header — */
	.side {
		border-bottom: 1px solid var(--line);
	}

	.side__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0 var(--s-5);
		padding: var(--s-4) var(--gutter) var(--s-2);
	}

	.side__id {
		display: block;
	}

	.side__name {
		font-family: var(--font-display);
		font-variation-settings: var(--display-settings);
		font-size: 1.25rem;
		font-weight: 500;
		letter-spacing: -0.01em;
		line-height: 1.2;
		color: var(--text);
		text-decoration: none;
		display: inline-block;
		padding-block: 0.5rem;
	}

	.side__desc,
	.side__contact {
		display: none;
	}

	.side__nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--s-5);
	}

	.side__link {
		position: relative;
		font-family: var(--font-sans);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		line-height: 1;
		color: var(--text-muted);
		text-decoration: none;
		padding: 0.875rem 0;
		transition: color var(--dur-fast) var(--ease-out);
	}

	/* Collapsed: the current page is marked by a hairline underneath its label. */
	.side__link::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0.5rem;
		height: 1px;
		background: var(--accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--dur-base) var(--ease-out);
	}

	.side__link[aria-current='page'] {
		color: var(--text);
	}

	.side__link[aria-current='page']::before {
		transform: scaleX(1);
	}

	@media (hover: hover) and (pointer: fine) {
		.side__link:hover {
			color: var(--text);
		}
		.side__link:hover::before {
			transform: scaleX(1);
		}
	}

	.side__link:focus-visible,
	.side__name:focus-visible,
	.side__contact-link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.side__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding-block: 0;
		}
		.side__link::before {
			bottom: 0.625rem;
		}
	}

	/* — Split (64em and up): the fixed left column — */
	@media (min-width: 64em) {
		.side {
			position: sticky;
			top: 0;
			height: 100dvh;
			border-bottom: 0;
			border-right: 1px solid var(--line);
		}

		.side__inner {
			height: 100%;
			display: flex;
			flex-direction: column;
			flex-wrap: nowrap;
			align-items: stretch;
			justify-content: flex-start;
			gap: var(--s-7);
			padding: var(--s-8) var(--s-6) var(--s-6);
			overflow-y: auto;
		}

		.side__name {
			font-size: 1.5rem;
			padding-block: 0;
		}

		.side__desc {
			display: block;
			margin-top: var(--s-3);
			font-size: 0.875rem;
			line-height: 1.6;
			color: var(--text-muted);
			max-width: 26ch;
			text-wrap: pretty;
		}

		/* The outline needs the middle of the rail on a post, so the description steps
		   aside and the nav tightens. */
		.side[data-post='true'] .side__desc {
			display: none;
		}

		.side[data-post='true'] .side__inner {
			gap: var(--s-5);
			padding-top: var(--s-6);
		}

		.side__nav {
			flex-direction: column;
			gap: 0;
		}

		.side__link {
			font-size: 0.8125rem;
			letter-spacing: 0.1em;
			padding: 0.5rem 0 0.5rem 1.75rem;
		}

		/* A short rule slides in ahead of the current page. */
		.side__link::before {
			left: 0;
			right: auto;
			bottom: auto;
			top: calc(50% - 0.5px);
			width: 1.125rem;
			transform: scaleX(0);
		}

		.side__contact {
			display: grid;
			gap: 0;
			list-style: none;
			margin: auto 0 0;
			padding: var(--s-4) 0 0;
			border-top: 1px solid var(--line);
		}

		.side__contact-link {
			display: inline-flex;
			align-items: center;
			gap: var(--s-2);
			font-size: 0.8125rem;
			line-height: 1;
			color: var(--text-secondary);
			text-decoration: none;
			padding: 0.5rem 0;
			transition: color var(--dur-fast) var(--ease-out);
		}

		.side__contact-link :global(svg) {
			color: var(--text-muted);
			transition: color var(--dur-fast) var(--ease-out);
		}

		@media (hover: hover) and (pointer: fine) {
			.side__contact-link:hover,
			.side__contact-link:hover :global(svg) {
				color: var(--accent);
			}
		}

		/* Short windows: the rail would scroll, so drop to the essentials. */
		@media (max-height: 40rem) {
			.side__desc {
				display: none;
			}
			.side__inner {
				gap: var(--s-5);
				padding-top: var(--s-6);
			}
		}
	}
</style>
