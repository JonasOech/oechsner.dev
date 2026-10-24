<script lang="ts">
	import { feeds, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
	const years = site.startYear === year ? `${year}` : `${site.startYear}–${year}`;
</script>

<footer class="footer">
	<div class="footer__inner">
		<p class="footer__line">
			<em>Notes on the concepts behind the software.</em>
			<span>© {years} {site.name}</span>
		</p>
		<p class="footer__links">
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
		border-top: 1px solid var(--line);
		background: var(--bg);
	}

	.footer__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem 2rem;
		padding: 2rem clamp(var(--gutter), 4vw, 3.75rem);
	}

	.footer__line {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
		margin: 0;
		font-size: 0.95rem;
		color: var(--text-secondary);
	}

	.footer__line span {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.footer__links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
		margin: 0;
	}

	.footer__links a,
	.footer__links button {
		appearance: none;
		background: none;
		border: 0;
		padding: 0;
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		text-decoration: none;
		cursor: pointer;
		transition: color 0.2s;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__links a:hover,
		.footer__links button:hover {
			color: var(--text);
		}
	}

	.footer a:focus-visible,
	.footer button:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.footer__links a,
		.footer__links button {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
		}
	}
</style>
