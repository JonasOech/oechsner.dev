<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container">
	<div class="footer__inner">
		<p class="footer__name">{site.name}</p>

		<div class="footer__body">
			<nav class="footer__nav" aria-label="Footer">
				{#each footerNav as item (item.href)}
					<a class="footer__link" href={item.href}>{item.label}</a>
				{/each}
				<a
					class="footer__link footer__feed"
					href={feeds.rss}
					type="application/rss+xml"
					data-sveltekit-reload
					onclick={() => trackFeed('open-rss', 'site-footer')}
				>
					<Icon name="rss" size={13} />
					RSS
				</a>
			</nav>

			<p class="footer__copy">
				© {site.startYear === year ? year : `${site.startYear}–${year}`}
				{site.name} -
				<a class="footer__legal-link" href="/impressum">Impressum</a>
				<span aria-hidden="true">·</span>
				<a class="footer__legal-link" href="/datenschutz">Datenschutz</a>
				<span aria-hidden="true">·</span>
				<!-- Withdrawing consent has to be as easy as giving it (Art. 7 Abs. 3 DSGVO), so
				     the banner is one press away from every page. A button rather than a link:
				     it changes state here, it does not go anywhere. -->
				<button type="button" class="footer__legal-link" onclick={reopenConsent}>
					Cookie settings
				</button>
			</p>

			<p class="footer__colophon">
				Deployed with SvelteKit on Cloudflare Pages. Built with AI. Set in Schibsted Grotesk
				and JetBrains Mono.
			</p>
		</div>
	</div>
	</div>
</footer>

<style>
	/* The footer closes the page on the same ink hairline every section opens on, with
	   the name hung in the first three columns like a rail label. */
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--gap-hero);
		padding-block: var(--s-3) var(--s-7);
		background: var(--bg);
	}

	.footer__inner {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--col-gap);
		border-top: 1px solid var(--text);
		padding-top: var(--s-3);
	}

	.footer__name {
		grid-column: 1 / 4;
		margin: 0;
		padding-top: 0.2rem;
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text);
	}

	.footer__body {
		grid-column: 4 / -1;
		display: grid;
		gap: var(--s-3);
		justify-items: start;
	}

	.footer__nav {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2) var(--s-5);
	}

	.footer__link {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1;
		color: var(--text-secondary);
		text-decoration: none;
		padding: 0.5rem 0;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.footer__feed {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
	}

	.footer__feed :global(svg) {
		color: var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover {
			color: var(--accent);
		}
	}

	.footer__link:active {
		color: var(--accent-dim);
	}

	.footer__link:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	.footer__copy {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		color: var(--text-muted);
		margin: 0;
	}

	.footer__legal-link {
		/* The button shares the anchors' styling exactly, so the three read as one row of
		   equals — a `button` inherits none of it, hence the explicit reset. */
		appearance: none;
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 400;
		color: var(--text-muted);
		text-decoration: underline;
		text-decoration-color: var(--line-strong);
		text-underline-offset: 3px;
		padding: 0.5rem 0.125rem;
		display: inline-block;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__legal-link:hover {
			color: var(--accent);
			text-decoration-color: var(--accent);
		}
	}

	.footer__legal-link:active {
		color: var(--accent-dim);
	}

	.footer__legal-link:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	.footer__colophon {
		font-size: 0.8125rem;
		color: var(--text-muted);
		max-width: 62ch;
		line-height: 1.6;
		margin: 0;
	}

	@media (pointer: coarse) {
		.footer__link,
		.footer__legal-link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding: 0 0.5rem;
		}
	}

	@media (max-width: 767px) {
		.footer__inner {
			grid-template-columns: minmax(0, 1fr);
		}
		.footer__name,
		.footer__body {
			grid-column: 1;
		}
		.footer__name {
			margin-bottom: var(--s-3);
		}
	}
</style>
