<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import Geometry from '$lib/components/Geometry.svelte';
</script>

<svelte:head>
	<title>{page.status} — oechsner.dev</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container error">
	<div class="error__text">
		<p class="eyebrow enter" style="--i: 0">Error {page.status}</p>
		<h1 class="hero-title error__title enter" style="--i: 1">
			{page.status === 404 ? 'Nothing here.' : 'Something broke.'}
		</h1>
		<p class="lede enter" style="--i: 2">
			{page.error?.message ?? 'The page you were looking for does not exist.'}
		</p>
		<div class="btn-row enter" style="--i: 3">
			<a class="btn btn--primary" href="/">
				<Icon name="arrow-right" />
				Read the writing
			</a>
			<a class="btn btn--secondary" href="/about">
				<Icon name="arrow-right" />
				About &amp; portfolio
			</a>
		</div>
	</div>
	<Geometry variant="solo" class="error__art" />
</div>

<style>
	.error {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 380px);
		gap: var(--s-8);
		align-items: center;
		padding-top: var(--s-9);
		padding-bottom: var(--s-9);
	}

	.error__text {
		display: grid;
		gap: var(--s-5);
		justify-items: start;
	}

	.error__title {
		font-size: clamp(2.5rem, 8vw, 5rem);
		padding-bottom: var(--s-3);
		border-bottom: var(--rule-w-thick) solid var(--red);
	}

	.error :global(.error__art) {
		transform: rotate(-6deg);
	}

	@media (max-width: 767px) {
		.error {
			grid-template-columns: minmax(0, 1fr);
			padding-top: var(--s-6);
			gap: var(--s-7);
		}
		.error :global(.error__art) {
			order: -1;
			max-width: 260px;
		}
	}
</style>
