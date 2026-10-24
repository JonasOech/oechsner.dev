<script lang="ts">
	/**
	 * Design I ("Wayfinder"): the brand mark. A dotted orbit around a small bigram graph —
	 * five words and the transitions between them, a nod to the n-gram post — drawn in the
	 * accent. The orbit turns slowly while the pointer is over the brand.
	 */
	let { size = 28 }: { size?: number } = $props();

	const nodes = [
		[50, 22],
		[76.6, 41.3],
		[66.5, 72.7],
		[33.5, 72.7],
		[23.4, 41.3]
	] as const;
	const edges = [
		[0, 1],
		[1, 2],
		[2, 4],
		[4, 0],
		[0, 2],
		[3, 1]
	] as const;
</script>

<svg class="mark" width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
	<circle class="mark__orbit" cx="50" cy="50" r="44" stroke="currentColor" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round" opacity=".45" />
	<g stroke="currentColor" stroke-width="2" opacity=".55">
		{#each edges as [a, b] (`${a}-${b}`)}
			<line x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
		{/each}
	</g>
	{#each nodes as [x, y], i (i)}
		<circle cx={x} cy={y} r={i === 0 ? 6.5 : 4.5} fill="currentColor" />
	{/each}
</svg>

<style>
	.mark {
		display: block;
		flex: none;
	}

	.mark__orbit {
		transform-origin: 50px 50px;
		transition: transform 1.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	:global(a:hover) > .mark .mark__orbit {
		transform: rotate(120deg);
	}
</style>
