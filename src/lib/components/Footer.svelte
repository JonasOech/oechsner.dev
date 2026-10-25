<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container footer__inner grid">
		<p class="footer__name">
			<span class="footer__mark" aria-hidden="true"></span>
			{site.name}
		</p>

		<nav class="footer__nav" aria-label="Footer">
			<p class="footer__head">Pages</p>
			<ul>
				{#each footerNav as item (item.href)}
					<li><a class="footer__link" href={item.href}>{item.label}</a></li>
				{/each}
				<li>
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
				</li>
			</ul>
		</nav>

		<div class="footer__legal">
			<p class="footer__head">Legal</p>
			<ul>
				<li><a class="footer__link" href="/impressum">Impressum</a></li>
				<li><a class="footer__link" href="/datenschutz">Datenschutz</a></li>
				<li>
					<!-- Withdrawing consent has to be as easy as giving it (Art. 7 Abs. 3 DSGVO), so
					     the banner is one press away from every page. A button rather than a link:
					     it changes state here, it does not go anywhere. -->
					<button type="button" class="footer__link" onclick={reopenConsent}>
						Cookie settings
					</button>
				</li>
			</ul>
		</div>

		<div class="footer__colophon">
			<p class="footer__head">Colophon</p>
			<p>
				Set in Inter on a twelve-column grid, in black, white and one red. Deployed with
				SvelteKit on Cloudflare Pages. Built with AI.
			</p>
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
		padding-block: var(--s-5) var(--s-6);
		border-top: 6px solid var(--line-strong);
	}

	.footer__inner {
		row-gap: var(--s-6);
		align-items: start;
	}

	.footer__name {
		grid-column: 1 / span 3;
		display: flex;
		align-items: center;
		gap: 0.625rem;
		font-size: 0.9375rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.footer__mark {
		width: 0.75rem;
		height: 0.75rem;
		background: var(--accent);
	}

	.footer__nav {
		grid-column: 4 / span 3;
	}

	.footer__legal {
		grid-column: 7 / span 3;
	}

	.footer__colophon {
		grid-column: 10 / span 3;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: var(--text-muted);
	}

	.footer__head {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text);
		margin: 0 0 var(--s-3);
		padding-bottom: var(--s-2);
		border-bottom: 1px solid var(--line-strong);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0;
	}

	.footer__link {
		appearance: none;
		background: none;
		border: 0;
		cursor: pointer;
		display: inline-block;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--text);
		text-decoration: none;
		padding: 0.3125rem 0;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.footer__feed {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
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
		box-shadow: var(--focus-ring);
	}

	.footer__copy {
		grid-column: 1 / -1;
		padding-top: var(--s-3);
		border-top: 1px solid var(--line);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	@media (pointer: coarse) {
		.footer__link {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding-block: 0;
		}
	}

	@media (max-width: 1023px) {
		.footer__name {
			grid-column: 1 / -1;
		}
		.footer__nav {
			grid-column: 1 / span 4;
		}
		.footer__legal {
			grid-column: 5 / span 4;
		}
		.footer__colophon {
			grid-column: 9 / span 4;
		}
	}

	@media (max-width: 767px) {
		.footer__name,
		.footer__nav,
		.footer__legal,
		.footer__colophon,
		.footer__copy {
			grid-column: 1 / -1;
		}
	}
</style>
