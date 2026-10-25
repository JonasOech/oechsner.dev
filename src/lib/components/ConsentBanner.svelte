<script lang="ts">
	import { consent, decide, initConsent } from '$lib/consent.svelte';
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * The one thing on the site that asks the visitor for something.
	 *
	 * It is deliberately *not* a modal: nothing is behind a scrim, focus is not trapped and
	 * the page is readable and navigable while it sits there. A consent wall would be the
	 * wrong trade for a blog — and it is only defensible to let the banner be ignored
	 * because ignoring it means no analytics, which is what `consent.svelte.ts` guarantees.
	 *
	 * The two buttons carry the same styling on purpose. German supervisory authorities
	 * read a visually louder "accept" as steering the choice, so neither one gets the
	 * double-ringed default-button treatment it would otherwise earn under DESIGN.md §7.
	 */
	$effect(() => {
		// Reads no reactive state, so it runs exactly once, on mount — which is the point:
		// `localStorage` does not exist while the page is being prerendered.
		initConsent();
	});
</script>

{#if consent.ready && consent.asking}
	<div class="consent" role="region" aria-labelledby="consent-title">
		<div class="win consent__panel">
			<div class="win__bar">
				<span class="win__close" aria-hidden="true"></span>
				<p class="win__title" id="consent-title">Analytics</p>
				<span class="win__zoom" aria-hidden="true"></span>
			</div>

			<div class="win__body consent__body">
				<span class="consent__icon" aria-hidden="true"><Icon name="alert" size={40} /></span>
				<p class="consent__copy">
					I use Google Analytics to track how people use this site. No Cookies are used unless you allow it. Further information is available under
					<a class="link" href="/datenschutz">Datenschutz</a>.
				</p>

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
	</div>
{/if}

<style>
	/* Above the menu bar (50), below the skip link (100) — the one control that must
	   stay reachable no matter what else is on screen. */
	.consent {
		position: fixed;
		z-index: 90;
		inset: auto 0 0 0;
		padding: var(--s-3) var(--gutter);
		/* Clears the home indicator on a phone without padding the panel on a desktop. */
		padding-bottom: max(var(--s-3), env(safe-area-inset-bottom));
		pointer-events: none;
	}

	/* An alert dialog, not a modal: it is the same window chrome, so it reads as part of
	   the desktop and nothing is dimmed behind it. */
	.consent__panel {
		pointer-events: auto;
		max-width: 52rem;
		margin-inline: auto;
		animation: consent-open var(--dur-base) steps(4, end) both;
	}

	@keyframes consent-open {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.consent__body {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--s-3) var(--s-5);
		padding: var(--s-4) var(--s-5);
	}

	.consent__copy {
		margin: 0;
		max-width: 62ch;
		font-size: 1rem;
		line-height: 1.6;
		color: var(--text);
	}

	.consent__actions {
		display: flex;
		gap: var(--s-3);
	}

	/* Both buttons carry the same styling on purpose: no default ring on either. German
	   supervisory authorities read a visually louder "accept" as steering the choice. */
	.consent__actions .btn {
		min-width: 6.5rem;
		justify-content: center;
	}

	@media (max-width: 767px) {
		.consent__body {
			grid-template-columns: auto minmax(0, 1fr);
		}
		.consent__actions {
			grid-column: 1 / -1;
		}
		.consent__actions .btn {
			flex: 1;
		}
	}
</style>
