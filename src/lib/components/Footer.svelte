<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container">
		<!-- The colophon is a small window of its own: "About This Site", in the old
		     Apple-menu sense. -->
		<div class="win footer__win">
			<div class="win__bar">
				<span class="win__close" aria-hidden="true"></span>
				<p class="win__title">About This Site</p>
				<span class="win__zoom" aria-hidden="true"></span>
			</div>

			<div class="win__body footer__body">
				<span class="footer__icon" aria-hidden="true"><Icon name="disk" size={44} /></span>

				<div class="footer__text">
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
							<Icon name="rss" size={14} />
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
						Deployed with SvelteKit on Cloudflare Pages. Built with AI. Set in Pixelify Sans and
						Atkinson Hyperlegible, on a desktop that never existed.
					</p>
				</div>
			</div>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--s-7);
		padding-bottom: var(--s-7);
	}

	.footer__win {
		max-width: 44rem;
		margin-inline: auto;
	}

	.footer__body {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--s-4);
		align-items: start;
	}

	.footer__icon {
		color: var(--ink);
	}

	.footer__text {
		display: grid;
		gap: var(--s-3);
		min-width: 0;
	}

	.footer__nav {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-1) var(--s-4);
	}

	.footer__link {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		padding: 0.25rem 0;
	}

	.footer__copy {
		font-family: var(--font-display);
		font-size: 0.9375rem;
		color: var(--text);
	}

	.footer__legal-link {
		/* The button shares the anchors' styling exactly, so the three read as one row of
		   equals — a `button` inherits none of it, hence the explicit reset. */
		appearance: none;
		background: none;
		border: none;
		cursor: pointer;
		font: inherit;
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		padding: 0.25rem 0;
		display: inline-block;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover,
		.footer__legal-link:hover {
			background: var(--ink);
			color: var(--paper);
		}
	}

	.footer__link:active,
	.footer__legal-link:active {
		background: var(--ink);
		color: var(--paper);
	}

	.footer__link:focus-visible,
	.footer__legal-link:focus-visible {
		outline: 2px dotted var(--ink);
		outline-offset: 2px;
	}

	.footer__colophon {
		font-size: 0.9375rem;
		color: var(--text-muted);
		line-height: 1.55;
	}

	@media (pointer: coarse) {
		.footer__link,
		.footer__legal-link {
			min-height: 44px;
			align-items: center;
		}
		.footer__legal-link {
			display: inline-flex;
		}
	}

	@media (max-width: 479px) {
		.footer__body {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
