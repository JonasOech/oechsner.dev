<script>
	import { pipeline, standalone, CLASS_LABELS } from './data.js';

	let dataset = $state(/** @type {import('./types').Dataset} */ ('ravenF'));
	let cropped = $state(true);
	let asTable = $state(false);
	let hovered = $state(/** @type {number | null} */ (null));

	let rows = $derived(pipeline[dataset]);
	let comps = $derived(standalone[dataset]);

	const W = 660;
	const ROW_H = 46;
	const BAR_H = 14;
	const PAD_L = 86;
	const PAD_R = 76;
	const PAD_T = 26;
	let H = $derived(PAD_T + rows.length * ROW_H + 8);
	let x0 = $derived(cropped ? 85 : 0);
	let plotW = W - PAD_L - PAD_R;

	/** @param {number} v */
	function x(v) {
		return PAD_L + ((v - x0) / (100 - x0)) * plotW;
	}
	let ticks = $derived(cropped ? [85, 90, 95, 100] : [0, 25, 50, 75, 100]);

	/** @param {'ours' | 'zhao'} key */
	function meanOf(key) {
		return rows.reduce((s, r) => s + r[key], 0) / rows.length;
	}
</script>

<figure class="widget viz-root">
	<div class="head">
		<div>
			<h4>Full pipeline, three-fold mean accuracy</h4>
			<p class="sub">Our reconstruction against the values reported by Zhao et al. (2023), Table 4.</p>
		</div>
		<div class="controls">
			<div class="seg" role="group" aria-label="Dataset">
				<button class:on={dataset === 'raven'} onclick={() => (dataset = 'raven')}>RAVEN</button>
				<button class:on={dataset === 'ravenF'} onclick={() => (dataset = 'ravenF')}>RAVEN-F</button>
			</div>
			<label class="check">
				<input type="checkbox" bind:checked={cropped} />
				crop axis
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={asTable} />
				table
			</label>
		</div>
	</div>

	<div class="legend">
		<span class="key"><i style="background:var(--series-1)"></i>Ours</span>
		<span class="key"><i style="background:var(--series-2)"></i>Zhao et al.</span>
		<span class="means"
			>mean {meanOf('ours').toFixed(2)} % vs. {meanOf('zhao').toFixed(2)} %</span
		>
	</div>

	{#if asTable}
		<div class="tablewrap">
			<table>
				<thead>
					<tr>
						<th>Configuration</th>
						<th>Ours (%)</th>
						<th>Zhao (%)</th>
						<th>p</th>
						<th>FCNN alone</th>
						<th>CMRB alone</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as r, i}
						<tr>
							<td>{CLASS_LABELS[r.id]}</td>
							<td>{r.ours.toFixed(2)}</td>
							<td>{r.zhao.toFixed(2)}</td>
							<td>{r.p}</td>
							<td>{comps[i].fcnn.toFixed(1)}</td>
							<td>{comps[i].cmrb.toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<svg viewBox="0 0 {W} {H}" width="100%" role="img" aria-label="Accuracy per configuration">
			{#each ticks as t}
				<line class="grid" x1={x(t)} x2={x(t)} y1={PAD_T - 8} y2={H - 14} />
				<text class="tick" x={x(t)} y={PAD_T - 13}>{t}%</text>
			{/each}

			{#each rows as r, i}
				{@const yTop = PAD_T + i * ROW_H}
				{@const better = r.ours > r.zhao}
				<g
					class="grp"
					class:dim={hovered !== null && hovered !== i}
					role="graphics-symbol"
					aria-label={CLASS_LABELS[r.id]}
					onmouseenter={() => (hovered = i)}
					onmouseleave={() => (hovered = null)}
				>
					<rect class="hit" x="0" y={yTop - 4} width={W} height={ROW_H} />
					<text class="cat" x={PAD_L - 12} y={yTop + ROW_H / 2 - 6}>{CLASS_LABELS[r.id]}</text>

					<rect
						class="bar"
						x={PAD_L}
						y={yTop}
						width={Math.max(0, x(r.ours) - PAD_L)}
						height={BAR_H}
						rx="4"
						fill="var(--series-1)"
					/>
					<text class="val" x={x(r.ours) + 7} y={yTop + BAR_H - 3}>{r.ours.toFixed(2)}</text>

					<rect
						class="bar"
						x={PAD_L}
						y={yTop + BAR_H + 2}
						width={Math.max(0, x(r.zhao) - PAD_L)}
						height={BAR_H}
						rx="4"
						fill="var(--series-2)"
					/>
					<text class="val" x={x(r.zhao) + 7} y={yTop + 2 * BAR_H - 1}>{r.zhao.toFixed(2)}</text>

					{#if better}
						<text class="flag" x={PAD_L - 12} y={yTop + ROW_H / 2 + 8}>we win here</text>
					{/if}
				</g>
			{/each}

			<line class="axis" x1={PAD_L} x2={PAD_L} y1={PAD_T - 8} y2={H - 14} />
		</svg>
	{/if}

	<figcaption>
		{#if cropped}
			<strong>Note:</strong> the axis starts at 85 %, not 0 — it exaggerates the gap. Untick
			<em>crop axis</em> to see the honest proportions.
		{:else}
			Full 0–100 % axis. Every bar is close to the top; the interesting story is in the last five
			points.
		{/if}
		O-IG is the one configuration where our reconstruction beats the paper on RAVEN (93.98 vs.
		87.60) — and the one where it trails least on RAVEN-F.
	</figcaption>
</figure>

<style>
	.head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: flex-start;
		margin-bottom: 0.7rem;
	}
	.head h4 {
		margin: 0;
		font-size: 0.98rem;
	}
	.sub {
		margin: 0.15rem 0 0;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		font-size: 0.8rem;
	}
	.seg {
		display: inline-flex;
		border: 1px solid var(--rule);
		border-radius: 7px;
		overflow: hidden;
	}
	.seg button {
		border: 0;
		background: var(--chip);
		color: inherit;
		font: inherit;
		font-size: 0.8rem;
		padding: 0.32rem 0.7rem;
		cursor: pointer;
	}
	.seg button.on {
		background: var(--accent);
		color: var(--text-inverse);
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.32rem;
		color: var(--muted);
		cursor: pointer;
	}
	.legend {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
		font-size: 0.8rem;
		margin-bottom: 0.3rem;
	}
	.key {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--text-secondary);
	}
	.key i {
		width: 11px;
		height: 11px;
		border-radius: 3px;
		display: inline-block;
	}
	.means {
		margin-left: auto;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}
	svg {
		display: block;
		overflow: visible;
	}
	.grid {
		stroke: var(--rule);
		stroke-width: 1;
	}
	.axis {
		stroke: var(--axis);
		stroke-width: 1;
	}
	.tick,
	.cat,
	.val,
	.flag {
		fill: var(--muted);
		font-size: 11px;
		font-variant-numeric: tabular-nums;
	}
	.tick {
		text-anchor: middle;
	}
	.cat {
		text-anchor: end;
		fill: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
	}
	.flag {
		text-anchor: end;
		font-size: 10px;
		font-style: italic;
	}
	.hit {
		fill: transparent;
	}
	.grp {
		transition: opacity 120ms ease;
	}
	.grp.dim {
		opacity: 0.35;
	}
	.bar {
		stroke: var(--surface-1);
		stroke-width: 1;
	}
	.tablewrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.83rem;
		font-variant-numeric: tabular-nums;
	}
	th,
	td {
		text-align: right;
		padding: 0.34rem 0.5rem;
		border-bottom: 1px solid var(--rule);
	}
	th:first-child,
	td:first-child {
		text-align: left;
	}
	th {
		color: var(--muted);
		font-weight: 600;
	}
</style>
