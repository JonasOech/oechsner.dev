<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Must match --bg in app.css (one per paper); a meta attribute cannot reference a CSS
	     variable. The footer's theme control rewrites them when the visitor overrides the system. -->
	<meta name="theme-color" content="#fbf9f5" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#1c1b19" media="(prefers-color-scheme: dark)" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<!-- Second in the tab order, behind the skip link: the thing asking for a decision
     should be reachable before the nav, not buried past the footer. It is fixed to the
     bottom of the viewport, so its position here costs the layout nothing. -->
<ConsentBanner />

<div class="shell">
	<Header />

	<div class="stage">
		<main id="main" tabindex="-1">
			{@render children()}
		</main>

		<Footer />
	</div>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	.stage {
		display: flex;
		flex-direction: column;
		flex: 1 0 auto;
		min-width: 0;
	}

	main {
		display: block;
		flex: 1 0 auto;
		outline: none;
		min-width: 0;
	}

	/* [index rail] [reading column + margin], centred as one composition: the column sits a
	   little left of the page's middle and the margin to its right holds the post outline
	   when there is room for it. */
	@media (min-width: 56em) {
		.shell {
			display: grid;
			grid-template-columns: var(--rail-w) minmax(0, calc(var(--col) + var(--margin-w) + var(--s-6)));
			column-gap: var(--s-8);
			justify-content: center;
			align-items: stretch;
		}
	}
</style>
