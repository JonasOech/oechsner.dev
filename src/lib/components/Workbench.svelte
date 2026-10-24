<script lang="ts">
	import { block, camera, cylinder, laptop, open, poly, ring, type Mark, type Pt } from '$lib/iso';
	import { spring, step, loop, reducedMotion } from '$lib/spring';

	/**
	 * The hero drawing: a desk in hairline isometric — laptop, mug, a stack of books — with
	 * a little bigram graph floating over it, the one from the n-gram post ("the gradient of
	 * the loss…"). Moving the pointer anywhere on the page swings the camera around the desk
	 * and works the laptop's hinge; hovering a word in the graph lights up the words that
	 * can follow it. The loop sleeps when nothing moves; reduced motion gets the still view.
	 */

	const W = 520;
	const H = 470;

	const words = [
		{ w: 'the', p: [-46, -40, 120] },
		{ w: 'gradient', p: [-92, -2, 100] },
		{ w: 'of', p: [-34, 8, 88] },
		{ w: 'loss', p: [14, -34, 132] },
		{ w: 'function', p: [40, 6, 108] },
		{ w: 'is', p: [-6, 34, 96] }
	] as const;
	// Bigram transitions: from → to.
	const edges: [number, number][] = [
		[0, 1],
		[0, 3],
		[1, 2],
		[2, 0],
		[3, 2],
		[3, 4],
		[4, 5],
		[5, 0]
	];

	const az = spring(45, 60, 14);
	const lid = spring(104, 80, 13);
	let hot = $state(-1);

	type Scene = { marks: Mark[]; nodes: { x: number; y: number; w: string }[]; links: { d: string; on: boolean }[] };
	let scene = $state<Scene>(draw(45, 104, -1));
	let svgEl: SVGSVGElement;

	function draw(a: number, l: number, h: number): Scene {
		const cam = camera(a, 2.05, W / 2, 300);
		const marks: Mark[] = [];
		// The desk: a slab the rest stands on.
		marks.push(...block(cam, 0, 0, 170, 120, -12, 0));

		// The graph's drop lines go down to the desk before anything stands on it, so the
		// objects cover them.
		let drops = '';
		for (const n of words) drops += open([cam.P(n.p[0], n.p[1], 0), cam.P(n.p[0], n.p[1], n.p[2] - 4)]);
		marks.push({ d: drops, cls: 'drop' });
		for (const n of words) marks.push({ d: poly(ring(n.p[0], n.p[1], 2.4, 0, 16).map(([x, y, z]) => cam.P(x, y, z))), cls: 'lo' });

		// Objects on the desk, painted far to near.
		const things: { depth: number; marks: Mark[] }[] = [];
		things.push({ depth: cam.depth(-24, -6), marks: laptop(cam, -24, -6, 62, 42, l) });

		const mug: Mark[] = [];
		const mx = 52;
		const my = -30;
		let handle: Pt[] = [];
		for (let i = 0; i <= 16; i++) {
			const t = -Math.PI / 2 + (i / 16) * Math.PI;
			handle.push(cam.P(mx + 9 + Math.cos(t) * 6, my, 9 + Math.sin(t) * 5));
		}
		mug.push(...cylinder(cam, mx, my, 9, 0, 18));
		mug.push({ d: poly(ring(mx, my, 7.4, 18).map(([x, y, z]) => cam.P(x, y, z))), cls: 'crease' });
		mug.push({ d: open(handle), cls: 'plate' });
		const steam = (dx: number) => {
			const pts: Pt[] = [];
			for (let i = 0; i <= 12; i++) pts.push(cam.P(mx + dx + Math.sin(i * 0.9) * 2.2, my, 22 + i * 2.2));
			return open(pts);
		};
		mug.push({ d: steam(-3) + steam(3), cls: 'accent' });
		things.push({ depth: cam.depth(mx, my), marks: mug });

		const books: Mark[] = [
			...block(cam, 50, 28, 44, 30, 0, 6, -6),
			...block(cam, 48, 27, 40, 28, 6, 11, 5),
			...block(cam, 51, 29, 36, 26, 11, 15, -2)
		];
		things.push({ depth: cam.depth(50, 28), marks: books });

		things.sort((p, q) => p.depth - q.depth);
		for (const t of things) marks.push(...t.marks);

		// The floating graph, over everything.
		const proj = words.map((n) => cam.P(n.p[0], n.p[1], n.p[2]));
		const links = edges.map(([s, e]) => ({ d: open([proj[s], proj[e]]), on: s === h }));
		const nodes = proj.map(([x, y], i) => ({ x, y, w: words[i].w }));
		return { marks, nodes, links };
	}

	$effect(() => {
		if (reducedMotion()) return;
		const motion = loop((dt) => {
			const a = step(az, dt);
			const b = step(lid, dt);
			scene = draw(az.x, lid.x, hot);
			return a || b;
		});

		const onMove = (e: PointerEvent) => {
			const nx = Math.max(-1, Math.min(1, (e.clientX / innerWidth) * 2 - 1));
			const ny = Math.max(-1, Math.min(1, (e.clientY / innerHeight) * 2 - 1));
			az.t = 45 + nx * 22;
			lid.t = 104 - ny * 22;
			motion.wake();
		};
		window.addEventListener('pointermove', onMove, { passive: true });
		return () => {
			window.removeEventListener('pointermove', onMove);
			motion.stop();
		};
	});

	function onSvgMove(e: PointerEvent) {
		const r = svgEl.getBoundingClientRect();
		const x = ((e.clientX - r.left) / r.width) * W;
		const y = ((e.clientY - r.top) / r.height) * H;
		let best = -1;
		let bd = 22;
		scene.nodes.forEach((n, i) => {
			const d = Math.hypot(n.x - x, n.y - y);
			if (d < bd) {
				bd = d;
				best = i;
			}
		});
		if (best !== hot) {
			hot = best;
			scene = draw(az.x, lid.x, hot);
		}
	}

	function onSvgLeave() {
		if (hot === -1) return;
		hot = -1;
		scene = draw(az.x, lid.x, hot);
	}

	const next = $derived(hot === -1 ? [] : edges.filter(([s]) => s === hot).map(([, e]) => e));
