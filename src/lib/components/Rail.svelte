<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * A labelled section: letterspaced serif rail label on the left, narrow content
	 * measure on the right. Collapses to label-above-content below 1024px.
	 */
	let {
		label,
		id,
		wide = false,
		children
	}: { label: string; id?: string; wide?: boolean; children: Snippet } = $props();
</script>

<section class="section rail" {id} use:reveal aria-labelledby={id ? `${id}-label` : undefined}>
	<h2 class="rail__label" id={id ? `${id}-label` : undefined}>{label}</h2>
	<div class="rail__body" class:rail__body--wide={wide}>
		{@render children()}
	</div>
</section>

<style>
	.rail__body--wide {
		max-width: none;
	}
</style>
