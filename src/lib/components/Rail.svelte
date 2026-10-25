<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A labelled section: a quiet italic label above its content, in the one column.
	 * (The name is a holdover from the earlier two-column design; the API is unchanged.)
	 *
	 * `level` picks the heading rank — pass 1 when this section is the page's own title
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

<section class="section rail" {id} aria-labelledby={labelId}>
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