</script>

<svg
	bind:this={svgEl}
	class="bench"
	viewBox="0 0 {W} {H}"
	role="img"
	aria-label="A line drawing of a desk with a laptop, a mug and books, under a small graph of words"
	onpointermove={onSvgMove}
	onpointerleave={onSvgLeave}
>
	{#each scene.marks as m, i (i)}
		<path class={m.cls} d={m.d} />
	{/each}
	{#each scene.links as l, i (i)}
		<path class="link" class:on={l.on} d={l.d} />
	{/each}
	{#each scene.nodes as n, i (n.w)}
		<g class="node" class:on={i === hot} class:next={next.includes(i)}>
			<circle cx={n.x} cy={n.y} r="4.5" />
			<text x={n.x + 8} y={n.y - 7}>{n.w}</text>
		</g>
	{/each}
</svg>

<style>
	.bench {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
		touch-action: pan-y;
	}

	path {
		vector-effect: non-scaling-stroke;
		stroke-linejoin: round;
		stroke-linecap: round;
		fill: none;
	}

	.plate {
		fill: var(--bg);
		stroke: var(--text);
		stroke-width: 1.25;
	}

	.crease {
		stroke: var(--text-muted);
		stroke-width: 1;
	}

	.lo {
		stroke: var(--line-strong);
		stroke-width: 1;
	}

	.drop {
		stroke: var(--line-strong);
		stroke-width: 1;
		stroke-dasharray: 2 4;
	}

	.accent {
		stroke: var(--accent);
		stroke-width: 1;
		stroke-dasharray: 3 5;
		animation: steam 2.4s linear infinite;
	}

	@keyframes steam {
		to {
			stroke-dashoffset: -16;
		}
	}

	.link {
		stroke: var(--text-muted);
		stroke-width: 1;
		transition: stroke 0.2s;
	}

	.link.on {
		stroke: var(--accent);
		stroke-width: 1.5;
	}

	.node circle {
		fill: var(--bg);
		stroke: var(--text);
		stroke-width: 1.25;
		vector-effect: non-scaling-stroke;
		transition: fill 0.2s;
	}

	.node text {
		font-family: var(--font-mono);
		font-size: 11px;
		fill: var(--text-muted);
		transition: fill 0.2s;
	}

	.node.on circle {
		fill: var(--accent);
		stroke: var(--accent);
	}

	.node.on text,
	.node.next text {
		fill: var(--accent);
	}

	.node.next circle {
		stroke: var(--accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.accent {
			animation: none;
		}
	}
</style>
