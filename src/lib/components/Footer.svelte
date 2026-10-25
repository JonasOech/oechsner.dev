<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container footer__inner">
		<div class="footer__top">
			<p class="footer__brand">{site.shortName}</p>

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
					<Icon name="rss" size={15} />
					RSS
				</a>
			</nav>
		</div>

		<div class="footer__bottom">
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
				Deployed with SvelteKit on Cloudflare Pages. Built with AI.
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--gap-hero);
		padding-block: var(--s-7) var(--s-6);
		background-color: var(--ink);
		color: var(--text-inverse);
		/* A strip of the four sticker colours along the top edge of the black. */
		background-image: linear-gradient(
			90deg,
			var(--yellow) 0 25%,
			var(--pink) 25% 50%,
			var(--blue) 50% 75%,
			var(--lime) 75% 100%
		);
		background-size: 100% 12px;
		background-repeat: no-repeat;
	}

	.footer__inner {
		display: grid;
		gap: var(--s-6);
		padding-top: var(--s-3);
	}

	.footer__top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-5);
	}

	.footer__brand {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--ink);
		background: var(--yellow);
		padding: 0.4rem 0.8rem 0.5rem;
		transform: rotate(-2deg);
	}

	.footer__nav {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-3);
	}

	.footer__link {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		font-weight: 800;
		line-height: 1;
		color: var(--text-inverse);
		border: var(--bw-thin) solid var(--text-inverse);
		border-radius: 999px;
		text-decoration: none;
		padding: 0.65rem 1rem;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover {
			background: var(--lime);
			color: var(--ink);
			border-color: var(--lime);
			transform: translateY(-2px) rotate(-2deg);
		}
	}

	.footer__link:active {
		background: var(--pink);
		color: var(--ink);
	}

	.footer__link:focus-visible {
		outline: none;
		box-shadow: 0 0 0 3px var(--ink), 0 0 0 6px var(--yellow);
	}

	.footer__bottom {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--s-3) var(--s-6);
		padding-top: var(--s-5);
		border-top: var(--bw-thin) dashed var(--text-inverse);
	}

	.footer__copy,
	.footer__colophon {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 700;
		line-height: 1.6;
		color: var(--text-inverse);
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
		font-weight: 800;
		color: var(--yellow);
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 3px;
		padding: 0.5rem 0.125rem;
		display: inline-block;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__legal-link:hover {
			color: var(--lime);
		}
	}

	.footer__legal-link:focus-visible {
		outline: none;
		box-shadow: 0 0 0 3px var(--ink), 0 0 0 6px var(--yellow);
	}

	@media (pointer: coarse) {
		.footer__legal-link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding: 0 0.5rem;
		}
		.footer__link {
			min-height: 44px;
		}
	}
</style>
