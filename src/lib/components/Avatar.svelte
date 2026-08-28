<script lang="ts">
	/**
	 * The circular portrait the Elevate hero and footer are built around.
	 *
	 * There is no photo in the repo yet, so this falls back to a typeset monogram —
	 * deliberately not a grey placeholder block (DESIGN.md §8, Don't #7).
	 *
	 * TODO(jonas): drop a square photo at `static/img/avatar.jpg` and set
	 * `src="/img/avatar.jpg"` on the two usages (Hero + Footer) to switch it on.
	 */
	let {
		size = 64,
		src,
		alt = 'Jonas Öchsner',
		initials = 'JÖ'
	}: { size?: number; src?: string; alt?: string; initials?: string } = $props();
</script>

<span class="avatar" style="--size: {size}px" aria-hidden={src ? undefined : 'true'}>
	{#if src}
		<img {src} {alt} width={size} height={size} loading="lazy" decoding="async" />
	{:else}
		<span class="avatar__mono">{initials}</span>
	{/if}
</span>

<style>
	.avatar {
		display: inline-grid;
		place-items: center;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		overflow: hidden;
		background:
			radial-gradient(120% 120% at 30% 20%, var(--surface-hover), var(--surface) 60%),
			var(--surface);
		border: 1px solid var(--line-strong);
		box-shadow: var(--shadow-2), var(--shadow-inset);
		flex: none;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar__mono {
		font-family: var(--font-display);
		font-size: calc(var(--size) * 0.36);
		font-weight: 400;
		letter-spacing: 0.04em;
		color: var(--text-secondary);
		line-height: 1;
		/* Optical centring: the serif sits slightly high on the cap line. */
		transform: translateY(0.02em);
		user-select: none;
	}
</style>
