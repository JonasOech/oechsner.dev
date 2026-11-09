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
	// a flat, orthographic scatter, and switching two off lays the last one out as a strip.
	// At least one stays on.
	//
	// The fullscreen button uses the Fullscreen API where the browser has it. Where it does
	// not (iPhone Safari only allows it for video) the figure is pinned over the whole window
	// instead, the same way LatexBlock maximises a formula.
	//
	// Fullscreen also zooms and pans. Zoom spreads the points apart instead of magnifying
	// them, so a tight cluster separates while dots, lines and labels keep their size. In the
	// page the plot stays fixed: a wheel over it scrolls the article, as a reader expects.
	//
	// Discrete changes — a dimension switched, Home, a zoom button or key, an arrow-key step —
	// morph from the old layout to the new one, once, then stop (DESIGN.md §7). Drags, the
	// wheel and pinches stay direct: easing a gesture only makes it feel late. Under reduced
	// motion everything snaps.
	import Icon from '$lib/components/Icon.svelte';

	let { csv, title = 'Clusters in three dimensions' }: { csv: string; title?: string } = $props();

	type Point = { i: number; v: [number, number, number]; cluster: string };

	// Cluster hues, in order of the sorted cluster labels. Only two series tokens exist; a
	// third cluster falls back to the secondary ink rather than inventing a colour.
	const PALETTE = ['var(--series-cool)', 'var(--accent)', 'var(--text-secondary)'];

	const W = 600;
	const H = 440; // in the page; fullscreen takes the shape of the screen instead
	const H_STRIP = 200;
	const R = 6.5; // point radius at the middle of the depth range
	const GAP = 12; // px between a point and its tooltip
	const MARGIN = 26; // room for the axis labels past the box
	const CAMERA = 5; // camera distance in box units: enough depth cue, little distortion
	const HOME = { yaw: -0.65, pitch: 0.38 };
	const ZOOM_MAX = 12;
	const MORPH = 620; // --dur-slow, for a change of view
	const STEP = 260; // --dur-base, for a zoom or an arrow-key step

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

	let figure: HTMLElement;
	let full = $state(false);
	let native = $state(false); // true while `full` is the Fullscreen API, not the overlay
	let svg: SVGSVGElement;

	// Zoom and pan, in fullscreen only. A screen position is (p − centre) · zoom + centre + pan,
	// in viewBox units, and pan is clamped so the plot's own frame always covers the view.
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);

	// Measured in the browser: the stage sets the fullscreen shape, the plot places the tooltip.
	let stageW = $state(0);
	let stageH = $state(0);
	let plotW = $state(0);
	let plotH = $state(0);

	async function toggleFull() {
		if (full) {
			if (document.fullscreenElement) await document.exitFullscreen();
			full = native = false;
			resetZoom();
			return;
		}
		if (document.fullscreenEnabled && figure.requestFullscreen) {
			try {
				await figure.requestFullscreen();
				full = native = true;
				return;
			} catch {
				// Refused (an iframe without permission, say): fall through to the overlay.
			}
		}
		full = true;
	}

	$effect(() => {
		if (!full || native) return;

		// The overlay has to clear the sticky header, but `.container` is its own stacking
		// context below it, so the column is lifted while the overlay is up (as in LatexBlock),
		// and the page behind it stops scrolling.
		const stack = figure.closest<HTMLElement>('.container');
		const stackZ = stack?.style.zIndex ?? '';
		if (stack) stack.style.zIndex = '300';
		const bodyOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			if (stack) stack.style.zIndex = stackZ;
			document.body.style.overflow = bodyOverflow;
		};
	});

	let kept = $derived([0, 1, 2].filter((k) => on[k]));
	let is3d = $derived(kept.length === 3);
	// The two dimensions a flat view shows, lower index across, or null.
	let flat = $derived(kept.length === 2 ? (kept as [number, number]) : null);
	// The one dimension a strip shows, or null.
	let line = $derived(kept.length === 1 ? kept[0] : null);

	// The viewBox height. Fullscreen matches the stage's shape, so a phone held upright gets a
	// tall plot rather than a landscape strip with empty space above and below it. In the page,
	// a 1D strip needs little height, so it gets a short plot.
	let vh = $derived(
		full && stageW > 0 && stageH > 0
			? Math.min(Math.max((W * stageH) / stageW, 300), 1100)
			: line !== null
				? H_STRIP
				: H
	);

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

	// Flat views and the strip are orthographic, so distances in them read true.
	function place(v: number[]) {
		if (line !== null) return { x: v[line], y: 0, z: 0, k: 1 };
		return flat ? { x: v[flat[0]], y: v[flat[1]], z: 0, k: 1 } : rotate3(v, yaw, pitch);
	}

	// The box corners and the axis-label anchors past them, in box units.
	let anchors = $derived.by(() => {
		const s = [-1, 1];
		const out = s.flatMap((a) => s.flatMap((b) => s.map((c) => [a, b, c])));
		out.push([1.18, -1, -1], [-1, 1.12, -1], [-1, -1, 1.18]);
		return out.map((p) => p.map((n, k) => n * halves[k]));
	});

	// A strip has no height to fit, and x / 0 = Infinity drops out of the min on its own.
	const fit = (rs: { x: number; y: number }[]) =>
		Math.min(
			(W / 2 - MARGIN) / Math.max(...rs.map((r) => Math.abs(r.x))),
			(vh / 2 - MARGIN) / Math.max(...rs.map((r) => Math.abs(r.y)))
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
	let scale = $derived(is3d ? scale3d : fit(anchors.map(place)));

	function project(v: number[]) {
		const r = place(v);
		return {
			x: W / 2 + r.x * scale * zoom + panX,
			y: vh / 2 - r.y * scale * zoom + panY,
			z: r.z,
			k: r.k
		};
	}

	function clampPan() {
		const mx = ((zoom - 1) * W) / 2;
		const my = ((zoom - 1) * vh) / 2;
		panX = Math.max(-mx, Math.min(mx, panX));
		panY = Math.max(-my, Math.min(my, panY));
	}

	// Zooms by `factor` about (fx, fy) in viewBox units: whatever is under that spot stays there.
	function zoomAt(factor: number, fx = W / 2, fy = vh / 2) {
		const next = Math.max(1, Math.min(ZOOM_MAX, zoom * factor));
		const f = next / zoom;
		panX = fx - W / 2 - (fx - W / 2 - panX) * f;
		panY = fy - vh / 2 - (fy - vh / 2 - panY) * f;
		zoom = next;
		clampPan();
	}

	function panBy(dx: number, dy: number) {
		panX += dx;
		panY += dy;
		clampPan();
	}

	function resetZoom() {
		zoom = 1;
		panX = panY = 0;
	}

	// Client pixels to viewBox units.
	function toView(cx: number, cy: number) {
		const r = svg.getBoundingClientRect();
		return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * vh, k: W / r.width };
	}

	// Wheel and trackpad pinch (which arrives as a wheel with ctrlKey). Attached by hand
	// because it must be able to preventDefault, and only while fullscreen.
	$effect(() => {
		if (!full) return;
		const wheel = (e: WheelEvent) => {
			e.preventDefault();
			const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
			const p = toView(e.clientX, e.clientY);
			zoomAt(Math.exp(-e.deltaY * unit * (e.ctrlKey ? 0.01 : 0.002)), p.x, p.y);
		};
		svg.addEventListener('wheel', wheel, { passive: false });
		return () => svg.removeEventListener('wheel', wheel);
	});

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
		swarm(points.map((p) => ({ ...p, s: project(norm(p.v)) }))).sort((a, b) => a.s.z - b.s.z)
	);

	// On a strip, points with nearly the same value would sit exactly on top of each other.
	// Each one, left to right, takes the row nearest the axis (0, +1, −1, +2, …) where it
	// overlaps nothing already placed. The rows carry no value: only x is data.
	function swarm<T extends { s: { x: number; y: number } }>(list: T[]): T[] {
		if (line === null) return list;
		const step = 2 * R + 1;
		const placed: { x: number; y: number }[] = [];
		return [...list]
			.sort((a, b) => a.s.x - b.s.x)
			.map((d) => {
				for (let n = 0; ; n++) {
					const row = n % 2 ? (n + 1) / 2 : -n / 2;
					const y = d.s.y - row * step;
					if (placed.every((q) => Math.hypot(q.x - d.s.x, q.y - y) >= step)) {
						placed.push({ x: d.s.x, y });
						return { ...d, s: { ...d.s, y } };
					}
				}
			});
	}

	let depth = $derived.by(() => {
		const zs = drawn.map((d) => d.s.z);
		return { min: Math.min(...zs), max: Math.max(...zs) };
	});
	// Depth fade only in 3D: in a flat view it would encode the dimension the view drops.
	const fade = (z: number) =>
		!is3d || depth.max - depth.min < 1e-9
			? 1
			: 0.5 + (0.5 * (z - depth.min)) / (depth.max - depth.min);

	// — The morph. Everything the svg draws is gathered into one flat layout, and what is on
	//   screen is the target layout, or, during a morph, a blend of the layout on screen when
	//   it began and the target. The target may keep moving meanwhile (a drag mid-morph); the
	//   blend just follows it. Every layout has the same points, edges and axes, so blending is
	//   index by index. —
	type Layout = {
		vh: number;
		pts: Record<number, { x: number; y: number; r: number; o: number }>;
		edges: { x1: number; y1: number; x2: number; y2: number }[];
		origin: { x: number; y: number };
		ends: { x: number; y: number; a: number }[]; // a: label opacity, 0 when collapsed
	};

	let target: Layout = $derived({
		vh,
		pts: Object.fromEntries(
			drawn.map((d) => [d.i, { x: d.s.x, y: d.s.y, r: R * d.s.k, o: fade(d.s.z) }])
		),
		edges: box.edges.map((e) => ({ x1: e.a.x, y1: e.a.y, x2: e.b.x, y2: e.b.y })),
		origin: { x: box.origin.x, y: box.origin.y },
		ends: box.ends.map((e) => ({ x: e.x, y: e.y, a: e.seen ? 1 : 0 }))
	});

	let morph = $state<{ from: Layout; start: number; dur: number } | null>(null);
	let progress = $state(1);
	let rafId = 0;

	// --ease-inout, cubic-bezier(0.65, 0, 0.35, 1), as the cubic it closely follows.
	const ease = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

	function blend(a: Layout, b: Layout, t: number): Layout {
		const pts: Layout['pts'] = {};
		for (const i in b.pts) {
			const p = a.pts[i] ?? b.pts[i];
			const q = b.pts[i];
			pts[i] = {
				x: lerp(p.x, q.x, t),
				y: lerp(p.y, q.y, t),
				r: lerp(p.r, q.r, t),
				o: lerp(p.o, q.o, t)
			};
		}
		return {
			vh: lerp(a.vh, b.vh, t),
			pts,
			edges: b.edges.map((e, n) => ({
				x1: lerp(a.edges[n].x1, e.x1, t),
				y1: lerp(a.edges[n].y1, e.y1, t),
				x2: lerp(a.edges[n].x2, e.x2, t),
				y2: lerp(a.edges[n].y2, e.y2, t)
			})),
			origin: { x: lerp(a.origin.x, b.origin.x, t), y: lerp(a.origin.y, b.origin.y, t) },
			ends: b.ends.map((e, n) => ({
				x: lerp(a.ends[n].x, e.x, t),
				y: lerp(a.ends[n].y, e.y, t),
				a: lerp(a.ends[n].a, e.a, t)
			}))
		};
	}

	let shown = $derived(morph ? blend(morph.from, target, ease(progress)) : target);

	// Runs `change` and morphs to what it produces. Starting from what is on screen, not
	// from the last target, is what lets a morph that interrupts another one stay smooth.
	function animate(change: () => void, dur = MORPH) {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const from = shown;
		change();
		if (reduce) return;
		morph = { from, start: performance.now(), dur };
		progress = 0;
		if (!rafId) rafId = requestAnimationFrame(tick);
	}

	function tick(now: number) {
		rafId = 0;
		if (!morph) return;
		progress = Math.min(1, (now - morph.start) / morph.dur);
		if (progress < 1) rafId = requestAnimationFrame(tick);
		else morph = null;
	}

	$effect(() => () => cancelAnimationFrame(rafId));

	let active = $derived(pinned ?? hovered);
	// Where the active point is on screen right now, morph included. A point zoomed or panned
	// out of view has no tooltip: it would point at nothing.
	let activeAt = $derived.by(() => {
		const at = active === null ? undefined : shown.pts[active];
		return at && at.x >= 0 && at.x <= W && at.y >= 0 && at.y <= shown.vh ? at : null;
	});
	let activePoint = $derived(activeAt ? (points.find((p) => p.i === active) ?? null) : null);

	// The tooltip goes beside its point, right if it fits and left if not. A phone-width plot
	// can have room on neither side, and then it goes above the point, or below. Either way
	// it is kept inside the plot.
	let tipW = $state(0);
	let tipH = $state(0);
	let tip = $derived.by(() => {
		if (!activeAt) return { left: 0, top: 0 };
		const x = (activeAt.x / W) * plotW;
		const y = (activeAt.y / shown.vh) * plotH;
		const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max));
		const beside =
			x + GAP + tipW <= plotW ? x + GAP : x - GAP - tipW >= 0 ? x - GAP - tipW : null;
		if (beside !== null) return { left: beside, top: clamp(y - tipH / 2, plotH - tipH) };
		const top = y - GAP - tipH >= 0 ? y - GAP - tipH : y + GAP;
		return { left: clamp(x - tipW / 2, plotW - tipW), top: clamp(top, plotH - tipH) };
	});

	const fmt = (n: number) => n.toFixed(3).replace('-', '−');

	function toggle(k: number) {
		if (on[k] && line !== null) return; // keep at least one
		animate(() => {
			on[k] = !on[k];
			resetZoom(); // a new view lays every point out afresh
		});
	}

	// — Pointers. One pointer dragging rotates the 3D view. In fullscreen it pans a flat
	//   view or strip, and pans 3D too with shift held or the right button; two pointers
	//   pinch-zoom and pan together. A press that barely moves is a click: it pins or clears
	//   the readout. Hit-testing goes by position, because a captured pointer's events all
	//   name the svg as their target. —
	let drag: { x: number; y: number; moved: boolean; pan: boolean } | null = null;
	const pointers = new Map<number, { x: number; y: number }>();
	let pinch: { dist: number; x: number; y: number } | null = null;

	function pinchState() {
		const [a, b] = [...pointers.values()];
		return { dist: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
	}

	function down(e: PointerEvent) {
		if (e.button !== 0 && !(full && e.button === 2)) return;
		try {
			svg.setPointerCapture(e.pointerId);
		} catch {
			// Not an active pointer any more (released mid-dispatch): nothing to capture.
		}
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (full && pointers.size === 2) {
			pinch = pinchState();
			drag = null;
			return;
		}
		const pan = full && (!is3d || e.shiftKey || e.button === 2);
		drag = { x: e.clientX, y: e.clientY, moved: false, pan };
	}

	function pointAt(e: PointerEvent) {
		const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-point]');
		return hit && svg.contains(hit) ? Number(hit.getAttribute('data-point')) : null;
	}

	function move(e: PointerEvent) {
		if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pinch && pointers.size >= 2) {
			const now = pinchState();
			const at = toView(now.x, now.y);
			panBy((now.x - pinch.x) * at.k, (now.y - pinch.y) * at.k);
			if (pinch.dist > 0) zoomAt(now.dist / pinch.dist, at.x, at.y);
			pinch = now;
			return;
		}
		if (!drag?.moved) hovered = pointAt(e);
		if (!drag || (!is3d && !drag.pan)) return;
		const dx = e.clientX - drag.x;
		const dy = e.clientY - drag.y;
		if (!drag.moved && Math.hypot(dx, dy) < 4) return;
		drag.moved = true;
		if (drag.pan) {
			const k = toView(0, 0).k;
			panBy(dx * k, dy * k);
		} else rotate(dx * 0.01, dy * 0.01);
		drag.x = e.clientX;
		drag.y = e.clientY;
	}

	function up(e: PointerEvent) {
		pointers.delete(e.pointerId);
		if (pinch) {
			// The finger left behind would otherwise start a drag of its own.
			if (pointers.size < 2) pinch = null;
			drag = null;
			return;
		}
		if (!drag) return;
		if (!drag.moved && e.button === 0) {
			const i = pointAt(e);
			pinned = i === pinned ? null : i;
		}
		drag = null;
	}

	function cancel(e: PointerEvent) {
		pointers.delete(e.pointerId);
		pinch = null;
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
		// In fullscreen the arrows pan a flat view, and shift turns them to panning in 3D.
		const panKeys = full && (!is3d || e.shiftKey);
		if (e.key in moves && panKeys) {
			e.preventDefault();
			const [dx, dy] = moves[e.key];
			animate(() => panBy((-dx / step) * 40, (-dy / step) * 40), STEP);
		} else if (e.key in moves && is3d) {
			e.preventDefault();
			animate(() => rotate(...moves[e.key]), STEP);
		} else if (full && (e.key === '+' || e.key === '=')) {
			animate(() => zoomAt(1.25), STEP);
		} else if (full && e.key === '-') {
			animate(() => zoomAt(0.8), STEP);
		} else if (full && e.key === '0') {
			animate(resetZoom, STEP);
		} else if (e.key === 'Home') {
			e.preventDefault();
			animate(() => {
				on = [true, true, true];
				yaw = HOME.yaw;
				pitch = HOME.pitch;
				resetZoom();
			});
		} else if (e.key === 'Escape') {
			pinned = null;
		}
	}
