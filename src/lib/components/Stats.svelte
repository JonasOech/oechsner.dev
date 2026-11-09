<script lang="ts">
	// A row of headline figures, dashboard-style: big number on top, a short description
	// under it, a hairline above and below the row, no vertical rules and no cards. Built for five, works for any count.
	// Use it in a post as
	//
	//   <Stats items={[{ value: 3220, label: 'votes cast' }, …]} caption="…" />
	//
	// Numbers are grouped (3220 → 3,220); strings are shown as written, so '67%' or '2.4×'
	// keep their units. It renders a plain `<dl>`, so feed readers get a label/value list
	// (see feed-content.ts).
	let {
		items,
		caption
	}: {
		items: { value: number | string; label: string }[];
		caption?: string;
	} = $props();

	const show = (value: number | string) =>
		typeof value === 'number' ? value.toLocaleString('en-US') : value;
</script>

<figure class="stats" style:--n={items.length}>
	<dl>
		{#each items as item, i (i)}
			<div class="stat">
				<dt>{item.label}</dt>
				<dd>{show(item.value)}</dd>
			</div>
		{/each}
	</dl>
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>

<style>
	/* Only horizontal rules, above and below the whole row. Columns, and rows when it
	   wraps, are separated by space alone. Flex rather than grid so a short last row
	   sits centred instead of hugging the left. */
	dl {
		--cols: var(--n);
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--s-5);
		margin: 0;
		padding-block: var(--s-5);
		border-block: 1px solid var(--line);
	}

	/* Too narrow for five abreast: three over two. */
	@media (max-width: 767px) {
		dl {
			--cols: min(var(--n), 3);
		}
	}

	.stat {
		/* Every item is exactly one column wide, so the columns line up across rows. */
		flex: 0 0 calc((100% - (var(--cols) - 1) * var(--s-5)) / var(--cols));
		min-width: 0;
		display: flex;
		/* The label comes first in the markup, so a screen reader announces "votes cast,
		   3,220"; on screen the number leads. */
		flex-direction: column-reverse;
		justify-content: flex-end;
		align-items: center;
		gap: var(--s-2);
		text-align: center;
	}

	dd {
		margin: 0;
		font-size: clamp(1.375rem, 3vw, 1.875rem);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.01em;
		font-variant-numeric: tabular-nums;
		color: var(--text);
		overflow-wrap: anywhere;
	}

	dt {
		font-size: 0.8125rem;
		line-height: 1.45;
		color: var(--text-secondary);
	}
</style>
