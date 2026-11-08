<script lang="ts">
	// A rotatable 3D scatter plot for a small clustered dataset, drawn as plain SVG with a
	// hand-rolled projection. No WebGL and no chart library: at this size the whole figure is a
	// few dozen nodes, it prerenders to real markup, and the feed rewriter can stub it like any
	// other widget.
	//
	// Input is CSV with a header row (tab- or semicolon-separated also works). The first three
	// columns are the coordinates, and their header names label the axes and the toggles. A
	// `cluster` column — or the fourth one — picks the colour.
	//
	// With all three dimensions on, the plot rotates. Switching one off shows the other two as
	// a flat, orthographic scatter. At least two stay on: one alone is not a scatter plot.

	let { csv, title = 'Clusters in three dimensions' }: { csv: string; title?: string } = $props();

	type Point = { i: number; v: [number, number, number]; cluster: string };

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
		const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
		const header = lines[0].split(sep).map((h) => h.trim());
		const at = header.indexOf('cluster');
		const c = at === -1 ? 3 : at;
		const points: Point[] = lines.slice(1).map((line, i) => {
			const cells = line.split(sep);
			const v = [0, 1, 2].map((k) => Number(cells[k])) as [number, number, number];
			if (v.some((n) => !Number.isFinite(n))) throw new Error(`Bad row ${i + 2}: ${line}`);
			return { i, v, cluster: (cells[c] ?? '').trim() };
		});
		return { axes: header.slice(0, 3), points };
	}

	let data = $derived(parse(csv));
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
	let halves = $derived([0, 1, 2].map((k) => (frame.hi[k] - frame.lo[k]) / 2 / frame.half));

	let yaw = $state(HOME.yaw);
	let pitch = $state(HOME.pitch);
	let on = $state([true, true, true]);
	let hovered = $state<number | null>(null);
	let pinned = $state<number | null>(null);

	// The two dimensions a flat view shows, lower index across, or null in 3D.
	let flat = $derived.by(() => {
		const kept = [0, 1, 2].filter((k) => on[k]);
		return kept.length === 2 ? (kept as [number, number]) : null;
	});

	// Data axis 0 → screen right, axis 1 → screen up, axis 2 → towards the viewer. Yaw turns
	// about the vertical, pitch tilts about the horizontal. Returns box units, y up.
	function rotate3([x, y, z]: number[], yaw: number, pitch: number) {
		const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
		const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
		const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
		const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
		const k = CAMERA / (CAMERA - z2);
		return { x: x1 * k, y: y2 * k, z: z2, k };
	}

	// Flat views are orthographic, so distances in them read true.
	function place(v: number[]) {
		return flat ? { x: v[flat[0]], y: v[flat[1]], z: 0, k: 1 } : rotate3(v, yaw, pitch);
	}

	// The box corners and the axis-label anchors past them, in box units.
	let anchors = $derived.by(() => {
		const s = [-1, 1];
		const out = s.flatMap((a) => s.flatMap((b) => s.map((c) => [a, b, c])));
		out.push([1.18, -1, -1], [-1, 1.12, -1], [-1, -1, 1.18]);
		return out.map((p) => p.map((n, k) => n * halves[k]));
	});

	const fit = (rs: { x: number; y: number }[]) =>
		Math.min(
			(W / 2 - MARGIN) / Math.max(...rs.map((r) => Math.abs(r.x))),
			(H / 2 - MARGIN) / Math.max(...rs.map((r) => Math.abs(r.y)))
		);

	// The 3D scale is the tightest one that keeps every anchor in frame at every angle a drag
	// can reach, found by sampling them. It is fixed, so rotating never zooms. A flat view
	// gets its own fit.
	let scale3d = $derived.by(() => {
		const rs = [];
		for (let a = 0; a < 48; a++)
			for (let b = 0; b <= 24; b++)
				for (const p of anchors)
					rs.push(rotate3(p, (a / 48) * 2 * Math.PI, ((b - 12) / 24) * Math.PI));
		return fit(rs);
	});
	let scale = $derived(flat ? fit(anchors.map(place)) : scale3d);

	function project(v: number[]) {
		const r = place(v);
		return { x: W / 2 + r.x * scale, y: H / 2 - r.y * scale, z: r.z, k: r.k };
	}

	let box = $derived.by(() => {
		const h = halves;
		const corner = (a: number, b: number, c: number) => project([a * h[0], b * h[1], c * h[2]]);
		const s = [-1, 1];
		const edges: { a: ReturnType<typeof project>; b: ReturnType<typeof project> }[] = [];
		for (const p of s)
			for (const q of s) {
				edges.push({ a: corner(-1, p, q), b: corner(1, p, q) });
				edges.push({ a: corner(p, -1, q), b: corner(p, 1, q) });
				edges.push({ a: corner(p, q, -1), b: corner(p, q, 1) });
			}
		// The three edges leaving the low corner are the axes; label each past its far end. In a
		// flat view the dropped axis collapses to a point and goes unlabelled.
		const origin = corner(-1, -1, -1);
		const ends = [corner(1.18, -1, -1), corner(-1, 1.12, -1), corner(-1, -1, 1.18)].map(
			(end) => ({ ...end, seen: Math.hypot(end.x - origin.x, end.y - origin.y) > 12 })
		);
		return { edges, origin, ends };
	});

	let drawn = $derived(
		points.map((p) => ({ ...p, s: project(norm(p.v)) })).sort((a, b) => a.s.z - b.s.z)
	);

	let depth = $derived.by(() => {
		const zs = drawn.map((d) => d.s.z);
		return { min: Math.min(...zs), max: Math.max(...zs) };
	});
	// Depth fade only in 3D: in a flat view it would encode the dimension the view drops.
	const fade = (z: number) =>
		flat || depth.max - depth.min < 1e-9
			? 1
			: 0.5 + (0.5 * (z - depth.min)) / (depth.max - depth.min);

	let active = $derived(pinned ?? hovered);
	let activePoint = $derived(drawn.find((d) => d.i === active) ?? null);

	const fmt = (n: number) => n.toFixed(3).replace('-', '−');

	function toggle(k: number) {
		if (on[k] && flat) return; // keep at least two
		on[k] = !on[k];
	}

	// — Dragging, in 3D only. A press that barely moves is a click: it pins or clears the
	//   readout. The pointer is only captured once it really drags, because capture retargets
	//   `pointerup` to the svg and the click would no longer know which point it landed on. —
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
		if (!drag || flat) return;
		const dx = e.clientX - drag.x;
		const dy = e.clientY - drag.y;
		if (!drag.moved && Math.hypot(dx, dy) < 4) return;
		if (!drag.moved) (e.currentTarget as Element).setPointerCapture(e.pointerId);
		drag.moved = true;
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
		if (e.key in moves && !flat) {
			e.preventDefault();
			rotate(...moves[e.key]);
		} else if (e.key === 'Home') {
			e.preventDefault();
			on = [true, true, true];
			yaw = HOME.yaw;
			pitch = HOME.pitch;
		} else if (e.key === 'Escape') {
			pinned = null;
		}
	}
