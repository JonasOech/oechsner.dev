<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		--bg: #ffffff;
		--fg: #16181d;
		--muted: #6b7280;
		--line: #e5e7eb;
		--panel: #f9fafb;
		color-scheme: light dark;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--bg: #0e1013;
			--fg: #e8eaed;
			--muted: #9aa0a6;
			--line: #24272c;
			--panel: #16181c;
		}
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--fg);
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	:global(a) {
		color: inherit;
	}
</style>
