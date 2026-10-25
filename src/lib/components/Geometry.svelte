<script lang="ts">
	/**
	 * The site's decorative geometry: circle, square, triangle and the diagonal, drawn in
	 * the three primaries and ink. Purely ornamental — hidden from assistive tech — and
	 * every colour is a design token, so the figures retheme with app.css.
	 *
	 * `hero`   — the square composition beside the home page greeting.
	 * `band`   — the wide composition at the right of a page-title poster.
	 * `solo`   — the three shapes in a row, for the 404 and other quiet pages.
	 * `stripe` — a thin strip of the primaries, used above the footer.
	 */
	let {
		variant = 'hero',
		class: className = ''
	}: { variant?: 'hero' | 'band' | 'solo' | 'stripe'; class?: string } = $props();
</script>

{#if variant === 'hero'}
	<svg
		class="geo {className}"
		viewBox="0 0 400 400"
		aria-hidden="true"
		focusable="false"
		stroke="var(--ink)"
		stroke-width="6"
		stroke-linejoin="miter"
	>
		<rect x="190" y="30" width="180" height="180" fill="var(--blue)" />
		<circle cx="150" cy="170" r="110" fill="var(--yellow)" />
		<polygon points="60,380 220,170 380,380" fill="var(--red)" />
		<line x1="0" y1="400" x2="400" y2="0" stroke-width="10" />
		<circle cx="318" cy="118" r="28" fill="var(--paper)" />
		<g stroke-width="8">
			<line x1="40" y1="30" x2="120" y2="30" />
			<line x1="40" y1="52" x2="120" y2="52" />
			<line x1="40" y1="74" x2="120" y2="74" />
		</g>
	</svg>
{:else if variant === 'band'}
	<svg
		class="geo {className}"
		viewBox="0 0 520 240"
		aria-hidden="true"
		focusable="false"
		stroke="var(--ink)"
		stroke-width="6"
	>
		<circle cx="120" cy="120" r="96" fill="var(--paper)" />
		<rect x="170" y="30" width="170" height="170" fill="var(--red)" />
		<polygon points="300,220 410,40 520,220" fill="var(--yellow)" />
		<line x1="40" y1="240" x2="260" y2="0" stroke-width="10" />
		<circle cx="410" cy="150" r="22" fill="var(--blue)" />
	</svg>
{:else if variant === 'solo'}
	<svg
		class="geo {className}"
		viewBox="0 0 440 150"
		aria-hidden="true"
		focusable="false"
		stroke="var(--ink)"
		stroke-width="6"
	>
		<circle cx="75" cy="75" r="66" fill="var(--red)" />
		<rect x="168" y="9" width="132" height="132" fill="var(--yellow)" />
		<polygon points="316,141 370,9 424,141" fill="var(--blue)" />
	</svg>
{:else}
	<svg
		class="geo {className}"
		viewBox="0 0 120 12"
		preserveAspectRatio="none"
		aria-hidden="true"
		focusable="false"
	>
		<rect x="0" y="0" width="40" height="12" fill="var(--red)" />
		<rect x="40" y="0" width="40" height="12" fill="var(--yellow)" />
		<rect x="80" y="0" width="40" height="12" fill="var(--blue)" />
	</svg>
{/if}

<style>
	.geo {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
</style>
