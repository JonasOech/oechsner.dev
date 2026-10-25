<script lang="ts">
	import { consent, decide, initConsent } from '$lib/consent.svelte';

	/**
	 * The one thing on the site that asks the visitor for something.
	 *
	 * It is deliberately *not* a modal: nothing is behind a scrim, focus is not trapped and
	 * the page is readable and navigable while it sits there. A consent wall would be the
	 * wrong trade for a blog — and it is only defensible to let the banner be ignored
	 * because ignoring it means no analytics, which is what `consent.svelte.ts` guarantees.
	 *
	 * The two buttons carry the same styling on purpose. German supervisory authorities
	 * read a visually louder "accept" as steering the choice, so neither one is the primary
	 * button it would otherwise be under DESIGN.md §4.
	 */
	$effect(() => {
		// Reads no reactive state, so it runs exactly once, on mount — which is the point:
		// `localStorage` does not exist while the page is being prerendered.
		initConsent();
	});
</script>

{#if consent.ready && consent.asking}
	<div class="consent" role="region" aria-labelledby="consent-title">
		<div class="consent__panel">
			<div class="consent__text">
				<p class="label" id="consent-title">Analytics</p>
				<p class="consent__copy">
					I use Google Analytics to track how people use this site. No Cookies are used unless you allow it. Further information is available under
					<a class="link" href="/datenschutz">Datenschutz</a>.
				</p>
			</div>

			<div class="consent__actions">
				<button type="button" class="btn btn--secondary" onclick={() => decide('granted')}>
					Allow
				</button>
				<button type="button" class="btn btn--secondary" onclick={() => decide('denied')}>
					Decline
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Above the sticky header (50), below the skip link (100) — the one control that must
	   stay reachable no matter what else is on screen. */
	.consent {
		position: fixed;
		z-index: 90;
		inset: auto 0 0 0;
		padding: var(--s-4) var(--gutter);
		/* Clears the home indicator on a phone without padding the panel on a desktop. */
		padding-bottom: max(var(--s-4), env(safe-area-inset-bottom));
		pointer-events: none;
	}

	.consent__panel {
		pointer-events: auto;
		max-width: var(--container);
		margin-inline: auto;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--s-4) var(--s-6);
		padding: var(--s-5);
		border: var(--bw) solid var(--ink);
		background: var(--lilac);
		box-shadow: var(--shadow-3);
		animation: consent-rise var(--dur-base) var(--ease-out) both;
	}

	@keyframes consent-rise {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	.consent__text {
		display: grid;
		gap: var(--s-2);
	}

	.consent__copy {
		margin: 0;
		max-width: 62ch;
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--ink);
		font-weight: 500;
	}

	.consent__actions {
		display: flex;
		gap: var(--s-3);
	}

	/* Both buttons sized to the wider label so the pair is symmetric — the same reason
	   they share a variant: nothing here should look like the answer being suggested. */
	.consent__actions .btn {
		min-width: 7rem;
		justify-content: center;
	}

	@media (max-width: 767px) {
		.consent__panel {
			grid-template-columns: minmax(0, 1fr);
			align-items: start;
			padding: var(--s-4);
			box-shadow: var(--shadow-2);
		}
	}

	@media (max-width: 479px) {
		.consent__actions {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: var(--s-3);
		}
	}
</style>
