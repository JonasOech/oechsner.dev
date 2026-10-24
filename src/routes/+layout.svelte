<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { initTheme } from '$lib/theme.svelte';

	let { children } = $props();

	$effect(() => {
		initTheme();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Light --bg from app.css; src/lib/theme.svelte.ts swaps it when the scheme changes. -->
	<meta name="theme-color" content="#f5f1ea" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<!-- Second in the tab order, behind the skip link: the thing asking for a decision
     should be reachable before the nav, not buried past the footer. It is fixed to the
     bottom of the viewport, so its position here costs the layout nothing. -->
<ConsentBanner />

<Header />

<main id="main" tabindex="-1">
	{@render children()}
</main>

<Footer />

<CommandPalette />

<style>
	main {
		display: block;
		flex: 1 0 auto;
		outline: none;
	}
</style>
