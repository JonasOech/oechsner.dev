// Helpers for drawing RAVEN-style panels as SVG.
// The attribute ranges mirror the sVAE's supervised semantic layer
// (5 types, 10 colors, 6 sizes, 8 angles) so the pictures and the
// 29-dimensional vector in the post always agree.

export const SIDES = [3, 4, 5, 6, 0]; // 0 = circle
export const TYPE_NAMES = ['triangle', 'square', 'pentagon', 'hexagon', 'circle'];

/**
 * RAVEN encodes colour as a grey level; index 0 is white, index 9 near-black.
 * @param {number} colorIdx
 */
export function greyFor(colorIdx) {
	const v = Math.round(255 - (colorIdx / 9) * 235);
	return `rgb(${v},${v},${v})`;
}

/**
 * Six discrete sizes, as a fraction of the panel half-width.
 * @param {number} sizeIdx
 * @param {number} [half]
 */
export function radiusFor(sizeIdx, half = 50) {
	return half * (0.32 + (sizeIdx / 5) * 0.58);
}

export const ANGLES = [-135, -90, -45, 0, 45, 90, 135, 180];

/**
 * Polygon points for a shape centred at (cx, cy).
 * Returns null for the circle, which is drawn with <circle> instead.
 * @param {number} typeIdx
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {number} angleDeg
 */
export function polygonPoints(typeIdx, cx, cy, r, angleDeg) {
	const n = SIDES[typeIdx];
	if (n === 0) return null;
	const pts = [];
	for (let i = 0; i < n; i++) {
		// -90deg so a triangle points up at angle 0.
		const a = ((angleDeg - 90 + (360 / n) * i) * Math.PI) / 180;
		pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
	}
	return pts.join(' ');
}

/**
 * Human-readable one-line summary of a panel object.
 * @param {import('./types').PanelObj} obj
 */
export function describe(obj) {
	return `${TYPE_NAMES[obj.type]}, colour ${obj.color}, size ${obj.size}, ${ANGLES[obj.angle]}°`;
}
