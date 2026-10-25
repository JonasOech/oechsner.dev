<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container">
		<div class="footer__panel">
			<div class="footer__brand">
				<span class="footer__mark" aria-hidden="true">JÖ</span>
				<p class="footer__name">{site.name}</p>
				<p class="footer__tag">Notes on ML, systems and the software behind them.</p>
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
					<Icon name="rss" size={13} />
					RSS
				</a>
			</nav>

			<p class="footer__copy">
				© {site.startYear === year ? year : `${site.startYear}–${year}`}
				{site.name}
				<span aria-hidden="true">·</span>
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
				Deployed with SvelteKit on Cloudflare Pages. Built with AI. Set in Inter and JetBrains Mono.
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--gap-hero);
		padding-bottom: var(--s-5);
	}

	.footer__panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas:
			'brand nav'
			'copy  colophon';
		gap: var(--s-5) var(--s-6);
		align-items: start;
		padding: var(--s-5);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-1);
	}

	.footer__brand {
		grid-area: brand;
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: var(--s-3);
		align-items: center;
	}

	.footer__mark {
		grid-row: span 2;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 11px;
		background: var(--grad);
		color: var(--text-inverse);
		font-size: 0.75rem;
		font-weight: 700;
	}

	.footer__name {
		font-weight: 650;
		color: var(--text);
		line-height: 1.3;
	}

	.footer__tag {
		font-size: 0.8125rem;
		color: var(--text-muted);
		line-height: 1.4;
	}

	.footer__nav {
		grid-area: nav;
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-1) var(--s-2);
		justify-content: flex-end;
	}

	.footer__link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
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

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover {
			color: var(--text);
			background: var(--surface-active);
		}
	}

	.footer__copy {
		grid-area: copy;
		padding-top: var(--s-4);
		border-top: 1px solid var(--line);
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.footer__colophon {
		grid-area: colophon;
		padding-top: var(--s-4);
		border-top: 1px solid var(--line);
		font-size: 0.75rem;
		color: var(--text-muted);
		text-align: right;
	}

	.footer__legal-link {
		display: inline;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: var(--text-secondary);
		text-decoration: underline;
		text-decoration-color: var(--line-strong);
		text-underline-offset: 0.2em;
		cursor: pointer;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__legal-link:hover {
			color: var(--accent);
			text-decoration-color: currentColor;
		}
	}

	.footer__link:focus-visible,
	.footer__legal-link:focus-visible {
		outline: none;
		border-radius: var(--r-xs);
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 767px) {
		.footer__panel {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'brand'
				'nav'
				'copy'
				'colophon';
			padding: var(--s-4);
			border-radius: var(--r-md);
		}

		.footer__nav {
			justify-content: flex-start;
			margin-inline: calc(var(--s-3) * -1);
		}

		.footer__colophon {
			text-align: left;
			border-top: 0;
			padding-top: 0;
		}
	}
</style>
