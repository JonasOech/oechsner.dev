<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
	<title>{page.status} — oechsner.dev</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<!-- The system alert: an icon, a sentence, a default button. -->
<div class="container error">
	<div class="win error__win enter" style="--i: 0">
		<div class="win__bar">
			<span class="win__close" aria-hidden="true"></span>
			<p class="win__title">Error {page.status}</p>
			<span class="win__zoom" aria-hidden="true"></span>
		</div>

		<div class="win__body error__body">
			<span class="error__icon" aria-hidden="true"><Icon name="alert" size={56} /></span>

			<div class="error__text">
				<h1 class="error__title">
					{page.status === 404 ? 'Nothing here.' : 'Something broke.'}
				</h1>
				<p class="error__lede">
					{page.error?.message ?? 'The page you were looking for does not exist.'}
				</p>
			</div>

			<div class="btn-row error__actions">
				<a class="btn btn--secondary" href="/about">
					<Icon name="arrow-right" />
					About &amp; portfolio
				</a>
				<a class="btn btn--primary" href="/">
					<Icon name="arrow-right" />
					Read the writing
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.error {
		padding-top: var(--s-9);
		padding-bottom: var(--s-6);
	}

	.error__win {
		max-width: 36rem;
		margin-inline: auto;
	}

	.error__body {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--s-4) var(--s-5);
		padding: var(--s-5);
	}

	.error__text {
		display: grid;
		gap: var(--s-3);
		align-content: start;
	}

	.error__title {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 5vw, 2.25rem);
		line-height: 1.1;
	}

	.error__lede {
		color: var(--text-secondary);
		max-width: 46ch;
	}

	.error__actions {
		grid-column: 1 / -1;
		justify-content: flex-end;
	}

	@media (max-width: 767px) {
		.error {
			padding-top: var(--s-6);
		}
	}

	@media (max-width: 479px) {
		.error__actions {
			flex-direction: column-reverse;
		}
	}
</style>
