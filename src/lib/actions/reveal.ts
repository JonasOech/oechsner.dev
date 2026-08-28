import type { Action } from 'svelte/action';

/**
 * One-shot scroll reveal (DESIGN.md §7).
 *
 * The `.reveal` class is added by this action rather than sitting in the markup, so a
 * visitor without JS — or with JS that failed — gets a fully rendered page instead of a
 * blank column of `opacity: 0` elements. Each element is unobserved as soon as it fires,
 * so there is no persistent scroll work.
 */
export const reveal: Action<HTMLElement, { stagger?: boolean } | undefined> = (node, params) => {
	const reduced =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	node.classList.add('reveal');
	if (params?.stagger) node.classList.add('reveal--stagger');

	if (reduced || typeof IntersectionObserver === 'undefined') {
		node.classList.add('is-visible');
		return;
	}

	// Index children so `--i` drives the stagger delay.
	if (params?.stagger) {
		Array.from(node.children).forEach((child, i) => {
			(child as HTMLElement).style.setProperty('--i', String(i));
		});
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		},
		{ rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
