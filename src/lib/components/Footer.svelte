<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container footer__inner">
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
			Deployed with SvelteKit on Cloudflare Pages. Built with AI.
		</p>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--gap-hero);
		padding-block: var(--s-8) var(--s-7);
		background: transparent;
	}

	/* A short double rule sits on the footer's top edge, like the tail-piece of a chapter. */
	.footer::before {
		content: '';
		display: block;
		width: 3rem;
		height: 3px;
		margin: 0 auto var(--s-6);
		border-top: 1px solid var(--text);
		border-bottom: 1px solid var(--text);
	}

	.footer__inner {
		display: grid;
		justify-items: center;
		gap: var(--s-5);
		text-align: center;
	}

	.footer__nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--s-5);
	}

	.footer__link {
		font-family: var(--font-serif);
		font-size: 1rem;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 0.1em;
		font-variant-caps: all-small-caps;
		color: var(--text-muted);
		text-decoration: none;
		padding: 0.5rem 0.125rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	/* The icon takes the accent so the feed is findable at a glance; the label stays in
	   step with the other footer links. */
	.footer__feed {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
	}

	.footer__feed :global(svg) {
		color: var(--accent-dim);
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover {
			color: var(--accent);
		}
		.footer__feed:hover :global(svg) {
			color: var(--accent);
		}
	}

	.footer__link:active {
		color: var(--accent-press);
	}

	.footer__link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.footer__copy {
		font-family: var(--font-serif);
		font-size: 0.9375rem;
		font-weight: 400;
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
		font-family: var(--font-serif);
		font-size: 0.9375rem;
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
		color: var(--accent-press);
	}

	.footer__legal-link:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.footer__legal-link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding: 0 0.5rem;
		}
	}

	.footer__colophon {
		font-size: 0.9375rem;
		font-style: italic;
		color: var(--text-muted);
		max-width: 46ch;
		line-height: 1.5;
		margin: 0;
	}

	@media (pointer: coarse) {
		.footer__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding: 0 0.5rem;
		}
	}
</style>
