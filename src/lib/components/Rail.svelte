<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * A labelled section on the 12-column grid: the label and its auto-counted numeral hang
	 * in columns 1-3 under a black rule, the content takes the rest. Collapses to
	 * label-above-content below 768px.
	 *
	 * `level` picks the heading rank — pass 1 when this rail is the page's own title
	 * (Contact), which also sets the label as a full-width display heading and does not
	 * count it as a numbered section. Leave it at 2 for sections within a page.
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

<section
	class="section rail"
	class:rail--page={level === 1}
	{id}
	use:reveal
	aria-labelledby={labelId}
>
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

	/* A page title is not a numbered section. */
	.rail--page {
		counter-increment: none;
	}
</style>
