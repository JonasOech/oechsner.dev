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
	/* A closing paragraph under a hairline, not a card. */
	.subscribe {
		display: grid;
		gap: var(--s-3);
		padding-top: var(--s-5);
		border-top: 1px solid var(--line);
	}

	.subscribe__mark {
		display: none;
	}

	.subscribe__text {
		display: grid;
		gap: var(--s-1);
	}

	.subscribe__copy {
		margin: 0;
		color: var(--text-secondary);
		text-wrap: pretty;
	}

	.subscribe__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3) var(--s-5);
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
		color: var(--accent);
	}

	.subscribe__links a:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}
</style>
