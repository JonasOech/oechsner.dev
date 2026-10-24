<script lang="ts">
	/**
	 * One slate tile of the spread: a cover cropped to a circle, with the title in white
	 * serif laid across its left edge. On hover the circle swells and the label steps in.
	 */
	let { href, image, label, kicker }: { href: string; image?: string; label: string; kicker?: string } =
		$props();
</script>

<a class="tile" {href}>
	<span class="tile__circle" aria-hidden="true">
		{#if image}<img src={image} alt="" loading="lazy" decoding="async" />{/if}
	</span>
	<span class="tile__label">
		{#if kicker}<span class="tile__kicker">{kicker}</span>{/if}
		{label}
	</span>
</a>

<style>
	.tile {
		position: relative;
		flex: 1 1 0;
		min-height: 8.5rem;
		display: flex;
		align-items: center;
		padding: 1rem 1.25rem;
		overflow: hidden;
		color: var(--panel-slate-text);
		text-decoration: none;
		background: var(--panel-slate);
		transition: background-color 0.35s;
	}

	.tile:not(:first-child) {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.tile__circle {
		position: absolute;
		top: 50%;
		left: 58%;
		width: min(7rem, 46%);
		aspect-ratio: 1;
		border-radius: 50%;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.12);
		transform: translate(-50%, -50%);
		transition: transform 0.6s var(--ease-out);
	}

	.tile__circle img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Dimmed at rest so the white label laid across it stays legible. */
		opacity: 0.45;
		filter: grayscale(0.4);
		transition:
			opacity 0.4s,
			filter 0.4s;
	}

	.tile__label {
		position: relative;
		max-width: 62%;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.2;
		transition: transform 0.45s var(--ease-out);
	}

	.tile__kicker {
		display: block;
		margin-bottom: 0.2rem;
		font-family: var(--font-ui);
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.7;
	}

	@media (hover: hover) and (pointer: fine) {
		.tile:hover {
			background: var(--panel-slate-hover);
		}
		.tile:hover .tile__circle {
			transform: translate(-50%, -50%) scale(1.12);
		}
		.tile:hover .tile__circle img {
			opacity: 0.8;
			filter: none;
		}
		.tile:hover .tile__label {
			transform: translateX(6px);
		}
	}

	.tile:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px var(--panel-ice);
	}

	@media (max-width: 599px) {
		.tile:not(:first-child) {
			border-top: 0;
			border-left: 1px solid rgba(255, 255, 255, 0.1);
		}
	}
</style>
