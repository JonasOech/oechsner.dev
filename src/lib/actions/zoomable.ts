import { mount, unmount } from 'svelte';
import type { Action } from 'svelte/action';
import Icon from '$lib/components/Icon.svelte';

/**
 * Gives every image and video inside the node a way into the lightbox (`Lightbox.svelte`):
 * a corner button that fades in on hover and takes keyboard focus, and — where there is no
 * hover to fade anything in — a tap on the image itself.
 *
 * It works on `<img>` and `<video>` elements and does not care what they hold: PNG, JPEG,
 * WebP, AVIF, an animated GIF or an SVG file are all the same thing here, and so is an
 * `<img>` inside a `<picture>`.
 *
 * A video comes in two kinds. One without `controls` — the muted loop that stands in for
 * a GIF — is treated as an image throughout. One with `controls` is a player, and a tap
 * on it means play: it keeps its taps, and on a touch screen it gets no button either,
 * because every corner of a phone's inline player is already a control and the player
 * has a full-screen button of its own.
 *
 * This runs on the rendered DOM rather than in the mdsvex pipeline because posts write
 * their figures as raw HTML, which reaches remark as opaque strings, and because it keeps
 * a post plain markdown that Obsidian still renders. Nothing here is needed to read the
 * page: without JS the images are simply images.
 *
 * `key` is whatever identifies the content inside the node. The post route keeps one
 * `.prose` element and swaps the post inside it on navigation, so the action is told when
 * to look again instead of watching the subtree for mutations it mostly causes itself.
 *
 * Each image ends up in a `span.zoomable`, the box its button is pinned to. Where the
 * markup already provides that span the action uses it and adds only the button; where it
 * does not, the action wraps the image itself.
 *
 * Left alone on purpose:
 * - images inside a link, a button or a widget — they already mean something else when
 *   pressed, or are a figure's working parts rather than a picture;
 * - `<img data-no-zoom>`, the author's opt-out;
 * - an unwrapped image that is a direct child of the node. Wrapping moves the image, and
 *   one sitting at the edge of the post's fragment is a node Svelte removes the old post
 *   by — moved, the old post would not come out cleanly on navigation. Markdown images sit
 *   in a `<p>` and figures in a `<figure>`, so this only ever concerns a bare top-level
 *   `<img>` tag, and writing the `span.zoomable` around it by hand brings it back in.
 */
export type ZoomableMedia = HTMLImageElement | HTMLVideoElement;

export type ZoomableParams = {
	open: (media: ZoomableMedia, opener: HTMLElement) => void;
	key?: unknown;
};

const SKIP = 'a, button, .widget, [data-no-zoom]';

/** Below this an image is a thumbnail, and gets a button sized not to sit on all of it. */
const COMPACT_WIDTH = 128;
const COMPACT_HEIGHT = 96;

export const zoomable: Action<HTMLElement, ZoomableParams> = (node, params) => {
	let { open } = params;

	// Safari before 15.4 has no modal <dialog>, which is what the lightbox is. Offer
	// nothing there rather than a button that cannot deliver.
	const supported =
		typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype;

	function enhance() {
		if (!supported) return () => {};
		const undo: (() => void)[] = [];

		// Watched rather than measured once: an image has no size until it has loaded,
		// and the column it sits in changes width with the window.
		const sizes = new ResizeObserver((entries) => {
			for (const { target, contentRect } of entries) {
				target
					.closest('.zoomable')
					?.classList.toggle(
						'zoomable--compact',
						contentRect.width < COMPACT_WIDTH || contentRect.height < COMPACT_HEIGHT
					);
			}
		});
		undo.push(() => sizes.disconnect());

		for (const media of node.querySelectorAll<ZoomableMedia>('img, video')) {
			if (media.closest(SKIP)) continue;

			const video = media instanceof HTMLVideoElement ? media : null;
			// The same element, typed without the union the event overloads stumble on.
			const element: HTMLElement = media;

			// A <picture> picks its source only while the <img> is its own child, so the
			// pair is wrapped whole.
			const subject = media.parentElement?.tagName === 'PICTURE' ? media.parentElement : media;
			const parent = subject.parentElement;
			if (!parent) continue;

			const provided = parent.classList.contains('zoomable');
			if (!provided && parent === node) continue;

			// The wrapper is the box the button is placed against: an image narrower than
			// the column would otherwise leave its button out in the margin.
			const wrapper = provided ? parent : document.createElement('span');
			if (!provided) {
				wrapper.className = 'zoomable';
				subject.replaceWith(wrapper);
				wrapper.appendChild(subject);
			}
			wrapper.classList.toggle('zoomable--player', video?.controls ?? false);

			// After the image in the DOM, so it is announced and tabbed to in that order.
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'zoomable__btn';
			button.title = 'Maximise';
			button.setAttribute('aria-label', video ? 'Maximise the video' : 'Maximise the image');
			button.setAttribute('aria-haspopup', 'dialog');
			const icon = mount(Icon, { target: button, props: { name: 'maximize' } });
			wrapper.appendChild(button);

			const show = () => open(media, button);

			// A tap opens the image; a mouse click on it does not, because a mouse has the
			// button. `click` does not reliably say what kind of pointer made it (Safari has
			// sent it as a plain MouseEvent), so the pointerdown before it is asked instead.
			let pointerType = '';
			const onPointerDown = (event: PointerEvent) => {
				pointerType = event.pointerType;
			};
			const onClick = () => {
				const touch = pointerType
					? pointerType !== 'mouse'
					: matchMedia('(hover: none)').matches;
				pointerType = '';
				// Asked at the time: a player's tap is play and pause.
				if (touch && !video?.controls) show();
			};

			button.addEventListener('click', show);
			// On the image itself, not delegated: iOS Safari only sends `click` to an
			// element it considers clickable, and a listener on it is what makes it so.
			element.addEventListener('pointerdown', onPointerDown);
			element.addEventListener('click', onClick);
			sizes.observe(element);

			undo.push(() => {
				element.removeEventListener('pointerdown', onPointerDown);
				element.removeEventListener('click', onClick);
				void unmount(icon);
				button.remove();
				wrapper.classList.remove('zoomable--compact', 'zoomable--player');
				// On navigation the old post is already out of the document and this is a
				// no-op; on teardown in place it puts the markup back as it was written.
				if (!provided && wrapper.parentNode) wrapper.replaceWith(subject);
			});
		}

		return () => undo.forEach((fn) => fn());
	}

	let cleanup = enhance();

	return {
		update(next) {
			const changed = next.key !== params.key;
			params = next;
			({ open } = next);
			if (!changed) return;
			cleanup();
			cleanup = enhance();
		},
		destroy() {
			cleanup();
		}
	};
};
