<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import Ransom from '$lib/components/Ransom.svelte';
</script>

<svelte:head>
	<title>{page.status} — oechsner.dev</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container error">
	<p class="error__stamp enter" style="--i: 0; --r0: 10deg">
		<span class="stamp">Error {page.status}</span>
	</p>
	<h1 class="error__title enter" style="--i: 1">
		<Ransom text={page.status === 404 ? 'Nothing here.' : 'Something broke.'} />
	</h1>
	<p class="lede error__lede slip taped taped--one enter" style="--i: 2">
		{page.error?.message ?? 'The page you were looking for does not exist.'}
	</p>
	<p class="scrawl error__note enter" style="--i: 3" aria-hidden="true">
		somebody cut this page out.
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
		justify-items: center;
		text-align: center;
		gap: var(--s-5);
		padding-top: var(--s-8);
		padding-bottom: var(--s-8);
	}

	.error__title {
		font-size: clamp(2.75rem, 10vw, 5.5rem);
		line-height: 1.35;
		text-transform: none;
	}

	.error__lede {
		padding: var(--s-4) var(--s-5);
		max-width: 46ch;
		font-family: var(--font-type);
		font-size: 1.0625rem;
		color: var(--text);
		transform: rotate(-0.8deg);
	}

	.error__note {
		font-size: 1.25rem;
		transform: rotate(2deg);
	}

	@media (max-width: 767px) {
		.error {
			padding-top: var(--s-6);
		}
	}
</style>
