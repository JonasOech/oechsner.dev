<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Rail from '$lib/components/Rail.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
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
	title="Projects"
	description="Jonas Öchsner — applied computer science at Universität Bamberg, machine learning and data-protection engineering at LIfBi, ERASMUS at TU Dublin from September 2026."
/>

<PageTitle title="Projects" kicker="Things I have built" tone="red" />

<div class="container section-first">
	<Rail label="Projects" id="projects">
		{#each projects as project (project.title)}
			<article class="entry">
				<h3 class="entry__title">{project.title}</h3>
				{#if project.stack}
					<p class="mono entry__stack">{project.stack}</p>
				{/if}
				<ul class="entry__list">
					{#each project.points as point (point)}
						<li>{point}</li>
					{/each}
				</ul>
				{#if project.download}
					<div class="download">
						<a class="btn btn--secondary" href={project.download.href} download>
							<Icon name="arrow-down" />
							{project.download.label}
						</a>
						<span class="mono download__meta">{project.download.meta}</span>
					</div>
				{/if}
				{#if project.link || project.source}
					<div class="download">
						{#if project.link}
							<a class="btn btn--secondary" href={project.link.href}>
								<Icon name="arrow-right" />
								{project.link.label}
							</a>
						{/if}
						{#if project.source}
							<a
								class="btn btn--secondary"
								href={project.source.href}
								target="_blank"
								rel="noreferrer noopener"
							>
								<Icon name="github" />
								{project.source.label}
							</a>
						{/if}
					</div>
				{/if}
				<p class="meta">{project.period}{project.org ? ` · ${project.org}` : ''}</p>
			</article>
		{/each}
		<p class="meta note">{projectsNote}</p>
	</Rail>

	<Rail label="Skills" id="skills">
		<dl class="skills">
			{#each skills as group (group.label)}
				<div class="skills__group">
					<dt class="label">{group.label}</dt>
					<dd class="skills__items">
						{#each group.items as item (item)}
							<span class="tag">{item}</span>
						{/each}
					</dd>
				</div>
			{/each}
		</dl>
	</Rail>
</div>

<style>
	/* The first rail sits close under the poster header. */
	.section-first :global(.rail:first-child) {
		margin-top: var(--s-8);
	}

	.entry__stack {
		margin: 0 0 var(--s-3);
	}

	/* The row under an entry's points: a download (whose `download` attribute is the point —
	   a .pptx would otherwise be handed to whatever viewer the OS has registered for it), or a
	   link to read more next to the repository the code lives in. */
	.download {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3);
		margin: 0 0 var(--s-4);
	}

	.download__meta {
		white-space: nowrap;
	}

	@media (max-width: 479px) {
		/* `.btn` is width: 100% below 480px, so the weight hint has to drop to its own line
		   rather than try to share one. */
		.download {
			align-items: flex-start;
			gap: var(--s-2);
		}
	}

	.note {
		margin-top: var(--s-4);
		font-weight: 400;
		font-style: italic;
	}

	.skills {
		margin: 0;
		display: grid;
		gap: var(--s-5);
	}

	.skills__group {
		display: grid;
		gap: var(--s-3);
	}

	.skills__items {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}
</style>
