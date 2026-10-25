<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
	<title>{page.status} — oechsner.dev</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container error">
	<p class="eyebrow enter" style="--i: 0">Error {page.status}</p>
	<h1 class="hero-title enter" style="--i: 1">
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

<style>
	.error {
		display: grid;
		justify-items: start;
		gap: var(--s-5);
		padding-top: var(--s-8);
		padding-bottom: var(--s-8);
	}

	.error .hero-title {
		font-size: clamp(3rem, 12vw, 8rem);
		padding: 0.1em 0.25em 0.15em;
		background: var(--pink);
		border: var(--bw) solid var(--ink);
		box-shadow: var(--shadow-4);
		transform: rotate(-1.5deg);
	}

	.lede {
		max-width: 46ch;
	}

	@media (max-width: 767px) {
		.error {
			padding-top: var(--s-6);
		}
	}
</style>
