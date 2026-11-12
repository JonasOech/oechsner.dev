<script lang="ts">
	/**
	 * Inline SVG icons, drawn on a 24px grid at stroke-width 1.5 (lucide geometry).
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
		| 'plus'
		| 'minus';

	let { name, size = 15 }: { name: IconName; size?: number } = $props();

	const paths: Record<IconName, string> = {
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
		// Four corner brackets facing out, and the same four turned inward — the maximise
		// toggle on a formula plate and on a post image.
		maximize: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
		minimize: 'M4 9h5V4M15 4v5h5M20 15h-5v5M9 20v-5H4',
		plus: 'M5 12h14M12 5v14',
		minus: 'M5 12h14'
	};
</script>

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
	<path d={paths[name]} />
</svg>
