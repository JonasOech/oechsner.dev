<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container footer__inner">
		<p class="footer__sign" aria-hidden="true">That's all, folks. Staple it shut.</p>

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
			Colophon: set in Anton, Special Elite, Permanent Marker and Source Serif. Two inks, one
			cream sheet, a lot of tape. Deployed with SvelteKit on Cloudflare Pages. Built with AI.
		</p>
	</div>
</footer>

<style>
	/* The back page: a strip of dark ink with a torn top edge, so the last sheet looks
	   ripped off a bigger one. Type flips to cream; links go orange. */
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--gap-hero);
		padding-block: var(--s-8) var(--s-7);
		background: var(--bg-deep);
		color: var(--paper);
		clip-path: var(--torn-top);
	}

	.footer__inner {
		display: grid;
		justify-items: center;
		gap: var(--s-5);
		text-align: center;
	}

	.footer__sign {
		font-family: var(--font-marker);
		font-size: 1.5rem;
		line-height: 1.2;
		color: var(--accent);
		transform: rotate(-2deg);
	}

	.footer__nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--s-2) var(--s-5);
	}

	.footer__link {
		font-family: var(--font-head);
		font-size: 1.125rem;
		line-height: 1;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--paper);
		text-decoration: none;
		padding: 0.6rem 0.25rem;
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
			text-decoration: underline;
			text-decoration-thickness: 3px;
			text-underline-offset: 0.2em;
		}
	}

	.footer__link:active {
		color: var(--accent);
	}

	.footer__link:focus-visible,
	.footer__legal-link:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 2px;
	}

	.footer__copy {
		font-family: var(--font-type);
		font-size: 0.875rem;
		color: var(--paper);
		margin: 0;
	}

	.footer__legal-link {
		/* The button shares the anchors' styling exactly, so the three read as one row of
		   equals — a `button` inherits none of it, hence the explicit reset. */
		appearance: none;
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-type);
		font-size: 0.875rem;
		color: var(--paper);
		text-decoration: underline;
		text-decoration-color: var(--accent);
		text-decoration-thickness: 2px;
		text-underline-offset: 3px;
		padding: 0.5rem 0.125rem;
		display: inline-block;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__legal-link:hover {
			color: var(--accent);
		}
	}

	.footer__legal-link:active {
		color: var(--accent);
	}

	@media (pointer: coarse) {
		.footer__legal-link,
		.footer__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding: 0 0.5rem;
		}
	}

	.footer__colophon {
		font-family: var(--font-type);
		font-size: 0.8125rem;
		color: rgba(var(--paper-rgb), 0.8);
		max-width: 52ch;
		line-height: 1.6;
		margin: 0;
	}
</style>
