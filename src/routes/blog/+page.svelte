<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ArticleRow from '$lib/components/ArticleRow.svelte';
	import { reveal } from '$lib/actions/reveal';
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
	<!-- One rail, matching the reference blog page: the label sits beside the intro,
	     and the post list runs on below it in the same content column. -->
	<section class="rail blog">
		<h1 class="rail__label enter" style="--i: 0">Blog</h1>

		<div class="rail__body blog__body">
			<p class="lede enter" style="--i: 1">
				Notes on machine learning, neuro-symbolic reasoning, data-protection engineering, and the
				systems that have to hold all of it up. Mostly things I wish someone had written down before
				I started.
			</p>

			{#if allTags.length}
				<div class="tag-row enter blog__filter" style="--i: 2" role="group" aria-label="Filter posts by tag">
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

			<div class="blog__posts" aria-live="polite" use:reveal={{ stagger: true }}>
				{#if shown.length === 0}
					<p class="empty">Nothing tagged “{activeTag}” yet.</p>
				{:else}
					{#key activeTag}
						<ArticleRow post={featured} featured />
						{#each rest as post (post.slug)}
							<ArticleRow {post} />
						{/each}
					{/key}
				{/if}
			</div>
		</div>
	</section>
</div>

<style>
	.blog {
		padding-top: var(--s-9);
	}

	.blog__body {
		max-width: var(--measure);
	}

	.blog__filter {
		margin-top: var(--s-5);
	}

	.blog__posts {
		display: grid;
		gap: var(--s-2);
		margin-top: var(--s-10);
	}

	.empty {
		color: var(--text-muted);
	}

	@media (max-width: 767px) {
		.blog {
			padding-top: var(--s-6);
		}
		.blog__posts {
			margin-top: var(--s-8);
		}
	}
</style>
