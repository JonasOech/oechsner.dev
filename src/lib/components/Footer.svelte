<script lang="ts">
	import WayfinderMark from '$lib/components/WayfinderMark.svelte';
	import { contacts, cvPath, feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
	const years = site.startYear === year ? `${year}` : `${site.startYear}–${year}`;
	const elsewhere = contacts.filter((c) => c.label !== 'University');
</script>

<!-- After georgesiosi.com: brand and a one-line mission beside columns of links, then a
     proverb and the legal line, ruled off underneath. -->
<footer class="footer">
	<div class="container">
		<div class="footer__top">
			<div class="footer__brand">
				<a class="footer__mark" href="/">
					<WayfinderMark size={24} />
					<span>{site.name}</span>
				</a>
				<p class="footer__mission">
					Notes from an applied CS degree: machine learning, systems, and the concepts behind
					the software.
					<a
						href={feeds.rss}
						type="application/rss+xml"
						data-sveltekit-reload
						onclick={() => trackFeed('open-rss', 'site-footer')}>Subscribe</a
					> to follow along.
				</p>
			</div>

			<div class="footer__cols">
				<nav class="footer__col" aria-label="Footer">
					<p class="footer__title">Navigate</p>
					{#each footerNav as item (item.href)}
						<a href={item.href}>{item.label}</a>
					{/each}
				</nav>
				<div class="footer__col">
					<p class="footer__title">Read</p>
					<a
						href={feeds.rss}
						type="application/rss+xml"
						data-sveltekit-reload
						onclick={() => trackFeed('open-rss', 'site-footer')}>RSS feed</a
					>
					<a href={feeds.atom} type="application/atom+xml" data-sveltekit-reload>Atom feed</a>
					<a href={cvPath} target="_blank" rel="noopener">CV (PDF)</a>
				</div>
				<div class="footer__col">
					<p class="footer__title">Connect</p>
					{#each elsewhere as c (c.href)}
						<a href={c.href}>{c.label}</a>
					{/each}
				</div>
				<div class="footer__col">
					<p class="footer__title">Legal</p>
					<a href="/impressum">Impressum</a>
					<a href="/datenschutz">Datenschutz</a>
					<!-- Withdrawing consent has to be as easy as giving it (Art. 7 Abs. 3 DSGVO), so
					     the banner is one press away from every page. A button rather than a link:
					     it changes state here, it does not go anywhere. -->
					<button type="button" onclick={reopenConsent}>Cookie settings</button>
				</div>
			</div>
		</div>

		<div class="footer__bottom">
			<p class="footer__proverb">“Übung macht den Meister.” — Practice makes the master.</p>
			<p class="footer__copy">
				© {years}
				{site.name} · Built with SvelteKit and AI, deployed on Cloudflare Pages
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: var(--gap-hero);
		padding-block: 48px 32px;
		border-top: 1px solid var(--line);
	}

	.footer__top {
		display: grid;
		gap: 2.25rem;
	}

	.footer__brand {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		max-width: 17rem;
	}

	.footer__mark {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		color: var(--text);
		text-decoration: none;
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.footer__mark :global(svg) {
		color: var(--accent);
	}

	.footer__mission {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.92rem;
		line-height: 1.6;
	}

	.footer__mission a {
		color: var(--accent);
		font-weight: 500;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.18em;
	}

	.footer__cols {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.75rem 2rem;
	}

	.footer__col {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.625rem;
	}

	.footer__title {
		margin: 0 0 0.125rem;
		color: var(--accent);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.footer__col a,
	.footer__col button {
		appearance: none;
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--text-secondary);
		text-decoration: none;
		cursor: pointer;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__col a:hover,
		.footer__col button:hover {
			color: var(--accent);
		}
	}

	.footer a:focus-visible,
	.footer button:focus-visible {
		outline: none;
		border-radius: 3px;
		box-shadow: var(--focus-ring);
	}

	.footer__bottom {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 2.5rem;
		padding-top: 1.375rem;
		border-top: 1px solid var(--line);
	}

	.footer__proverb {
		margin: 0;
		font-family: var(--font-display);
		font-style: italic;
		font-size: 0.95rem;
		color: var(--text-secondary);
	}

	.footer__copy {
		margin: 0;
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	@media (min-width: 640px) {
		.footer__cols {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media (min-width: 900px) {
		.footer__top {
			grid-template-columns: minmax(200px, 260px) minmax(0, 1fr);
			gap: 3.5rem;
		}
		.footer__bottom {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}

	@media (pointer: coarse) {
		.footer__col a,
		.footer__col button {
			min-height: 44px;
			display: inline-flex;
			align-items: center;
		}
		.footer__col {
			gap: 0;
		}
	}
</style>
