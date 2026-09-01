<script>
	import Panel from './Panel.svelte';
	import { describe } from './shapes.js';

	// A toy RPM. It is NOT a real RAVEN item: one explicit rule, hand-written
	// generators. What it does reproduce faithfully is the *difference between
	// the two answer-set generators*, which is the whole reason RAVEN-F exists.

	const RANGES = { type: 5, color: 10, size: 6, angle: 8 };
	const ATTRS = ['type', 'color', 'size', 'angle'];

	const ri = (n) => Math.floor(Math.random() * n);
	const eq = (a, b) => ATTRS.every((k) => a[k] === b[k]);
	const key = (o) => ATTRS.map((k) => o[k]).join('-');

	function perturb(obj) {
		const k = ATTRS[ri(ATTRS.length)];
		let v = obj[k];
		while (v === obj[k]) v = ri(RANGES[k]);
		return { ...obj, [k]: v };
	}

	/** Context: size progresses across columns, colour progresses down rows. */
	function buildContext() {
		const angle = ri(RANGES.angle);
		const c0 = ri(8);
		const types = [ri(5), ri(5), ri(5)];
		const grid = [];
		for (let r = 0; r < 3; r++) {
			const s0 = ri(4);
			for (let c = 0; c < 3; c++) {
				grid.push({ type: types[r], color: c0 + r, size: s0 + c, angle });
			}
		}
		return grid;
	}

	/** RAVEN: every distractor is the answer with exactly one attribute changed. */
	function ravenChoices(answer) {
		const out = [answer];
		const seen = new Set([key(answer)]);
		let guard = 0;
		while (out.length < 8 && guard++ < 400) {
			const d = perturb(answer);
			if (seen.has(key(d))) continue;
			seen.add(key(d));
			out.push(d);
		}
		return out;
	}

	/** RAVEN-F: grow the set iteratively, perturbing whatever is already in it. */
	function fairChoices(answer) {
		const out = [answer];
		const seen = new Set([key(answer)]);
		let guard = 0;
		while (out.length < 8 && guard++ < 400) {
			const parent = out[ri(out.length)];
			const d = perturb(parent);
			if (seen.has(key(d))) continue;
			seen.add(key(d));
			out.push(d);
		}
		return out;
	}

	function shuffle(a) {
		const c = [...a];
		for (let i = c.length - 1; i > 0; i--) {
			const j = ri(i + 1);
			[c[i], c[j]] = [c[j], c[i]];
		}
		return c;
	}

	/** The context-blind cheat: per attribute, take the modal value across all
	 *  eight candidates; score each candidate by how many modes it matches. */
	function contextBlindPick(choices) {
		const modes = {};
		for (const k of ATTRS) {
			const tally = new Map();
			for (const c of choices) tally.set(c[k], (tally.get(c[k]) ?? 0) + 1);
			modes[k] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
		}
		let best = 0;
		let bestScore = -1;
		choices.forEach((c, i) => {
			const s = ATTRS.filter((k) => c[k] === modes[k]).length;
			if (s > bestScore) {
				bestScore = s;
				best = i;
			}
		});
		return best;
	}

	let mode = $state('raven');
	let grid = $state([]);
	let choices = $state([]);
	let answerIdx = $state(0);
	let picked = $state(null);
	let showCheat = $state(false);

	function newProblem() {
		const g = buildContext();
		const answer = g[8];
		const raw = mode === 'raven' ? ravenChoices(answer) : fairChoices(answer);
		const sh = shuffle(raw);
		grid = g;
		choices = sh;
		answerIdx = sh.findIndex((c) => eq(c, answer));
		picked = null;
	}

	function setMode(m) {
		mode = m;
		newProblem();
	}

	newProblem();

	let context = $derived(grid.slice(0, 8));
	let cheatIdx = $derived(choices.length ? contextBlindPick(choices) : 0);
	let cheatRight = $derived(cheatIdx === answerIdx);
</script>

