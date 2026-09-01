<script>
	import { polygonPoints, greyFor, radiusFor, ANGLES } from './shapes.js';

	let { obj = null, px = 72, state = 'normal' } = $props();

	const half = 50;
	let r = $derived(obj ? radiusFor(obj.size, half) : 0);
	let points = $derived(obj ? polygonPoints(obj.type, half, half, r, ANGLES[obj.angle]) : null);
	let fill = $derived(obj ? greyFor(obj.color) : 'none');
</script>

<svg
	class="panel {state}"
	width={px}
	height={px}
	viewBox="0 0 100 100"
	role="img"
	aria-label={obj ? 'RPM panel' : 'missing panel'}
>
	<rect x="1" y="1" width="98" height="98" rx="3" class="frame" />
	{#if obj}
		{#if points}
			<polygon {points} {fill} class="glyph" />
		{:else}
			<circle cx="50" cy="50" {r} {fill} class="glyph" />
		{/if}
	{:else}
		<text x="50" y="50" class="qmark">?</text>
	{/if}
</svg>

<style>
	.panel .frame {
		fill: var(--panel-bg, #fff);
		stroke: var(--rule, #c9ccd4);
		stroke-width: 1.5;
	}
	.panel.correct .frame {
		stroke: #2a9d5c;
		stroke-width: 3;
	}
	.panel.wrong .frame {
		stroke: #d1495b;
		stroke-width: 3;
	}
	.panel.target .frame {
		stroke: var(--accent, #1d3557);
		stroke-width: 2.5;
		stroke-dasharray: 5 4;
	}
	.glyph {
		stroke: #1b1d23;
		stroke-width: 2;
		stroke-linejoin: round;
	}
	.qmark {
		text-anchor: middle;
		dominant-baseline: central;
		font-size: 38px;
		font-weight: 600;
		fill: var(--muted, #8b90a0);
	}
</style>
