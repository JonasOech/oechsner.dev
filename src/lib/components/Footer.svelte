<script lang="ts">
	import { footerNav, site } from '$lib/data/site';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="container footer__inner">
		<nav class="footer__nav" aria-label="Footer">
			{#each footerNav as item (item.href)}
				<a class="footer__link" href={item.href}>{item.label}</a>
			{/each}
		</nav>

		<p class="footer__copy">
			© {site.startYear === year ? year : `${site.startYear}–${year}`}
			{site.name} - 
			<a class="footer__legal-link" href="/impressum">Impressum</a>
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
		background: var(--bg-deep);
		border-top: 1px solid var(--line);
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
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: var(--text-muted);
		text-decoration: none;
		padding: 0.5rem 0.125rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__link:hover {
			color: var(--text);
		}
	}

	.footer__link:active {
		color: var(--text-secondary);
	}

	.footer__link:focus-visible {
		outline: none;
		border-radius: 3px;
		box-shadow: var(--focus-ring);
	}

	.footer__copy {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--text-muted);
		margin: 0;
	}

	.footer__legal-link {
		font-size: 0.75rem;
		font-weight: 700;
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
			color: var(--text);
			text-decoration-color: var(--text);
		}
	}

	.footer__legal-link:active {
		color: var(--text-secondary);
	}

	.footer__legal-link:focus-visible {
		outline: none;
		border-radius: 3px;
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
		font-size: 0.75rem;
		color: var(--text-muted);
		max-width: 46ch;
		line-height: 1.6;
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
