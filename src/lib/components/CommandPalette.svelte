<script lang="ts">
	import { goto } from '$app/navigation';
	import { palette } from '$lib/palette.svelte';
	import { posts, formatDate } from '$lib/posts';
	import { cvPath, feeds } from '$lib/data/site';
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * ⌘K (Ctrl+K elsewhere): a search box over every page and post. Type to filter, arrows
	 * to move, Enter to go, Escape to close. A native <dialog>, so focus is trapped and
	 * restored by the browser.
	 */
	type Item = { group: string; title: string; hint: string; href: string; file?: boolean; text: string };

	const pages: Item[] = [
		['Home', '/', 'Front page'],
		['About', '/about', 'Background, experience and grades'],
		['Projects', '/skills', 'What I have built, and with what'],
		['Contact', '/contact', 'Email, GitHub, LinkedIn'],
		['Impressum', '/impressum', 'Legal notice'],
		['Datenschutz', '/datenschutz', 'Privacy policy']
	].map(([title, href, hint]) => ({ group: 'Pages', title, href, hint, text: `${title} ${hint}`.toLowerCase() }));

	const files: Item[] = [
		{ group: 'Files', title: 'CV (PDF)', href: cvPath, hint: 'Download', file: true, text: 'cv resume pdf download' },
		{ group: 'Files', title: 'RSS feed', href: feeds.rss, hint: 'Subscribe', file: true, text: 'rss feed subscribe' }
	];

	const writing: Item[] = posts.map((p) => ({
		group: 'Writing',
		title: p.title,
		href: `/blog/${p.slug}`,
		hint: `${formatDate(p.date)} · ${p.readingMinutes} min`,
		text: `${p.title} ${p.summary} ${p.tags.join(' ')}`.toLowerCase()
	}));

	const all = [...writing, ...pages, ...files];

	let dialog: HTMLDialogElement;
	let input = $state<HTMLInputElement>();
	let query = $state('');
	let index = $state(0);

	const results = $derived.by(() => {
		const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
		return terms.length ? all.filter((it) => terms.every((t) => it.text.includes(t))) : all;
	});

	$effect(() => {
		if (palette.open && !dialog.open) {
			query = '';
			index = 0;
			dialog.showModal();
			queueMicrotask(() => input?.focus());
		} else if (!palette.open && dialog.open) {
			dialog.close();
		}
	});

	$effect(() => {
		// Keep the highlight on a real row as the list shrinks.
		if (index >= results.length) index = Math.max(0, results.length - 1);
	});

	function onWindowKey(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			palette.open = !palette.open;
		}
	}

	function choose(it: Item | undefined) {
		if (!it) return;
		palette.open = false;
		if (it.file) location.assign(it.href);
		else goto(it.href);
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			index = (index + 1) % Math.max(results.length, 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			index = (index - 1 + results.length) % Math.max(results.length, 1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			choose(results[index]);
		}
	}

	$effect(() => {
		document.getElementById(`cmd-${index}`)?.scrollIntoView({ block: 'nearest' });
	});
</script>

<svelte:window onkeydown={onWindowKey} />

<dialog
	bind:this={dialog}
	class="palette"
	aria-label="Search pages and writing"
	onclose={() => (palette.open = false)}
	onclick={(e) => {
		if (e.target === dialog) palette.open = false;
	}}
>
	<div class="palette__box">
		<label class="palette__search">
			<Icon name="search" size={16} />
			<span class="visually-hidden">Search</span>
			<input
				bind:this={input}
				bind:value={query}
				onkeydown={onKey}
				type="search"
				placeholder="Search writing and pages…"
				role="combobox"
				aria-expanded="true"
				aria-controls="cmd-list"
				aria-activedescendant={results.length ? `cmd-${index}` : undefined}
				autocomplete="off"
				spellcheck="false"
			/>
			<kbd>esc</kbd>
		</label>

		<ul class="palette__list" id="cmd-list" role="listbox" aria-label="Results">
			{#each results as it, i (it.href)}
				{#if i === 0 || results[i - 1].group !== it.group}
					<li class="palette__group" role="presentation">{it.group}</li>
				{/if}
				<!-- Keyboard choice happens in the search box (combobox + aria-activedescendant);
				     the click is the pointer's way to the same thing. -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					id="cmd-{i}"
					class="palette__item"
					role="option"
					aria-selected={i === index}
					onpointermove={() => (index = i)}
					onclick={() => choose(it)}
				>
					<span class="palette__title">{it.title}</span>
					<span class="palette__hint">{it.hint}</span>
				</li>
			{:else}
				<li class="palette__empty" role="presentation">Nothing matches “{query}”.</li>
			{/each}
		</ul>

		<p class="palette__foot"><kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>↵</kbd> to open</p>
	</div>
</dialog>

<style>
	.palette {
		width: min(640px, calc(100vw - 32px));
		max-height: min(560px, calc(100dvh - 96px));
		margin: 12vh auto auto;
		padding: 0;
		border: 1px solid var(--line-strong);
		background: var(--bg);
		color: var(--text);
		box-shadow: var(--shadow-4);
	}

	.palette::backdrop {
		background: rgba(var(--text-rgb), 0.18);
		backdrop-filter: blur(2px);
	}

	.palette[open] {
		animation: palette-in 0.22s var(--ease-out);
	}

	@keyframes palette-in {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
	}

	.palette__box {
		display: flex;
		flex-direction: column;
		max-height: inherit;
	}

	.palette__search {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
		border-bottom: 1px solid var(--line);
		color: var(--text-muted);
	}

	.palette__search input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: none;
		background: none;
		font: inherit;
		font-size: 1rem;
		color: var(--text);
	}

	.palette__search input::-webkit-search-cancel-button {
		display: none;
	}

	kbd {
		padding: 2px 6px;
		border: 1px solid var(--line-strong);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	.palette__list {
		flex: 1;
		margin: 0;
		padding: 6px 0;
		overflow-y: auto;
		list-style: none;
	}

	.palette__group {
		padding: 10px 16px 4px;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.palette__item {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding: 9px 16px;
		cursor: pointer;
	}

	.palette__item[aria-selected='true'] {
		background: var(--surface);
		box-shadow: inset 2px 0 0 var(--accent);
	}

	.palette__title {
		color: var(--text);
		font-size: 0.9375rem;
	}

	.palette__item[aria-selected='true'] .palette__title {
		color: var(--accent);
	}

	.palette__hint {
		flex: none;
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.palette__empty {
		padding: 24px 16px;
		color: var(--text-muted);
	}

	.palette__foot {
		display: flex;
		gap: 4px;
		align-items: center;
		margin: 0;
		padding: 10px 16px;
		border-top: 1px solid var(--line);
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (max-width: 479px) {
		.palette__hint {
			display: none;
		}
	}
</style>
