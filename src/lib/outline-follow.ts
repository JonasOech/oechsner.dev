// The maths behind the post outline's list following the reader
// (src/lib/components/PostOutline.svelte). Kept free of Svelte and of the component's
// state so it can be unit-tested in plain Node: scripts/outline-follow.test.mjs.

/** An entry's box in the list's scroll coordinates: 0 is the top of the scrolled content. */
export interface EntryBox {
	top: number;
	bottom: number;
}

export interface ScrollView {
	scrollTop: number;
	clientHeight: number;
	scrollHeight: number;
}

/**
 * Where the list should scroll so entry `active` has `scrolloff` entries visible on each
 * side, or null when it already has them (or the move would be under a pixel).
 *
 * This is nvim's `:set scrolloff=`: the list rests while the active entry has its margin,
 * and when it does not, moves just far enough to restore it — never re-centring on every
 * change. The margin is counted in entries rather than pixels, because a heading that wraps
 * onto three lines is still one step for the reader, not three. Within `scrolloff` entries
 * of either end the margin runs to the very end (0 or `scrollHeight`), past any padding or
 * sentinel, so the first and last entries are never left stranded under the edge. When the
 * active entry and its margin do not fit at all (a short window), it is centred instead.
 */
export function followTarget(
	entries: readonly EntryBox[],
	active: number,
	view: ScrollView,
	scrolloff = 3
): number | null {
	if (!Number.isInteger(active) || active < 0 || active >= entries.length) return null;

	const lo = active - scrolloff <= 0 ? 0 : entries[active - scrolloff].top;
	const hi =
		active + scrolloff >= entries.length - 1 ? view.scrollHeight : entries[active + scrolloff].bottom;

	let target: number;
	if (hi - lo > view.clientHeight) {
		const { top, bottom } = entries[active];
		target = (top + bottom) / 2 - view.clientHeight / 2;
	} else if (lo < view.scrollTop) {
		target = lo;
	} else if (hi > view.scrollTop + view.clientHeight) {
		target = hi - view.clientHeight;
	} else {
		return null;
	}

	target = Math.min(Math.max(target, 0), Math.max(0, view.scrollHeight - view.clientHeight));
	return Math.abs(target - view.scrollTop) < 1 ? null : target;
}

/**
 * Measures `items` (the list's <li>s) in `scroller`'s scroll coordinates — the frame
 * `followTarget` counts its scrolloff in, one box per entry, however many lines each wraps
 * onto.
 */
export function entryBoxes(scroller: HTMLElement, items: ArrayLike<Element>): EntryBox[] {
	const origin = scroller.getBoundingClientRect().top + scroller.clientTop - scroller.scrollTop;
	return Array.from(items, (item) => {
		const r = item.getBoundingClientRect();
		return { top: r.top - origin, bottom: r.bottom - origin };
	});
}
