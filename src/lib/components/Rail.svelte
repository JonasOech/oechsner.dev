<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * A labelled section: a numbered, tracked-uppercase label hung in columns 1-3, a narrow content
	 * measure from column 4. Collapses to label-above-content below 768px.
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
	/* `wide` hands the body's children to the rail's own twelve-column grid, so a page can
	   place them itself: the label keeps row one and the content spans whatever it asks for. */
	.rail__body--wide {
		display: contents;
	}
</style>
