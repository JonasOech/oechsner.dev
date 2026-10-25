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
	<!-- Must match --bg in app.css; a meta attribute cannot reference a CSS variable. -->
	<meta name="theme-color" content="#fbfaf7" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<!-- Second in the tab order, behind the skip link: the thing asking for a decision
     should be reachable before the nav, not buried past the footer. It is fixed to the
     bottom of the viewport, so its position here costs the layout nothing. -->
<ConsentBanner />

<!-- The split page: `Header` is the fixed left column (a top bar below 64em), `.stage` is
     the column that scrolls. Both live in app.css. -->
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
	main {
		display: block;
		outline: none;
	}
</style>
