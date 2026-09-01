<script>
	import { baselines } from './data.js';

	let sortByAcc = $state(true);
	let rows = $derived(sortByAcc ? [...baselines].sort((a, b) => b.acc - a.acc) : baselines);
</script>

<figure class="widget">
	<div class="head">
		<h4>The field on RAVEN-F</h4>
		<label class="check">
			<input type="checkbox" bind:checked={sortByAcc} />
			sort by accuracy
		</label>
	</div>

	<ul class="rows">
		{#each rows as r}
			<li class={r.kind}>
				<span class="name">{r.name}</span>
				<span class="track"><span class="fill" style="width:{((r.acc - 65) / 35) * 100}%"></span
					></span>
				<span class="num">{r.acc.toFixed(1)} %</span>
			</li>
		{/each}
	</ul>

	<figcaption>
		Scale runs 65–100 %. Our reconstruction falls five points short of the paper it reproduces and
		still sits above every published baseline in the comparison.
	</figcaption>
</figure>

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 0.9rem;
	}
	.head h4 {
		margin: 0;
		font-size: 0.98rem;
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.32rem;
		font-size: 0.8rem;
		color: var(--muted);
		cursor: pointer;
	}
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.rows li {
		display: grid;
		grid-template-columns: minmax(9rem, 14rem) 1fr 3.6rem;
		align-items: center;
		gap: 0.7rem;
	}
	.name {
		font-size: 0.83rem;
	}
	li.ours .name,
	li.reported .name {
		font-weight: 700;
	}
	.track {
		height: 12px;
		background: var(--chip);
		border-radius: 4px;
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		border-radius: 4px;
		background: var(--muted);
		opacity: 0.5;
	}
	li.ours .fill {
		background: var(--series-1);
		opacity: 1;
	}
	li.reported .fill {
		background: var(--series-2);
		opacity: 1;
	}
	.num {
		text-align: right;
		font-size: 0.82rem;
		font-variant-numeric: tabular-nums;
	}
</style>
