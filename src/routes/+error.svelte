<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
	<title>{page.status} — oechsner.dev</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container error grid">
	<p class="eyebrow enter" style="--i: 0">Error <span class="num">{page.status}</span></p>
	<div class="error__body">
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
</div>

<style>
	/* A page that says one thing, on the grid: the code hangs in the margin, the message
	   and the two ways out take the content columns. */
	.error {
		align-items: start;
		padding-top: var(--s-8);
		padding-bottom: var(--s-8);
	}

	.error > .eyebrow {
		grid-column: 1 / 4;
		padding-top: 0.6rem;
	}

	.error__body {
		grid-column: 4 / 11;
		display: grid;
		justify-items: start;
		gap: var(--s-5);
	}

	@media (max-width: 767px) {
		.error {
			padding-top: var(--s-6);
			row-gap: var(--s-3);
		}
		.error > .eyebrow,
		.error__body {
			grid-column: 1 / -1;
		}
	}
</style>
