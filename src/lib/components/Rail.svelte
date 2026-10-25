<script lang="ts">
	import type { Snippet } from 'svelte';
	import Window from '$lib/components/Window.svelte';

	/**
	 * A labelled section of a page. On this site that is a window: the label becomes the
	 * title bar, the content sits in the ruled body. The name and props are kept from the
	 * earlier "rail" layout so every page can keep using `<Rail label="…">`.
	 *
	 * `level` picks the heading rank — pass 1 when this window is the page's own title
	 * (Contact), leave it at 2 for sections within a page. `closeHref` makes the close box
	 * a link, which is how a page window offers a way back to the writing index.
	 */
	let {
		label,
		id,
		level = 2,
		closeHref,
		children
	}: {
		label: string;
		id?: string;
		wide?: boolean;
		level?: 1 | 2;
		closeHref?: string;
		children: Snippet;
	} = $props();
</script>

<Window title={label} {id} {level} {closeHref} closeLabel="Close window, back to writing">
	{@render children()}
</Window>
