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
	title="Skills"
	description="Jonas Öchsner — applied computer science at Universität Bamberg, machine learning and data-protection engineering at LIfBi, ERASMUS at TU Dublin from September 2026."
/>

<div class="container">
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
	.entry__stack {
		margin: 0 0 var(--s-3);
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
