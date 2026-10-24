<script lang="ts">

	/**
	 * An ink-wash owl on a bamboo branch, hand-drawn as SVG.
	 *
	 * - Its head turns and its eyes follow the pointer anywhere on the page.
	 * - Running the pointer across its chest ruffles the feathers under it; across the
	 *   bamboo, the leaves swing. Every moving part is a damped spring, so motion settles.
	 * - Clicking it rouses the whole bird: it puffs up, shakes out, tilts its head, blinks.
	 *
	 * At rest nothing animates and the rAF loop sleeps, which matters here: the ink
	 * filters (displacement + turbulence) are re-rasterised on every frame something
	 * moves. Reduced motion gets the static drawing only.
	 */

	const uid = $props.id();
	const f = (name: string) => `${name}-${uid}`;

	// — Geometry (viewBox units). The head centre and the perch are what the motion is built around.
	const HEAD_C = { x: 175, y: 108 };
	const PERCH = { x: 175, y: 232 };
	const EYES = [
		{ x: 156, y: 110 },
		{ x: 194, y: 110 }
	];

	const HEAD =
		'M128 62 C138 69 146 72 152 75 C164 70 186 70 198 75 C204 72 212 69 222 62 C221 76 217 84 214 89 C227 104 226 128 210 140 C196 151 154 151 140 140 C124 128 123 104 136 89 C133 84 129 76 128 62Z';
	const BODY =
		'M175 110 C214 112 229 150 227 184 C225 214 205 237 175 239 C145 237 125 214 123 184 C121 150 136 112 175 110Z';

	type Leaf = { x: number; y: number; a: number; len: number; w: number; o: number };
	const leaves: Leaf[] = [
		{ x: 292, y: 142, a: -52, len: 62, w: 13, o: 0.85 },
		{ x: 292, y: 142, a: -8, len: 58, w: 12, o: 0.7 },
		{ x: 292, y: 142, a: 38, len: 52, w: 11, o: 0.85 },
		{ x: 292, y: 142, a: 78, len: 44, w: 10, o: 0.6 },
		{ x: 276, y: 168, a: 112, len: 58, w: 12, o: 0.85 },
		{ x: 276, y: 168, a: 146, len: 50, w: 11, o: 0.65 },
		{ x: 276, y: 168, a: 178, len: 40, w: 9, o: 0.5 },
		{ x: 62, y: 271, a: 150, len: 44, w: 10, o: 0.85 },
		{ x: 62, y: 271, a: 192, len: 38, w: 9, o: 0.6 },
		{ x: 62, y: 271, a: 226, len: 30, w: 8, o: 0.45 }
	];
	const leafPath = (l: Leaf) =>
		`M0 0 C${l.len * 0.18} ${-l.w * 0.9} ${l.len * 0.55} ${-l.w} ${l.len} ${-l.w * 0.08} ` +
		`C${l.len * 0.6} ${l.w * 0.45} ${l.len * 0.22} ${l.w * 0.55} 0 0Z`;

	const feathers = [
		[162, 158], [178, 154], [194, 160], [154, 176], [170, 174], [186, 175],
		[200, 180], [162, 194], [178, 193], [194, 196], [170, 212], [186, 212]
	] as const;

	// — Element refs, written to directly from the loop (no reactive state per frame).
	let svgEl: SVGSVGElement;
	let headEl: SVGGElement;
	let faceEl: SVGGElement;
	let bodyEl: SVGGElement;

	/** A damped spring: x'' = k(target − x) − c·x'. */
	type Spring = { x: number; v: number; t: number; k: number; c: number };
	const spring = (k: number, c: number, x = 0): Spring => ({ x, v: 0, t: x, k, c });
	const step = (s: Spring, dt: number) => {
		s.v += (s.k * (s.t - s.x) - s.c * s.v) * dt;
		s.x += s.v * dt;
	};
	const restless = (s: Spring) => Math.abs(s.v) > 0.002 || Math.abs(s.t - s.x) > 0.002;

	$effect(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		// The repeated parts, in document order (which is also their order in the arrays above).
		const pick = <T extends Element>(sel: string) => [...svgEl.querySelectorAll<T>(sel)];
		const pupilEls = pick<SVGGElement>('[data-pupil]');
		const lidEls = pick<SVGEllipseElement>('[data-lid]');
		const featherEls = pick<SVGGElement>('[data-feather]');
		const leafEls = pick<SVGGElement>('[data-leaf]');

		const yaw = spring(90, 13);
		const pitch = spring(90, 13);
		const tilt = spring(70, 9);
		const puff = spring(160, 9, 1);
		const lean = spring(60, 12);
		const blink = spring(900, 45);
		const pupils = EYES.map(() => ({ x: spring(380, 30), y: spring(380, 30) }));
		const fSprings = feathers.map(() => ({ r: spring(220, 9), y: spring(220, 11) }));
		const lSprings = leaves.map(() => spring(55, 3.2));

		let pointer = { x: HEAD_C.x + 60, y: HEAD_C.y + 40, vx: 0, vy: 0, seen: 0 };
		let raf = 0;
		let last = 0;
		let visible = true;
		let blinkTimer: ReturnType<typeof setTimeout>;
		let wanderTimer: ReturnType<typeof setTimeout>;

		const toSvg = (cx: number, cy: number) => {
			const r = svgEl.getBoundingClientRect();
			const s = 320 / r.width;
			return { x: (cx - r.left) * s, y: (cy - r.top) * s };
		};

		/** Where the owl looks: a soft saturating curve, so far-away points still read as "over there". */
		function lookAt(x: number, y: number) {
			const dx = x - HEAD_C.x;
			const dy = y - HEAD_C.y;
			yaw.t = dx / (Math.abs(dx) + 140);
			pitch.t = dy / (Math.abs(dy) + 220);
			lean.t = yaw.t * 1.6;
			EYES.forEach((e, i) => {
				const ex = x - (e.x + yaw.t * 11);
				const ey = y - (e.y + pitch.t * 6);
				const d = Math.hypot(ex, ey) || 1;
				const m = Math.min(d / 50, 1) * 3.1;
				pupils[i].x.t = (ex / d) * m;
				pupils[i].y.t = (ey / d) * m;
			});
		}

		function render() {
			const y = yaw.x;
			const p = pitch.x;
			headEl.setAttribute(
				'transform',
				`translate(${y * 4} ${p * 3}) rotate(${y * 8 + tilt.x} ${HEAD_C.x} ${HEAD_C.y + 30})`
			);
			// The far eye disc foreshortens as the head turns; the face slides toward the near side.
			faceEl.setAttribute(
				'transform',
				`translate(${HEAD_C.x + y * 11} ${HEAD_C.y + p * 6}) scale(${1 - Math.abs(y) * 0.1} 1) translate(${-HEAD_C.x} ${-HEAD_C.y})`
			);
			pupils.forEach((s, i) => pupilEls[i].setAttribute('transform', `translate(${s.x.x} ${s.y.x})`));
			const b = Math.max(0, Math.min(1, blink.x));
			lidEls.forEach((el, i) => {
				const top = EYES[i].y - 11;
				el.setAttribute('transform', `translate(0 ${top}) scale(1 ${b}) translate(0 ${-top})`);
			});
			bodyEl.setAttribute(
				'transform',
				`rotate(${lean.x} ${PERCH.x} ${PERCH.y}) translate(${PERCH.x} ${PERCH.y}) scale(${puff.x} ${1 - (puff.x - 1) * 0.4}) translate(${-PERCH.x} ${-PERCH.y})`
			);
			featherEls.forEach((el, i) => {
				const [fx, fy] = feathers[i];
				el.setAttribute('transform', `translate(${fx} ${fy + fSprings[i].y.x}) rotate(${fSprings[i].r.x})`);
			});
			leafEls.forEach((el, i) => {
				const l = leaves[i];
				el.setAttribute('transform', `translate(${l.x} ${l.y}) rotate(${l.a + lSprings[i].x})`);
			});
		}

		function frame(now: number) {
			const dt = Math.min((now - last) / 1000, 1 / 30);
			last = now;
			const all: Spring[] = [yaw, pitch, tilt, puff, lean, blink];
			pupils.forEach((s) => all.push(s.x, s.y));
			fSprings.forEach((s) => all.push(s.r, s.y));
			all.push(...lSprings);
			// Two half-steps keep the stiffer springs stable at 30fps.
			for (const s of all) {
				step(s, dt / 2);
				step(s, dt / 2);
			}
			render();
			raf = all.some(restless) && visible ? requestAnimationFrame(frame) : 0;
		}

		function wake() {
			if (raf || !visible) return;
			last = performance.now();
			raf = requestAnimationFrame(frame);
		}

		function onMove(e: PointerEvent) {
			const q = toSvg(e.clientX, e.clientY);
			pointer.vx = q.x - pointer.x;
			pointer.vy = q.y - pointer.y;
			pointer.x = q.x;
			pointer.y = q.y;
			pointer.seen = performance.now();
			lookAt(q.x, q.y);

			const speed = Math.hypot(pointer.vx, pointer.vy);
			if (speed > 0.5) {
				feathers.forEach(([fx, fy], i) => {
					const d = Math.hypot(q.x - fx, q.y - fy);
					if (d > 24) return;
					const k = (1 - d / 24) * Math.min(speed, 14);
					fSprings[i].r.v += Math.sign(pointer.vx || 1) * k * 22;
					fSprings[i].y.v -= k * 9;
				});
				leaves.forEach((l, i) => {
					const rad = (l.a * Math.PI) / 180;
					const mx = l.x + Math.cos(rad) * l.len * 0.6;
					const my = l.y + Math.sin(rad) * l.len * 0.6;
					const d = Math.hypot(q.x - mx, q.y - my);
					if (d > 34) return;
					// Push the leaf the way the pointer crossed it.
					const cross = Math.cos(rad) * pointer.vy - Math.sin(rad) * pointer.vx;
					lSprings[i].v += cross * (1 - d / 34) * 9;
				});
			}
			wake();
		}

		function rouse() {
			puff.v += 1.4;
			tilt.t = (Math.random() < 0.5 ? -1 : 1) * 22;
			setTimeout(() => {
				tilt.t = 0;
				wake();
			}, 650);
			fSprings.forEach((s) => {
				s.r.v += (Math.random() - 0.5) * 900;
				s.y.v -= Math.random() * 120;
			});
			lSprings.forEach((s) => (s.v += (Math.random() - 0.5) * 120));
			doBlink();
			wake();
		}

		function doBlink() {
			blink.t = 1;
			wake();
			setTimeout(() => {
				blink.t = 0;
				wake();
			}, 110);
		}

		function scheduleBlink() {
			blinkTimer = setTimeout(
				() => {
					doBlink();
					// Owls double-blink now and then.
					if (Math.random() < 0.25) setTimeout(doBlink, 260);
					scheduleBlink();
				},
				2600 + Math.random() * 4200
			);
		}

		/** With the pointer gone quiet, the owl looks about on its own. */
		function scheduleWander() {
			wanderTimer = setTimeout(
				() => {
					if (performance.now() - pointer.seen > 4500) {
						lookAt(HEAD_C.x + (Math.random() - 0.5) * 520, HEAD_C.y + (Math.random() - 0.2) * 260);
						wake();
					}
					scheduleWander();
				},
				1800 + Math.random() * 2600
			);
		}

		const io = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible) wake();
		});
		io.observe(svgEl);

		const owl = svgEl.querySelector('.owl') as SVGGElement;
		owl.addEventListener('click', rouse);
		window.addEventListener('pointermove', onMove, { passive: true });
		lookAt(pointer.x, pointer.y);
		scheduleBlink();
		scheduleWander();
		wake();

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(blinkTimer);
			clearTimeout(wanderTimer);
			io.disconnect();
			owl.removeEventListener('click', rouse);
			window.removeEventListener('pointermove', onMove);
		};
	});
