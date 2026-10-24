<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { ui, setTheme } from '$lib/theme.svelte';

	/**
	 * Light/dark switch. Both glyphs are always rendered and CSS
	 * shows the one for the *other* scheme (keyed on `html[data-theme]`), so the prerendered
	 * button is already right before hydration.
	 */
	let { class: className = '' }: { class?: string } = $props();

	const next = $derived(ui.theme === 'dark' ? 'light' : 'dark');
</script>

<button
	type="button"
	class="theme-toggle {className}"
	aria-label="Switch to {next} mode"
	title="Switch to {next} mode"
	onclick={() => setTheme(next)}
>
	<span class="theme-toggle__icon theme-toggle__icon--sun"><Icon name="sun" size={17} /></span>
	<span class="theme-toggle__icon theme-toggle__icon--moon"><Icon name="moon" size={16} /></span>
</button>

<style>
	.theme-toggle {
		appearance: none;
		display: inline-grid;
		place-items: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out),
			transform var(--dur-base) var(--ease-out);
	}

	.theme-toggle__icon {
		grid-area: 1 / 1;
		display: grid;
		transition:
			opacity var(--dur-base) var(--ease-out),
			transform var(--dur-slow) var(--ease-out);
	}

	/* In dark mode offer the sun, in light mode the moon. */
	:global(html[data-theme='dark']) .theme-toggle__icon--moon,
	:global(html:not([data-theme='dark'])) .theme-toggle__icon--sun {
		opacity: 0;
		transform: rotate(-90deg) scale(0.6);
	}

	@media (hover: hover) and (pointer: fine) {
		.theme-toggle:hover {
			color: var(--accent);
			border-color: var(--accent);
		}
	}

	.theme-toggle:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}
</style>
