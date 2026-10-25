<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
	<title>{page.status} — oechsner.dev</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container error">
	<p class="error__code enter" style="--i: 0" aria-hidden="true">{page.status}</p>
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

	/* The status code is the index numeral, set as large as the grid allows. */
	.error__code {
		font-size: clamp(7rem, 30vw, 24rem);
		font-weight: 800;
		line-height: 0.8;
		letter-spacing: -0.07em;
		color: var(--accent);
		margin: 0;
	}

	.error .hero-title {
		font-size: clamp(2.5rem, 7vw, 5.5rem);
	}

	.lede {
		max-width: 46ch;
		font-size: 1.25rem;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
</style>