<figure class="widget">
	<div class="head">
		<div>
			<h4>Solve one yourself (AI generated)</h4>
			<p class="sub">
				Find the pattern. Which panel finishes the matrix?
			</p>
		</div>
		<div class="seg" role="group" aria-label="Answer set generator">
			<button class:on={mode === 'raven'} onclick={() => setMode('raven')}>RAVEN answers</button>
			<button class:on={mode === 'fair'} onclick={() => setMode('fair')}>RAVEN-F answers</button>
		</div>
	</div>

	<div class="lab">
		<div class="matrix">
			{#each context as p}
				<Panel obj={p} px={62} />
			{/each}
			<Panel obj={null} px={62} state="target" />
		</div>

		<div class="answers">
			<p class="label">Answer options</p>
			<div class="opts">
				{#each choices as c, i}
					<button
						class="opt"
						class:cheat={showCheat && i === cheatIdx}
						onclick={() => (picked = i)}
						aria-label={describe(c)}
					>
						<Panel
							obj={c}
							px={56}
							state={picked === null
								? 'normal'
								: i === answerIdx
									? 'correct'
									: i === picked
										? 'wrong'
										: 'normal'}
						/>
					</button>
				{/each}
			</div>

			<div class="foot">
				<button class="rpm-btn ghost" onclick={newProblem}>New problem</button>
				<label class="check">
					<input type="checkbox" bind:checked={showCheat} />
					show the context-blind guess
				</label>
			</div>

			{#if picked !== null}
				<p class="verdict" class:ok={picked === answerIdx}>
					{picked === answerIdx ? 'Correct.' : 'Not quite.'} The answer is
					{describe(choices[answerIdx])}.
				</p>
			{/if}

			{#if showCheat}
				<p class="cheatnote" class:ok={cheatRight}>
					A solver that never looks at the eight context panels — it just takes the most common
					value of each attribute across the answer options — picks the
					<span class="chip">outlined</span> panel. Here it is
					<strong>{cheatRight ? 'right' : 'wrong'}</strong>.
					{#if mode === 'raven'}
						Under RAVEN's generator every distractor is the answer with one attribute changed, so
						the answer <em>is</em> the attribute-wise majority. That is the bias.
					{:else}
						RAVEN-F grows the option set by perturbing options it already made, so the answer is no
						longer the majority and the cheat stops working reliably.
					{/if}
				</p>
			{/if}
		</div>
	</div>

	<figcaption>
		A single hand-written rule, not a sample from the real dataset. The
		generators are described by Zhang et al. (2019) and Benny et al. (2021).
		Flip the toggle a few times with the cheat visible.
	</figcaption>
</figure>

<style>
	.head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: flex-start;
		margin-bottom: 0.9rem;
	}
	.head h4 {
		margin: 0;
		font-size: 0.98rem;
	}
	.sub {
		margin: 0.15rem 0 0;
		font-size: 0.8rem;
		color: var(--muted);
		max-width: 30rem;
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
	.lab {
		display: flex;
		gap: 1.8rem;
		flex-wrap: wrap;
		align-items: flex-start;
	}
	.matrix {
		display: grid;
		grid-template-columns: repeat(3, auto);
		gap: 4px;
		width: max-content;
	}
	.answers {
		flex: 1 1 250px;
		min-width: 230px;
	}
	.label {
		margin: 0 0 0.4rem;
		font-size: 0.78rem;
		color: var(--muted);
	}
	.opts {
		display: grid;
		grid-template-columns: repeat(4, auto);
		gap: 4px;
		width: max-content;
	}
	.opt {
		padding: 0;
		border: 0;
		background: none;
		border-radius: 5px;
		cursor: pointer;
		line-height: 0;
	}
	.opt.cheat {
		outline: 2px dashed var(--series-2);
		outline-offset: 2px;
	}
	.foot {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		flex-wrap: wrap;
		margin-top: 0.8rem;
		font-size: 0.8rem;
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.32rem;
		color: var(--muted);
		cursor: pointer;
	}
	.verdict {
		margin: 0.7rem 0 0;
		font-size: 0.83rem;
		color: var(--danger);
	}
	.verdict.ok {
		color: var(--success);
	}
	.cheatnote {
		margin: 0.6rem 0 0;
		font-size: 0.8rem;
		line-height: 1.6;
		color: var(--text-secondary);
		border-left: 2px solid var(--series-2);
		padding-left: 0.7rem;
	}
	.chip {
		border: 1px dashed var(--series-2);
		border-radius: 4px;
		padding: 0 0.25rem;
	}
</style>
