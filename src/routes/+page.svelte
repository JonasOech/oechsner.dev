<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import HairlineFigure from '$lib/components/HairlineFigure.svelte';
	import Workbench from '$lib/components/Workbench.svelte';
	import Handset from '$lib/components/Handset.svelte';
	import { site } from '$lib/data/site';
	import { activePlugins, pluginGroups } from '$lib/data/obsidian-plugins';
	import { posts, formatDate } from '$lib/posts';

	/**
	 * The front page, in the order of aanandmadhav.com: identity hero, numbers, things in
	 * rotation, projects, recent writing, a life story, and (in the footer) the closing pitch.
	 *
	 * The hero's three words are the largest type on the page, which DESIGN.md §11 rules out
	 * for the original design. It is the reference's signature, so this exploration keeps it.
	 */

	// — Hero: three words, each with a small drawing that follows the pointer. —
	const identities = [
		{ word: 'Student.', kind: 'book' },
		{ word: 'Builder.', kind: 'laptop' },
		{ word: 'Explorer.', kind: 'compass' }
	] as const;
	let activeWord = $state(-1);
	let stage: HTMLElement;
	const pointer = $state({ x: 0, y: 0 });

	function onStageMove(e: PointerEvent) {
		const r = stage.getBoundingClientRect();
		pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
		pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
	}

	// — Things in rotation: the vault, the year abroad. —
	const groups = pluginGroups
		.map(([key, g]) => ({ key, title: g.title, plugins: activePlugins(key) }))
		.filter((g) => g.plugins.length);
	let shelf = $state(0);
	const shelfGroup = $derived(groups[shelf]);
	const pluginCount = groups.reduce((n, g) => n + g.plugins.length, 0);

	const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
	const now = new Date();
	const elapsed = (now.getUTCFullYear() - 2026) * 12 + now.getUTCMonth() - 8;
	let month = $state(Math.max(0, Math.min(months.length - 1, elapsed)));
	const monthYear = (i: number) => (i < 4 ? 2026 : 2027);

	const noted = now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

	// — Writing —
	const featured = posts.slice(0, 2);
	const more = posts.slice(2);
</script>

<Seo title={site.name} />

