<script>
	import Panel from './Panel.svelte';

	// A deliberately small slice of the CMRB: one semantic dimension (size),
	// one two-way relation (a + b), one 9x9 cognitive map.
	//
	// Cell (i, j) is marked when x_i + x_j equals the value of the missing
	// panel 9. That is what makes the map usable for prediction: read off a
	// marked pair, add the two panels, and you have the answer.
	//
	// Learning is the intersection step from the paper's algorithm: keep only
	// the cells that survived every problem seen so far. Coincidences die,
	// the generating rule stays.

	const N = 9;

	function randomProblem() {
		// Row-wise arithmetic: the third panel of each row is the sum of the
		// first two. Values stay inside the sVAE's 6 size slots (0-5).
		const x = [];
		for (let r = 0; r < 3; r++) {
			const a = Math.floor(Math.random() * 3);
			const b = Math.floor(Math.random() * 3);
			x.push(a, b, a + b);
		}
		return x;
	}

	function mapOf(x) {
		const target = x[8];
		const m = [];
		for (let i = 0; i < N; i++) {
			const row = [];
			for (let j = 0; j < N; j++) row.push(x[i] + x[j] === target);
			m.push(row);
		}
		return m;
	}

	function intersect(a, b) {
		return a.map((row, i) => row.map((v, j) => v && b[i][j]));
	}

	let problem = $state(randomProblem());
	let ltm = $state(mapOf(problem));
	let seen = $state(1);
	let lastPruned = $state(0);

	let live = $derived(ltm.flat().filter(Boolean).length);
	let panels = $derived(
		problem.map((v, i) => (i === 8 ? null : { type: 1, color: 3, size: v, angle: 3 }))
	);

	// Any surviving cell predicts the same value once the map has converged.
	let prediction = $derived.by(() => {
		for (let i = 0; i < N; i++)
			for (let j = 0; j < N; j++) if (ltm[i][j]) return { i, j, value: problem[i] + problem[j] };
		return null;
	});

	function observe() {
		const before = live;
		const p = randomProblem();
		problem = p;
		ltm = intersect(ltm, mapOf(p));
		seen += 1;
		lastPruned = before - ltm.flat().filter(Boolean).length;
	}

	function reset() {
		problem = randomProblem();
		ltm = mapOf(problem);
		seen = 1;
		lastPruned = 0;
	}
</script>

<figure class="widget">
	<div class="lab">
		<div class="left">
			<div class="grid3">
				{#each panels as p}
					<Panel obj={p} px={58} state={p ? 'normal' : 'target'} />
				{/each}
			</div>
			<p class="rule">Rule in play: in every row, panel 3 = panel 1 + panel 2 (on <em>size</em>).</p>
			<div class="btns">
				<button class="rpm-btn" onclick={observe}>Observe another problem</button>
				<button class="rpm-btn ghost" onclick={reset}>Reset memory</button>
			</div>
		</div>

		<div class="right">
			<div class="maphead">
				<span>Cognitive map after {seen} problem{seen === 1 ? '' : 's'}</span>
				<span class="count">{live} / 81 cells alive</span>
			</div>
			<div class="map" style="--n:{N}">
				{#each ltm as row, i}
					{#each row as on, j}
						<span
							class="cell"
							class:on
							class:truth={(i === 6 && j === 7) || (i === 7 && j === 6)}
							title="({i + 1}, {j + 1}) — x{i + 1} + x{j + 1} {on ? '=' : '≠'} x9"
						></span>
					{/each}
				{/each}
			</div>
			<p class="status">
				{#if lastPruned > 0}
					Last problem pruned <strong>{lastPruned}</strong> coincidental cells.
				{:else if seen === 1}
					Everything that happens to add up on this one problem is still marked.
				{:else}
					Nothing new was pruned — the map has settled.
				{/if}
				{#if prediction}
					<br />Reading cell ({prediction.i + 1}, {prediction.j + 1}): predicted size for the
					missing panel = <strong>{prediction.value}</strong> (true value {problem[8]}).
				{/if}
			</p>
		</div>
	</div>

	<figcaption>
		The two outlined cells are (7, 8) and (8, 7) — the pair the generating rule actually uses. They
		can never be pruned. Everything else is noise waiting to be intersected away. The real CMRB does
		this for 29 dimensions at once, keeps 30 such maps per configuration, and adds a 9×9×9 tensor
		for three-way relations <code>a + b − c</code>.
	</figcaption>
</figure>

<style>
	.lab {
		display: flex;
		gap: 1.8rem;
		flex-wrap: wrap;
		align-items: flex-start;
	}
	.left {
		flex: 0 0 auto;
	}
	.right {
		flex: 1 1 260px;
		min-width: 240px;
	}
	.grid3 {
		display: grid;
		grid-template-columns: repeat(3, auto);
		gap: 4px;
		width: max-content;
	}
	.rule {
		font-size: 0.78rem;
		color: var(--muted);
		margin: 0.6rem 0 0.7rem;
		max-width: 22rem;
	}
	.btns {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.maphead {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--muted);
		margin-bottom: 0.4rem;
	}
	.count {
		font-variant-numeric: tabular-nums;
	}
	.map {
		display: grid;
		grid-template-columns: repeat(var(--n), 1fr);
		gap: 2px;
		max-width: 260px;
	}
	.cell {
		aspect-ratio: 1;
		border-radius: 2px;
		background: var(--chip);
		transition: background 160ms ease;
	}
	.cell.on {
		background: var(--series-1);
	}
	.cell.truth {
		outline: 2px solid var(--series-2);
		outline-offset: 1px;
	}
	.status {
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin: 0.7rem 0 0;
		line-height: 1.6;
	}
</style>
