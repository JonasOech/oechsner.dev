<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import { nav, cvPath, feeds, contacts } from '$lib/data/site';
	import { posts } from '$lib/posts';

	/**
	 * A small "jump to" menu in the style of a product command palette. It is a plain
	 * list filter over the pages, the posts and a few actions — no fuzzy search, no state
	 * beyond the query and the highlighted row. Opens from the top bar button, `Ctrl/Cmd+K`
	 * or `/`; closes on Escape (native `<dialog>` behaviour) or a click on the backdrop.
	 */
	type Item = { label: string; hint: string; href: string; group: string; external?: boolean };

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let dialog: HTMLDialogElement;
	let input: HTMLInputElement;
	let query = $state('');
	let active = $state(0);

	const mail = contacts.find((c) => c.primary);

	const all: Item[] = [
		...nav.map((n) => ({ label: n.label, hint: n.href, href: n.href, group: 'Pages' })),
		...posts.map((p) => ({
			label: p.title,
			hint: `${p.readingMinutes} min`,
			href: `/blog/${p.slug}`,
			group: 'Writing'
		})),
		{ label: 'Download CV', hint: 'PDF', href: cvPath, group: 'Actions', external: true },
		{ label: 'Subscribe via RSS', hint: 'rss.xml', href: feeds.rss, group: 'Actions', external: true },
		...(mail
			? [{ label: 'Send an email', hint: mail.value, href: mail.href, group: 'Actions', external: true }]
			: [])
	];

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return q ? all.filter((i) => i.label.toLowerCase().includes(q)) : all;
	});

	$effect(() => {
		if (open && !dialog.open) {
			query = '';
			active = 0;
			dialog.showModal();
			input.focus();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	$effect(() => {
		// Keep the highlighted row inside the list when the filter shrinks it.
		if (active >= results.length) active = Math.max(0, results.length - 1);
	});

	function go(item: Item) {
		open = false;
		if (item.external) {
			window.location.href = item.href;
		} else {
			goto(item.href);
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			active = (active + 1) % Math.max(1, results.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			active = (active - 1 + results.length) % Math.max(1, results.length);
		} else if (event.key === 'Enter' && results[active]) {
			event.preventDefault();
			go(results[active]);
		}
	}

	function onWindowKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			open = !open;
		} else if (event.key === '/' && !typing && !open && !(target && target.isContentEditable)) {
			event.preventDefault();
			open = true;
		}
	}

	function onBackdrop(event: MouseEvent) {
		if (event.target === dialog) open = false;
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	class="palette"
	bind:this={dialog}
	aria-label="Jump to"
	onclose={() => (open = false)}
	onclick={onBackdrop}
>
	<div class="palette__bar">
		<Icon name="search" size={16} />
		<input
			class="palette__input"
			bind:this={input}
			bind:value={query}
			onkeydown={onKeydown}
			type="text"
			placeholder="Jump to a page or post…"
			autocomplete="off"
			spellcheck="false"
			role="combobox"
			aria-expanded="true"
			aria-controls="palette-list"
			aria-activedescendant={results[active] ? `palette-opt-${active}` : undefined}
			aria-label="Jump to a page or post"
		/>
		<kbd class="palette__kbd">esc</kbd>
	</div>

	<ul class="palette__list" id="palette-list" role="listbox" aria-label="Results">
		{#each results as item, i (item.href + item.label)}
			{#if i === 0 || results[i - 1].group !== item.group}
				<li class="palette__group" role="presentation">{item.group}</li>
			{/if}
			<li role="presentation">
				<button
					type="button"
					class="palette__item"
					id="palette-opt-{i}"
					role="option"
					aria-selected={i === active}
					tabindex="-1"
					onmousemove={() => (active = i)}
					onclick={() => go(item)}
				>
					<span class="palette__label">{item.label}</span>
					<span class="palette__hint">{item.hint}</span>
				</button>
			</li>
		{:else}
			<li class="palette__empty" role="presentation">Nothing matches “{query}”.</li>
		{/each}
	</ul>
</dialog>

<style>
	.palette {
		width: min(560px, calc(100vw - 2rem));
		margin: 12vh auto auto;
		padding: 0;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-lg);
		background: var(--surface);
		color: var(--text);
		box-shadow: var(--shadow-4);
		overflow: hidden;
	}

	.palette::backdrop {
		background: rgba(var(--text-rgb), 0.35);
		backdrop-filter: blur(3px);
	}

	.palette[open] {
		animation: palette-in var(--dur-base) var(--ease-out);
	}

	@keyframes palette-in {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.985);
		}
	}

	.palette__bar {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding: 0 var(--s-4);
		border-bottom: 1px solid var(--line);
		color: var(--text-muted);
	}

	.palette__input {
		flex: 1;
		min-width: 0;
		height: 3.25rem;
		border: 0;
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 1rem;
	}

	.palette__input::placeholder {
		color: var(--text-muted);
	}

	.palette__input:focus-visible {
		outline: none;
	}

	.palette__bar:focus-within {
		box-shadow: inset 0 -2px 0 var(--accent);
	}

	.palette__kbd {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		padding: 0.2rem 0.4rem;
		border: 1px solid var(--line-strong);
		border-radius: var(--r-xs);
		background: var(--bg);
		color: var(--text-muted);
	}

	.palette__list {
		list-style: none;
		margin: 0;
		padding: var(--s-2);
		max-height: min(52vh, 420px);
		overflow-y: auto;
	}

	.palette__group {
		padding: var(--s-3) var(--s-3) var(--s-1);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.palette__item {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-4);
		width: 100%;
		padding: 0.625rem var(--s-3);
		border: 0;
		border-radius: var(--r-sm);
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 0.9375rem;
		text-align: left;
		cursor: pointer;
	}

	.palette__item[aria-selected='true'] {
		background: var(--accent-wash);
		color: var(--accent-dim);
	}

	.palette__label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.palette__hint {
		flex: none;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-muted);
		max-width: 40%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.palette__empty {
		padding: var(--s-5) var(--s-3);
		color: var(--text-muted);
		text-align: center;
	}
</style>
