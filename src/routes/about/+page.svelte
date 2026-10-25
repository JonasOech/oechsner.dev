<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import { site, cvPath } from '$lib/data/site';
	import {
		about,
		experience,
		education,
		projects,
		projectsNote,
		grades,
		skills
	} from '$lib/data/resume';
</script>

<Seo
	title="About"
	description="Jonas Öchsner — applied computer science at Universität Bamberg, machine learning and data-protection engineering at LIfBi, ERASMUS at TU Dublin from September 2026."
/>

<div class="container">
	<section class="intro grid">
		<h1 class="intro__title enter" style="--i: 0">About</h1>
		<div class="stack enter lede" style="--i: 1">
			{#each about as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
		</div>
		<div class="btn-row enter" style="--i: 2">
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

	<Rail label="Experience" id="experience">
		{#each experience as job (job.title + job.period)}
			<article class="entry">
				<h3 class="entry__title">{job.title}</h3>
				{#if job.org}
					<p class="entry__body entry__org">{job.org}{job.place ? ` · ${job.place}` : ''}</p>
				{/if}
				{#if job.points.length}
					<ul class="entry__list">
						{#each job.points as point (point)}
							<li>{point}</li>
						{/each}
					</ul>
				{/if}
				<p class="meta">{job.period}</p>
			</article>
		{/each}
	</Rail>

	<Rail label="Education" id="education">
		{#each education as school (school.title + school.period)}
			<article class="entry">
				<h3 class="entry__title">{school.title}</h3>
				{#if school.org}
					<p class="entry__body entry__org">{school.org}{school.place ? ` · ${school.place}` : ''}</p>
				{/if}
				{#if school.points.length}
					<ul class="entry__list">
						{#each school.points as point (point)}
							<li>{point}</li>
						{/each}
					</ul>
				{/if}
				<p class="meta">{school.period}</p>
			</article>
		{/each}
	</Rail>

	<Rail label="Grades" id="grades">
		<p class="meta note note--top">{grades.summary}</p>
		<dl class="grades">
			{#each grades.items as [course, grade] (course)}
				<div class="grades__row">
					<dt>{course}</dt>
					<dd>{grade}</dd>
				</div>
			{/each}
		</dl>
	</Rail>
</div>

<style>
	.intro {
		row-gap: var(--s-6);
		padding-top: var(--s-8);
		padding-bottom: var(--s-2);
	}

	.intro__title {
		grid-column: 1 / -1;
		font-size: clamp(3rem, 10vw, 8.5rem);
		font-weight: 800;
		letter-spacing: -0.055em;
		line-height: 0.92;
	}

	/* The lede sits on columns 4-10, the same line the section bodies start on. */
	.intro .lede {
		grid-column: 4 / span 7;
		max-width: none;
		font-size: clamp(1.125rem, 1.8vw, 1.375rem);
		font-weight: 500;
		line-height: 1.45;
		letter-spacing: -0.012em;
	}

	.intro .btn-row {
		grid-column: 4 / span 7;
	}

	.entry__org {
		color: var(--text-secondary);
		margin-bottom: var(--s-3);
	}

	.note {
		margin-top: var(--s-4);
		font-weight: 400;
		font-style: italic;
	}

	.note--top {
		margin-top: 0;
		margin-bottom: var(--s-5);
		font-style: normal;
	}

	.grades {
		margin: 0;
		display: grid;
		gap: 0;
	}

	.grades__row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--s-4);
		align-items: baseline;
		padding: var(--s-3) 0;
		border-bottom: 1px solid var(--line);
	}

	.grades__row:last-child {
		border-bottom: 0;
	}

	.grades dt {
		color: var(--text-secondary);
		font-size: 0.9375rem;
	}

	.grades dd {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		font-feature-settings: 'tnum' 1;
		color: var(--text);
	}

	@media (max-width: 767px) {
		.intro {
			padding-top: var(--s-5);
		}
		.intro .lede,
		.intro .btn-row {
			grid-column: 1;
		}
	}
</style>
