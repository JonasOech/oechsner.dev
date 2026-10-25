<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container footer__inner">
		<p class="footer__rule" aria-hidden="true">EOF</p>

		<nav class="footer__nav" aria-label="Footer">
			{#each footerNav as item (item.href)}
				<a class="footer__link" href={item.href}>{item.label.toLowerCase()}</a>
			{/each}
			<a
				class="footer__link footer__feed"
				href={feeds.rss}
				type="application/rss+xml"
				data-sveltekit-reload
				onclick={() => trackFeed('open-rss', 'site-footer')}
			>
				<Icon name="rss" size={13} />
				rss
			</a>
		</nav>

		<p class="footer__copy">
			© {site.startYear === year ? year : `${site.startYear}–${year}`}
			{site.name}
			<span aria-hidden="true">|</span>
			<a class="footer__legal-link" href="/impressum">Impressum</a>
			<span aria-hidden="true">|</span>
			<a class="footer__legal-link" href="/datenschutz">Datenschutz</a>
			<span aria-hidden="true">|</span>
			<!-- Withdrawing consent has to be as easy as giving it (Art. 7 Abs. 3 DSGVO), so
			     the banner is one press away from every page. A button rather than a link:
			     it changes state here, it does not go anywhere. -->
			<button type="button" class="footer__legal-link" onclick={reopenConsent}>
				Cookie settings
			</button>
		</p>

		<p class="footer__colophon">
			Deployed with SvelteKit on Cloudflare Pages. Built with AI. Set in JetBrains Mono.
		</p>
	</div>

	<!-- The keyboard-hint bar. Decorative: the keys it names are real (1-4 in the header),
	     but every one of them has an ordinary link, so screen readers lose nothing. -->
	<div class="hints" aria-hidden="true">
		<div class="container hints__row">
			<span><b>1-4</b> goto</span>
			<span><b>tab</b> next link</span>
			<span><b>space</b> page down</span>
			<span><b>end</b> bottom</span>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--gap-hero);
		background: var(--bg-deep);
		border-top: 1px solid var(--line-strong);
	}

	.footer__inner {
		display: grid;
		gap: var(--s-3);
		padding-block: var(--s-4) var(--s-5);
	}

	.footer__rule {
		font-size: 0.75rem;
		color: var(--text-muted);
		overflow: hidden;
		white-space: nowrap;
	}

	.footer__rule::after {
		content: ' ────────────────────────────────────────────────────────────────────────────────────────────────────';
		color: var(--line-strong);
	}

	.footer__nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--s-4);
	}

	.footer__link {
		font-size: 0.8125rem;
		line-height: 1;
		color: var(--text-secondary);
		text-decoration: none;
		padding: 0.625rem 0.5ch;
		margin-left: -0.5ch;
	}

	.footer__link::before {
		content: './';
		color: var(--text-muted);
	}

	.footer__feed {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
	}

	.footer__feed :global(svg) {
		color: var(--prompt);
	}

	.footer__feed::before {
		content: none;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover {
			background: var(--accent);
			color: var(--text-inverse);
		}
		.footer__link:hover :global(svg) {
			color: var(--text-inverse);
		}
	}

	.footer__link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.footer__copy {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin: 0;
	}

	.footer__legal-link {
		appearance: none;
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--text-secondary);
		text-decoration: underline;
		text-decoration-color: var(--line-strong);
		text-underline-offset: 3px;
		padding: 0.5rem 0.125rem;
		display: inline-block;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__legal-link:hover {
			background: var(--accent);
			color: var(--text-inverse);
		}
	}

	.footer__legal-link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.footer__legal-link,
		.footer__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
		}
	}

	.footer__colophon {
		font-size: 0.75rem;
		color: var(--text-muted);
		max-width: 64ch;
		line-height: 1.6;
		margin: 0;
	}

	.hints {
		background: var(--surface-active);
		border-top: 1px solid var(--line-strong);
		font-size: 0.6875rem;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	.hints__row {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--s-5);
		padding-block: 0.25rem;
	}

	.hints b {
		background: var(--text-secondary);
		color: var(--text-inverse);
		padding: 0 0.75ch;
		margin-right: 0.5ch;
	}
</style>
