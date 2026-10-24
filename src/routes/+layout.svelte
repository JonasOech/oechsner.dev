<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';
	import InkSplash from '$lib/components/InkSplash.svelte';
	import { onNavigate } from '$app/navigation';
	import { initTheme } from '$lib/theme.svelte';

	let { children } = $props();

	$effect(() => {
		initTheme();
	});

	// Each page fades into the next, ink and all (see the view-transition rules at the end
	// of app.css). The reference uses cross-document view transitions; SvelteKit navigates
	// client-side, so this is the same-document API.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Light --bg from app.css; src/lib/theme.svelte.ts swaps it when the scheme changes. -->
	<meta name="theme-color" content="#f5f3ee" />
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

<InkSplash />

<style>
	main {
		display: block;
		flex: 1 0 auto;
		outline: none;
	}
</style>
