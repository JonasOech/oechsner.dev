<!--
	Marks a post whose project is still live, from a post's `running: true` front-matter
	field. Sits inline right after a post title: a yellow status dot with a slow ring
	breathing out of it, then "Experiment Running", so the state never rests on colour or
	motion alone.

	This is the one looping animation on the site (DESIGN.md §7, special effect 3). It moves
	only `transform` and `opacity` on a pseudo-element, and under reduced motion the ring is
	removed outright, leaving a still dot.
-->
<span class="running">
	<span class="running__dot" aria-hidden="true"></span>
	Experiment Running
</span>

<style>
	/* Lives inside headings of three different faces and sizes, so it sets its own type
	   rather than inheriting any of it — meta styling, DM Sans, in every context. The
	   explicit colour also matters for the lead title, which paints its text with
	   `background-clip: text` and a transparent colour. */
	.running {
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		margin-left: 0.75em;
		vertical-align: middle;
		white-space: nowrap;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 700;
		font-style: normal;
		line-height: 1.4;
		letter-spacing: 0.01em;
		text-transform: none;
		color: var(--text-muted);
	}

	.running__dot {
		position: relative;
		width: 0.4375rem;
		height: 0.4375rem;
		border-radius: 50%;
		background: var(--live);
		flex: none;
	}

	.running__dot::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: var(--live);
		opacity: 0;
		animation: running-ping 2.6s var(--ease-out) infinite;
	}

	/* The ring finishes at 70% and the rest of the cycle is stillness, so it reads as a
	   slow pulse rather than a constant flicker. */
	@keyframes running-ping {
		0% {
			transform: scale(1);
			opacity: 0.55;
		}
		70%,
		100% {
			transform: scale(2.8);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.running__dot::after {
			animation: none;
		}
	}
</style>
