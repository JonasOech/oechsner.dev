<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, footerNav, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';
	import { theme, initTheme, setTheme, type ThemeChoice } from '$lib/theme.svelte';

	const year = new Date().getFullYear();

	// The control is inert without script, so it only appears once there is script to run it;
	// without JS the visitor simply gets the system's paper.
	let ready = $state(false);
	onMount(() => {
		initTheme();
		ready = true;
	});

	const choices: { value: ThemeChoice; label: string }[] = [
		{ value: 'system', label: 'Auto' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];
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
			{site.name} ·
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

		<div class="footer__row">
			<p class="footer__colophon">
				Set in Source Serif and Inter. Deployed with SvelteKit on Cloudflare Pages. Built with AI.
			</p>

			{#if ready}
				<div class="theme" role="group" aria-label="Colour theme">
					{#each choices as c (c.value)}
						<button
							type="button"
							class="theme__btn"
							aria-pressed={theme.choice === c.value}
							onclick={() => setTheme(c.value)}
						>
							{c.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</footer>

<style>
	.footer {
		margin-top: var(--gap-hero);
		padding-block: 0 var(--s-7);
	}

	.footer__inner {
		display: grid;
		gap: var(--s-3);
		border-top: 1px solid var(--line);
		padding-top: var(--s-5);
	}

	.footer__nav {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--s-4);
	}

	.footer__link {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--text-secondary);
		text-decoration: none;
		padding-block: 0.375rem;
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
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	.footer__copy {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		line-height: 1.5;
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
		font-family: var(--font-sans);
		font-size: 0.75rem;
		color: var(--text-muted);
		text-decoration: underline;
		text-decoration-color: var(--line-strong);
		text-underline-offset: 3px;
		padding: 0.375rem 0.125rem;
		display: inline-block;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__legal-link:hover {
			color: var(--accent);
			text-decoration-color: currentColor;
		}
	}

	.footer__legal-link:active {
		color: var(--accent-dim);
	}

	.footer__legal-link:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	.footer__row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3) var(--s-5);
		margin-top: var(--s-2);
	}

	.footer__colophon {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		color: var(--text-muted);
		max-width: 34ch;
		line-height: 1.6;
		margin: 0;
	}

	/* The theme control: three words, the chosen one in ink. Meant to be found, not noticed. */
	.theme {
		display: inline-flex;
		gap: var(--s-1);
	}

	.theme__btn {
		appearance: none;
		background: none;
		border: 0;
		border-bottom: 1px solid transparent;
		cursor: pointer;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--text-muted);
		padding: 0.375rem 0.5rem;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.theme__btn[aria-pressed='true'] {
		color: var(--text);
		border-bottom-color: var(--text);
	}

	@media (hover: hover) and (pointer: fine) {
		.theme__btn:not([aria-pressed='true']):hover {
			color: var(--accent);
		}
	}

	.theme__btn:focus-visible {
		outline: none;
		border-radius: var(--radius);
		box-shadow: var(--focus-ring);
	}

	@media (pointer: coarse) {
		.footer__link,
		.footer__legal-link,
		.theme__btn {
			display: inline-flex;
			align-items: center;
			min-height: 44px;
			padding-inline: 0.5rem;
		}
	}
</style>
