<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import ArticleRow from '$lib/components/ArticleRow.svelte';
	import { site, cvPath } from '$lib/data/site';
	import { about } from '$lib/data/resume';
	import { posts } from '$lib/posts';

	const latest = posts.slice(0, 4);
</script>

<Seo title={site.name} />

<div class="container">
	<section class="hero">
		<div class="enter" style="--i: 0"><Avatar size={64} /></div>
		<p class="eyebrow enter" style="--i: 1">{site.eyebrow}</p>
		<h1 class="hero-title enter" style="--i: 2">{site.headline}</h1>
		<div class="btn-row hero__actions enter" style="--i: 3">
			<a class="btn btn--primary" href="/contact">
				<Icon name="arrow-right" />
				Get In Touch
			</a>
			<a class="btn btn--secondary" href={cvPath} download>
				<Icon name="arrow-down" />
				Download CV
			</a>
		</div>
	</section>

	<Rail label="About" id="about">
		<div class="stack">
			<p>{about[0]}</p>
			<p>{about[2]}</p>
		</div>
		<p class="about__more">
			<a class="link" href="/about">Read the longer version</a>
		</p>
	</Rail>

	{#if latest.length}
		<Rail label="Articles" id="articles" wide>
			<div class="articles">
				{#each latest as post (post.slug)}
					<ArticleRow {post} />
				{/each}
			</div>
			<div class="articles__more">
				<a class="btn btn--secondary" href="/blog">
					<Icon name="arrow-right" />
					Read more
				</a>
			</div>
		</Rail>
	{/if}
</div>

<style>
	.hero {
		display: grid;
		justify-items: center;
		text-align: center;
		gap: var(--s-5);
		padding-top: var(--s-10);
		padding-bottom: var(--gap-hero);
	}

	.hero-title {
		max-width: 18ch;
	}

	.hero__actions {
		margin-top: var(--s-2);
		justify-content: center;
	}

	.about__more {
		margin-top: var(--s-5);
	}

	.articles {
		display: grid;
		gap: var(--s-2);
		max-width: var(--measure);
	}

	.articles__more {
		display: flex;
		justify-content: center;
		margin-top: var(--s-7);
		max-width: var(--measure);
	}

	@media (max-width: 767px) {
		.hero {
			padding-top: var(--s-7);
		}
		.hero-title {
			max-width: none;
		}
	}
</style>
