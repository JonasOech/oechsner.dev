<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { contacts, cvPath, feeds, site } from '$lib/data/site';
	import { posts } from '$lib/posts';
	import { trackFeed } from '$lib/track';
	import { reopenConsent } from '$lib/consent.svelte';

	const year = new Date().getFullYear();
	const years = site.startYear === year ? `${year}` : `${site.startYear}–${year}`;
	const social = contacts.filter((c) => c.label === 'GitHub' || c.label === 'LinkedIn');
	const email = contacts.find((c) => c.primary);
	const recent = posts.slice(0, 4);
</script>

<!-- After aanandmadhav.com: a closing band with one big two-tone line and a way to get in
     touch, then the colophon and three columns of links. -->
<footer class="footer">
	<div class="container">
		<div class="footer__band">
			<h2 class="footer__line">Bring me the <span class="hl">hard problem.</span></h2>
			<div class="footer__pitch">
				<p>
					I’m looking for an internship in Dublin, and I’m always up for a conversation about
					machine learning, systems and the concepts behind them. I read every message.
				</p>
				<a class="btn btn--primary" href="/contact">Get in touch →</a>
				<p class="footer__social">
					{#each social as s (s.href)}
						<a class="arrow-link" href={s.href}>{s.label} <Icon name="arrow-up-right" /></a>
					{/each}
					{#if email}<a class="arrow-link" href={email.href}>Email <Icon name="arrow-up-right" /></a>{/if}
				</p>
			</div>
		</div>

		<div class="footer__cols">
			<div class="footer__colophon">
				<p class="footer__copy">© {years} {site.name}</p>
				<p>Built in Bamberg and Dublin. SvelteKit on Cloudflare Pages.</p>
			</div>
			<nav class="footer__col" aria-label="Recent writing">
				<p class="footer__title">Writing</p>
				{#each recent as p (p.slug)}
					<a href="/blog/{p.slug}">{p.title}</a>
				{/each}
			</nav>
			<nav class="footer__col" aria-label="Site">
				<p class="footer__title">Site</p>
				<a href="/about">About</a>
				<a href="/skills">Projects</a>
				<a href="/contact">Contact</a>
				<a href={cvPath} target="_blank" rel="noopener">CV (PDF)</a>
				<a href={feeds.rss} type="application/rss+xml" data-sveltekit-reload onclick={() => trackFeed('open-rss', 'site-footer')}>RSS</a>
			</nav>
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
</footer>

<style>
	.footer {
		position: relative;
		z-index: 1;
		margin-top: 96px;
		border-top: 1px solid var(--line);
		background: var(--bg-deep);
	}

	.footer__band {
		display: grid;
		gap: 32px;
		padding-block: 96px 64px;
		border-bottom: 1px solid var(--line-strong);
	}

	.footer__line {
		margin: 0;
		font-size: clamp(3rem, 7vw, 6rem);
		font-weight: 500;
		line-height: 0.94;
		letter-spacing: -0.045em;
		max-width: 9ch;
	}

	.footer__pitch {
		display: grid;
		gap: 24px;
		justify-items: start;
		align-content: start;
		max-width: 34rem;
	}

	.footer__pitch p {
		margin: 0;
		line-height: 1.65;
	}

	.footer__social {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}

	.footer__cols {
		display: grid;
		gap: 32px;
		padding-block: 40px 48px;
	}

	.footer__colophon p {
		margin: 0;
		font-size: 0.875rem;
	}

	.footer__copy,
	.footer__title {
		font-family: var(--font-mono);
		font-size: 0.6875rem !important;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.footer__copy {
		margin-bottom: 8px !important;
	}

	.footer__col {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}

	.footer__title {
		margin: 0 0 6px;
	}

	.footer__col a,
	.footer__col button {
		appearance: none;
		background: none;
		border: 0;
		padding: 0;
		font: inherit;
		font-size: 0.875rem;
		color: var(--text);
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		transition: color 0.15s;
	}

	@media (hover: hover) and (pointer: fine) {
		.footer__col a:hover,
		.footer__col button:hover {
			color: var(--accent);
		}
	}

	.footer__col a:focus-visible,
	.footer__col button:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (min-width: 900px) {
		.footer__band {
			grid-template-columns: 1.1fr 1fr;
			align-items: start;
		}
		.footer__cols {
			grid-template-columns: 1.6fr 1fr 1fr 1fr;
		}
	}

	@media (min-width: 600px) and (max-width: 899px) {
		.footer__cols {
			grid-template-columns: repeat(3, 1fr);
		}
		.footer__colophon {
			grid-column: 1 / -1;
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
