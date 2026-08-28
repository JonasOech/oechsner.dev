<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import ArticleRow from '$lib/components/ArticleRow.svelte';
	import { posts, allTags } from '$lib/posts';

	let activeTag = $state<string | null>(null);

	const shown = $derived(activeTag ? posts.filter((p) => p.tags.includes(activeTag!)) : posts);
	const featured = $derived(shown[0]);
	const rest = $derived(shown.slice(1));

	function toggleTag(tag: string) {
		activeTag = activeTag === tag ? null : tag;
	}
</script>

<Seo
	title="Blog"
	description="Notes on machine learning, neuro-symbolic reasoning, data protection engineering and the systems underneath them."
/>

<div class="container">
	<section class="intro">
		<p class="eyebrow enter" style="--i: 0">Writing</p>
		<p class="lede enter" style="--i: 1">
			Notes on machine learning, neuro-symbolic reasoning, data-protection engineering, and the
			systems that have to hold all of it up. Mostly things I wish someone had written down before
			I started.
		</p>

		{#if allTags.length}
			<div class="tag-row enter" style="--i: 2" role="group" aria-label="Filter posts by tag">
				{#each allTags as tag (tag)}
					<button
						type="button"
						class="tag"
						aria-pressed={activeTag === tag}
						onclick={() => toggleTag(tag)}
					>
						{tag}
					</button>
				{/each}
			</div>
		{/if}
	</section>

	<Rail label="Blog" id="posts" wide>
		{#if shown.length === 0}
			<p class="empty">
				{#if activeTag}
					Nothing tagged “{activeTag}” yet.
				{:else}
					No posts yet — the first one is being written.
				{/if}
			</p>
		{:else}
			<div class="articles">
				{#key activeTag}
					<ArticleRow post={featured} featured />
					{#each rest as post (post.slug)}
						<ArticleRow {post} />
					{/each}
				{/key}
			</div>
		{/if}
	</Rail>
</div>

<style>
	.intro {
		display: grid;
		gap: var(--s-5);
		justify-items: start;
		padding-top: var(--s-9);
		padding-bottom: var(--gap-hero);
		max-width: var(--measure);
	}

	.articles {
		display: grid;
		gap: var(--s-2);
		max-width: var(--measure);
	}

	.empty {
		color: var(--text-muted);
	}

	@media (max-width: 767px) {
		.intro {
			padding-top: var(--s-6);
		}
	}
</style>
