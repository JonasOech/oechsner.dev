<script lang="ts">
	import { onMount } from 'svelte';

	type Hello = {
		siteName: string;
		channel: string;
		servedAt: string;
		edge: {
			colo: string;
			country: string | null;
			city: string | null;
			httpProtocol: string;
			tlsVersion: string;
		} | null;
	};

	let state = $state<{ status: 'loading' | 'ok' | 'error'; data?: Hello; error?: string }>({
		status: 'loading'
	});

	async function load() {
		state = { status: 'loading' };
		try {
			const res = await fetch('/api/hello');
			if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
			state = { status: 'ok', data: await res.json() };
		} catch (e) {
			state = { status: 'error', error: e instanceof Error ? e.message : String(e) };
		}
	}

	onMount(load);
</script>

<svelte:head>
	<title>oechsner.dev — SvelteKit on Cloudflare Pages</title>
	<meta name="description" content="A small SvelteKit demo deployed to Cloudflare Pages." />
</svelte:head>

<main>
	<header>
		<p class="eyebrow">SvelteKit · Cloudflare Pages</p>
		<h1>It runs at the edge.</h1>
		<p class="lede">
			The page below is static. The card is filled in by <code>/api/hello</code>, a SvelteKit
			server route that the Cloudflare adapter compiles into the Pages Worker.
		</p>
	</header>

	<section class="card" aria-live="polite">
		{#if state.status === 'loading'}
			<p class="muted">Asking the Worker…</p>
		{:else if state.status === 'error'}
			<p class="err">Could not reach the Worker: {state.error}</p>
		{:else if state.data}
			<dl>
				<div><dt>Site</dt><dd>{state.data.siteName}</dd></div>
				<div><dt>Channel</dt><dd>{state.data.channel}</dd></div>
				<div><dt>Served at</dt><dd>{state.data.servedAt}</dd></div>
				{#if state.data.edge}
					<div><dt>Data centre</dt><dd>{state.data.edge.colo}</dd></div>
					<div>
						<dt>Request from</dt>
						<dd>{[state.data.edge.city, state.data.edge.country].filter(Boolean).join(', ') || '—'}</dd>
					</div>
					<div><dt>Protocol</dt><dd>{state.data.edge.httpProtocol} · {state.data.edge.tlsVersion}</dd></div>
				{:else}
					<div>
						<dt>Edge</dt>
						<dd class="muted">not on the Workers runtime — try <code>npm run preview</code></dd>
					</div>
				{/if}
			</dl>
		{/if}
		<button onclick={load} disabled={state.status === 'loading'}>Ask again</button>
	</section>

	<footer>
		<p>
			Push to <code>main</code> and GitHub Actions deploys this to Cloudflare Pages. See
			<code>README.md</code>.
		</p>
	</footer>
</main>

<style>
	main {
		max-width: 44rem;
		margin: 0 auto;
		padding: 4rem 1.5rem;
		display: grid;
		gap: 2.5rem;
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	h1 {
		margin: 0 0 1rem;
		font-size: clamp(2rem, 6vw, 3rem);
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.lede {
		margin: 0;
		color: var(--muted);
		font-size: 1.05rem;
		line-height: 1.6;
	}

	.card {
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 1.5rem;
		background: var(--panel);
		display: grid;
		gap: 1.25rem;
	}

	dl {
		margin: 0;
		display: grid;
		gap: 0.6rem;
	}

	dl > div {
		display: grid;
		grid-template-columns: 9rem 1fr;
		gap: 1rem;
		align-items: baseline;
	}

	@media (max-width: 30rem) {
		dl > div {
			grid-template-columns: 1fr;
			gap: 0.15rem;
		}
	}

	dt {
		color: var(--muted);
		font-size: 0.85rem;
	}

	dd {
		margin: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.9rem;
		overflow-wrap: anywhere;
	}

	button {
		justify-self: start;
		font: inherit;
		font-size: 0.9rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background: var(--line);
	}

	button:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.muted {
		color: var(--muted);
		margin: 0;
	}

	.err {
		color: #e5484d;
		margin: 0;
	}

	footer p {
		margin: 0;
		color: var(--muted);
		font-size: 0.85rem;
	}

	code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.9em;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 0.05em 0.35em;
	}
</style>
