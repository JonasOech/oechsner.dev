<script lang="ts">
	import { untrack } from 'svelte';
	import { activePlugins } from '$lib/data/obsidian-plugins';

	let { group, startOpen = false }: { group: string; startOpen?: boolean } = $props();

	const plugins = $derived(activePlugins(group));
	const uid = $props.id();
	const panelId = `${uid}-panel`;

	// `startOpen` seeds the initial selection and nothing more — a later change to it
	// should not yank a panel the reader has since opened or closed.
	let openName = $state<string | null>(
		untrack(() => (startOpen ? (plugins[0]?.name ?? null) : null))
	);

	function toggle(name: string) {
		openName = openName === name ? null : name;
	}

	function onChipKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && openName !== null) {
			openName = null;
			event.stopPropagation();
		}
	}
</script>

<!--
	One rectangle: the plugin names divide its top band into segments, and the description
	opens as the band underneath them, at the full width of the rectangle. Every description
	is in the markup with `hidden` on the inactive ones, so the prerendered page holds the
	whole list even though one shows at a time — and `hidden` keeps a closed panel at zero
	height rather than an empty gap.
-->
<figure class="widget plugin-rack">
	<ul class="rack">
		{#each plugins as plugin (plugin.name)}
			<li>
				<button
					type="button"
					class="chip"
					data-open={openName === plugin.name}
					aria-expanded={openName === plugin.name}
					aria-controls={panelId}
					onclick={() => toggle(plugin.name)}
					onkeydown={onChipKeydown}
				>
					{plugin.name}
				</button>
			</li>
		{/each}
	</ul>

	<div class="panel" id={panelId} data-open={openName !== null}>
		<div class="panel__inner">
			{#each plugins as plugin (plugin.name)}
				<div class="panel__item" hidden={openName !== plugin.name}>
					<p class="panel__use">{plugin.use}</p>
				</div>
			{/each}
		</div>
	</div>
</figure>

<style>
	/* The segments run to the rectangle's edge, so the shared `.widget` padding has to
	   go and the corners have to clip whatever reaches them. Doubling up the class beats
	   `.prose .widget` in app.css without an `!important`. */
	.widget.plugin-rack {
		padding: 0;
		overflow: hidden;
	}

	/* Wrapping flex rather than a grid: segments share a common basis, so they come out
	   equal within a row, and a group that needs a second row still fills it edge to edge
	   instead of leaving the empty tracks a fixed column count would. */
	.rack {
		display: flex;
		flex-wrap: wrap;
		list-style: none;
		margin: -1px 0 0 -1px;
		padding: 0;
	}

	/* `margin: 0` is load-bearing: `.prose li + li` in app.css puts a top margin on every
	   list item but the first, which in a stretched grid row leaves the first segment
	   taller than its neighbours. */
	.rack li {
		display: flex;
		flex: 1 1 8.5rem;
		min-width: 0;
		margin: 0;
	}

	/* Every segment carries its own top and left rule. Rows all start at the same x, so
	   the negative margin on `.rack` pushes the rules of the first row and of each row's
	   first segment outside the figure, where its `overflow: hidden` clips them — which
	   leaves dividers only between neighbours, at whatever count happens to fit. */
	.chip {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		padding: var(--s-3) var(--s-3);
		border: 0;
		border-top: 1px solid var(--line);
		border-left: 1px solid var(--line);
		background: none;
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 600;
		line-height: 1.35;
		text-align: center;
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out);
	}

	.chip[data-open='true'] {
		background: var(--surface-active);
		color: var(--text);
		box-shadow: inset 0 -2px 0 var(--accent);
	}

	@media (hover: hover) and (pointer: fine) {
		.chip:hover {
			background: var(--surface-hover);
			color: var(--text);
		}

		.chip[data-open='true']:hover {
			background: var(--surface-active);
			color: var(--text);
		}
	}

	.chip:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* Both shadows, or focusing the open segment would erase the bar marking it open. */
	.chip[data-open='true']:focus-visible {
		box-shadow:
			inset 0 -2px 0 var(--accent),
			var(--focus-ring);
	}

	@media (pointer: coarse) {
		.chip {
			min-height: 44px;
		}
	}

	/* `0fr → 1fr` on a grid row animates to the height of whichever item is not
	   `hidden`, which is the one thing a plain `height` transition cannot do. */
	.panel {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--dur-fast) var(--ease-out);
	}

	.panel[data-open='true'] {
		grid-template-rows: 1fr;
	}

	.panel__inner {
		overflow: hidden;
		min-height: 0;
	}

	.panel[data-open='true'] .panel__inner {
		border-top: 1px solid var(--line);
	}

	.panel__item {
		padding: var(--s-4) var(--s-5);
	}

	.panel__use {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--text-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		.chip,
		.panel {
			transition: none;
		}
	}
</style>
