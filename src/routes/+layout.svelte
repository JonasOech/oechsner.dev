<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Must match --bg in app.css; a meta attribute cannot reference a CSS variable. -->
	<meta name="theme-color" content="#0e0f12" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<Header />

<main id="main" tabindex="-1">
	{@render children()}
</main>

<Footer />

<style>
	main {
		display: block;
		flex: 1 0 auto;
		outline: none;
	}
</style>
