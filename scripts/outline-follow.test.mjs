import { test } from 'node:test';
import assert from 'node:assert/strict';
import { followTarget } from '../src/lib/outline-follow.ts';

/** `n` entries of equal height, stacked from 0. */
const rows = (n, h = 30) => Array.from({ length: n }, (_, i) => ({ top: i * h, bottom: (i + 1) * h }));
const list = rows(17); // 510px of entries
const view = (scrollTop, clientHeight = 300, scrollHeight = 510) => ({ scrollTop, clientHeight, scrollHeight });

test('holds still while the active entry has 3 entries of room both ways', () => {
	assert.equal(followTarget(list, 5, view(0)), null);
});

test('glides down just far enough to show 3 entries below', () => {
	assert.equal(followTarget(list, 7, view(0)), 30); // entry 10 ends at 330
});

test('glides up just far enough to show 3 entries above', () => {
	assert.equal(followTarget(list, 6, view(150)), 90); // entry 3 starts at 90
});

test('within 3 entries of the start it goes all the way to the top', () => {
	assert.equal(followTarget(list, 2, view(100)), 0);
});

test('within 3 entries of the end it goes all the way to the bottom', () => {
	assert.equal(followTarget(list, 14, view(0)), 210);
});

test('counts entries, not pixels', () => {
	// Entry 6 is a wrapped, three-line 90px entry.
	const tall = [
		...rows(6),
		{ top: 180, bottom: 270 },
		...rows(10).map((r) => ({ top: r.top + 270, bottom: r.bottom + 270 }))
	];
	// Entry 7 (3 below entry 4) ends at 300. A 90px pixel margin would have stopped at 240.
	assert.equal(followTarget(tall, 4, view(0, 280, 570)), 20);
});

test('centres the active entry when 7 entries do not fit', () => {
	assert.equal(followTarget(list, 8, view(0, 150)), 180); // entry 8 spans 240–270
});

test('keeps the target inside the scrollable range', () => {
	assert.equal(followTarget(list, 1, view(40, 100)), 0); // centring alone would ask for -5
});

test('ignores a move under a pixel', () => {
	assert.equal(followTarget(list, 7, view(29.6)), null);
});

test('ignores an index outside the list', () => {
	assert.equal(followTarget(list, -1, view(0)), null);
	assert.equal(followTarget(list, 17, view(0)), null);
});
