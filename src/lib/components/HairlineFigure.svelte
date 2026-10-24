<script lang="ts">
	import { block, camera, cylinder, laptop, poly, ring, open, type Mark, type Pt } from '$lib/iso';
	import { spring, step, loop, reducedMotion } from '$lib/spring';

	/**
	 * One of the small line drawings that appear beside the hero words. Each has a single
	 * moving part driven by the pointer while its word is active:
	 *
	 * - book (Student): a page lifts off the right-hand stack and follows the pointer across.
	 * - laptop (Builder): the lid opens, and the pointer's height works the hinge.
	 * - compass (Explorer): the needle swings toward the pointer.
	 *
	 * `input` is the pointer over the hero words, normalised to -1…1 on each axis.
	 */
	let {
		kind,
		active,
		input
	}: { kind: 'book' | 'laptop' | 'compass'; active: boolean; input: { x: number; y: number } } = $props();

	const reveal = spring(0, 90, 16);
	const drive = spring(0, 110, 15);

	let marks = $state<Mark[]>([]);

	function draw(r: number, v: number): Mark[] {
		if (kind === 'laptop') {
			const cam = camera(45, 2.05, 200, 205);
			return laptop(cam, 0, 0, 92, 62, Math.max(4, Math.min(118, 18 + 86 * r + v * 20)));
		}
		if (kind === 'book') {
			const cam = camera(45, 2.1, 200, 175);
			const out: Mark[] = [...block(cam, -27, 0, 54, 74, 0, 5), ...block(cam, 27, 0, 54, 74, 0, 5)];
			// Ruled lines on both open pages.
			let lines = '';
			for (let i = 0; i < 7; i++) {
				const y = -26 + i * 8;
				lines += open([cam.P(-48, y, 5), cam.P(-8, y, 5)]) + open([cam.P(8, y, 5), cam.P(48, y, 5)]);
			}
			out.push({ d: lines, cls: 'lo' });
			const phi = (Math.max(6, Math.min(174, 6 + r * (84 - v * 70))) * Math.PI) / 180;
			const pg = (t: number, y: number): Pt => cam.P(t * Math.cos(phi), y, 5 + t * Math.sin(phi));
			out.push({ d: poly([pg(0, -36), pg(52, -36), pg(52, 36), pg(0, 36)]), cls: 'plate' });
			return out;
		}
		const cam = camera(45, 2.6, 200, 175);
		const out: Mark[] = [...cylinder(cam, 0, 0, 46, 0, 12)];
		out.push({ d: poly(ring(0, 0, 39, 12).map(([x, y, z]) => cam.P(x, y, z))), cls: 'crease' });
		let ticks = '';
		for (let i = 0; i < 12; i++) {
			const t = (i * Math.PI) / 6;
			const r0 = i % 3 === 0 ? 29 : 33;
			ticks += open([cam.P(Math.cos(t) * r0, Math.sin(t) * r0, 12), cam.P(Math.cos(t) * 36, Math.sin(t) * 36, 12)]);
		}
		out.push({ d: ticks, cls: 'lo' });
		const a = ((-24 + 40 * r + v * 50) * Math.PI) / 180;
		const at = (x: number, y: number): Pt =>
			cam.P(x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), 12.5);
		out.push({ d: poly([at(0, -30), at(6, 0), at(0, 26), at(-6, 0)]), cls: 'plate' });
		out.push({ d: open([at(0, -27), at(0, 23)]), cls: 'crease' });
		out.push(...cylinder(cam, 0, 0, 3, 12.5, 15));
		return out;
	}

	marks = draw(0, 0);

	const motion = loop((dt) => {
		const a = step(reveal, dt);
		const b = step(drive, dt);
		marks = draw(reveal.x, drive.x);
		return a || b;
	});

	$effect(() => {
		reveal.t = active ? 1 : 0;
		if (!active) drive.t = 0;
		if (reducedMotion()) {
			reveal.x = reveal.t;
			drive.x = drive.t;
			marks = draw(reveal.x, drive.x);
			return;
		}
		motion.wake();
	});

	$effect(() => {
		if (!active) return;
		drive.t = kind === 'laptop' ? -input.y : input.x;
		if (reducedMotion()) return;
		motion.wake();
	});

	$effect(() => () => motion.stop());
</script>

<svg class="figure" viewBox="0 0 400 320" aria-hidden="true" focusable="false">
	{#each marks as m, i (i)}
		<path class={m.cls} d={m.d} />
	{/each}
</svg>

<style>
	.figure {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
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
</style>
