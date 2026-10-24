/** A damped spring, x'' = k(t − x) − c·x', for motion that settles instead of stopping dead. */
export type Spring = { x: number; v: number; t: number; k: number; c: number };

export const spring = (x = 0, k = 120, c = 18): Spring => ({ x, v: 0, t: x, k, c });

/** Advance by dt seconds (in two half steps, for stability); returns whether it still moves. */
export function step(s: Spring, dt: number): boolean {
	for (let i = 0; i < 2; i++) {
		s.v += (s.k * (s.t - s.x) - s.c * s.v) * (dt / 2);
		s.x += s.v * (dt / 2);
	}
	const moving = Math.abs(s.v) > 0.001 || Math.abs(s.t - s.x) > 0.001;
	if (!moving) {
		s.x = s.t;
		s.v = 0;
	}
	return moving;
}

/** Runs `tick(dt)` every frame while it returns true; `wake()` starts it again. */
export function loop(tick: (dt: number) => boolean) {
	let raf = 0;
	let last = 0;
	const frame = (now: number) => {
		const dt = Math.min((now - last) / 1000, 1 / 30);
		last = now;
		raf = tick(dt) ? requestAnimationFrame(frame) : 0;
	};
	return {
		wake() {
			if (raf) return;
			last = performance.now();
			raf = requestAnimationFrame(frame);
		},
		stop() {
			cancelAnimationFrame(raf);
			raf = 0;
		}
	};
}

export const reducedMotion = () =>
	typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
