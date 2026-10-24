/**
 * A tiny isometric line-drawing kit for the site's hairline figures.
 *
 * World space: x and y lie on the ground, z points up. The camera looks down at a fixed
 * 30° elevation (the 2:1 isometric view) from an azimuth that can turn, so a scene can be
 * swung around by the pointer. Solids are drawn as "plates": polygons filled with the page
 * colour and stroked with a hairline, painted back to front so nearer ones cover farther
 * ones. Everything returns SVG path strings; the components own the <svg>.
 */

export type V3 = [number, number, number];
export type Pt = [number, number];
export type Proj = (x: number, y: number, z: number) => Pt;
/** One stroke of a drawing: its path and the CSS class that says how heavy it is. */
export type Mark = { d: string; cls: 'plate' | 'crease' | 'lo' | 'drop' | 'accent' | 'fill' };

const ELEV_K = 0.5; // sin(30°): ground depth is halved on screen
const ELEV_C = Math.sqrt(1 - ELEV_K * ELEV_K); // cos(30°): heights shrink a little

export type Camera = {
	P: Proj;
	/** Distance toward the viewer of a ground point: larger is nearer. */
	depth: (x: number, y: number) => number;
	/** The horizontal direction toward the viewer, for back-face tests. */
	view: Pt;
};

export function camera(azDeg: number, scale: number, cx: number, cy: number): Camera {
	const a = (azDeg * Math.PI) / 180;
	const ca = Math.cos(a);
	const sa = Math.sin(a);
	return {
		P: (x, y, z) => {
			const u = x * ca - y * sa;
			const v = x * sa + y * ca;
			return [cx + scale * u, cy + scale * (v * ELEV_K - z * ELEV_C)];
		},
		depth: (x, y) => x * sa + y * ca,
		view: [sa, ca]
	};
}

const f = (n: number) => (Math.round(n * 100) / 100).toString();

/** A closed polygon. */
export const poly = (pts: Pt[]) => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';

/** An open polyline. */
export const open = (pts: Pt[]) => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L');

/** Convex hull of screen points (Andrew's monotone chain), counter-clockwise. */
export function hull(points: Pt[]): Pt[] {
	const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
	if (p.length < 3) return p;
	const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lower: Pt[] = [];
	for (const q of p) {
		while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
		lower.push(q);
	}
	const upper: Pt[] = [];
	for (let i = p.length - 1; i >= 0; i--) {
		const q = p[i];
		while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
		upper.push(q);
	}
	return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Points of a horizontal circle at height z. */
export function ring(cx: number, cy: number, r: number, z: number, n = 48): V3[] {
	return Array.from({ length: n }, (_, i) => {
		const t = (i / n) * Math.PI * 2;
		return [cx + Math.cos(t) * r, cy + Math.sin(t) * r, z] as V3;
	});
}

/**
 * A box standing on the ground plane, turned `rot` degrees about its centre: only the
 * side faces turned toward the camera, then the top. Convex, so the visible faces never
 * overlap one another.
 */
export function block(
	cam: Camera,
	cx: number,
	cy: number,
	w: number,
	d: number,
	z0: number,
	z1: number,
	rot = 0
): Mark[] {
	const r = (rot * Math.PI) / 180;
	const cr = Math.cos(r);
	const sr = Math.sin(r);
	const corner = (u: number, v: number): Pt => [cx + u * cr - v * sr, cy + u * sr + v * cr];
	const c = [corner(-w / 2, -d / 2), corner(w / 2, -d / 2), corner(w / 2, d / 2), corner(-w / 2, d / 2)];
	const marks: Mark[] = [];
	for (let i = 0; i < 4; i++) {
		const a = c[i];
		const b = c[(i + 1) % 4];
		// Outward normal of edge a→b for a clockwise-in-world ring.
		const nx = b[1] - a[1];
		const ny = -(b[0] - a[0]);
		if (nx * cam.view[0] + ny * cam.view[1] <= 0) continue;
		marks.push({
			d: poly([cam.P(a[0], a[1], z0), cam.P(b[0], b[1], z0), cam.P(b[0], b[1], z1), cam.P(a[0], a[1], z1)]),
			cls: 'plate'
		});
	}
	marks.push({ d: poly(c.map(([x, y]) => cam.P(x, y, z1))), cls: 'plate' });
	return marks;
}

/** An upright cylinder: its silhouette, then its top face. */
export function cylinder(cam: Camera, cx: number, cy: number, r: number, z0: number, z1: number): Mark[] {
	const bottom = ring(cx, cy, r, z0).map(([x, y, z]) => cam.P(x, y, z));
	const top = ring(cx, cy, r, z1).map(([x, y, z]) => cam.P(x, y, z));
	return [
		{ d: poly(hull(bottom.concat(top))), cls: 'plate' },
		{ d: poly(top), cls: 'plate' }
	];
}

/**
 * A laptop: deck with keys and trackpad, and a lid hinged on the deck's back edge.
 * `lid` is the opening angle in degrees: 0 closed, 90 upright, ~110 leaning back.
 */
export function laptop(cam: Camera, cx: number, cy: number, w: number, d: number, lid: number): Mark[] {
	const h = 2.6;
	const yb = cy - d / 2;
	const phi = (lid * Math.PI) / 180;
	const L = d * 0.95;
	const lidPt = (x: number, t: number): Pt => cam.P(x, yb + t * Math.cos(phi), h + t * Math.sin(phi));
	const lidFace: Mark = {
		d: poly([lidPt(cx - w / 2, 0), lidPt(cx + w / 2, 0), lidPt(cx + w / 2, L), lidPt(cx - w / 2, L)]),
		cls: 'plate'
	};
	const screen: Mark = {
		d: poly([
			lidPt(cx - w / 2 + 3, 3),
			lidPt(cx + w / 2 - 3, 3),
			lidPt(cx + w / 2 - 3, L - 3),
			lidPt(cx - w / 2 + 3, L - 3)
		]),
		cls: 'crease'
	};
	const deck = block(cam, cx, cy, w, d, 0, h);
	let keys = '';
	const cols = 10;
	const rows = 4;
	const kw = (w - 10) / cols;
	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < cols; i++) {
			const x0 = cx - w / 2 + 5 + i * kw;
			const y0 = yb + 4 + j * kw;
			keys += poly([
				cam.P(x0 + 0.6, y0 + 0.6, h),
				cam.P(x0 + kw - 0.6, y0 + 0.6, h),
				cam.P(x0 + kw - 0.6, y0 + kw - 0.6, h),
				cam.P(x0 + 0.6, y0 + kw - 0.6, h)
			]);
		}
	}
	const padY = yb + 6 + rows * kw;
	const pad: Mark = {
		d: poly([
			cam.P(cx - w * 0.16, padY, h),
			cam.P(cx + w * 0.16, padY, h),
			cam.P(cx + w * 0.16, cy + d / 2 - 3, h),
			cam.P(cx - w * 0.16, cy + d / 2 - 3, h)
		]),
		cls: 'crease'
	};
	const base = [...deck, { d: keys, cls: 'lo' } as Mark, pad];
	// Upright or leaning back, the lid is behind the deck; nearly closed, it lies on top.
	return lid >= 90 ? [lidFace, screen, ...base] : [...base, lidFace, screen];
}