</script>

<figure class="widget scatter3d">
	<div class="head">
		<h4>{title}</h4>
		<div class="seg" role="group" aria-label="Dimensions shown">
			{#each axes as a, k (k)}
				<button
					class:on={on[k]}
					aria-pressed={on[k]}
					aria-disabled={on[k] && !!flat}
					title={on[k] && flat ? 'At least two dimensions stay on' : undefined}
					onclick={() => toggle(k)}>{a}</button
				>
			{/each}
		</div>
	</div>

	<div class="stage">
		<!-- A custom control: it takes the arrow keys and drags, which no interactive ARIA role
		     describes. `application` hands the keys through to it. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
		<svg
			class:flat
			viewBox="0 0 {W} {H}"
			role="application"
			aria-roledescription="scatter plot"
			aria-label={flat
				? `Scatter plot of ${points.length} points, ${axes[flat[0]]} across and ${axes[flat[1]]} up.`
				: `3D scatter plot of ${points.length} points. Drag or use the arrow keys to rotate; Home resets the view.`}
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

	<figcaption>
		Drag to rotate, or focus the plot and use the arrow keys. Switch a dimension off to see the
		other two flat, without perspective. Hover a point for its values, click to pin them.
	</figcaption>
</figure>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-3);
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--s-3);
	}
	/* The 1px gap over a --line ground draws the dividers between the toggles. */
	.seg {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
		border-radius: 7px;
		overflow: hidden;
	}
	.seg button {
		border: 0;
		background: var(--surface-active);
		color: var(--text-secondary);
		font: inherit;
		font-size: 0.8rem;
		padding: 0.32rem 0.9rem;
		cursor: pointer;
	}
	.seg button.on {
		background: var(--accent);
		color: var(--text-inverse);
	}
	.seg button[aria-disabled='true'] {
		cursor: not-allowed;
	}
	.seg button:focus-visible,
	svg:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
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
	svg.flat {
		cursor: default;
		touch-action: auto;
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
	.tip-cluster i {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		display: inline-block;
		flex: none;
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
</style>
