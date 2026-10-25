<script lang="ts">
	/**
	 * Inline SVG icons. Two families, one component:
	 *  - UI icons: drawn on a 24px grid at stroke-width 1.5 (lucide geometry).
	 *  - Glyphs (folder, document, disk …): 32px pixel-grid desktop icons, drawn with
	 *    crisp edges in `currentColor` over `--paper` — the files of the Desktop metaphor.
	 * No emoji, no icon font, no runtime dependency — DESIGN.md §8, Don't #6.
	 */
	type IconName =
		| 'arrow-right'
		| 'arrow-left'
		| 'arrow-down'
		| 'mail'
		| 'github'
		| 'linkedin'
		| 'external'
		| 'nerd'
		| 'circle'
		| 'rss'
		| 'copy'
		| 'check'
		| 'maximize'
		| 'minimize'
		| GlyphName;

	/** The desktop icons — see `glyphs` below. */
	type GlyphName = 'folder' | 'doc' | 'pdf' | 'rss-file' | 'disk' | 'mail-file' | 'alert';

	let { name, size = 15 }: { name: IconName; size?: number } = $props();

	type LineName = Exclude<IconName, GlyphName>;
	const paths: Record<LineName, string> = {
		'arrow-right': 'M5 12h14M13 6l6 6-6 6',
		'arrow-left': 'M19 12H5M11 18l-6-6 6-6',
		'arrow-down': 'M12 5v14M6 13l6 6 6-6',
		mail: 'M22 7 13.03 12.7a2 2 0 0 1-2.06 0L2 7M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
		github:
			'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2',
		linkedin:
			'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM6 9H2v12h4zM4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
		external: 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
		// A face in glasses, for the nerdyness scale. Head, two lenses, a short bridge and a
		// mouth — no pupils: at 15px they close up inside the lenses and the face goes muddy.
		// The lenses are deliberately oversized (r 3.2 on a r 9 head), because the glasses are
		// the whole signal and anything smaller reads as a blank circle at this size.
		nerd: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M8.3 7.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4M15.7 7.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4M11.5 11h1M9 16.8c1.8 1.3 4.2 1.3 6 0',
		// The empty slot of that scale: the same head circle with nothing inside it.
		circle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
		rss: 'M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
		copy: 'M10 8h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2zM16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3',
		check: 'M20 6 9 17l-5-5',
		// Two corners pushed apart, and the same two pulled back together — the maximise
		// toggle on a formula plate.
		maximize: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
		minimize: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7'
	};

	// 32px grid, 2px strokes on whole pixels, fills from the two inks only. The markup is a
	// constant in this file, never user input, so `{@html}` is safe here.
	const P = 'fill="var(--paper)" stroke="currentColor" stroke-width="2" stroke-linejoin="miter"';
	const K = 'fill="currentColor"';
	const glyphs: Record<GlyphName, string> = {
		folder: `<path d="M3 7h9l3 3h14v18H3z" ${P}/><path d="M3 13h26" stroke="currentColor" stroke-width="2"/><path d="M5 26h22" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"/>`,
		doc: `<path d="M7 3h14l6 6v20H7z" ${P}/><path d="M21 3v6h6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 15h12M11 19h12M11 23h8" stroke="currentColor" stroke-width="2"/>`,
		pdf: `<path d="M7 3h14l6 6v20H7z" ${P}/><path d="M21 3v6h6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="7" y="16" width="20" height="9" ${K}/><path d="M11 20h3M17 20h3M22 20h2" stroke="var(--paper)" stroke-width="2"/>`,
		'rss-file': `<path d="M7 3h14l6 6v20H7z" ${P}/><path d="M21 3v6h6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="11" y="23" width="3" height="3" ${K}/><path d="M11 19a7 7 0 0 1 7 7M11 14a12 12 0 0 1 12 12" fill="none" stroke="currentColor" stroke-width="2"/>`,
		disk: `<path d="M3 3h22l4 4v22H3z" ${P}/><rect x="9" y="3" width="13" height="9" ${K}/><rect x="17" y="5" width="3" height="5" fill="var(--paper)"/><rect x="7" y="17" width="18" height="12" ${P}/><path d="M10 21h12M10 25h12" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"/>`,
		'mail-file': `<path d="M3 7h26v19H3z" ${P}/><path d="M3 7l13 11L29 7" fill="none" stroke="currentColor" stroke-width="2"/>`,
		alert: `<path d="M11 3h10l8 8v10l-8 8H11l-8-8V11z" ${P}/><rect x="15" y="9" width="3" height="10" ${K}/><rect x="15" y="22" width="3" height="3" ${K}/>`
	};

	const isGlyph = $derived(name in glyphs);
</script>

{#if isGlyph}
	<svg
		width={size}
		height={size}
		viewBox="0 0 32 32"
		shape-rendering="crispEdges"
		aria-hidden="true"
		focusable="false"
	>
		{@html glyphs[name as GlyphName]}
	</svg>
{:else}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		<path d={paths[name as LineName]} />
	</svg>
{/if}
