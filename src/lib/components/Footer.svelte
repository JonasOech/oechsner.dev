<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container">
		<p class="footer__ornament" aria-hidden="true">&lowast;&nbsp;&nbsp;&lowast;&nbsp;&nbsp;&lowast;</p>

		<div class="footer__cols">
			<section class="footer__col" aria-labelledby="colophon-h">
				<h2 class="footer__h" id="colophon-h">Colophon</h2>
				<p class="footer__text">
					Set in Playfair Display and Newsreader, with code in JetBrains Mono, on a paper-toned
					ground. Deployed with SvelteKit on Cloudflare Pages. Built with AI.
				</p>
			</section>

			<nav class="footer__col" aria-labelledby="sections-h">
				<h2 class="footer__h" id="sections-h">Sections</h2>
				<ul class="footer__list">
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

			<section class="footer__col" aria-labelledby="legal-h">
				<h2 class="footer__h" id="legal-h">Imprint</h2>
				<ul class="footer__list">
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
			</section>
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
		border-top: 4px double var(--rule);
	}

	.footer__ornament {
		text-align: center;
		font-size: 1.5rem;
		line-height: 1;
		color: var(--accent);
		margin: 0 0 var(--s-5);
	}

	.footer__cols {
		display: grid;
		grid-template-columns: 1.4fr 1fr 1fr;
		gap: var(--s-6);
	}

	.footer__col + .footer__col {
		padding-left: var(--s-6);
		border-left: 1px solid var(--line-strong);
	}

	.footer__h {
		font-family: var(--font-text);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--accent);
		margin: 0 0 var(--s-3);
	}

	.footer__text {
		font-size: 0.9375rem;
		line-height: 1.55;
		color: var(--text-secondary);
		max-width: 42ch;
	}

	.footer__list {
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
		font-family: var(--font-text);
		font-size: 1rem;
		line-height: 1.4;
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: var(--line-strong);
		text-underline-offset: 0.25em;
		padding: 0.25rem 0;
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		transition:
			color var(--dur-fast) var(--ease-out),
			text-decoration-color var(--dur-fast) var(--ease-out);
	}

	.footer__feed :global(svg) {
		color: var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover {
			color: var(--accent);
			text-decoration-color: var(--accent);
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
			min-height: 44px;
		}
	}

	.footer__copy {
		margin: var(--s-6) 0 0;
		padding-top: var(--s-3);
		border-top: 1px solid var(--line);
		text-align: center;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	@media (max-width: 767px) {
		.footer__cols {
			grid-template-columns: 1fr 1fr;
		}
		.footer__col:first-child {
			grid-column: 1 / -1;
		}
		.footer__col + .footer__col {
			border-left: 0;
			padding-left: 0;
		}
	}
</style>
