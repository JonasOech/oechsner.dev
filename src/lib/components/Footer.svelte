<script lang="ts">
	import Seal from '$lib/components/Seal.svelte';
	import { feeds, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
	const years = site.startYear === year ? `${year}` : `${site.startYear}–${year}`;
</script>

<!-- After alexwang.ai: one quiet line and the name seal, which links home. The legal links
     sit underneath because German law wants them on every page. -->
<footer class="footer">
	<div class="container">
		<p class="footer__line">
			© {years}
			{site.name}
			<a class="footer__seal" href="/" aria-label="Home"><Seal /></a>
		</p>
		<p class="footer__legal">
			<a href="/impressum">Impressum</a>
			<a href="/datenschutz">Datenschutz</a>
			<!-- Withdrawing consent has to be as easy as giving it (Art. 7 Abs. 3 DSGVO), so
			     the banner is one press away from every page. A button rather than a link:
			     it changes state here, it does not go anywhere. -->
			<button type="button" onclick={reopenConsent}>Cookie settings</button>
			<a
				href={feeds.rss}
				type="application/rss+xml"
				data-sveltekit-reload
				onclick={() => trackFeed('open-rss', 'site-footer')}>RSS</a
			>
		</p>
	</div>
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: 5rem;
		padding-bottom: 2rem;
	}

	.footer__line {
		margin: 0;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.footer__seal {
		display: inline-block;
		margin-left: 0.45em;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__seal:hover {
			opacity: 0.7;
		}
	}

	.footer__legal {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
	}

	.footer__legal a,
	.footer__legal button {
		appearance: none;
		background: none;
		border: 0;
		border-bottom: 1px solid transparent;
		padding: 0;
		font: inherit;
		color: var(--text-muted);
		text-decoration: none;
		cursor: pointer;
		transition:
			color 0.2s ease,
			border-color 0.2s ease;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__legal a:hover,
		.footer__legal button:hover {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}
	}

	.footer a:focus-visible,
	.footer button:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.footer__legal a,
		.footer__legal button {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
		}
	}
</style>
