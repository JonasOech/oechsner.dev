<script lang="ts">
	import Geometry from '$lib/components/Geometry.svelte';
	import type { Snippet } from 'svelte';

	/**
	 * The poster header of every inner page: a colour block with a diagonal lower edge, the
	 * page's h1 set in heavy uppercase, an optional standfirst, and the band composition at
	 * the right. `tone` picks the block colour; the type colour follows from it.
	 */
	let {
		title,
		kicker,
		tone = 'yellow',
		children
	}: {
		title: string;
		kicker?: string;
		tone?: 'yellow' | 'red' | 'blue';
		children?: Snippet;
	} = $props();
</script>

<header class="ptitle block block--{tone}">
	<div class="container ptitle__inner">
		<div class="ptitle__text">
			{#if kicker}<p class="ptitle__kicker enter" style="--i: 0">{kicker}</p>{/if}
			<h1 class="ptitle__h enter" style="--i: 1">{title}</h1>
			{#if children}
				<div class="ptitle__lede enter" style="--i: 2">{@render children()}</div>
			{/if}
		</div>
		<Geometry variant="band" class="ptitle__art" />
	</div>
</header>

<style>
	.ptitle {
		--cut: 2.5rem;
		padding-block: var(--s-8) calc(var(--s-8) + var(--cut));
		clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--cut)), 0 100%);
		margin-bottom: calc(var(--cut) * -1);
	}

	.ptitle__inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 340px);
		gap: var(--s-6);
		align-items: center;
	}

	.ptitle__kicker {
		font-size: 0.875rem;
		font-weight: 800;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		margin: 0 0 var(--s-3);
		color: inherit;
	}

	.ptitle__h {
		color: inherit;
		font-size: clamp(2.5rem, 7vw, 4.25rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.02em;
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	.ptitle__lede {
		margin-top: var(--s-4);
		max-width: 44ch;
		font-size: 1.1875rem;
		line-height: 1.5;
		font-weight: 500;
		color: inherit;
	}

	@media (max-width: 767px) {
		.ptitle {
			--cut: 1.5rem;
			padding-block: var(--s-6) calc(var(--s-6) + var(--cut));
		}
		.ptitle__inner {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-4);
		}
		.ptitle__inner :global(.ptitle__art) {
			order: -1;
			width: 150px;
			justify-self: end;
		}
	}
</style>