<!-- ─── Hero ─────────────────────────────────────────────────────────────── -->
<section class="hero container" aria-labelledby="hero-title">
	<div class="hero__copy">
		<div
			class="identity"
			bind:this={stage}
			role="presentation"
			onpointermove={onStageMove}
			onpointerleave={() => (activeWord = -1)}
		>
			<h1 id="hero-title" class="identity__words" aria-label="Student. Builder. Explorer.">
				{#each identities as id, i (id.word)}
					<button
						type="button"
						aria-pressed={activeWord === i}
						data-active={activeWord === i}
						onpointerenter={() => (activeWord = i)}
						onfocus={() => (activeWord = i)}
						onclick={() => (activeWord = activeWord === i ? -1 : i)}
					>
						<span>{id.word}</span>
					</button>
				{/each}
			</h1>
			{#each identities as id, i (id.kind)}
				<div class="identity__art" style="grid-row: {i + 1}" data-active={activeWord === i} aria-hidden="true">
					<HairlineFigure kind={id.kind} active={activeWord === i} input={pointer} />
				</div>
			{/each}
		</div>

		<p class="hero__intro">
			I’m Jonas. I study applied computer science and build machine-learning systems that give a
			safe answer, and can explain where it came from.
		</p>
		<a class="btn btn--primary" href="/contact">Let’s work together →</a>
		<p class="hero__note">Looking for an internship in Dublin</p>
	</div>

	<div class="hero__art">
		<Workbench />
	</div>
</section>

<!-- ─── Numbers ──────────────────────────────────────────────────────────── -->
<section class="section-block container" aria-labelledby="work-title">
	<div class="head">
		<h2 id="work-title" class="display">Good models. <span class="hl">Real systems.</span></h2>
		<p class="head__aside"><strong>99 ECTS</strong> in applied computer science</p>
	</div>

	<div class="cards">
		<article class="card">
			<h3>LIfBi, Bamberg</h3>
			<div class="card__metric">
				<span class="metric">100%</span>
				<span class="card__caption">of LLM inference kept on-premise</span>
			</div>
			<p>
				An AI-powered data-protection classifier that sorts survey questions against the special
				categories of Art. 9 GDPR. Full stack, three Docker containers.
			</p>
			<a class="arrow-link" href="/skills">My work at LIfBi <Icon name="arrow-up-right" /></a>
		</article>
		<article class="card">
			<h3>Cognitive Systems, Uni Bamberg</h3>
			<div class="card__metric">
				<span class="metric">94%</span>
				<span class="card__caption">prediction accuracy reproducing a neuro-symbolic solver</span>
			</div>
			<p>
				Team project replicating Zhao et al. (2023) on Raven’s Progressive Matrices: a CNN, a
				supervised VAE, then cognitive-map relational reasoning.
			</p>
			<a class="arrow-link" href="/cognitive-maps-for-rpm-report.pdf" target="_blank" rel="noopener">
				Read the report <Icon name="arrow-up-right" />
			</a>
		</article>
	</div>

	<ul class="rows">
		<li>
			<a href="/blog/healthcare-innovation-challenge">
				<span class="rows__name">Quick Equipment Log</span>
				<span class="rows__num">10 h</span>
				<span class="rows__cap">overnight build that won Best Use of Technology</span>
				<Icon name="arrow-up-right" size={16} />
			</a>
		</li>
		<li>
			<a href="/about">
				<span class="rows__name">Introduction to AI</span>
				<span class="rows__num">1.7</span>
				<span class="rows__cap">my grade in the course I went on to tutor</span>
				<Icon name="arrow-up-right" size={16} />
			</a>
		</li>
		<li>
			<a href="/about">
				<span class="rows__name">Universität Bamberg</span>
				<span class="rows__num">1.98</span>
				<span class="rows__cap">average across 99 credited ECTS</span>
				<Icon name="arrow-up-right" size={16} />
			</a>
		</li>
		<li>
			<a href="#writing">
				<span class="rows__name">This site</span>
				<span class="rows__num">{posts.length}</span>
				<span class="rows__cap">posts written up so far</span>
				<Icon name="arrow-up-right" size={16} />
			</a>
		</li>
	</ul>
</section>

<!-- ─── In rotation ──────────────────────────────────────────────────────── -->
<section class="section-block container" aria-labelledby="rotation-title">
	<div class="head head--sub">
		<div>
			<h2 id="rotation-title" class="display">A few things <span class="hl">in rotation.</span></h2>
			<p class="head__lede">My vault, a year abroad, and the question I keep coming back to.</p>
		</div>
		<a class="arrow-link" href="/about">More about me <Icon name="arrow-up-right" /></a>
	</div>

	<div class="trio">
		<article class="tile">
			<p class="tile__kicker">Obsidian</p>
			<h3>The vault</h3>
			<p class="tile__sub">{pluginCount} plugins, doing {groups.length} jobs.</p>
			<div class="shelf" role="group" aria-label="Plugin groups">
				{#each groups as g, i (g.key)}
					<button
						type="button"
						class="shelf__cell"
						aria-pressed={shelf === i}
						aria-label={g.title}
						onclick={() => (shelf = i)}
						onpointerenter={() => (shelf = i)}
					></button>
				{/each}
			</div>
			<div class="shelf__read" aria-live="polite">
				<p class="shelf__title">{shelfGroup.title}</p>
				<p class="shelf__list">{shelfGroup.plugins.map((p) => p.name).join(' · ')}</p>
			</div>
			<a class="arrow-link" href="/blog/obsidian-setup">My Obsidian setup <Icon name="arrow-up-right" /></a>
		</article>

		<article class="tile">
			<p class="tile__kicker">Exchange year</p>
			<h3>TU Dublin</h3>
			<p class="tile__sub">ERASMUS, Computing</p>
			<div class="gauge" aria-hidden="true">
				<span class="gauge__fill" style="height: {((month + 1) / months.length) * 100}%"></span>
			</div>
			<p class="gauge__read" aria-live="polite">
				<strong>{months[month]} {monthYear(month)}</strong> · month {month + 1} of {months.length}
			</p>
			<div class="steps" role="group" aria-label="Months of the exchange">
				{#each months as m, i (m)}
					<button type="button" aria-pressed={month === i} onclick={() => (month = i)}>{m}</button>
				{/each}
			</div>
			<a class="arrow-link" href="/contact">Say hi in Dublin <Icon name="arrow-up-right" /></a>
		</article>

		<article class="tile">
			<p class="tile__kicker">Principle</p>
			<h3>Safe answers</h3>
			<p class="tile__sub">and where they came from</p>
			<p class="tile__quote">
				Most of my work sits where machine learning needs to be integrated into resilient software
				systems. The goal is to build models that produce a safe answer, and an architecture that
				can explain where the answer came from.
			</p>
			<a class="arrow-link" href="/about">Background and CV <Icon name="arrow-up-right" /></a>
		</article>
	</div>
	<p class="noted">Last noted {noted}</p>
</section>

<!-- ─── Projects ─────────────────────────────────────────────────────────── -->
<section class="section-block container" aria-labelledby="lab-title">
	<div class="head">
		<h2 id="lab-title" class="display"><span class="hl">Curiosity,</span> put to work.</h2>
	</div>

	<div class="lab">
		<article class="lab__feature">
			<div class="lab__art"><Handset /></div>
			<p class="lab__award">Best Use of Technology · Health Innovation Challenge 2026</p>
			<h3>Quick Equipment Log</h3>
			<p>
				Voice logging for hospital equipment, from the handsets ward staff already carry: an LLM
				turns dictation into a structured booking, and a human confirms it.
			</p>
			<a class="arrow-link" href="/blog/healthcare-innovation-challenge">
				Read the write-up <Icon name="arrow-up-right" />
			</a>
		</article>

		<div class="lab__list">
			<article>
				<p class="lab__status">Active</p>
				<h3>GDPR compliance classifier</h3>
				<p>
					Classifies survey questions against Art. 9 GDPR, with every LLM call run locally through
					Ollama so sensitive data never leaves the institute.
				</p>
				<a class="arrow-link" href="/skills">See the project <Icon name="arrow-up-right" /></a>
			</article>
			<article>
				<p class="lab__status">Completed</p>
				<h3>Raven’s Progressive Matrices</h3>
				<p>
					Reproduced a three-stage neuro-symbolic pipeline for abstract visual reasoning, reaching
					94% prediction accuracy.
				</p>
				<a class="arrow-link" href="/cognitive-maps-for-rpm-presentation.pptx" download>
					Download the slides <Icon name="arrow-up-right" />
				</a>
			</article>
			<article>
				<p class="lab__status">Ongoing</p>
				<h3>This site</h3>
				<p>
					Fully prerendered SvelteKit, with a custom mdsvex pipeline for citations, display math and
					reading time.
				</p>
				<a class="arrow-link" href="/skills">All projects <Icon name="arrow-up-right" /></a>
			</article>
		</div>
	</div>
	<p class="noted noted--wide">
		Some projects become write-ups. Two stay closed source. All of them teach me something useful.
	</p>
</section>

<!-- ─── Writing ──────────────────────────────────────────────────────────── -->
<section class="section-block container" id="writing" aria-labelledby="writing-title">
	<div class="head">
		<h2 id="writing-title" class="display">Recent <span class="hl">writing</span></h2>
		<a class="arrow-link" href="/rss.xml" data-sveltekit-reload>RSS feed <Icon name="arrow-up-right" /></a>
	</div>

	<div class="pieces">
		{#each featured as p (p.slug)}
			<article class="piece">
				<a class="piece__img" href="/blog/{p.slug}" tabindex="-1" aria-hidden="true">
					{#if p.cover}<img src={p.cover} alt="" loading="lazy" decoding="async" />{/if}
				</a>
				<p class="piece__meta">
					<span>{p.readingMinutes} min read</span><time datetime={p.date}>{formatDate(p.date)}</time>
				</p>
				<h3 class="piece__title"><a href="/blog/{p.slug}">{p.title}</a></h3>
				{#if p.summary}<p class="piece__sum">{p.summary}</p>{/if}
				<a class="arrow-link" href="/blog/{p.slug}">Read the piece <Icon name="arrow-up-right" /></a>
			</article>
		{/each}
	</div>

	{#if more.length}
		<ul class="archive">
			{#each more as p (p.slug)}
				<li>
					<a href="/blog/{p.slug}">
						<span class="archive__title">{p.title}</span>
						<span class="archive__meta">{p.readingMinutes} min · {formatDate(p.date)}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<!-- ─── Life ─────────────────────────────────────────────────────────────── -->
<section class="section-block container" aria-labelledby="life-title">
	<div class="head head--sub">
		<div>
			<h2 id="life-title" class="display">There is <span class="hl">life</span> beyond the terminal.</h2>
			<p class="head__lede">Hackathons, a year abroad, and the problems that turn out not to be technical.</p>
		</div>
		<a class="arrow-link" href="/blog/healthcare-innovation-challenge">The whole story <Icon name="arrow-up-right" /></a>
	</div>

	<figure class="life">
		<img
			class="life__photo"
			src="/img/hic/cover.jpeg"
			alt="A phone showing the Quick Equipment Log app, held up in front of the Health Innovation Challenge sponsor wall"
			width="1200"
			height="1600"
			loading="lazy"
			decoding="async"
		/>
		<blockquote class="life__quote">
			<p>So the real constraint was not about technology at all. The tracker already holds the right information.</p>
			<a class="arrow-link" href="/blog/healthcare-innovation-challenge">Read the full story <Icon name="arrow-up-right" /></a>
		</blockquote>
		<figcaption class="life__cap">Dublin · Oct 2026 · Health Innovation Challenge</figcaption>
	</figure>
</section>

<style>
	/* — Hero — */
	.hero {
		display: grid;
		gap: 48px;
		align-items: center;
		padding-block: 72px 48px;
	}

	.identity {
		--slide: clamp(60px, 6vw, 88px);
		display: grid;
		grid-template-columns: max-content;
		grid-template-rows: repeat(3, 1fr);
		align-items: center;
		isolation: isolate;
		margin-bottom: 24px;
	}

	.identity__words {
		z-index: 2;
		display: grid;
		grid-area: 1 / 1 / 4;
		grid-template-rows: subgrid;
		margin: 0;
		padding-right: var(--slide);
		font: 500 clamp(52px, 7.4vw, 106px) / 1.06 var(--font-sans);
		letter-spacing: -0.045em;
	}

	.identity__words button {
		display: block;
		padding: 0 0 4px;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		letter-spacing: inherit;
		text-align: left;
		cursor: pointer;
	}

	.identity__words span {
		display: inline-block;
		transition:
			transform 0.7s cubic-bezier(0.32, 0.72, 0, 1),
			color 0.2s;
	}

	.identity__words button[data-active='true'] span {
		color: var(--accent);
		transform: translateX(var(--slide));
	}

	.identity__words button:focus-visible {
		outline: none;
	}

	.identity__words button:focus-visible span {
		text-decoration: underline 2px;
		text-underline-offset: 0.12em;
	}

	.identity__art {
		z-index: 1;
		grid-column: 1;
		justify-self: start;
		width: calc(var(--slide) - 8px);
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transform: translateX(-12px) scale(0.92);
		transition:
			opacity 0.25s,
			transform 0.7s cubic-bezier(0.32, 0.72, 0, 1),
			visibility 0s 0.25s;
	}

	.identity__art[data-active='true'] {
		opacity: 1;
		visibility: visible;
		transform: none;
		transition-delay: 80ms, 0s, 0s;
	}

	.hero__intro {
		max-width: 27rem;
		margin: 0 0 24px;
		font-size: 1.125rem;
		line-height: 1.65;
	}

	.hero__note {
		margin: 16px 0 0;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.hero__art {
		max-width: 620px;
		width: 100%;
		justify-self: center;
	}

	@media (min-width: 900px) {
		.hero {
			grid-template-columns: 1fr 1fr;
			padding-block: 120px 96px;
		}
	}

	/* — Shared section furniture — */
	.section-block {
		padding-block: 96px 0;
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px 32px;
		margin-bottom: 36px;
	}

	.head--sub {
		align-items: flex-end;
	}

	.display {
		margin: 0;
		font-size: clamp(2rem, 3.6vw, 2.75rem);
		font-weight: 500;
		line-height: 1.05;
		letter-spacing: -0.035em;
	}

	.head__aside {
		margin: 0;
		font-size: 0.875rem;
	}

	.head__aside strong {
		color: var(--text);
		font-weight: 500;
	}

	.head__lede {
		margin: 16px 0 0;
		font-size: 0.9375rem;
	}

	.noted {
		margin: 20px 0 0;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.noted--wide {
		max-width: 38rem;
		font-size: 0.875rem;
		line-height: 1.65;
	}

	h3 {
		font-weight: 500;
	}

	/* — Numbers — */
	.cards {
		display: grid;
		gap: 20px;
	}

	.card {
		display: grid;
		gap: 20px;
		align-content: start;
		justify-items: start;
		padding: 40px 32px 32px;
		background: var(--surface);
	}

	.card h3 {
		font-size: 1.25rem;
		letter-spacing: -0.015em;
	}

	.card p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.7;
	}

	.card__metric {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.metric {
		font-size: clamp(3rem, 5vw, 4rem);
		line-height: 1;
		letter-spacing: -0.04em;
		color: var(--accent);
	}

	.card__caption {
		max-width: 12rem;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.rows {
		margin: 20px 0 0;
		padding: 0;
		list-style: none;
	}

	.rows a {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'name arrow'
			'num  num'
			'cap  cap';
		align-items: center;
		gap: 4px 16px;
		padding: 20px 24px;
		color: inherit;
		text-decoration: none;
		transition: background-color 0.2s;
	}

	.rows li:nth-child(even) a {
		background: var(--surface);
	}

	.rows__name {
		grid-area: name;
		font-size: 1.125rem;
		color: var(--text);
	}

	.rows__num {
		grid-area: num;
		font-size: 2rem;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.rows__cap {
		grid-area: cap;
		font-size: 0.8125rem;
	}

	.rows a :global(svg) {
		grid-area: arrow;
		color: var(--text);
		transition: transform 0.25s var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.rows a:hover {
			background: var(--surface-hover);
		}
		.rows a:hover :global(svg) {
			transform: translate(2px, -2px);
		}
	}

	.rows a:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px var(--accent);
	}

	@media (min-width: 900px) {
		.cards {
			grid-template-columns: 1fr 1fr;
		}
		.rows a {
			grid-template-columns: 1.1fr 0.9fr 1.1fr auto;
			grid-template-areas: 'name num cap arrow';
		}
	}

	/* — In rotation — */
	.trio {
		display: grid;
		gap: 24px;
	}

	.tile {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		min-height: 520px;
		padding: 28px 28px 30px;
		background: var(--surface);
	}

	.tile__kicker {
		margin: 0 0 14px;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.tile h3 {
		font-size: 1.375rem;
		letter-spacing: -0.02em;
	}

	.tile__sub {
		margin: 10px 0 0;
		font-size: 0.875rem;
	}

	.tile > .arrow-link {
		margin-top: auto;
	}

	.shelf {
		display: grid;
		grid-template-columns: repeat(6, 32px);
		gap: 8px;
		align-self: center;
		margin-top: 56px;
	}

	.shelf__cell {
		width: 32px;
		height: 28px;
		padding: 0;
		border: 1px solid var(--line-strong);
		background: transparent;
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.shelf__cell[aria-pressed='true'] {
		border-color: var(--accent);
		background: var(--accent-wash);
		box-shadow: inset 0 0 0 1px var(--accent);
	}

	.shelf__read {
		align-self: stretch;
		margin: 20px 0 32px;
		text-align: center;
	}

	.shelf__title {
		margin: 0;
		color: var(--text);
		font-size: 0.9375rem;
	}

	.shelf__list {
		margin: 6px 0 0;
		font-size: 0.75rem;
		line-height: 1.6;
	}

	.gauge {
		position: relative;
		align-self: center;
		width: 72px;
		height: 120px;
		margin-top: 40px;
		border: 1px solid var(--line-strong);
		border-top-width: 6px;
		overflow: hidden;
	}

	.gauge__fill {
		position: absolute;
		inset: auto 4px 4px;
		background: var(--accent);
		opacity: 0.75;
		transition: height 0.7s cubic-bezier(0.32, 0.72, 0, 1);
	}

	.gauge__read {
		align-self: center;
		margin: 16px 0 0;
		font-size: 0.8125rem;
	}

	.gauge__read strong {
		color: var(--text);
		font-weight: 500;
	}

	.steps {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-self: stretch;
		gap: 2px;
		margin: 16px 0 32px;
	}

	.steps button {
		min-width: 40px;
		height: 36px;
		padding: 0 6px;
		border: 0;
		background: transparent;
		font: inherit;
		font-size: 0.75rem;
		color: var(--text-muted);
		cursor: pointer;
	}

	.steps button[aria-pressed='true'] {
		background: var(--bg);
		color: var(--text);
		font-weight: 600;
	}

	.shelf__cell:focus-visible,
	.steps button:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.tile__quote {
		margin: 28px 0 32px;
		font-size: 1.1rem;
		line-height: 1.7;
		color: var(--text-muted);
	}

	@media (min-width: 900px) {
		.trio {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* — Projects — */
	.lab {
		display: grid;
		gap: 48px;
	}

	.lab__feature {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 40px 48px 48px;
		background: var(--surface);
	}

	.lab__art {
		align-self: center;
		width: min(320px, 100%);
		margin-bottom: 32px;
	}

	.lab__award {
		margin: 0 0 16px;
		font-size: 0.8125rem;
		color: var(--accent);
	}

	.lab__feature h3 {
		font-size: 2rem;
		letter-spacing: -0.03em;
	}

	.lab__feature p:not(.lab__award),
	.lab__list p:not(.lab__status) {
		margin: 16px 0 20px;
		font-size: 0.9375rem;
		line-height: 1.7;
	}

	.lab__list {
		display: grid;
		gap: 44px;
		align-content: start;
	}

	.lab__list article {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.lab__status {
		margin: 0 0 8px;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.lab__list h3 {
		font-size: 1.375rem;
		letter-spacing: -0.02em;
	}

	@media (min-width: 900px) {
		.lab {
			grid-template-columns: 1fr 1fr;
			gap: 72px;
		}
		.lab__list {
			padding-top: 24px;
		}
	}

	@media (max-width: 599px) {
		.lab__feature {
			padding: 32px 24px;
		}
	}

	/* — Writing — */
	.pieces {
		display: grid;
		gap: 48px;
	}

	.piece {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.piece__img {
		display: block;
		align-self: stretch;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		background: var(--surface);
	}

	.piece__img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.8s var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.piece__img:hover img {
			transform: scale(1.03);
		}
	}

	.piece__meta {
		display: flex;
		justify-content: space-between;
		align-self: stretch;
		margin: 24px 0 0;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.piece__title {
		margin: 18px 0 0;
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 2.6vw, 2.25rem);
		font-weight: 400;
		line-height: 1.15;
		letter-spacing: -0.01em;
	}

	.piece__title a {
		color: inherit;
		text-decoration: none;
	}

	@media (hover: hover) and (pointer: fine) {
		.piece__title a:hover {
			color: var(--accent);
		}
	}

	.piece__sum {
		margin: 16px 0 20px;
		font-size: 0.875rem;
		line-height: 1.7;
	}

	.archive {
		margin: 56px 0 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--line);
	}

	.archive a {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 4px 24px;
		padding: 18px 0;
		border-bottom: 1px solid var(--line);
		color: inherit;
		text-decoration: none;
	}

	.archive__title {
		font-family: var(--font-display);
		font-size: 1.375rem;
		line-height: 1.2;
		color: var(--text);
		transition: color 0.15s;
	}

	.archive__meta {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	@media (hover: hover) and (pointer: fine) {
		.archive a:hover .archive__title {
			color: var(--accent);
		}
	}

	.piece__title a:focus-visible,
	.archive a:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (min-width: 900px) {
		.pieces {
			grid-template-columns: 1fr 1fr;
		}
	}

	/* — Life — */
	.life {
		display: grid;
		gap: 40px;
		margin: 0;
	}

	.life__photo {
		width: 100%;
		max-width: 480px;
		aspect-ratio: 3 / 4;
		object-fit: cover;
	}

	.life__quote {
		align-self: center;
		margin: 0;
	}

	.life__quote p {
		margin: 0 0 32px;
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 2.8vw, 2.4rem);
		line-height: 1.25;
		color: var(--text-muted);
	}

	.life__cap {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	@media (min-width: 900px) {
		.life {
			grid-template-columns: 1fr 1fr;
			column-gap: 96px;
		}
		.life__cap {
			grid-column: 1 / -1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.identity__words span,
		.identity__art {
			transition: none;
		}
	}
</style>
