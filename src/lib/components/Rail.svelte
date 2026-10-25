<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * A labelled section: glass pill label above a frosted content panel.
	 *
	 * `level` picks the heading rank — pass 1 when this rail is the page's own title
	 * (Contact), leave it at 2 for sections within a page.
	 */
	let {
		label,
		id,
		wide = false,
		level = 2,
		children
	}: { label: string; id?: string; wide?: boolean; level?: 1 | 2; children: Snippet } = $props();

	const labelId = $derived(id ? `${id}-label` : undefined);
</script>

<section class="section rail" {id} use:reveal aria-labelledby={labelId}>
	{#if level === 1}
		<h1 class="rail__label" id={labelId}>{label}</h1>
	{:else}
		<h2 class="rail__label" id={labelId}>{label}</h2>
	{/if}
	<div class="rail__body" class:rail__body--wide={wide}>
		{@render children()}
	</div>
</section>

<style>
	/* A wide section brings its own cards (the home page's post grid, the contact tiles),
	   so it skips the shared glass panel. */
	.rail__body--wide {
		padding: 0;
		background: none;
		border: 0;
		box-shadow: none;
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}
</style>
