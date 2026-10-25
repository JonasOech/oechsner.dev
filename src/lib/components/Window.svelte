<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Action, ActionReturn } from 'svelte/action';
	import { reveal } from '$lib/actions/reveal';

	/**
	 * A window on the desktop: pinstriped title bar, close box, ruled body. The chrome
	 * itself (`.win*`) is global CSS in app.css so the footer, consent dialog and error
	 * alert can use it without importing this component.
	 *
	 * The title is the window's heading — `level` picks its rank (1 when the window is the
	 * page's own title, 2 for sections inside a page). The close box is a real link when
	 * `closeHref` is given and a plain decoration otherwise; it carries `closeLabel` for
	 * screen readers.
	 */
	let {
		title,
		id,
		level = 2,
		closeHref,
		closeLabel = 'Close window',
		heading = true,
		flush = false,
		enter,
		status,
		children
	}: {
		title: string;
		id?: string;
		level?: 1 | 2;
		closeHref?: string;
		closeLabel?: string;
		/** false renders the title as plain text, for a window whose real heading is inside it (a post). */
		heading?: boolean;
		flush?: boolean;
		/** Above-the-fold windows draw in on load (staggered by this index) instead of waiting to scroll into view. */
		enter?: number;
		status?: Snippet;
		children: Snippet;
	} = $props();

	const maybeReveal: Action<HTMLElement, boolean> = (node, on) => {
		if (!on) return;
		const result = reveal(node, undefined) as ActionReturn | undefined;
		return { destroy: () => result?.destroy?.() };
	};

	const uid = $props.id();
	const labelId = $derived(id ? `${id}-label` : `${uid}-label`);
</script>

<section
	class="win"
	class:enter={enter !== undefined}
	style:--i={enter}
	{id}
	use:maybeReveal={enter === undefined}
	aria-labelledby={labelId}
>
	<div class="win__bar">
		{#if closeHref}
			<a class="win__close" href={closeHref} aria-label={closeLabel}></a>
		{:else}
			<span class="win__close" aria-hidden="true"></span>
		{/if}
		{#if !heading}
			<p class="win__title" id={labelId}>{title}</p>
		{:else if level === 1}
			<h1 class="win__title" id={labelId}>{title}</h1>
		{:else}
			<h2 class="win__title" id={labelId}>{title}</h2>
		{/if}
		<span class="win__zoom" aria-hidden="true"></span>
	</div>
	<div class="win__body" class:win__body--flush={flush}>
		{@render children()}
	</div>
	{#if status}
		<div class="win__status">
			{@render status()}
		</div>
	{/if}
</section>