</script>

<svg
	bind:this={svgEl}
	class="ink-owl"
	viewBox="0 0 320 300"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
	focusable="false"
>
	<defs>
		<!-- Brush edges: a fine displacement, then a slow blotchy variation in ink density. -->
		<filter id={f('ink')} x="-5%" y="-5%" width="110%" height="110%">
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="t" />
			<feDisplacementMap in="SourceGraphic" in2="t" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d" />
			<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="9" result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.35" result="m" />
			<feComposite in="d" in2="m" operator="arithmetic" k1="0.5" k2="0.7" k3="0" k4="0" />
		</filter>
		<!-- Dry brush: streaks where the bristles skipped, along the stroke. -->
		<filter id={f('dry')} x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.012 0.42" numOctaves="2" seed="2" result="s" />
			<feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3.2 -0.55" result="sm" />
			<feComposite in="SourceGraphic" in2="sm" operator="in" />
		</filter>
		<filter id={f('dryv')} x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.35 0.012" numOctaves="2" seed="5" result="s" />
			<feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.6 -0.25" result="sm" />
			<feComposite in="SourceGraphic" in2="sm" operator="in" />
		</filter>
		<linearGradient id={f('leaf')} x1="0" x2="1">
			<stop offset="0" stop-color="currentColor" stop-opacity="1" />
			<stop offset="1" stop-color="currentColor" stop-opacity=".55" />
		</linearGradient>
		<linearGradient id={f('head')} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="currentColor" stop-opacity=".62" />
			<stop offset=".55" stop-color="currentColor" stop-opacity=".28" />
			<stop offset="1" stop-color="currentColor" stop-opacity=".18" />
		</linearGradient>
		<radialGradient id={f('body')} cx=".5" cy=".42" r=".6">
			<stop offset="0" stop-color="currentColor" stop-opacity=".06" />
			<stop offset=".7" stop-color="currentColor" stop-opacity=".2" />
			<stop offset="1" stop-color="currentColor" stop-opacity=".42" />
		</radialGradient>
		<linearGradient id={f('wing')} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="currentColor" stop-opacity=".45" />
			<stop offset="1" stop-color="currentColor" stop-opacity=".9" />
		</linearGradient>
	</defs>

	<!-- The branch and the bamboo. -->
	<g filter="url(#{f('ink')})">
		<g filter="url(#{f('dry')})">
			<path
				d="M318 191 C262 199 200 220 122 236 C96 241 74 245 50 249 C76 252 102 250 127 246 C206 234 262 214 316 202 C322 200 323 193 318 191Z"
				fill="currentColor"
				opacity=".88"
			/>
		</g>
		<path d="M248 211 C260 190 274 166 292 142 L295 145 C278 170 266 194 257 213Z" fill="currentColor" opacity=".8" />
		<path d="M104 243 C92 252 80 262 62 271 C82 266 97 258 111 245Z" fill="currentColor" opacity=".72" />
		<path
			d="M226 219 c3 -4 8 -5 12 -3 M150 233 c3 -3 7 -3 10 -1"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			fill="none"
			opacity=".9"
		/>
		{#each leaves as l, i (i)}
			<g data-leaf transform="translate({l.x} {l.y}) rotate({l.a})">
				<path d={leafPath(l)} fill="url(#{f('leaf')})" opacity={l.o} />
			</g>
		{/each}
	</g>

	<!-- The owl. The paper-coloured silhouette underneath keeps the branch from showing
	     through its washes. -->
	<g class="owl">
		<path class="ink-owl__paper" d={BODY} />
		<path class="ink-owl__paper" d={HEAD} />
		<g filter="url(#{f('ink')})">
			<path d="M164 232 L157 268 L170 262 L177 272 L184 261 L193 266 L190 232Z" fill="currentColor" opacity=".7" />
			<g bind:this={bodyEl}>
				<path d={BODY} fill="url(#{f('body')})" />
				<g filter="url(#{f('dryv')})">
					<path
						d="M137 124 C115 152 112 200 133 232 C139 238 148 240 153 238 C137 214 131 170 148 130Z"
						fill="url(#{f('wing')})"
					/>
					<path
						d="M213 124 C235 152 238 200 217 232 C211 238 202 240 197 238 C213 214 219 170 202 130Z"
						fill="url(#{f('wing')})"
					/>
				</g>
				<path
					d="M139 212 l-6 24 M146 219 l-4 21 M211 212 l6 24 M204 219 l4 21"
					stroke="currentColor"
					stroke-width="2.4"
					stroke-linecap="round"
					opacity=".75"
				/>
				{#each feathers as [fx, fy], i (i)}
					<g data-feather transform="translate({fx} {fy})">
						<path
							d="M-6 -2 Q0 5 6 -2"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							opacity=".6"
						/>
					</g>
				{/each}
			</g>
			<path
				d="M156 227 q-1 7 -4 10 M162 227 q1 7 0 11 M168 227 q2 6 1 10 M182 227 q-1 7 -4 10 M188 227 q1 7 0 11 M194 227 q2 6 1 10"
				fill="none"
				stroke="currentColor"
				stroke-width="2.6"
				stroke-linecap="round"
				opacity=".9"
			/>
			<g bind:this={headEl}>
				<path d={HEAD} fill="url(#{f('head')})" />
				<path
					d="M130 66 C138 77 141 84 140 91 M220 66 C212 77 209 84 210 91 M142 84 C158 75 192 75 208 84"
					fill="none"
					stroke="currentColor"
					stroke-width="3.2"
					stroke-linecap="round"
					opacity=".7"
				/>
				<g bind:this={faceEl}>
					{#each EYES as e, i (i)}
						<circle class="ink-owl__disc" cx={e.x} cy={e.y - 1} r="20" />
					{/each}
					<path
						d="M137 96 Q160 90 175 113 Q190 90 213 96"
						fill="none"
						stroke="currentColor"
						stroke-width="2.8"
						stroke-linecap="round"
						opacity=".7"
					/>
					{#each EYES as e, i (i)}
						<circle class="ink-owl__iris" cx={e.x} cy={e.y} r="9.5" />
						<g data-pupil>
							<circle cx={e.x} cy={e.y} r="6" fill="currentColor" />
							<circle class="ink-owl__glint" cx={e.x - 2} cy={e.y - 2} r="1.7" />
						</g>
						<ellipse
							data-lid
							class="ink-owl__lid"
							cx={e.x}
							cy={e.y}
							rx="11"
							ry="11"
							transform="translate(0 {e.y - 11}) scale(1 0) translate(0 {-(e.y - 11)})"
						/>
					{/each}
					<path d="M170 117 L180 117 L175 131Z" fill="currentColor" opacity=".9" />
				</g>
			</g>
		</g>
	</g>
</svg>

<style>
	.ink-owl {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
		color: rgb(var(--ink-rgb));
		pointer-events: none;
	}

	.owl {
		pointer-events: visiblePainted;
		cursor: pointer;
	}

	.ink-owl__paper {
		fill: var(--owl-paper);
	}

	.ink-owl__disc {
		fill: var(--owl-face);
		stroke: currentColor;
		stroke-opacity: 0.4;
		stroke-width: 1.6;
	}

	.ink-owl__iris {
		fill: var(--owl-eye);
	}

	.ink-owl__glint {
		fill: var(--owl-face);
	}

	.ink-owl__lid {
		fill: var(--owl-lid);
	}
</style>
