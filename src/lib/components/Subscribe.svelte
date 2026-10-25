<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { feeds, site } from '$lib/data/site';
	import { trackFeed } from '$lib/track';

	/**
	 * The end-of-post invitation to follow the blog by feed. Copying the URL is the primary
	 * action rather than opening it: a browser shows a feed as a wall of raw XML, while a
	 * reader only ever wants the address pasted in. The two plain links stay for readers
	 * that register as a handler, and for anyone who wants to look.
	 */
	const feedUrl = `${site.url}${feeds.rss}`;

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(feedUrl);
		} catch {
			// No clipboard (insecure context, or permission refused): the URL is on screen
			// in the links below, so there is still a way to get it.
			return;
		}
		// Counted only once the clipboard actually took it — a refused permission is not
		// somebody subscribing.
		trackFeed('copy-url', 'post-footer');
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<aside class="subscribe" aria-labelledby="subscribe-title">
	<span class="subscribe__mark">
		<Icon name="rss" size={16} />
	</span>

	<div class="subscribe__text">
		<p class="label" id="subscribe-title">Follow along</p>
		<p class="subscribe__copy">
			New posts arrive in your feed reader, in full. Paste the feed URL into any reader.
		</p>
	</div>

	<div class="subscribe__actions">
		<button type="button" class="btn btn--secondary subscribe__copy-btn" onclick={copy}>
			<Icon name={copied ? 'check' : 'copy'} />
			<!-- Announced on change, so a screen reader hears the confirmation it cannot see. -->
			<span aria-live="polite">{copied ? 'Copied' : 'Copy feed URL'}</span>
		</button>

		<p class="meta subscribe__links">
			<a
				href={feeds.rss}
				type="application/rss+xml"
				data-sveltekit-reload
				onclick={() => trackFeed('open-rss', 'post-footer')}>RSS</a
			>
			<span aria-hidden="true">·</span>
			<a
				href={feeds.atom}
				type="application/atom+xml"
				data-sveltekit-reload
				onclick={() => trackFeed('open-atom', 'post-footer')}>Atom</a
			>
		</p>
	</div>
</aside>

<style>
	.subscribe {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--s-4) var(--s-5);
		padding: var(--s-5);
		background: var(--surface);
		border: 3px solid var(--ink);
		border-radius: 0;
		box-shadow: var(--shadow-2);
	}

	/* The accent is kept for the one mark that says "feed" — the rest of the block is the
	   site's ordinary surface, so it reads as part of the post's ending, not an advert. */
	.subscribe__mark {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0;
		color: var(--ink);
		background: var(--yellow);
		border: 3px solid var(--ink);
	}

	.subscribe__text {
		display: grid;
		gap: var(--s-1);
	}

	.subscribe__copy {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	.subscribe__actions {
		display: grid;
		justify-items: center;
		gap: var(--s-2);
	}

	/* Fixed to its wider label, so "Copied" does not make the button jump. */
	.subscribe__copy-btn {
		min-width: 10.5rem;
	}

	.subscribe__links {
		display: flex;
		gap: var(--s-2);
	}

	.subscribe__links a {
		color: var(--text-muted);
		text-decoration: underline;
		text-decoration-color: var(--line-strong);
		text-underline-offset: 3px;
		transition: color var(--dur-fast) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.subscribe__links a:hover {
			color: var(--ink);
			text-decoration-color: var(--accent);
		}
	}

	.subscribe__links a:active {
		color: var(--accent-dim);
	}

	.subscribe__links a:focus-visible {
		outline: none;
		border-radius: 0;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 767px) {
		.subscribe {
			grid-template-columns: auto minmax(0, 1fr);
		}

		.subscribe__actions {
			grid-column: 1 / -1;
			grid-template-columns: auto auto;
			justify-content: start;
			align-items: center;
			gap: var(--s-4);
		}
	}
</style>
