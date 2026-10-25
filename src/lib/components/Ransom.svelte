<script lang="ts">
	/**
	 * A title set as a ransom note: every word is its own cut-out, in one of six
	 * type-and-paper combinations, each a little crooked. The words stay real text in
	 * reading order with ordinary spaces between them, so it wraps, selects and is read
	 * aloud like any heading — only the paper changes.
	 *
	 * `offset` shifts which cut-out the first word gets, so two titles on one page do not
	 * start with the same piece of paper.
	 */
	let { text, offset = 0 }: { text: string; offset?: number } = $props();

	const words = $derived(text.split(/\s+/).filter(Boolean));
</script>

<span class="ransom">
	{#each words as word, i (i)}
		<span class="rw rw--{(i + offset) % 6}">{word}</span>{' '}
	{/each}
</span>

<style>
	.ransom {
		display: inline;
		line-height: 1.5;
	}

	/* Every cut-out is a box with a hard edge and a slight shadow, as if lifted off a
	   lighter sheet. `em` units so the whole set scales with the headline. */
	.rw {
		display: inline-block;
		margin: 0.04em 0.03em;
		padding: 0.06em 0.22em 0.02em;
		line-height: 1.1;
		box-shadow: 0.06em 0.07em 0 rgba(var(--text-rgb), 0.35);
		overflow-wrap: anywhere;
		transition: transform var(--dur-base) var(--ease-snap);
	}

	.rw--0 {
		font-family: var(--font-head);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		background: var(--text);
		color: var(--paper);
		transform: rotate(-2.2deg);
	}

	.rw--1 {
		font-family: var(--font-type);
		font-size: 0.78em;
		background: var(--surface);
		color: var(--text);
		border: 0.05em solid var(--text);
		transform: rotate(1.6deg) translateY(-0.04em);
	}

	.rw--2 {
		font-family: var(--font-head);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		background: var(--accent);
		color: var(--text);
		transform: rotate(1.2deg);
	}

	.rw--3 {
		font-family: var(--font-body);
		font-weight: 800;
		font-style: italic;
		font-size: 0.9em;
		background: var(--surface);
		color: var(--blue);
		transform: rotate(-1.4deg) translateY(0.03em);
	}

	.rw--4 {
		font-family: var(--font-head);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		background: var(--blue);
		color: var(--paper);
		transform: rotate(2deg);
	}

	.rw--5 {
		font-family: var(--font-marker);
		font-size: 0.8em;
		background: var(--surface-hover);
		color: var(--text);
		transform: rotate(-1.6deg);
	}

	:global(a:hover) .rw,
	:global(a:focus-visible) .rw {
		transform: rotate(0deg);
	}
</style>
