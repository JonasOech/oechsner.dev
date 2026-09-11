<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { betaFeatures, type BetaStatus } from '$lib/data/beta';

	// Inlined at build time (vite.config.ts): true everywhere except the production `main`
	// build, so the gallery's contents never reach oechsner.dev/beta.
	const visible = __BETA__;

	const features = $derived(
		[...betaFeatures].sort((a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0))
	);

	const statusLabel: Record<BetaStatus, string> = {
		proposed: 'Proposed',
		'in-review': 'In review',
		accepted: 'Accepted'
	};

	const dateFmt = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
	const formatDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`));
</script>

<Seo title="Beta" description="A preview surface for work-in-progress features, before they reach the site." />

<svelte:head>
	<!-- This surface is never meant to be found or indexed, on any deployment. -->
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container beta">
	{#if !visible}
		<!-- Production build: the route exists but stays deliberately empty. -->
		<section class="stub">
			<h1 class="stub__title">Nothing here</h1>
			<p class="stub__body">
				<code>/beta</code> is a review surface for features still being tried out. It only shows
				anything on preview deployments — never on the live site.
			</p>
		</section>
	{:else}
		<header class="head">
			<p class="kicker">Preview only</p>
			<h1 class="head__title">Beta</h1>
			<p class="head__lede">
				Work-in-progress features, parked here to be looked at before they reach the site.
				This page shows nothing on <code>oechsner.dev</code> — you're seeing it because this
				is a preview deployment.
			</p>
		</header>

		{#if features.length === 0}
			<p class="empty">No features in beta right now.</p>
		{:else}
			<ul class="grid" role="list">
				{#each features as f (f.slug)}
					<li class="card">
						<div class="card__top">
							<span class="badge" data-status={f.status}>{statusLabel[f.status]}</span>
							<time class="meta" datetime={f.added}>{formatDate(f.added)}</time>
						</div>

						<h2 class="card__title">
							{#if f.href}
								<a href={f.href}>{f.title}</a>
							{:else}
								{f.title}
							{/if}
						</h2>

						<p class="card__summary">{f.summary}</p>

						{#if f.tags && f.tags.length}
							<div class="card__tags">
								{#each f.tags as tag (tag)}
									<span class="tag">{tag}</span>
								{/each}
							</div>
						{/if}

						<p class="meta card__author">{f.author}</p>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>

<style>
	.beta {
		padding-block: var(--s-9) var(--s-11);
	}

	.stub {
		max-width: var(--measure);
		padding-top: var(--s-8);
	}

	.stub__title {
		margin: 0 0 var(--s-3);
	}

	.stub__body {
		color: var(--text-secondary);
	}

	.head {
		max-width: var(--measure);
		margin-bottom: var(--s-8);
	}

	.kicker {
		margin: 0 0 var(--s-3);
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.head__title {
		margin: 0 0 var(--s-4);
	}

	.head__lede {
		margin: 0;
		color: var(--text-secondary);
	}

	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--s-5);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
	}

	.card {
		display: grid;
		gap: var(--s-3);
		align-content: start;
		padding: var(--s-5);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 10px;
		box-shadow: var(--shadow-1);
	}

	.card__top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-3);
	}

	.card__title {
		margin: 0;
		font-size: 1.25rem;
		line-height: 1.25;
	}

	.card__title a {
		color: inherit;
		text-decoration: none;
		background-image: linear-gradient(currentColor, currentColor);
		background-repeat: no-repeat;
		background-position: 0 100%;
		background-size: 0% 1px;
		transition: background-size var(--dur-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.card__title a:hover {
			background-size: 100% 1px;
		}
	}

	.card__title a:focus-visible {
		outline: none;
		border-radius: 3px;
		box-shadow: var(--focus-ring);
	}

	.card__summary {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9375rem;
	}

	.card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.card__author {
		margin: 0;
	}

	.badge {
		font-family: var(--font-sans);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.25em 0.6em;
		border-radius: 999px;
		border: 1px solid var(--line);
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.badge[data-status='in-review'] {
		color: var(--accent);
		border-color: var(--accent-dim);
		background: var(--accent-wash);
	}

	.badge[data-status='accepted'] {
		color: var(--text);
		border-color: var(--text-muted);
	}

	.empty {
		color: var(--text-secondary);
	}

	@media (max-width: 767px) {
		.beta {
			padding-block: var(--s-6) var(--s-9);
		}
	}
</style>
