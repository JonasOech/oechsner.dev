<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * A labelled section: a cut-out headline label stuck in the left column, narrow
	 * content measure on the right. Collapses to label-above-content below 1024px.
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
	.rail__body--wide {
		max-width: none;
	}
</style>
