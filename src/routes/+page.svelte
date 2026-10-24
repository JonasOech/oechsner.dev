<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { site, cvPath } from '$lib/data/site';
	import { about } from '$lib/data/resume';
	import { posts, formatDate } from '$lib/posts';

	/**
	 * After georgesiosi.com: a two-column front door. On the left a kicker, the first name
	 * in large copper italics, a serif lead and two pill buttons; on the right the writing
	 * as a numbered index of hairline-ruled rows, newest first. A ruled background
	 * paragraph closes the page.
	 *
	 * This puts the author's name in the largest type on the page, which DESIGN.md §11
	 * rules out for the original design. It is the signature move of the reference, so this
	 * exploration keeps it.
	 */
</script>

<Seo title={site.name} />

<div class="container wf-home">
	<div class="wf-grid">
		<section class="wf-intro" aria-labelledby="wf-name">
			<p class="wf-kicker">Applied computer science</p>
			<h1 class="wf-name" id="wf-name">Jonas<span aria-hidden="true">.</span></h1>
			<p class="wf-lead">
				I write about machine learning, statistics and distributed systems: the concepts behind
				the software, worked through until they make sense.
			</p>
			<p class="wf-proof">
				Applied CS at Uni Bamberg, currently at TU Dublin. Software engineer and AI tutor, looking
				for an internship in Dublin.
			</p>
			<div class="wf-doors">
				<a class="btn btn--primary" href={cvPath} target="_blank" rel="noopener">Download CV</a>
				<a class="btn btn--secondary" href="/contact">Get in touch</a>
			</div>
			<p class="wf-signal">53.3498° N · Dublin</p>
		</section>

		<section class="wf-shelves" aria-labelledby="wf-writing">
			<h2 class="wf-label" id="wf-writing">Explore the writing</h2>
			<ol class="wf-list">
				{#each posts as post, i (post.slug)}
					<li>
						<a class="wf-link" href="/blog/{post.slug}">
							<span class="wf-num">{String(i + 1).padStart(2, '0')}</span>
							<span class="wf-title">{post.title}</span>
							<span class="wf-desc">
								<span class="wf-desc-text">{post.summary}</span>
								<span class="wf-meta">{formatDate(post.date)} · {post.readingMinutes} min</span>
							</span>
							<span class="wf-arrow" aria-hidden="true">→</span>
						</a>
					</li>
				{/each}
			</ol>
		</section>
	</div>

	<section class="wf-background" aria-label="Background">
		<p>{about[0]}</p>
		<a class="wf-more" href="/about">
			Background, projects and CV
			<Icon name="arrow-right" size={14} />
		</a>
	</section>
</div>

<style>
	.wf-home {
		max-width: 1040px;
		padding-top: clamp(2.75rem, 7vw, 5.5rem);
	}

	.wf-grid {
		display: grid;
		gap: clamp(2.5rem, 6vw, 4.5rem);
	}

	@media (min-width: 900px) {
		.wf-grid {
			grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
			gap: clamp(3rem, 6vw, 5.5rem);
		}
	}

	.wf-intro {
		display: flex;
		flex-direction: column;
		min-width: 0;
		animation: wf-rise 0.7s both;
	}

	.wf-shelves {
		min-width: 0;
		animation: wf-rise 0.7s 0.18s both;
	}

	@keyframes wf-rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	.wf-kicker,
	.wf-label {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.72rem;
		font-weight: 700;
		line-height: 1.4;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.wf-label {
		margin-bottom: 6px;
	}

	.wf-name {
		margin: 18px 0 0;
		font-family: var(--font-display);
		font-size: clamp(3.1rem, 8.5vw, 5.35rem);
		font-style: italic;
		font-weight: 400;
		line-height: 0.95;
		letter-spacing: -0.03em;
		color: var(--accent);
	}

	.wf-lead {
		max-width: 28.5rem;
		margin: 28px 0 0;
		font-family: var(--font-display);
		font-size: clamp(1.05rem, 2.1vw, 1.28rem);
		line-height: 1.55;
		color: var(--text);
	}

	.wf-proof {
		max-width: 26rem;
		margin: 16px 0 0;
		font-size: 0.92rem;
		line-height: 1.55;
		color: var(--text-secondary);
	}

	.wf-doors {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 28px;
	}

	.wf-link:focus-visible,
	.wf-more:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.wf-signal {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 36px 0 0;
		font-size: 0.72rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.wf-signal::before {
		content: '';
		flex: none;
		width: 28px;
		height: 1px;
		background: var(--accent);
	}

	@media (min-width: 900px) {
		.wf-signal {
			margin-top: auto;
			padding-top: 48px;
		}
	}

	.wf-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.wf-link {
		display: grid;
		grid-template-columns: 2.1rem minmax(0, 1fr) auto;
		grid-template-areas:
			'num title arrow'
			'num desc  desc';
		align-items: baseline;
		gap: 4px 14px;
		padding: 1.15rem 0;
		border-top: 1px solid var(--line);
		color: inherit;
		text-decoration: none;
		transition: color 0.2s;
	}

	.wf-list > li:last-child .wf-link {
		border-bottom: 1px solid var(--line);
	}

	.wf-num {
		grid-area: num;
		font-family: var(--font-display);
		font-size: 0.82rem;
		font-style: italic;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--accent);
	}

	.wf-title {
		grid-area: title;
		font-family: var(--font-display);
		font-size: clamp(1.12rem, 2vw, 1.28rem);
		font-weight: 500;
		line-height: 1.3;
		letter-spacing: -0.01em;
		color: var(--text);
		transition: color 0.2s;
	}

	.wf-desc {
		grid-area: desc;
		font-size: 0.88rem;
		line-height: 1.45;
		color: var(--text-secondary);
	}

	/* The reference's descriptions are one-liners; post summaries run longer, so they are
	   held to two lines here and read in full on the post. */
	.wf-desc-text {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	.wf-meta {
		display: block;
		margin-top: 4px;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.wf-arrow {
		grid-area: arrow;
		font-size: 1.05rem;
		line-height: 1;
		color: var(--accent);
		transition: transform 0.2s;
	}

	.wf-link:hover .wf-title,
	.wf-link:focus-visible .wf-title {
		color: var(--accent);
	}

	.wf-link:hover .wf-arrow,
	.wf-link:focus-visible .wf-arrow {
		transform: translateX(3px);
	}

	@media (min-width: 900px) {
		.wf-link {
			grid-template-columns: 2.1rem minmax(10rem, 0.75fr) minmax(0, 1fr) auto;
			grid-template-areas: 'num title desc arrow';
			align-items: center;
			column-gap: 16px;
			padding: 1.2rem 0;
		}
		.wf-desc {
			font-size: 0.86rem;
		}
	}

	.wf-background {
		max-width: 46rem;
		margin-top: clamp(3.5rem, 8vw, 6.5rem);
		padding-top: clamp(2rem, 4vw, 3rem);
		border-top: 1px solid var(--line);
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--text-secondary);
	}

	.wf-more {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1.25rem;
		font-weight: 600;
		color: var(--accent);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.2em;
	}

	@media (prefers-reduced-motion: reduce) {
		.wf-intro,
		.wf-shelves {
			animation: none;
		}
	}
</style>
