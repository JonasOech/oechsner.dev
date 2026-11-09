/**
 * Parses CSV text into rows of cells. Handles quoted fields (with `""` escapes and embedded
 * separators or newlines), which is what pandas' `to_csv` writes when a cell needs it. The
 * separator is sniffed from the first line: tab, then semicolon, then comma.
 */
export function parseCsv(text: string): string[][] {
	const src = text.replace(/^﻿/, '').trim();
	const firstLine = src.slice(0, src.search(/\r?\n|$/));
	const sep = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let quoted = false;

	for (let i = 0; i < src.length; i++) {
		const ch = src[i];
		if (quoted) {
			if (ch === '"' && src[i + 1] === '"') {
				cell += '"';
				i++;
			} else if (ch === '"') {
				quoted = false;
			} else {
				cell += ch;
			}
		} else if (ch === '"') {
			quoted = true;
		} else if (ch === sep) {
			row.push(cell);
			cell = '';
		} else if (ch === '\n' || ch === '\r') {
			if (ch === '\r' && src[i + 1] === '\n') i++;
			row.push(cell);
			rows.push(row);
			row = [];
			cell = '';
		} else {
			cell += ch;
		}
	}
	row.push(cell);
	rows.push(row);

	return rows.filter((r) => r.some((c) => c.trim() !== ''));
}
