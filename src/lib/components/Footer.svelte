<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container">
		<div class="footer__grid">
			<div class="footer__colophon">
				<p class="footer__name">{site.name}</p>
				<p class="footer__note">
					Set in Newsreader and JetBrains Mono, both self-hosted. Deployed with SvelteKit on
					Cloudflare Pages. Built with AI.
				</p>
			</div>

			<nav class="footer__col" aria-label="Footer">
				<p class="label">Sections</p>
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

			<div class="footer__col">
				<p class="label">Legal</p>
				<a class="footer__link" href="/impressum">Impressum</a>
				<a class="footer__link" href="/datenschutz">Datenschutz</a>
				<!-- Withdrawing consent has to be as easy as giving it (Art. 7 Abs. 3 DSGVO), so
				     the banner is one press away from every page. A button rather than a link:
				     it changes state here, it does not go anywhere. -->
				<button type="button" class="footer__link" onclick={reopenConsent}>
					Cookie settings
				</button>
			</div>
		</div>

		<p class="footer__copy">
			© {site.startYear === year ? year : `${site.startYear}–${year}`}
			{site.name}
		</p>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--gap-hero);
		padding-block: var(--s-6) var(--s-6);
		border-top: 1px solid var(--line-strong);
	}

	.footer__grid {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--s-6) var(--s-7);
		padding-bottom: var(--s-6);
		border-bottom: 1px solid var(--line);
	}

	.footer__name {
		font-size: 1.25rem;
		font-weight: 500;
		line-height: 1.2;
		color: var(--text);
		margin: 0 0 var(--s-2);
	}

	.footer__note {
		font-size: 0.9375rem;
		font-style: italic;
		line-height: 1.55;
		color: var(--text-muted);
		max-width: 40ch;
		margin: 0;
	}

	.footer__col {
		display: grid;
		align-content: start;
		justify-items: start;
		gap: 0.125rem;
	}

	.footer__col .label {
		margin-bottom: var(--s-2);
	}

	.footer__link {
		appearance: none;
		background: none;
		border: 0;
		cursor: pointer;
		font-family: var(--font-serif);
		font-size: 1.0625rem;
		font-weight: 400;
		line-height: 1.3;
		color: var(--text-secondary);
		text-decoration: none;
		padding: 0.25rem 0;
		text-align: left;
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
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.footer__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
		}
	}

	.footer__copy {
		margin: var(--s-4) 0 0;
		font-size: 0.9375rem;
		font-variant-caps: all-small-caps;
		letter-spacing: var(--caps-tracking);
		font-variant-numeric: tabular-nums lining-nums;
		color: var(--text-muted);
	}

	@media (max-width: 767px) {
		.footer__grid {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		}

		.footer__colophon {
			grid-column: 1 / -1;
		}
	}
</style>
