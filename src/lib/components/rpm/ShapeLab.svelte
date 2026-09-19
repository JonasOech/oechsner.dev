<script>
	import Panel from './Panel.svelte';
	import { SEMANTIC_GROUPS } from './data.js';
	import { TYPE_NAMES, ANGLES } from './shapes.js';

	let type = $state(2);
	let color = $state(4);
	let size = $state(3);
	let angle = $state(3);

	let obj = $derived({ type, color, size, angle });
	let active = $derived({ type, color, size, angle });

	// The semantic layer f is the concatenation of four one-hot blocks.
	let vector = $derived(
		SEMANTIC_GROUPS.flatMap((g) => g.values.map((_, i) => (active[g.key] === i ? 1 : 0)))
	);

	/** @param {import('./types').Attr} key @param {string} v */
	function setAttr(key, v) {
		const n = +v;
		if (key === 'type') type = n;
		else if (key === 'color') color = n;
		else if (key === 'size') size = n;
		else angle = n;
	}

	function randomise() {
		type = Math.floor(Math.random() * 5);
		color = Math.floor(Math.random() * 10);
		size = Math.floor(Math.random() * 6);
		angle = Math.floor(Math.random() * 8);
	}
</script>

<figure class="widget">
	<div class="lab">
		<div class="stage">
			<Panel {obj} px={168} />
			<p class="caption">
				{TYPE_NAMES[type]} · colour {color} · size {size} · {ANGLES[angle]}°
			</p>
			<button class="rpm-btn" onclick={randomise}>Randomise</button>
		</div>

		<div class="controls">
			{#each SEMANTIC_GROUPS as g}
				<label class="row">
					<span class="name">{g.label}</span>
					<input
						type="range"
						min="0"
						max={g.values.length - 1}
						step="1"
						value={active[g.key]}
						oninput={(e) => setAttr(g.key, e.currentTarget.value)}
					/>
					<span class="val">{g.values[active[g.key]]}</span>
					<span class="dim">{g.values.length} dims</span>
				</label>
			{/each}
		</div>
	</div>

	<div class="vector">
		<div class="vec-head">
			<span>Semantic layer <code>f</code> — 29 dimensions</span>
			<span class="sum">5 + 10 + 6 + 8 = 29</span>
		</div>
		<div class="cells">
			{#each SEMANTIC_GROUPS as g, gi}
				<div class="group" data-group={g.key}>
					{#each g.values as v, i}
						<span
							class="cell"
							class:on={active[g.key] === i}
							title="{g.label} = {v}">{active[g.key] === i ? 1 : 0}</span
						>
					{/each}
					<span class="glabel">{g.label}</span>
				</div>
				{#if gi < SEMANTIC_GROUPS.length - 1}<span class="sep"></span>{/if}
			{/each}
		</div>
	</div>

	<figcaption>
		Move a slider and watch exactly one bit flip. This is the whole interpretability claim: the
		bottleneck the reasoner sees is 29 named numbers, not an opaque embedding.
	</figcaption>
</figure>

<style>
	.lab {
		display: flex;
		gap: 1.6rem;
		flex-wrap: wrap;
		align-items: flex-start;
	}
	.stage {
		text-align: center;
	}
	.caption {
		margin: 0.5rem 0 0.6rem;
		font-size: 0.82rem;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}
	.controls {
		flex: 1 1 260px;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		min-width: 240px;
	}
	.row {
		display: grid;
		grid-template-columns: 3.6rem 1fr 2.6rem;
		grid-template-areas: 'name slider val' 'dim dim dim';
		align-items: center;
		gap: 0.1rem 0.6rem;
		font-size: 0.85rem;
	}
	.name {
		grid-area: name;
		font-weight: 600;
	}
	.row input {
		grid-area: slider;
		width: 100%;
		accent-color: var(--accent);
	}
	.val {
		grid-area: val;
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: var(--muted);
	}
	.dim {
		grid-area: dim;
		font-size: 0.7rem;
		color: var(--muted);
		opacity: 0.75;
	}
	.vector {
		margin-top: 1.3rem;
	}
	.vec-head {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.4rem;
		font-size: 0.8rem;
		color: var(--muted);
		margin-bottom: 0.45rem;
	}
	.sum {
		font-variant-numeric: tabular-nums;
	}
	.cells {
		display: flex;
		align-items: flex-start;
		gap: 0.35rem;
		overflow-x: auto;
		padding-bottom: 0.3rem;
	}
	.group {
		display: grid;
		grid-auto-flow: column;
		gap: 2px;
	}
	.group .glabel {
		display: none;
	}
	.cell {
		width: 1.35rem;
		height: 1.6rem;
		display: grid;
		place-items: center;
		font-size: 0.7rem;
		border-radius: 3px;
		background: var(--chip);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		transition: background 120ms ease;
	}
	.cell.on {
		background: var(--accent);
		color: var(--text-inverse);
		font-weight: 700;
	}
	.sep {
		width: 1px;
		align-self: stretch;
		background: var(--rule);
		margin: 0 0.2rem;
	}
</style>
