<script lang="ts">
	import { goto, afterNavigate } from '$app/navigation';

	/**
	 * Clicking an internal link flicks a brush stroke of ink under the
	 * words you clicked, then the page follows. The stroke is one fragment shader over a
	 * full-screen canvas: a quadratic Bézier with a pressed-then-lifting width, ragged
	 * edges, bristle streaks that run dry toward the tip, and a few droplets flung off the
	 * end. The layout's view transition (see +layout.svelte) fades the old page, ink and
	 * all, into the new one.
	 *
	 * Only runs with motion allowed and WebGL available; otherwise links behave exactly
	 * as before.
	 */

	const DURATION = 320;
	const DROPS = 6;

	const FRAG = `
		precision highp float;
		uniform vec2 uA, uC, uB;          // the stroke: start, bend, end (css px, y up)
		uniform float uT, uDpr, uW, uLen, uSeed;
		uniform vec3 uInk;
		uniform vec4 uDrop[${DROPS}];     // droplet: leaves at xy, lands at zw
		uniform vec3 uDropP[${DROPS}];    // radius, launch time, flight time

		float h21(vec2 p) {
			p = fract(p * vec2(233.34, 851.73) + uSeed * 31.7);
			p += dot(p, p + 23.45);
			return fract(p.x * p.y);
		}
		float vnoise(vec2 p) {
			vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
			return mix(mix(h21(i), h21(i + vec2(1., 0.)), u.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1.)), u.x), u.y);
		}
		float fbm(vec2 p) {
			float a = .5, s = 0.;
			for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= .5; }
			return s;
		}
		vec2 bez(float t) { float o = 1. - t; return o * o * uA + 2. * o * t * uC + t * t * uB; }
		vec2 bezD(float t) { return 2. * (1. - t) * (uC - uA) + 2. * t * (uB - uC); }

		void main() {
			vec2 p = gl_FragCoord.xy / uDpr;

			// Nearest point on the curve: a coarse scan, then Newton steps.
			float bt = 0., bd = 1e9;
			for (int i = 0; i <= 24; i++) {
				float t = float(i) / 24.;
				float d = distance(p, bez(t));
				if (d < bd) { bd = d; bt = t; }
			}
			vec2 dd = 2. * (uB - 2. * uC + uA);
			for (int i = 0; i < 3; i++) {
				vec2 q = bez(bt) - p, d1 = bezD(bt);
				bt = clamp(bt - dot(q, d1) / (dot(d1, d1) + dot(q, dd)), 0., 1.);
			}
			vec2 P = bez(bt), T = normalize(bezD(bt)), N = vec2(-T.y, T.x);
			float along = bt * uLen;
			float across = dot(p - P, N) + (vnoise(vec2(along / 46., 3. + uSeed * 9.)) - .5) * uW * .3;
			float head = clamp(uT / .7, 0., 1.);

			// Width: the brush lands, presses and swells, then lifts away toward the tip.
			float w = uW * (.68 + .32 * smoothstep(0., .12, bt)) * (1. - .72 * smoothstep(.5, 1., bt));
			w *= .88 + .3 * fbm(vec2(along / 70., uSeed * 7.));
			float dist = (bt < .002 || bt > .998) ? bd : abs(across);
			float edge = w + (fbm(p * .32) - .5) * uW * .55;
			float body = smoothstep(edge + .9, edge - .9, dist);
			body *= smoothstep(head + .02, head - .01, bt);

			// Bristles: streaks along the stroke, the brush running dry toward its end and edges.
			float bristle = vnoise(vec2(along / 80., across / (uW * .12) + uSeed * 11.)) * .7
			              + vnoise(vec2(along / 24., across / (uW * .05))) * .3;
			float dry = smoothstep(.45, 1., bt) * .62 + smoothstep(.55, 1., dist / max(w, 1.)) * .38;
			float ink = body * smoothstep(dry - .06, dry + .08, bristle);
			ink *= .84 + .16 * fbm(p * .07 + 5.);

			// Droplets flung off the tip, each a streak that slows as it lands.
			for (int i = 0; i < ${DROPS}; i++) {
				vec4 d = uDrop[i];
				vec3 m = uDropP[i];
				float u = clamp((uT - m.y) / m.z, 0., 1.);
				if (u <= 0.) continue;
				float e = 1. - (1. - u) * (1. - u);
				vec2 c = mix(d.xy, d.zw, e);
				vec2 c0 = mix(d.xy, d.zw, max(e - .3 * (1. - u) - .04, 0.));
				vec2 pa = p - c0, ba = c - c0;
				float hh = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-3), 0., 1.);
				float sd = length(pa - ba * hh) - m.x * mix(.35, 1., hh);
				ink = max(ink, smoothstep(.8, -.8, sd));
			}

			gl_FragColor = vec4(uInk * ink, ink);
		}`;

	let canvas: HTMLCanvasElement;
	let busy = false;

	type GL = {
		gl: WebGLRenderingContext;
		u: (name: string) => WebGLUniformLocation | null;
	};
	let ctx: GL | null | undefined;

	function setup(): GL | null {
		const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false });
		if (!gl) return null;
		const prog = gl.createProgram()!;
		const shaders: [number, string][] = [
			[gl.VERTEX_SHADER, 'attribute vec2 a; void main() { gl_Position = vec4(a, 0., 1.); }'],
			[gl.FRAGMENT_SHADER, FRAG]
		];
		for (const [type, src] of shaders) {
			const s = gl.createShader(type)!;
			gl.shaderSource(s, src);
			gl.compileShader(s);
			gl.attachShader(prog, s);
		}
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
		gl.useProgram(prog);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		// One triangle that covers the viewport.
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		return { gl, u: (name) => gl.getUniformLocation(prog, name) };
	}

	function inkColour(): [number, number, number] {
		const raw = getComputedStyle(document.documentElement).getPropertyValue('--ink-rgb');
		const [r, g, b] = raw.split(',').map((n) => parseFloat(n) / 255);
		return [r || 0.21, g || 0.2, b || 0.16];
	}

	/** Paint a stroke under `rect` (a line box of the clicked text); resolves when it is done. */
	function flick(rect: DOMRect): Promise<boolean> {
		if (ctx === undefined) ctx = setup();
		if (!ctx) return Promise.resolve(false);
		const { gl, u } = ctx;

		const dpr = Math.min(devicePixelRatio || 1, 1.5);
		const W = innerWidth;
		const H = innerHeight;
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		gl.viewport(0, 0, canvas.width, canvas.height);
		canvas.dataset.state = 'drawing';

		const rnd = (a: number, b: number) => a + Math.random() * (b - a);
		const half = Math.min(Math.max(rect.height * 0.3, 4.5), 13);
		const y = H - (rect.top + rect.height * 0.58);
		const x0 = rect.left - half * 0.4;
		const x1 = rect.right + half * 0.8;
		const len = Math.max(x1 - x0, 24);
		const fall = rnd(0.25, 0.65) * half * 2;
		const A = [x0, y + rnd(-0.2, 0.3) * half];
		const B = [x0 + len, y - fall * 0.5];
		const C = [x0 + len * 0.55, y + fall * 0.35];

		const pt = (t: number) => [
			(1 - t) ** 2 * A[0] + 2 * (1 - t) * t * C[0] + t * t * B[0],
			(1 - t) ** 2 * A[1] + 2 * (1 - t) * t * C[1] + t * t * B[1]
		];
		const drops: number[] = [];
		const props: number[] = [];
		for (let i = 0; i < DROPS; i++) {
			const t = rnd(0.86, 1);
			const [px, py] = pt(t);
			const tx = 2 * (1 - t) * (C[0] - A[0]) + 2 * t * (B[0] - C[0]);
			const ty = 2 * (1 - t) * (C[1] - A[1]) + 2 * t * (B[1] - C[1]);
			const ang = Math.atan2(ty, tx) + rnd(-0.22, 0.22);
			const reach = half * rnd(0.8, 5.5);
			drops.push(px, py, px + Math.cos(ang) * reach, py + Math.sin(ang) * reach);
			props.push(Math.max(half * rnd(0.05, 0.2), 0.8), t * 0.7, rnd(0.18, 0.3));
		}

		gl.uniform1f(u('uDpr'), dpr);
		gl.uniform2f(u('uA'), A[0], A[1]);
		gl.uniform2f(u('uB'), B[0], B[1]);
		gl.uniform2f(u('uC'), C[0], C[1]);
		gl.uniform1f(u('uW'), half);
		gl.uniform1f(u('uLen'), len);
		gl.uniform1f(u('uSeed'), Math.random());
		gl.uniform3f(u('uInk'), ...inkColour());
		gl.uniform4fv(u('uDrop'), drops);
		gl.uniform3fv(u('uDropP'), props);

		return new Promise((resolve) => {
			const start = performance.now();
			const tick = (now: number) => {
				const t = Math.min((now - start) / DURATION, 1);
				gl.uniform1f(u('uT'), t);
				gl.drawArrays(gl.TRIANGLES, 0, 3);
				if (t < 1) requestAnimationFrame(tick);
				else resolve(true);
			};
			requestAnimationFrame(tick);
		});
	}

	function eligible(a: HTMLAnchorElement | null, e: MouseEvent): a is HTMLAnchorElement {
		if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
		if (a.target || a.hasAttribute('download') || a.hasAttribute('data-sveltekit-reload')) return false;
		const url = new URL(a.href, location.href);
		if (url.origin !== location.origin) return false;
		// Same page, different anchor: that is a scroll, not a page change.
		if (url.pathname === location.pathname && url.hash) return false;
		// Files (the CV, the feeds) are not pages.
		if (/\.[a-z0-9]+$/i.test(url.pathname)) return false;
		return true;
	}

	/** The line box of the link nearest the click (links can wrap over several lines). */
	function lineUnder(a: HTMLAnchorElement, e: MouseEvent): DOMRect | null {
		const range = document.createRange();
		range.selectNodeContents(a);
		const rects = [...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
		if (!rects.length) return null;
		if (!e.detail) return rects.sort((p, q) => q.width - p.width)[0]; // keyboard: the widest line
		const gap = (r: DOMRect) =>
			Math.max(r.top - e.clientY, e.clientY - r.bottom, 0) + Math.max(r.left - e.clientX, e.clientX - r.right, 0);
		return rects.sort((p, q) => gap(p) - gap(q))[0];
	}

	$effect(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		// Capture phase, so this runs before SvelteKit's own link handler, which then sees
		// `defaultPrevented` and stands aside; the navigation is replayed with goto().
		const onClick = (e: MouseEvent) => {
			const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
			if (!eligible(a, e)) return;
			if (busy) {
				e.preventDefault();
				return;
			}
			const rect = lineUnder(a, e);
			if (!rect || document.visibilityState !== 'visible') return;
			e.preventDefault();
			busy = true;
			const href = a.href;
			flick(rect).then(() => {
				goto(href).finally(() => (busy = false));
			});
		};

		window.addEventListener('click', onClick, true);
		return () => window.removeEventListener('click', onClick, true);
	});

	// The new page arrives clean; the view transition has already carried the ink out with
	// the old snapshot.
	afterNavigate(() => {
		if (canvas) canvas.dataset.state = 'idle';
	});
</script>

<canvas bind:this={canvas} class="ink-splash" data-state="idle" aria-hidden="true"></canvas>

<style>
	.ink-splash {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 60;
		pointer-events: none;
		transition: opacity 260ms ease;
	}

	.ink-splash[data-state='idle'] {
		opacity: 0;
		visibility: hidden;
	}
</style>