</script>

<svelte:document
	onfullscreenchange={() => {
		// The browser's own Escape or exit control leaves fullscreen without the button.
		if (native && !document.fullscreenElement) {
			full = native = false;
			resetZoom();
		}
	}}
/>
<svelte:window
	onkeydown={(e) => {
		if (full && !native && e.key === 'Escape') {
			full = false;
			resetZoom();
		}
	}}
/>

<figure class="widget scatter3d" class:max={full} bind:this={figure}>
	<div class="head">
		<h4>{title}</h4>
		<div class="tools">
			<div class="seg" role="group" aria-label="Dimensions shown">
				{#each axes as a, k (k)}
					<button
						class:on={on[k]}
						aria-pressed={on[k]}
						aria-disabled={on[k] && line !== null}
						title={on[k] && line !== null ? 'At least one dimension stays on' : undefined}
						onclick={() => toggle(k)}>{a}</button
					>
				{/each}
			</div>
			<button
				class="full"
				type="button"
				title={full ? 'Exit fullscreen' : 'Fullscreen'}
				aria-label={full ? 'Exit fullscreen' : 'Show the plot fullscreen'}
				aria-pressed={full}
				onclick={toggleFull}
			>
				<Icon name={full ? 'minimize' : 'maximize'} />
			</button>
		</div>
	</div>

	<div class="stage" bind:clientWidth={stageW} bind:clientHeight={stageH}>
		<div class="plot" style:--ratio={W / shown.vh} bind:clientWidth={plotW} bind:clientHeight={plotH}>
			<!-- A custom control: it takes the arrow keys and drags, which no interactive ARIA role
			     describes. `application` hands the keys through to it. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
			<svg
				bind:this={svg}
				class:flat={!is3d}
				viewBox="0 0 {W} {shown.vh}"
				role="application"
				aria-roledescription="scatter plot"
				aria-label={line !== null
					? `Strip plot of ${points.length} points along ${axes[line]}.`
					: flat
						? `Scatter plot of ${points.length} points, ${axes[flat[0]]} across and ${axes[flat[1]]} up.`
						: `3D scatter plot of ${points.length} points. Drag or use the arrow keys to rotate; Home resets the view.`}
				tabindex="0"
				onpointerdown={down}
				onpointermove={move}
				onpointerup={up}
				onpointercancel={cancel}
				onpointerleave={() => (hovered = null)}
				oncontextmenu={(e) => full && e.preventDefault()}
				onkeydown={key}
			>
				<g class="box">
					{#each shown.edges as e, n (n)}
						<line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
					{/each}
				</g>
				<g class="axes">
					{#each shown.ends as end, k (k)}
						{#if end.a > 0.01}
							<g style:opacity={end.a}>
								<line x1={shown.origin.x} y1={shown.origin.y} x2={end.x} y2={end.y} />
								<text x={end.x} y={end.y}>{axes[k]}</text>
							</g>
						{/if}
					{/each}
				</g>

				{#each drawn as d (d.i)}
					{@const at = shown.pts[d.i]}
					<circle
						class="pt"
						class:active={d.i === active}
						data-point={d.i}
						cx={at.x}
						cy={at.y}
						r={at.r}
						style:fill={colourOf(d.cluster)}
						style:opacity={at.o}
					/>
				{/each}
			</svg>

			{#if full}
				<div class="zoom" role="group" aria-label="Zoom">
					<button
						type="button"
						aria-label="Zoom out"
						disabled={zoom <= 1}
						onclick={() => animate(() => zoomAt(1 / 1.5), STEP)}><Icon name="minus" /></button
					>
					<button
						type="button"
						class="level"
						title="Reset zoom"
						aria-label="Zoom {Math.round(zoom * 100)} percent, reset"
						onclick={() => animate(resetZoom, STEP)}>{Math.round(zoom * 100)}%</button
					>
					<button
						type="button"
						aria-label="Zoom in"
						disabled={zoom >= ZOOM_MAX}
						onclick={() => animate(() => zoomAt(1.5), STEP)}><Icon name="plus" /></button
					>
				</div>
			{/if}

			{#if activePoint}
				<div
					class="tip"
					style:left="{tip.left}px"
					style:top="{tip.top}px"
					bind:offsetWidth={tipW}
					bind:offsetHeight={tipH}
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
	</div>

	<figcaption>
		Drag to rotate, or focus the plot and use the arrow keys. Switch a dimension off to see the
		other two flat, without perspective, or two off to see the last one alone. Hover a point
		for its values, click to pin them. In fullscreen, scroll or pinch to zoom. Drag a flat view
		to pan it; in 3D, pan with shift-drag or two fingers.
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
	.tools {
		display: flex;
		gap: var(--s-2);
		align-items: stretch;
	}
	.full {
		display: grid;
		place-items: center;
		width: 2rem;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 7px;
		background: var(--surface-active);
		color: var(--text-muted);
		cursor: pointer;
		transition:
			color var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.full:hover {
			background: var(--surface-hover);
			border-color: var(--line-strong);
			color: var(--text);
		}
	}
	.seg button:focus-visible,
	.full:focus-visible,
	svg:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.plot {
		position: relative;
	}

	/* — Fullscreen, or the overlay standing in for it. The stage takes whatever height the
	     header and caption leave, and the plot is the largest box of the svg's own aspect
	     that fits in it, so the tooltip's percentages still land on the points. — */
	.scatter3d.max {
		position: fixed;
		inset: 0;
		z-index: 200;
		width: 100%;
		height: 100%;
		max-width: none;
		margin: 0;
		box-sizing: border-box;
		border: 0;
		border-radius: 0;
		display: flex;
		flex-direction: column;
	}
	.max .stage {
		flex: 1;
		min-height: 0;
		container-type: size;
		display: grid;
		place-items: center;
	}
	.max .plot {
		width: min(100cqw, calc(100cqh * var(--ratio)));
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
	.max svg {
		touch-action: none;
	}
	.max svg.flat {
		cursor: grab;
	}
	.max svg.flat:active {
		cursor: grabbing;
	}

	/* Over the plot's bottom-right corner, in fullscreen only. */
	.zoom {
		position: absolute;
		right: var(--s-3);
		bottom: var(--s-3);
		display: inline-grid;
		grid-auto-flow: column;
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
		border-radius: 7px;
		overflow: hidden;
	}
	.zoom button {
		display: grid;
		place-items: center;
		min-width: 2rem;
		height: 2rem;
		padding: 0 var(--s-2);
		border: 0;
		background: var(--surface-active);
		color: var(--text-secondary);
		font: inherit;
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
	}
	.zoom .level {
		min-width: 3.5rem;
	}
	.zoom button:disabled {
		color: var(--text-muted);
		cursor: default;
		opacity: 0.5;
	}
	@media (hover: hover) and (pointer: fine) {
		.zoom button:not(:disabled):hover {
			background: var(--surface-hover);
			color: var(--text);
		}
	}
	.zoom button:focus-visible {
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
