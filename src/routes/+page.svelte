<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { contacts, cvPath, site } from '$lib/data/site';
	import { about } from '$lib/data/resume';
	import { posts } from '$lib/posts';

	/**
	 * After alexwang.ai: the name and the owl live in the header; below them, a short About
	 * column beside the writing. Posts that opted into the lead slot (`hero: true`) are the
	 * selected writings; the rest follow as all posts.
	 */
	const selected = posts.filter((p) => p.hero);
	const rest = posts.filter((p) => !p.hero);

	const github = contacts.find((c) => c.label === 'GitHub');
	const linkedin = contacts.find((c) => c.label === 'LinkedIn');
	const email = contacts.find((c) => c.primary);

	const short = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		});
</script>

<Seo title={site.name} />

<div class="container ink-home">
	<section class="ink-about" aria-labelledby="ink-about">
		<h2 class="ink-section" id="ink-about">About</h2>
		<div class="ink-bio">
			<p>{about[0]}</p>
			<p>{about[2]}</p>
			<p>
				You can find me on
				{#if github}<a href={github.href}>GitHub</a>{/if}
				and
				{#if linkedin}<a href={linkedin.href}>LinkedIn</a>{/if}, read my
				<a href={cvPath} target="_blank" rel="noopener">CV</a>, or
				{#if email}<a href={email.href}>write to me</a>{/if}.
			</p>
		</div>
	</section>

	<section class="ink-writing" aria-labelledby="ink-selected">
		{#if selected.length}
			<h2 class="ink-section" id="ink-selected">Selected writings</h2>
			<ul class="ink-posts">
				{#each selected as post (post.slug)}
					<li class="ink-post">
						<time class="ink-post__date" datetime={post.date}>{short(post.date)}</time>
						<h3 class="ink-post__title"><a href="/blog/{post.slug}">{post.title}</a></h3>
						{#if post.summary}<span class="ink-post__excerpt">{post.summary}</span>{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#if rest.length}
			<h2 class="ink-section">All posts</h2>
			<ul class="ink-posts">
				{#each rest as post (post.slug)}
					<li class="ink-post">
						<time class="ink-post__date" datetime={post.date}>{short(post.date)}</time>
						<h3 class="ink-post__title"><a href="/blog/{post.slug}">{post.title}</a></h3>
						{#if post.summary}<span class="ink-post__excerpt">{post.summary}</span>{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.ink-home {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 4rem;
		margin-top: 6rem;
	}

	.ink-section {
		margin: 0 0 1.5rem;
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 400;
		color: var(--text-muted);
	}

	.ink-posts + .ink-section {
		margin-top: 1rem;
	}

	.ink-bio p {
		margin: 0 0 1.5rem;
		font-size: 1.2rem;
		line-height: 1.7;
		color: var(--text);
	}

	.ink-bio a,
	.ink-post__title a {
		color: var(--text);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: all 0.2s ease;
	}

	.ink-bio a {
		border-bottom-color: color-mix(in srgb, var(--accent) 45%, transparent);
	}

	@media (hover: hover) and (pointer: fine) {
		.ink-bio a:hover {
			color: var(--accent);
			border-bottom-color: var(--accent);
		}
		.ink-post__title a:hover {
			color: var(--accent);
			text-decoration: underline 1px;
			text-underline-offset: 0.2em;
		}
	}

	.ink-bio a:focus-visible,
	.ink-post__title a:focus-visible {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}

	.ink-posts {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.ink-post {
		margin-bottom: 2rem;
	}

	.ink-post__date {
		display: block;
		margin-bottom: 0.3rem;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.ink-post__title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--text);
	}

	.ink-post__excerpt {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.95rem;
		color: var(--text-muted);
	}

	@media (max-width: 960px) {
		.ink-home {
			margin-top: 2rem;
		}
	}

	@media (max-width: 768px) {
		.ink-home {
			grid-template-columns: 1fr;
			gap: 3rem;
		}
	}
</style>
