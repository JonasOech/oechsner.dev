<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Geometry from '$lib/components/Geometry.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<Geometry variant="stripe" class="footer__stripe" />
	<div class="container footer__inner">
		<div class="footer__brand">
			<Geometry variant="solo" class="footer__solo" />
			<p class="footer__name">{site.name}</p>
			<p class="footer__colophon">
				Deployed with SvelteKit on Cloudflare Pages. Built with AI. Set in Jost and JetBrains
				Mono, in red, yellow, blue and black.
			</p>
		</div>

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
				<Icon name="rss" size={16} />
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
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--gap-hero);
		background: var(--ink);
		color: var(--text-inverse);
	}

	.footer :global(.footer__stripe) {
		height: 16px;
		width: 100%;
	}

	.footer__inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas:
			'brand nav'
			'copy  copy';
		gap: var(--s-7) var(--s-8);
		padding-block: var(--s-8) var(--s-6);
	}

	.footer__brand {
		grid-area: brand;
		display: grid;
		gap: var(--s-4);
		align-content: start;
		justify-items: start;
	}

	.footer__brand :global(.footer__solo) {
		width: 150px;
	}

	.footer__name {
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-inverse);
		line-height: 1.1;
	}

	.footer__colophon {
		font-size: 0.9375rem;
		color: var(--text-on-ink-muted);
		max-width: 44ch;
		line-height: 1.6;
	}

	.footer__nav {
		grid-area: nav;
		display: grid;
		align-content: start;
		gap: var(--s-1);
		min-width: 12rem;
	}

	.footer__link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
		font-family: var(--font-sans);
		font-size: 1.125rem;
		font-weight: 800;
		line-height: 1;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-inverse);
		text-decoration: none;
		padding: 0.875rem 0;
		border-bottom: 2px solid var(--text-on-ink-muted);
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			padding var(--dur-fast) var(--ease-out);
	}

	.footer__feed {
		justify-content: flex-start;
		gap: 0.5em;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover {
			background: var(--yellow);
			color: var(--ink);
			padding-inline: var(--s-3);
		}
	}

	.footer__link:active {
		background: var(--red);
		color: var(--text-inverse);
	}

	.footer__link:focus-visible,
	.footer__legal-link:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 3px var(--ink),
			0 0 0 6px var(--yellow);
	}

	.footer__copy {
		grid-area: copy;
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-on-ink-muted);
		margin: 0;
		padding-top: var(--s-5);
		border-top: 2px solid var(--text-on-ink-muted);
	}

	.footer__legal-link {
		/* The button shares the anchors' styling exactly, so the three read as one row of
		   equals — a `button` inherits none of it, hence the explicit reset. */
		appearance: none;
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text-inverse);
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-decoration-color: var(--yellow);
		text-underline-offset: 4px;
		padding: 0.5rem 0.125rem;
		display: inline-block;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__legal-link:hover {
			color: var(--yellow);
		}
	}

	@media (pointer: coarse) {
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
			grid-template-areas:
				'nav'
				'brand'
				'copy';
			padding-block: var(--s-7) var(--s-5);
		}
	}
</style>
