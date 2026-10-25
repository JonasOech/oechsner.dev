<script lang="ts">
	/**
	 * The brand mark: a double-ruled square holding a serif "J" and "O", the diaeresis of
	 * the Ö picked out in the accent. Inline so it takes the page's ink (`currentColor`)
	 * and the accent token instead of carrying colours of its own.
	 */
	let { size = 40 }: { size?: number } = $props();
</script>

<svg
	class="monogram"
	viewBox="0 0 48 48"
	width={size}
	height={size}
	aria-hidden="true"
	focusable="false"
>
	<rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="currentColor" stroke-width="1" />
	<rect
		x="3.5"
		y="3.5"
		width="41"
		height="41"
		fill="none"
		stroke="currentColor"
		stroke-width="0.5"
	/>
	<!-- J: a stem with a hooked foot, drawn as a path so it never depends on a font. -->
	<path
		d="M17.5 14.5h8M21.5 14.5v16.5c0 3.2-1.9 5-4.7 5-1.6 0-2.9-.6-3.8-1.7"
		fill="none"
		stroke="currentColor"
		stroke-width="2.2"
		stroke-linejoin="round"
	/>
	<!-- O: a slightly condensed ring. -->
	<ellipse
		cx="32.5"
		cy="29"
		rx="6.2"
		ry="7.4"
		fill="none"
		stroke="currentColor"
		stroke-width="2.2"
	/>
	<!-- The umlaut. -->
	<circle cx="29.7" cy="17.6" r="1.35" fill="var(--accent)" />
	<circle cx="35.3" cy="17.6" r="1.35" fill="var(--accent)" />
</svg>

<style>
	.monogram {
		flex: none;
		color: var(--text);
	}
</style>
