<script lang="ts">
	import { block, camera, open, poly, ring, type Mark } from '$lib/iso';
	import { spring, step, loop, reducedMotion } from '$lib/spring';

	/**
	 * The Quick Equipment Log figure: a ward handset lying on its back, in hairline isometric.
	 * Point at it and it "listens": a row of voice bars rises off the screen and moves like
	 * speech, and the phone turns a little toward the pointer. At rest the bars lie flat.
	 */
	const W = 400;
	const H = 300;

	const speak = spring(0, 70, 12);
	const turn = spring(45, 60, 13);
	let t = 0;
	let marks = $state<Mark[]>(draw(45, 0, 0));
	let svgEl: SVGSVGElement;

	function draw(az: number, s: number, time: number): Mark[] {
		const cam = camera(az, 3.1, W / 2, 168);
		const out: Mark[] = [...block(cam, 0, 0, 48, 96, 0, 5)];
		const z = 5;
		out.push({
			d: poly([cam.P(-20, -40, z), cam.P(20, -40, z), cam.P(20, 40, z), cam.P(-20, 40, z)]),
			cls: 'crease'
		});
		// The hold-to-speak button.
		out.push({ d: poly(ring(0, -14, 7, z, 32).map(([x, y, zz]) => cam.P(x, y, zz))), cls: 'plate' });
		// Form fields below it.
		let fields = '';
		for (let i = 0; i < 4; i++) {
			const y = 2 + i * 8;
			fields += poly([cam.P(-15, y, z), cam.P(15, y, z), cam.P(15, y + 5, z), cam.P(-15, y + 5, z)]);
		}
		out.push({ d: fields, cls: 'lo' });
		// Voice bars standing on the button.
		let bars = '';
		for (let i = 0; i < 9; i++) {
			const x = -16 + i * 4;
			const env = Math.sin(((i + 0.5) / 9) * Math.PI);
			const h = 1.5 + s * env * (10 + 9 * Math.sin(time * 9 + i * 1.7) * Math.sin(time * 3.1 + i));
			bars += open([cam.P(x, -14, z + 7), cam.P(x, -14, z + 7 + Math.max(1.5, h))]);
		}
		out.push({ d: bars, cls: 'accent' });
		return out;
	}

	$effect(() => {
		if (reducedMotion()) return;
		let hovering = false;
		const motion = loop((dt) => {
			t += dt;
			const a = step(speak, dt);
			const b = step(turn, dt);
			marks = draw(turn.x, speak.x, t);
			return a || b || hovering;
		});
		const enter = () => {
			hovering = true;
			speak.t = 1;
			motion.wake();
		};
		const move = (e: PointerEvent) => {
			const r = svgEl.getBoundingClientRect();
			turn.t = 45 + (((e.clientX - r.left) / r.width) * 2 - 1) * 16;
			motion.wake();
		};
		const leave = () => {
			hovering = false;
			speak.t = 0;
			turn.t = 45;
			motion.wake();
		};
		const host = svgEl.closest('article') ?? svgEl;
		host.addEventListener('pointerenter', enter);
		host.addEventListener('pointermove', move as EventListener);
		host.addEventListener('pointerleave', leave);
		return () => {
			host.removeEventListener('pointerenter', enter);
			host.removeEventListener('pointermove', move as EventListener);
			host.removeEventListener('pointerleave', leave);
			motion.stop();
		};
	});
</script>

<svg bind:this={svgEl} class="handset" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">
	{#each marks as m, i (i)}
		<path class={m.cls} d={m.d} />
	{/each}
</svg>

<style>
	.handset {
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
		fill: var(--surface);
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

	.accent {
		stroke: var(--accent);
		stroke-width: 2;
	}
</style>
