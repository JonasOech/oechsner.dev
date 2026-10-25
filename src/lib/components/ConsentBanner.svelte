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
	/* Above nothing else, below the skip link. A hairline-topped strip on the page's own
	   background: it asks, it does not shout, and it never covers the text for long. */
	.consent {
		position: fixed;
		z-index: 90;
		inset: auto 0 0 0;
		background: var(--bg);
		border-top: 1px solid var(--line-strong);
		padding: var(--s-4) var(--gutter);
		padding-bottom: max(var(--s-4), env(safe-area-inset-bottom));
		animation: consent-fade var(--dur-base) var(--ease-out) both;
	}

	@keyframes consent-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.consent__panel {
		max-width: var(--measure);
		margin-inline: auto;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--s-3) var(--s-5);
	}

	.consent__text {
		display: grid;
		gap: var(--s-1);
	}

	.consent__copy {
		margin: 0;
		max-width: 62ch;
		font-size: 0.9375rem;
		line-height: 1.55;
		color: var(--text-secondary);
	}

	.consent__actions {
		display: flex;
		gap: var(--s-3);
	}

	.consent__actions .btn {
		min-width: 6rem;
	}

	@media (max-width: 767px) {
		.consent__panel {
			grid-template-columns: minmax(0, 1fr);
			align-items: start;
		}
	}

	@media (max-width: 479px) {
		.consent__actions {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		}
	}
</style>
