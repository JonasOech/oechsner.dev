<script lang="ts">
	// A rotatable 3D scatter plot for a small clustered dataset, drawn as plain SVG with a
	// hand-rolled projection. No WebGL and no chart library: at this size the whole figure is a
	// few dozen nodes, it prerenders to real markup, and the feed rewriter can stub it like any
	// other widget.
	//
	// Input is TSV with a header row. The first three columns are the coordinates (their header
	// names become the axis labels), and a `cluster` column — or the fourth one — is the group.

	let { tsv, title = 'Clusters in three dimensions' }: { tsv: string; title?: string } = $props();

	type Point = { i: number; v: [number, number, number]; cluster: string };
	type View = '3d' | 'xy' | 'xz' | 'yz';

	// Cluster hues, in order of the sorted cluster labels. Only two series tokens exist; a
	// third cluster falls back to the secondary ink rather than inventing a colour.
	const PALETTE = ['var(--series-cool)', 'var(--accent)', 'var(--text-secondary)'];

	const W = 600;
	const H = 440;
	const MARGIN = 26; // room for the axis labels past the box
	const CAMERA = 5; // camera distance in box units: enough depth cue, little distortion
	const HOME = { yaw: -0.65, pitch: 0.38 };

	function parse(text: string) {
		const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
		const header = lines[0].split('\t').map((h) => h.trim());
		const at = header.indexOf('cluster');
		const c = at === -1 ? 3 : at;
		const points: Point[] = lines.slice(1).map((line, i) => {
			const cells = line.split('\t');
			const v = [0, 1, 2].map((k) => Number(cells[k])) as [number, number, number];
			if (v.some((n) => !Number.isFinite(n))) throw new Error(`Bad row ${i + 2}: ${line}`);
			return { i, v, cluster: (cells[c] ?? '').trim() };
		});
		return { axes: header.slice(0, 3), points };
	}

	let data = $derived(parse(tsv));
	let axes = $derived(data.axes);
	let points = $derived(data.points);
	let clusters = $derived([...new Set(points.map((p) => p.cluster))].sort());
	const colourOf = (cluster: string) =>
		PALETTE[Math.min(clusters.indexOf(cluster), PALETTE.length - 1)];

	// One scale for all three axes, so the spread along each dimension stays comparable; the
	// box is the data's bounding box, centred on its midpoint.
	let frame = $derived.by(() => {
		const lo = [0, 1, 2].map((k) => Math.min(...points.map((p) => p.v[k])));
		const hi = [0, 1, 2].map((k) => Math.max(...points.map((p) => p.v[k])));
		const mid = lo.map((l, k) => (l + hi[k]) / 2);
		const half = Math.max(...lo.map((l, k) => (hi[k] - l) / 2)) || 1;
		return { lo, hi, mid, half };
	});
	const norm = (v: number[]) => v.map((n, k) => (n - frame.mid[k]) / frame.half);

	let yaw = $state(HOME.yaw);
	let pitch = $state(HOME.pitch);
	let view = $state<View>('3d');
	let hidden = $state<string[]>([]);
	let dropLines = $state(true);
	let asTable = $state(false);
	let hovered = $state<number | null>(null);
	let pinned = $state<number | null>(null);

	const VIEWS: Record<View, { yaw: number; pitch: number }> = {
		'3d': HOME,
		xy: { yaw: 0, pitch: 0 },
		xz: { yaw: 0, pitch: -Math.PI / 2 },
		yz: { yaw: Math.PI / 2, pitch: 0 }
	};

	let halves = $derived([0, 1, 2].map((k) => (frame.hi[k] - frame.lo[k]) / 2 / frame.half));

	// Data axis 0 → screen right, axis 1 → screen up, axis 2 → towards the viewer. Yaw turns
	// about the vertical, pitch tilts about the horizontal. Returns box units, y up.
	function rotate3([x, y, z]: number[], yaw: number, pitch: number, perspective: boolean) {
		const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
		const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
		const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
		const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
		const k = perspective ? CAMERA / (CAMERA - z2) : 1;
		return { x: x1 * k, y: y2 * k, z: z2, k };
	}

	// The box corners and the axis-label anchors past them, in box units.
	let anchors = $derived.by(() => {
		const s = [-1, 1];
		const out = s.flatMap((a) => s.flatMap((b) => s.map((c) => [a, b, c])));
		out.push([1.18, -1, -1], [-1, 1.12, -1], [-1, -1, 1.18]);
		return out.map((p) => p.map((n, k) => n * halves[k]));
	});

	// The 3D scale is the tightest one that keeps every anchor in frame at every angle the
	// controls can reach, found by sampling them. It is fixed, so rotating never zooms. Each
	// flat view is orthographic and gets its own fit.
	let scale3d = $derived.by(() => {
		let mx = 0;
		let my = 0;
		for (let a = 0; a < 48; a++)
			for (let b = 0; b <= 24; b++)
				for (const p of anchors) {
					const r = rotate3(p, (a / 48) * 2 * Math.PI, ((b - 12) / 24) * Math.PI, true);
					mx = Math.max(mx, Math.abs(r.x));
					my = Math.max(my, Math.abs(r.y));
				}
		return Math.min((W / 2 - MARGIN) / mx, (H / 2 - MARGIN) / my);
	});
	let scale = $derived.by(() => {
		if (view === '3d') return scale3d;
		const flat = anchors.map((p) => rotate3(p, VIEWS[view].yaw, VIEWS[view].pitch, false));
		const mx = Math.max(...flat.map((r) => Math.abs(r.x)));
		const my = Math.max(...flat.map((r) => Math.abs(r.y)));
		return Math.min((W / 2 - MARGIN) / mx, (H / 2 - MARGIN) / my);
	});

	const viewLabel = (v: View) =>
		v === '3d'
			? '3D'
			: v === 'xy'
				? `${axes[0]} × ${axes[1]}`
				: v === 'xz'
					? `${axes[0]} × ${axes[2]}`
					: `${axes[2]} × ${axes[1]}`;

	function setView(v: View) {
		view = v;
		yaw = VIEWS[v].yaw;
		pitch = VIEWS[v].pitch;
	}

	// Flat views are orthographic, so distances in them read true.
	function project(v: number[]) {
		const r = rotate3(v, yaw, pitch, view === '3d');
		return { x: W / 2 + r.x * scale, y: H / 2 - r.y * scale, z: r.z, k: r.k };
	}

	let box = $derived.by(() => {
		const h = halves;
		const corner = (a: number, b: number, c: number) => project([a * h[0], b * h[1], c * h[2]]);
		const s = [-1, 1];
		const edges: { a: ReturnType<typeof project>; b: ReturnType<typeof project>; axis: number }[] =
			[];
		for (const p of s)
			for (const q of s) {
				edges.push({ a: corner(-1, p, q), b: corner(1, p, q), axis: 0 });
				edges.push({ a: corner(p, -1, q), b: corner(p, 1, q), axis: 1 });
				edges.push({ a: corner(p, q, -1), b: corner(p, q, 1), axis: 2 });
			}
		// The three edges leaving the low corner are the axes; label each past its far end.
		const origin = corner(-1, -1, -1);
		const ends = [corner(1.18, -1, -1), corner(-1, 1.12, -1), corner(-1, -1, 1.18)].map(
			(end) => ({ ...end, seen: Math.hypot(end.x - origin.x, end.y - origin.y) > 12 })
		);
		return { edges, origin, ends, floor: -h[1] };
	});

	let drawn = $derived(
		points
			.filter((p) => !hidden.includes(p.cluster))
			.map((p) => {
				const n = norm(p.v);
				return { ...p, s: project(n), floor: project([n[0], box.floor, n[2]]) };
			})
			.sort((a, b) => a.s.z - b.s.z)
	);

	let depth = $derived.by(() => {
		const zs = drawn.map((d) => d.s.z);
		return { min: Math.min(...zs), max: Math.max(...zs) };
	});
	// Depth fade only in 3D: in a flat view it would encode the dimension the view drops.
	const fade = (z: number) =>
		view !== '3d' || depth.max - depth.min < 1e-9
			? 1
			: 0.5 + (0.5 * (z - depth.min)) / (depth.max - depth.min);

	let centroids = $derived(
		clusters
			.filter((c) => !hidden.includes(c))
			.map((c) => {
				const members = points.filter((p) => p.cluster === c);
				const mean = [0, 1, 2].map(
					(k) => members.reduce((s, p) => s + p.v[k], 0) / members.length
				);
				return { cluster: c, s: project(norm(mean)) };
			})
	);

	let active = $derived(pinned ?? hovered);
	let activePoint = $derived(drawn.find((d) => d.i === active) ?? null);

	const fmt = (n: number) => n.toFixed(3).replace('-', '−');

	// — Dragging. A press that barely moves is a click: it pins or clears the readout. The
	//   pointer is only captured once it really drags, because capture retargets `pointerup`
	//   to the svg and the click would no longer know which point it landed on. —
	let drag: { x: number; y: number; moved: boolean } | null = null;

	function down(e: PointerEvent) {
		if (e.button !== 0) return;
		drag = { x: e.clientX, y: e.clientY, moved: false };
	}

	function pointAt(e: PointerEvent) {
		const hit = (e.target as Element).closest('[data-point]');
		return hit ? Number(hit.getAttribute('data-point')) : null;
	}

	function move(e: PointerEvent) {
		if (!drag?.moved) hovered = pointAt(e);
		if (!drag) return;
		const dx = e.clientX - drag.x;
		const dy = e.clientY - drag.y;
		if (!drag.moved && Math.hypot(dx, dy) < 4) return;
		if (!drag.moved) (e.currentTarget as Element).setPointerCapture(e.pointerId);
		drag.moved = true;
		view = '3d';
		rotate(dx * 0.01, dy * 0.01);
		drag.x = e.clientX;
		drag.y = e.clientY;
	}

	function up(e: PointerEvent) {
		if (!drag) return;
		if (!drag.moved) {
			const i = pointAt(e);
			pinned = i === pinned ? null : i;
		}
		drag = null;
	}

	function rotate(dYaw: number, dPitch: number) {
		yaw += dYaw;
		pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch + dPitch));
	}

	function key(e: KeyboardEvent) {
		const step = 0.12;
		const moves: Record<string, [number, number]> = {
			ArrowLeft: [-step, 0],
			ArrowRight: [step, 0],
			ArrowUp: [0, -step],
			ArrowDown: [0, step]
		};
		if (e.key in moves) {
			e.preventDefault();
			view = '3d';
			rotate(...moves[e.key]);
		} else if (e.key === 'Home') {
			e.preventDefault();
			setView('3d');
		} else if (e.key === 'Escape') {
			pinned = null;
		}
	}

	function toggle(c: string) {
		hidden = hidden.includes(c) ? hidden.filter((h) => h !== c) : [...hidden, c];
		if (active !== null && hidden.includes(points[active].cluster)) pinned = hovered = null;
	}
