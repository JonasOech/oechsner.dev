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
				{site.name}.
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
				Set in your system's own serif, black on paper by day and the reverse after dark. Built
				with SvelteKit and deployed on Cloudflare Pages. Built with AI.
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		margin-top: var(--gap-hero);
		padding-bottom: var(--s-7);
	}

	.footer__inner {
		display: grid;
		gap: var(--s-3);
		padding-top: var(--s-5);
		border-top: 1px solid var(--line);
	}

	.footer__nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--s-5);
	}

	.footer__link,
	.footer__legal-link {
		font-family: var(--font-serif);
		font-size: 0.9375rem;
		color: var(--text-muted);
		text-decoration: none;
		padding-block: 0.25rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	/* The cookie control is a button, the others anchors; one reset makes them equals. */
	.footer__legal-link {
		appearance: none;
		background: none;
		border: 0;
		cursor: pointer;
		padding-inline: 0;
		text-decoration: underline;
		text-decoration-color: var(--line-strong);
		text-underline-offset: 0.2em;
	}

	.footer__feed {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover,
		.footer__legal-link:hover {
			color: var(--text);
		}
	}

	.footer__link:focus-visible,
	.footer__legal-link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.footer__copy,
	.footer__colophon {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--text-muted);
	}

	.footer__colophon {
		max-width: 52ch;
	}

	@media (pointer: coarse) {
		.footer__link,
		.footer__legal-link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding-block: 0;
		}
	}
</style>
