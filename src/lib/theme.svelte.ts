/**
 * The footer's theme control. Three states: follow the system (the default, and the only
 * behaviour without JavaScript), or pin one of the two papers.
 *
 * A pinned choice is stored under `theme` and applied by the inline script in app.html
 * before first paint; this module only has to change it afterwards. Every storage access
 * is wrapped, because it throws in private windows and with site data blocked, and the
 * page must still work — the choice then simply lasts until the tab closes.
 */

export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'theme';
const CHROME = { light: '#fbf9f5', dark: '#1c1b19' } as const;

let choice = $state<ThemeChoice>('system');

export const theme = {
	get choice() {
		return choice;
	}
};

/** Reads whatever app.html's script applied, so the control starts in the right state. */
export function initTheme() {
	try {
		const stored = localStorage.getItem(KEY);
		choice = stored === 'light' || stored === 'dark' ? stored : 'system';
	} catch {
		choice = 'system';
	}
	paintChrome();
}

export function setTheme(next: ThemeChoice) {
	choice = next;
	const root = document.documentElement;
	if (next === 'system') delete root.dataset.theme;
	else root.dataset.theme = next;
	try {
		if (next === 'system') localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, next);
	} catch {
		/* storage unavailable: the choice holds for this visit only */
	}
	paintChrome();
}

/** Keeps the browser UI colour in step with an explicit choice; `system` restores the media-query pair. */
function paintChrome() {
	const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
	metas.forEach((meta) => {
		const media = meta.getAttribute('media') ?? '';
		const own = media.includes('dark') ? 'dark' : 'light';
		// With a pinned paper both tags must agree; otherwise each keeps its own colour.
		meta.content = choice === 'system' ? CHROME[own] : CHROME[choice];
	});
}
