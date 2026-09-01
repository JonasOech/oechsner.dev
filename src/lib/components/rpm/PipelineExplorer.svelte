<script>
	const stages = [
		{
			id: 'fcnn',
			short: 'FCNN',
			title: '1 · FCNN — which configuration is this?',
			body: `A CNN (16/32/64/128 channels, 5x5 kernels, stride 1) plus a 16 384-node feed-forward head,
			       trained jointly on 160x160 images. It sorts a problem into one of the seven RAVEN
			       configurations, which then selects a fixed, hand-written crop rule for cutting the
			       panels into individual objects. Motivated by Chen's global-first theory: recognise the
			       layout before the parts.`,
			metric: '100.0 % on both datasets',
			verdict: 'reproduced exactly'
		},
		{
			id: 'svae',
			short: 'sVAE',
			title: '2 · sVAE — what is this object?',
			body: `A beta-VAE whose bottleneck carries a supervised semantic layer f: 5 types, 10 colours,
			       6 sizes and 8 angles, one-hot, 29 dimensions in total. Trained on four losses at once —
			       image reconstruction, latent reconstruction (z1 vs. z2), a smooth L1 term tying f to the
			       ground-truth labels from the problem XML, and a KL term with beta = 10. One sVAE per
			       configuration (two for O-IC and O-IG, inner and outer shapes).`,
			metric: 'never measured in isolation',
			verdict: 'the suspect'
		},
		{
			id: 'cmrb',
			short: 'CMRB',
			title: '3 · CMRB — which relation holds?',
			body: `Long-term memory of 30 cognitive maps per configuration per feature dimension, each a
			       9x9 matrix (two-way relation a+b) or a 9x9x9 tensor (three-way a+b-c). At inference the
			       problem's own map is computed and the stored maps that match it vote on the semantic
			       features of the missing panel.`,
			metric: '98.9 – 100 % with ground-truth features',
			verdict: 'reproduced within ~1 pp'
		},
		{
			id: 'match',
			short: 'Match',
			title: '4 · Answer matching',
			body: `The predicted 29-dimensional feature vector is compared against the sVAE encoding of each
			       of the eight answer candidates. Nearest one wins. No learning happens here — but every
			       upstream error in f lands on this step.`,
			metric: 'end-to-end: ~94 %',
			verdict: 'where the 5 points go missing'
		}
	];

	let openId = $state('fcnn');
	let open = $derived(stages.find((s) => s.id === openId));
</script>

<figure class="widget">
	<div class="track" role="tablist" aria-label="Pipeline stages">
		{#each stages as s, i}
			<button
				role="tab"
				class="stage"
				class:active={openId === s.id}
				aria-selected={openId === s.id}
				onclick={() => (openId = s.id)}
			>
				<span class="num">{i + 1}</span>
				<span class="short">{s.short}</span>
			</button>
			{#if i < stages.length - 1}<span class="arrow" aria-hidden="true">→</span>{/if}
		{/each}
	</div>

	<div class="detail">
		<h4>{open.title}</h4>
		<p>{open.body}</p>
		<div class="tags">
			<span class="pill metric">{open.metric}</span>
			<span class="pill verdict" data-id={open.id}>{open.verdict}</span>
		</div>
	</div>

	<figcaption>Click a stage. Accuracies are our three-fold means, not the paper's numbers.</figcaption>
</figure>

<style>
	.track {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.stage {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.9rem;
		border: 1px solid var(--rule);
		border-radius: 8px;
		background: var(--chip);
		color: inherit;
		font: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition:
			background 120ms ease,
			border-color 120ms ease;
	}
	.stage:hover {
		border-color: var(--accent);
	}
	.stage.active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--text-inverse);
	}
	.num {
		display: grid;
		place-items: center;
		width: 1.3rem;
		height: 1.3rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.08);
		font-size: 0.72rem;
		font-weight: 700;
	}
	.stage.active .num {
		background: rgb(0 0 0 / 0.18);
	}
	.short {
		font-weight: 600;
	}
	.arrow {
		color: var(--muted);
	}
	.detail {
		margin-top: 1rem;
	}
	.detail h4 {
		margin: 0 0 0.4rem;
		font-size: 0.98rem;
	}
	.detail p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.65;
	}
	.tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 0.8rem;
	}
	.pill {
		font-size: 0.75rem;
		padding: 0.22rem 0.6rem;
		border-radius: 99px;
		background: var(--chip);
		color: var(--muted);
	}
	.pill.verdict[data-id='svae'],
	.pill.verdict[data-id='match'] {
		background: rgba(var(--danger-rgb), 0.14);
		color: var(--danger);
	}
	.pill.verdict[data-id='fcnn'],
	.pill.verdict[data-id='cmrb'] {
		background: rgba(var(--success-rgb), 0.14);
		color: var(--success);
	}
</style>