</script>

<figure class="widget scatter3d">
	<div class="head">
		<h4>{title}</h4>
		<div class="controls">
			<div class="seg" role="group" aria-label="View">
				{#each Object.keys(VIEWS) as v (v)}
					<button
						class:on={view === v}
						aria-pressed={view === v}
						onclick={() => setView(v as View)}>{viewLabel(v as View)}</button
					>
				{/each}
			</div>
			<label class="check">
				<input type="checkbox" bind:checked={dropLines} />
				drop lines
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={asTable} />
				table
			</label>
		</div>
	</div>

	<div class="legend">
		{#each clusters as c (c)}
			{@const n = points.filter((p) => p.cluster === c).length}
			<button
				class="key"
				class:off={hidden.includes(c)}
				aria-pressed={!hidden.includes(c)}
				onclick={() => toggle(c)}
			>
				<i
					style:background={hidden.includes(c) ? 'transparent' : colourOf(c)}
					style:outline-color={colourOf(c)}
				></i>cluster {c}
				<span class="count">{n} {n === 1 ? 'point' : 'points'}</span>
			</button>
		{/each}
		<span class="hint">+ marks each cluster's centroid</span>
	</div>

	{#if asTable}
		<div class="tablewrap">
			<table>
				<thead>
					<tr>
						<th>#</th>
						{#each axes as a (a)}<th>{a}</th>{/each}
						<th>cluster</th>
					</tr>
				</thead>
				<tbody>
					{#each points as p (p.i)}
						<tr>
							<td>{p.i + 1}</td>
							{#each p.v as n, k (k)}<td class="num">{fmt(n)}</td>{/each}
							<td><i class="dot" style:background={colourOf(p.cluster)}></i>{p.cluster}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="stage">
			<!-- A custom control: it takes the arrow keys and drags, which no interactive ARIA role
			     describes. `application` hands the keys through to it; the table is the full readout. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
			<svg
				viewBox="0 0 {W} {H}"
				role="application"
				aria-roledescription="3D scatter plot"
				aria-label="3D scatter plot of {points.length} points in {clusters.length} clusters. Drag or use the arrow keys to rotate; Home resets the view. The table toggle lists every value."
				tabindex="0"
				onpointerdown={down}
				onpointermove={move}
				onpointerup={up}
				onpointercancel={() => (drag = null)}
				onpointerleave={() => (hovered = null)}
				onkeydown={key}
			>
				<g class="box">
					{#each box.edges as e, n (n)}
						<line x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y} />
					{/each}
				</g>
				<g class="axes">
					{#each box.ends as end, k (k)}
						{#if end.seen}
							<line x1={box.origin.x} y1={box.origin.y} x2={end.x} y2={end.y} />
							<text x={end.x} y={end.y}>{axes[k]}</text>
						{/if}
					{/each}
				</g>

				{#if dropLines && view === '3d'}
					<g class="drops">
						{#each drawn as d (d.i)}
							<line x1={d.s.x} y1={d.s.y} x2={d.floor.x} y2={d.floor.y} />
							<circle cx={d.floor.x} cy={d.floor.y} r="1.6" />
						{/each}
					</g>
				{/if}

				{#each centroids as c (c.cluster)}
					<g class="centroid" style:stroke={colourOf(c.cluster)}>
						<line x1={c.s.x - 7} y1={c.s.y} x2={c.s.x + 7} y2={c.s.y} />
						<line x1={c.s.x} y1={c.s.y - 7} x2={c.s.x} y2={c.s.y + 7} />
					</g>
				{/each}

				{#each drawn as d (d.i)}
					<circle
						class="pt"
						class:active={d.i === active}
						data-point={d.i}
						cx={d.s.x}
						cy={d.s.y}
						r={6.5 * d.s.k}
						style:fill={colourOf(d.cluster)}
						style:opacity={fade(d.s.z)}
					/>
				{/each}
			</svg>

			{#if activePoint}
				<div
					class="tip"
					class:flip={activePoint.s.x > W * 0.62}
					style:left="{(activePoint.s.x / W) * 100}%"
					style:top="{(activePoint.s.y / H) * 100}%"
				>
					<strong>Point {activePoint.i + 1}</strong>
					<span class="tip-cluster"
						><i style:background={colourOf(activePoint.cluster)}></i>cluster {activePoint.cluster}</span
					>
					{#each axes as a, k (a)}
						<span class="row"><span>{a}</span><span class="num">{fmt(activePoint.v[k])}</span></span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<figcaption>
		Drag to rotate, or focus the plot and use the arrow keys. Hover a point for its values, click
		to pin them. The flat views project onto two dimensions without perspective.
	</figcaption>
</figure>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-3);
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--s-3);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2) var(--s-4);
		align-items: center;
		font-size: 0.8rem;
	}
	/* The 1px gap over a --line ground draws the dividers, so they survive the 2×2 wrap. */
	.seg {
		display: inline-grid;
		grid-auto-flow: column;
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
		border-radius: 7px;
		overflow: hidden;
	}
	@media (max-width: 30rem) {
		.seg {
			grid-auto-flow: row;
			grid-template-columns: 1fr 1fr;
			width: 100%;
		}
	}
	.seg button {
		border: 0;
		background: var(--surface-active);
		color: var(--text-secondary);
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
		color: var(--text-muted);
		cursor: pointer;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2) var(--s-4);
		align-items: center;
		font-size: 0.8rem;
		margin-bottom: var(--s-2);
	}
	.key {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.2rem 0.5rem;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: transparent;
		color: var(--text-secondary);
		font: inherit;
		cursor: pointer;
	}
	.key.off {
		opacity: 0.45;
	}
	.key i {
		outline: 1px solid;
		outline-offset: -1px;
	}
	.key i,
	.dot,
	.tip-cluster i {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		display: inline-block;
		flex: none;
	}
	.count,
	.hint {
		color: var(--text-muted);
	}

	.stage {
		position: relative;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		background: var(--bg-deep);
		border: 1px solid var(--line);
		border-radius: 8px;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}
	svg:active {
		cursor: grabbing;
	}
	svg:focus-visible,
	.seg button:focus-visible,
	.key:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.box line {
		stroke: var(--line);
		stroke-width: 1;
	}
	.axes line {
		stroke: var(--line-strong);
		stroke-width: 1.25;
	}
	.axes text {
		fill: var(--text-muted);
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-anchor: middle;
		dominant-baseline: central;
	}
	.drops line {
		stroke: var(--line-strong);
		stroke-width: 1;
		stroke-dasharray: 2 3;
	}
	.drops circle {
		fill: var(--line-strong);
	}
	.centroid {
		stroke-width: 2;
		stroke-linecap: round;
		opacity: 0.85;
	}
	.pt {
		stroke: var(--bg-deep);
		stroke-width: 1.5;
		cursor: pointer;
	}
	.pt.active {
		stroke: var(--text);
		stroke-width: 2;
	}

	.tip {
		position: absolute;
		transform: translate(14px, -50%);
		display: grid;
		gap: 0.15rem;
		min-width: 9.5rem;
		padding: var(--s-2) var(--s-3);
		background: var(--surface-active);
		border: 1px solid var(--line-strong);
		border-radius: 6px;
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--text-secondary);
		pointer-events: none;
	}
	.tip.flip {
		transform: translate(calc(-100% - 14px), -50%);
	}
	.tip strong {
		color: var(--text);
	}
	.tip-cluster {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-bottom: 0.15rem;
	}
	.row {
		display: flex;
		justify-content: space-between;
		gap: var(--s-3);
	}
	.num {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	.tablewrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.35rem 0.6rem;
		border-bottom: 1px solid var(--line);
	}
	th {
		color: var(--text-muted);
		font-weight: 700;
	}
	td .dot {
		margin-right: 0.4rem;
	}
</style>
