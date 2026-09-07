<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * How deep a post goes, 1–3, from a post's `nerdyness` front-matter field. All three
	 * slots always render so the scale is legible at a glance; an unearned slot is the bare
	 * head circle, the way an unfilled star reads in a rating.
	 *
	 * Drawn with `Icon`, so both states share one geometry and one stroke, and the ring is
	 * exactly the size of the face it stands in for.
	 */
	let { level }: { level: number } = $props();

	const clamped = $derived(Math.min(3, Math.max(1, Math.round(level))));
</script>

<!-- No `role="img"` or `aria-label`: the icons are `aria-hidden` and the count beside them
     already says the same thing out loud, so the visible text is the accessible name. -->
<span class="nerd">
	{#each [1, 2, 3] as slot (slot)}
		<Icon name={slot <= clamped ? 'nerd' : 'circle'} size={15} />
	{/each}
	<span class="nerd__count">{clamped}/3 nerds</span>
</span>

<style>
	/* Sits inline in a `.meta` line and inherits its colour through `currentColor`, so the
	   scale always matches the date and read time beside it. `middle` rather than the
	   default baseline: an inline-flex box baselines on the bottom edge of an SVG, which
	   leaves the row riding above the text. */
	.nerd {
		display: inline-flex;
		align-items: center;
		gap: 0.15em;
		vertical-align: middle;
		/* Faces and count are one unit — never break the scale across a line wrap. */
		white-space: nowrap;
	}

	/* Reads as the caption to the faces rather than a fourth item in the row, so it wants
	   more air than the 0.15em between the icons. */
	.nerd__count {
		margin-left: 0.35em;
	}
</style>
