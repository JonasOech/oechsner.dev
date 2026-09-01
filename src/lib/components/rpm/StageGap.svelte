<script>
	import { standalone, pipeline } from './data.js';

	let dataset = $state('ravenF');

	const mean = (arr, k) => arr.reduce((s, r) => s + r[k], 0) / arr.length;

	let bars = $derived([
		{
			label: 'FCNN alone',
			note: 'configuration classification',
			v: mean(standalone[dataset], 'fcnn')
		},
		{
			label: 'CMRB alone',
			note: 'fed ground-truth semantic features',
			v: mean(standalone[dataset], 'cmrb')
		},
		{
			label: 'Full pipeline',
			note: 'FCNN → sVAE → CMRB → matching',
			v: mean(pipeline[dataset], 'ours')
		}
	]);
</script>

<figure class="widget">
	<div class="head">
		<h4>Where the five points go missing</h4>
		<div class="seg" role="group" aria-label="Dataset">
			<button class:on={dataset === 'raven'} onclick={() => (dataset = 'raven')}>RAVEN</button>
			<button class:on={dataset === 'ravenF'} onclick={() => (dataset = 'ravenF')}>RAVEN-F</button>
		</div>
	</div>

	<ul class="bars">
		{#each bars as b, i}
			<li>
				<span class="lbl">{b.label}</span>
				<span class="track">
					<span
						class="fill"
						class:last={i === bars.length - 1}
						style="width:{((b.v - 90) / 10) * 100}%"
					></span>
				</span>
				<span class="num">{b.v.toFixed(2)} %</span>
				<span class="note">{b.note}</span>
			</li>
		{/each}
	</ul>

	<figcaption>
		Mean over the seven configurations; the bar scale runs 90–100 %. The two measured components
		land where the paper says they should. The only untested piece in between is the sVAE — which is
		why the report puts the blame there by elimination rather than by measurement.
	</figcaption>
</figure>

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}
	.head h4 {
		margin: 0;
		font-size: 0.98rem;
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
	.bars {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}
	.bars li {
		display: grid;
		grid-template-columns: 7.5rem 1fr 4rem;
		grid-template-areas: 'lbl track num' '. note note';
		align-items: center;
		gap: 0.1rem 0.7rem;
	}
	.lbl {
		grid-area: lbl;
		font-size: 0.85rem;
		font-weight: 600;
	}
	.track {
		grid-area: track;
		height: 14px;
		background: var(--chip);
		border-radius: 4px;
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		border-radius: 4px;
		background: var(--series-1);
		transition: width 260ms ease;
	}
	.fill.last {
		background: var(--series-2);
	}
	.num {
		grid-area: num;
		text-align: right;
		font-size: 0.83rem;
		font-variant-numeric: tabular-nums;
	}
	.note {
		grid-area: note;
		font-size: 0.74rem;
		color: var(--muted);
	}
</style>
