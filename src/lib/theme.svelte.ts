/**
 * Light/dark colour scheme. The inline script in src/app.html sets `data-theme` on <html>
 * before first paint (saved choice, else the OS preference); this module reads it back
 * and flips it. Every colour is a token in src/app.css with a value for each scheme.
 */

export type Theme = 'light' | 'dark';

/** Must match `--bg` for each scheme in app.css; a meta attribute cannot read a CSS variable. */
const themeColor: Record<Theme, string> = { light: '#f5f3ee', dark: '#181714' };

export const ui = $state<{ theme: Theme }>({ theme: 'light' });

function syncMeta() {
	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor[ui.theme]);
}

/** Read what the pre-paint script decided. Call once on the client. */
export function initTheme() {
	ui.theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	syncMeta();
}

export function setTheme(theme: Theme) {
	ui.theme = theme;
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem('theme', theme);
	} catch {
		// Private mode or blocked storage: the choice just won't survive a reload.
	}
	syncMeta();
}
