<script lang="ts">
	// A table straight from a CSV in src/lib/data, as pandas' `df.to_csv()` writes it: the
	// first column is the index and becomes the row labels; an empty first header cell is
	// fine. Use it in a post as `<DataFrame path="my-table.csv" />`; the other props are
	// optional and refer to columns and rows by their names in the CSV.
	//
	// The CSVs are read at build time (an eager glob), so the table prerenders with no loading
	// state, and an unknown path fails the build. It renders a plain `<table>`, so feed readers
	// get the same table (see feed-content.ts).
	import { parseCsv } from '$lib/csv';

	const files = import.meta.glob<string>('/src/lib/data/*.csv', {
		query: '?raw',
		import: 'default',
		eager: true
	});

	type Format = 'percent' | number | ((value: number) => string);

	let {
		path,
		labels = {},
		format = {},
		highlight = [],
		caption
	}: {
		/** A CSV in src/lib/data. */
		path: string;
		/** Display names for column headers and row labels. */
		labels?: Record<string, string>;
		/** Per column: 'percent' (0.672 → 67.2%), a number of decimals, or a function. */
		format?: Record<string, Format>;
		/** Cells to set in bold red, as [row label, column]. */
		highlight?: [string, string][];
		caption?: string;
	} = $props();

	let parsed = $derived.by(() => {
		// Accepts `votes.csv`, `src/lib/data/votes.csv`, `/src/lib/data/votes.csv` or `$lib/data/votes.csv`.
		const name = path.split('/').pop() ?? path;
		const csv = files[`/src/lib/data/${name}`];
		if (csv === undefined) throw new Error(`DataFrame: no CSV at src/lib/data/${name}`);

		const [header, ...body] = parseCsv(csv);
		if (!header) throw new Error(`DataFrame: ${name} is empty`);
		return {
			indexName: header[0].trim(),
			columns: header.slice(1).map((c) => c.trim()),
			rows: body.map((r) => ({ index: r[0].trim(), cells: r.slice(1).map((c) => c.trim()) }))
		};
	});

	const isNumber = (raw: string) => raw !== '' && Number.isFinite(Number(raw));
	const label = (name: string) => labels[name] ?? name;
	const isHighlighted = (row: string, column: string) =>
		highlight.some(([r, c]) => r === row && c === column);

	// Unformatted: 11.0 → 11, 3220.0 → 3,220, 0.2222222 → 0.2222
	function show(raw: string, column: string): string {
		if (!isNumber(raw)) return raw;
		const n = Number(raw);
		const f = format[column];
		if (typeof f === 'function') return f(n);
		if (f === 'percent') return `${(n * 100).toFixed(1)}%`;
		const digits = typeof f === 'number' ? f : undefined;
		return n.toLocaleString('en-US', {
			minimumFractionDigits: digits,
			maximumFractionDigits: digits ?? 4
		});
	}
</script>

<figure class="dataframe">
	<div class="table-scroll">
		<table>
			<thead>
				<tr>
					<th>{label(parsed.indexName)}</th>
					{#each parsed.columns as column (column)}
						<th class="num">{label(column)}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each parsed.rows as row (row.index)}
					<tr>
						<th scope="row">{label(row.index)}</th>
						{#each parsed.columns as column, i (column)}
							{@const raw = row.cells[i] ?? ''}
							<td class:num={isNumber(raw)}>
								{#if isHighlighted(row.index, column)}
									<strong class="flag">{show(raw, column)}</strong>
								{:else}
									{show(raw, column)}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>

<style>
	/* Figures line up by their last digit. */
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.flag {
		color: var(--accent);
	}
</style>
