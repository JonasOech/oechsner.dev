<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';

	/**
	 * The maximised view of a post image or video: the picture as large as the screen
	 * allows, its caption under it, and zoom on every input a reader might bring — wheel,
	 * trackpad pinch, touch pinch, double-tap, click, buttons and keys.
	 *
	 * One instance serves a whole post. The `zoomable` action (`$lib/actions/zoomable.ts`)
	 * puts the way in on each image and video and calls `open()` with it.
	 *
	 * What it shows is whatever an `<img>` or `<video>` can: PNG, JPEG, WebP, AVIF, GIF
	 * (animated or not), SVG files, and any video the browser plays. A video with no
	 * controls of its own — the looping clip that stands in for a GIF — is a moving image
	 * and zooms like one. A video *with* controls is a player: it is maximised, but every
	 * gesture on it stays the player's, so it does not zoom.
	 *
	 * It is a modal `<dialog>` filling the viewport, not the Fullscreen API: on iPhone
	 * Safari that API has long been for video only, so an overlay is the one construction
	 * that behaves the same on every device. A dialog is in the top layer everywhere —
	 * above the sticky header without any z-index — makes the page behind inert, and gets
	 * Escape and the Android back gesture for free.
	 *
	 * The image is zoomed by giving it a real width and height, and only *moved* with a
	 * transform. Scaling it with `transform: scale()` would be cheaper, but Safari is
	 * prone to rasterising a transformed layer at its laid-out size and stretching the
	 * bitmap, so a zoomed SVG or chart comes out soft exactly when the reader wants detail.
	 */

	type Media = HTMLImageElement | HTMLVideoElement;

	type Item = {
		kind: 'image' | 'video';
		/** An image's address: whatever the page's own `<img>` settled on, so a `<picture>`
		    or `srcset` has already chosen the format this browser can show. A video is
		    cloned instead (see `player`) and has none. */
		src: string;
		/** The alt text, or a video's `aria-label` / `title`. */
		label: string;
		/** The figure's caption as markup; empty where there is none. */
		caption: string;
		/** A video with its own controls. Pointer, wheel and keys on it belong to the player. */
		controls: boolean;
		/** Dark-ink diagrams keep the light ground they have in the post (`figure.plain`). */
		plate: boolean;
		/** An SVG file: sharp at any size, so it may fill the screen and zoom without limit. */
		vector: boolean;
		width: number;
		height: number;
	};

	/** The plate's padding, in px because the pan arithmetic has to know it. */
	const PLATE_PAD = 16;
	/** A small bitmap is not blown up past this to fill the screen; an SVG has no such limit. */
	const MAX_UPSCALE = 2;
	/** Where a click or double-tap zooms to, and one press of the +/− buttons. */
	const TOGGLE_ZOOM = 2.5;
	const STEP = 1.5;
	/** Movement below this is still a tap, and two taps this close together are a double. */
	const TAP_SLOP = 8;
	const DOUBLE_TAP_MS = 320;
	const DOUBLE_TAP_SLOP = 36;

	let dialog: HTMLDialogElement;
	let stage: HTMLDivElement;
	let closeButton: HTMLButtonElement;
	let returnTo: HTMLElement | null = null;
	/** The page's own video while its copy is on show; outside `item` so it is never proxied. */
	let pageVideo: HTMLVideoElement | null = null;

	let item = $state<Item | null>(null);
	let stageW = $state(0);
	let stageH = $state(0);

	/** 1 is "fits the screen". The pan is the image centre's offset from the stage centre. */
	let zoom = $state(1);
	let cx = $state(0);
	let cy = $state(0);
	/** Discrete steps (buttons, keys, double-tap) glide; anything finger-driven must not lag. */
	let animate = $state(false);
	let dragging = $state(false);

	const canZoom = $derived(!!item && !item.controls);
	const pad = $derived(item?.plate ? PLATE_PAD : 0);
	const margin = $derived(stageW < 640 ? 12 : 32);

	/** The image's size at zoom 1. */
	const base = $derived.by(() => {
		if (!item || !stageW || !stageH) return null;
		const availW = Math.max(stageW - 2 * (margin + pad), 1);
		const availH = Math.max(stageH - 2 * (margin + pad), 1);
		const k = Math.min(
			availW / item.width,
			availH / item.height,
			item.vector ? Infinity : MAX_UPSCALE
		);
		return { w: item.width * k, h: item.height * k };
	});

	/** Far enough in to count pixels on a bitmap: twice its own resolution, and never less than 4×. */
	const maxZoom = $derived(
		!item || !base ? 1 : item.vector ? 8 : Math.max(4, (2 * item.width) / base.w)
	);

	const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value));

	function frameSize(z: number) {
		return { w: (base?.w ?? 0) * z + 2 * pad, h: (base?.h ?? 0) * z + 2 * pad };
	}

	/**
	 * How far the centre may travel on each axis: nothing while the image fits, and
	 * otherwise just enough to bring either edge in to the margin — never off into the dark.
	 */
	function limits(z: number) {
		const { w, h } = frameSize(z);
		return {
			x: Math.max(0, (w - (stageW - 2 * margin)) / 2),
			y: Math.max(0, (h - (stageH - 2 * margin)) / 2)
		};
	}

	/** Clamped here as well as on every write, so a rotated phone cannot strand the image. */
	const view = $derived.by(() => {
		if (!base) return null;
		const { w, h } = frameSize(zoom);
		const limit = limits(zoom);
		return {
			w,
			h,
			x: Math.round(stageW / 2 + clamp(cx, limit.x) - w / 2),
			y: Math.round(stageH / 2 + clamp(cy, limit.y) - h / 2)
		};
	});

	/** Zooms so that the point under (px, py) — stage coordinates — stays under it. */
	function zoomTo(next: number, px = stageW / 2, py = stageH / 2) {
		if (!base || !canZoom) return;
		next = Math.min(maxZoom, Math.max(1, next));
		const now = limits(zoom);
		const x = clamp(cx, now.x);
		const y = clamp(cy, now.y);
		const ratio = next / zoom;
		const limit = limits(next);
		cx = clamp(x + (px - (stageW / 2 + x)) * (1 - ratio), limit.x);
		cy = clamp(y + (py - (stageH / 2 + y)) * (1 - ratio), limit.y);
		zoom = next;
	}

	function panBy(dx: number, dy: number) {
		const limit = limits(zoom);
		cx = clamp(cx + dx, limit.x);
		cy = clamp(cy + dy, limit.y);
	}

	function step(next: number, px?: number, py?: number) {
		animate = true;
		zoomTo(next, px, py);
	}

	function toggle(px?: number, py?: number) {
		step(zoom > 1.01 ? 1 : TOGGLE_ZOOM, px, py);
	}

	export function open(media: Media, opener: HTMLElement | null = null) {
		const video = media instanceof HTMLVideoElement ? media : null;
		const src = video ? '' : (media as HTMLImageElement).currentSrc || media.src;
		const figcaption = media.closest('figure')?.querySelector('figcaption');
		const natural = video
			? { w: video.videoWidth, h: video.videoHeight }
			: { w: (media as HTMLImageElement).naturalWidth, h: (media as HTMLImageElement).naturalHeight };
		// An SVG file with no width and height of its own reports no natural size in some
		// browsers, and neither does anything still on its way in. The box it fills on the
		// page — less the plate's padding — has the right proportions until the viewer's
		// own copy has loaded and knows better.
		const style = getComputedStyle(media);
		const boxW =
			media.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
		const boxH =
			media.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);

		pageVideo = video;
		item = {
			kind: video ? 'video' : 'image',
			src,
			label: video
				? (video.getAttribute('aria-label') ?? video.title)
				: (media as HTMLImageElement).alt,
			caption: figcaption?.innerHTML.trim() ?? '',
			controls: video?.controls ?? false,
			plate: !video && media.closest('figure.plain') !== null,
			vector: /\.svgz?(?:[?#]|$)|^data:image\/svg\+xml/i.test(src),
			width: natural.w || Math.max(boxW, 1),
			height: natural.h || Math.max(boxH, 1)
		};
		zoom = 1;
		cx = 0;
		cy = 0;
		animate = false;
		dragging = false;
		// A gesture cut short by Escape never saw its fingers lift.
		pointers.clear();
		returnTo = opener;

		if (!dialog.open) dialog.showModal();
		// The dialog would otherwise hand focus to the first control in it, the zoom-out
		// button — which is disabled at this point.
		closeButton.focus({ preventScroll: true });
	}

	/** The viewer's own copy has loaded: whatever was guessed about its size is now known. */
	function onload(event: Event) {
		const image = event.currentTarget as HTMLImageElement;
		if (!item || !image.naturalWidth || !image.naturalHeight) return;
		item.width = image.naturalWidth;
		item.height = image.naturalHeight;
	}

	/**
	 * Puts a copy of the page's video into the frame, and hands the reader's place in it
	 * back when the viewer closes.
	 *
	 * A clone rather than a second tag written in the markup: it brings every `<source>`
	 * and `<track>` and whatever else the author set, without this component having to know
	 * the list. And a copy rather than the element itself, because moving that one out of
	 * the post would pull a node from under Svelte and restart the clip twice over.
	 */
	function player(host: HTMLElement) {
		const page = pageVideo;
		if (!page) return;

		const wasPlaying = !page.paused && !page.ended;
		const startAt = page.currentTime;
		// One soundtrack at a time.
		page.pause();

		const copy = page.cloneNode(true) as HTMLVideoElement;
		// Its size is the frame's business here, and playback is decided below rather than
		// by an attribute.
		for (const name of ['id', 'class', 'style', 'width', 'height', 'autoplay']) {
			copy.removeAttribute(name);
		}
		// Without this an iPhone takes any video that starts playing into its own full screen.
		copy.playsInline = true;
		// Properties, not attributes: the reader may have unmuted the one on the page.
		copy.muted = page.muted;
		copy.volume = page.volume;

		copy.addEventListener(
			'loadedmetadata',
			() => {
				if (item && copy.videoWidth && copy.videoHeight) {
					item.width = copy.videoWidth;
					item.height = copy.videoHeight;
				}
				// Safari may drop a position set before it knows how long the video is.
				if (startAt > 0) copy.currentTime = startAt;
			},
			{ once: true }
		);
		if (startAt > 0) copy.currentTime = startAt;
		host.appendChild(copy);

		// A clip with no controls has nothing to start it with, so it always runs — which
		// also rescues one whose autoplay the browser refused on the page (Low Power Mode on
		// iOS does that). Opening the viewer was a press, so playback is allowed here. If it
		// is refused anyway, a player still has its own play button.
		if (wasPlaying || !page.controls) copy.play().catch(() => {});

		return {
			destroy() {
				const stillPlaying = !copy.paused && !copy.ended;
				const reached = copy.currentTime;
				copy.pause();
				// Lets go of the network connection and the decoder straight away.
				copy.removeAttribute('src');
				copy.replaceChildren();
				copy.load();

				if (Number.isFinite(reached)) page.currentTime = reached;
				// Carries on where the reader left it — unless they paused it in the viewer.
				if (wasPlaying && stillPlaying) page.play().catch(() => {});
			}
		};
	}

	function close() {
		if (dialog.open) dialog.close();
	}

	/** Runs for every way out: the button, the backdrop, Escape, the back gesture. */
	function onclose() {
		item = null;
		pageVideo = null;
		// Safari does not focus a button on click, so the browser's own "return focus to
		// where it was" has nowhere to go there. Say it explicitly.
		returnTo?.focus({ preventScroll: true });
		returnTo = null;
	}

	// A swipe back, or a link in the caption, must not leave the viewer open over the next page.
	beforeNavigate(close);

	$effect(() => {
		if (!item) return;

		// The page behind must not scroll under the viewer. The scrollbar's width is handed
		// back as padding, so the column does not jump sideways as it goes and returns.
		const { overflow, paddingRight } = document.body.style;
		const scrollbar = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = 'hidden';
		if (scrollbar > 0) {
			document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbar}px`;
		}

		return () => {
			document.body.style.overflow = overflow;
			document.body.style.paddingRight = paddingRight;
		};
	});

	/* — Pointer: drag to pan, two fingers to pinch, tap to toggle or dismiss — */

	const pointers = new Map<number, { x: number; y: number }>();
	let downOnImage = false;
	let moved = false;
	let origin = { x: 0, y: 0 };
	let lastTap = { time: 0, x: 0, y: 0 };

	function toStage(clientX: number, clientY: number) {
		const rect = stage.getBoundingClientRect();
		return { x: clientX - rect.left, y: clientY - rect.top };
	}

	function onpointerdown(event: PointerEvent) {
		if (event.pointerType === 'mouse' && event.button !== 0) return;

		// Asked now, because once captured every later event reports the stage as its target.
		const onImage = (event.target as Element).closest('.lightbox__frame') !== null;

		// A press on a player is for its controls — scrubbing is a drag, too. It is not
		// captured and not tracked; only remembered, so the click that follows does not
		// count as one on the backdrop.
		if (onImage && item?.controls) {
			downOnImage = true;
			return;
		}

		// Capture, so a drag that leaves the stage — or the window — is still this drag.
		stage.setPointerCapture(event.pointerId);
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
		animate = false;

		if (pointers.size === 1) {
			downOnImage = onImage;
			moved = false;
			origin = { x: event.clientX, y: event.clientY };
		} else {
			// A second finger is never a tap.
			moved = true;
		}
	}

	function onpointermove(event: PointerEvent) {
		const previous = pointers.get(event.pointerId);
		if (!previous) return;
		const current = { x: event.clientX, y: event.clientY };
		pointers.set(event.pointerId, current);

		if (pointers.size === 1) {
			if (!moved) {
				if (Math.hypot(current.x - origin.x, current.y - origin.y) < TAP_SLOP) return;
				moved = true;
			}
			dragging = zoom > 1;
			panBy(current.x - previous.x, current.y - previous.y);
			return;
		}

		if (pointers.size === 2) {
			const other = [...pointers].find(([id]) => id !== event.pointerId)![1];
			const before = Math.hypot(previous.x - other.x, previous.y - other.y);
			const after = Math.hypot(current.x - other.x, current.y - other.y);
			const mid = toStage((current.x + other.x) / 2, (current.y + other.y) / 2);

			if (before > 0) zoomTo((zoom * after) / before, mid.x, mid.y);
			// The midpoint travelling is the two fingers dragging together.
			panBy((current.x - previous.x) / 2, (current.y - previous.y) / 2);
		}
	}

	function onpointerup(event: PointerEvent) {
		if (!pointers.delete(event.pointerId)) return;
		if (pointers.size > 0) return;
		dragging = false;
		if (moved || event.type === 'pointercancel' || !downOnImage) return;

		const point = toStage(event.clientX, event.clientY);

		// A mouse click is deliberate, so one is enough. A finger lands on the picture all
		// the time — on the way to a pinch, or just holding the phone — so it takes two.
		if (event.pointerType === 'mouse') {
			toggle(point.x, point.y);
			return;
		}

		const double =
			event.timeStamp - lastTap.time < DOUBLE_TAP_MS &&
			Math.hypot(point.x - lastTap.x, point.y - lastTap.y) < DOUBLE_TAP_SLOP;
		lastTap = double ? { time: 0, x: 0, y: 0 } : { time: event.timeStamp, ...point };
		if (double) toggle(point.x, point.y);
	}

	$effect(() => {
		// Everything the stage listens to is attached here by hand rather than in the
		// markup. Wheel and gesture listeners must be non-passive to cancel the browser's
		// own response; TypeScript has never heard of Safari's gesture events; and iOS
		// Safari only sends `click` to an element with a listener of its own, which a
		// delegated Svelte handler is not. The pointer handlers come along so the whole
		// gesture vocabulary is in one place.
		//
		// All of it is pointer-only by design, and all of it has a keyboard route: Escape
		// and the close button to leave, the +/− buttons and keys to zoom, the arrows to pan.

		// Dismissal waits for `click` rather than acting on pointerup: closing on the way
		// up leaves the click that follows to land on whatever in the article was underneath.
		const ondismiss = () => {
			if (!moved && !downOnImage) close();
		};

		const onwheel = (event: WheelEvent) => {
			event.preventDefault();
			animate = false;
			const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stageH : 1;
			// Chrome and Firefox report a trackpad pinch as ctrl+wheel with small deltas.
			const rate = event.ctrlKey ? 0.01 : 0.0015;
			const point = toStage(event.clientX, event.clientY);
			zoomTo(zoom * Math.exp(-event.deltaY * unit * rate), point.x, point.y);
		};

		// Safari on a Mac reports a trackpad pinch as these instead, and zooms the whole
		// page unless they are cancelled. iOS fires them too, alongside the pointer events
		// that already handled the same two fingers — so there they are only cancelled.
		let gestureZoom = 1;
		const ongesture = (event: Event) => {
			event.preventDefault();
			if (pointers.size > 0) return;
			const gesture = event as Event & { scale: number; clientX: number; clientY: number };
			if (event.type === 'gesturestart') gestureZoom = zoom;
			if (event.type !== 'gesturechange') return;
			animate = false;
			const point = toStage(gesture.clientX, gesture.clientY);
			zoomTo(gestureZoom * gesture.scale, point.x, point.y);
		};

		// A citation in the caption points into the article behind the viewer.
		const onlink = (event: MouseEvent) => {
			if ((event.target as Element).closest('.lightbox__caption a')) close();
		};

		const gestures = ['gesturestart', 'gesturechange', 'gestureend'];
		stage.addEventListener('pointerdown', onpointerdown);
		stage.addEventListener('pointermove', onpointermove);
		stage.addEventListener('pointerup', onpointerup);
		stage.addEventListener('pointercancel', onpointerup);
		stage.addEventListener('click', ondismiss);
		stage.addEventListener('wheel', onwheel, { passive: false });
		gestures.forEach((type) => dialog.addEventListener(type, ongesture, { passive: false }));
		dialog.addEventListener('click', onlink);

		return () => {
			stage.removeEventListener('pointerdown', onpointerdown);
			stage.removeEventListener('pointermove', onpointermove);
			stage.removeEventListener('pointerup', onpointerup);
			stage.removeEventListener('pointercancel', onpointerup);
			stage.removeEventListener('click', ondismiss);
			stage.removeEventListener('wheel', onwheel);
			gestures.forEach((type) => dialog.removeEventListener(type, ongesture));
			dialog.removeEventListener('click', onlink);
		};
	});

	function onkeydown(event: KeyboardEvent) {
		if (!item || event.metaKey || event.ctrlKey || event.altKey) return;
		// Space, the arrows and the rest mean play, seek and volume to a focused player.
		if ((event.target as Element).closest('video')) return;

		const pan = 80;
		const onControl = (event.target as Element).closest('button, a') !== null;

		switch (event.key) {
			case '+':
			case '=':
				step(zoom * STEP);
				break;
			case '-':
			case '_':
				step(zoom / STEP);
				break;
			case '0':
				step(1);
				break;
			case 'ArrowLeft':
				panBy(pan, 0);
				break;
			case 'ArrowRight':
				panBy(-pan, 0);
				break;
			case 'ArrowUp':
				panBy(0, pan);
				break;
			case 'ArrowDown':
				panBy(0, -pan);
				break;
			// These would scroll the article behind the viewer.
			case 'PageUp':
			case 'PageDown':
			case 'Home':
			case 'End':
				break;
			case ' ':
				if (onControl) return;
				break;
			default:
				return;
		}
		event.preventDefault();
	}
</script>

<svelte:window {onkeydown} />

<dialog
	class="lightbox"
	aria-label={item?.kind === 'video' ? 'Maximised video' : 'Maximised image'}
	bind:this={dialog}
	{onclose}
>
	<div
		class="lightbox__stage"
		class:lightbox__stage--dragging={dragging}
		bind:this={stage}
		bind:clientWidth={stageW}
		bind:clientHeight={stageH}
	>
		{#if item && view}
			<div
				class="lightbox__frame"
				class:lightbox__frame--plate={item.plate}
				class:lightbox__frame--player={item.controls}
				class:lightbox__frame--zoomed={zoom > 1.01}
				class:lightbox__frame--animate={animate}
				style="width: {view.w}px; height: {view.h}px; padding: {pad}px; transform: translate({view.x}px, {view.y}px)"
			>
				{#if item.kind === 'video'}
					<div class="lightbox__media" use:player></div>
				{:else}
					<img class="lightbox__media" src={item.src} alt={item.label} draggable="false" {onload} />
				{/if}
			</div>
		{/if}
	</div>

	<div class="lightbox__tools">
		{#if canZoom}
			<button
				class="lightbox__tool"
				type="button"
				title="Zoom out"
				aria-label="Zoom out"
				aria-disabled={zoom <= 1.01}
				onclick={() => step(zoom / STEP)}
			>
				<Icon name="minus" />
			</button>
			<button
				class="lightbox__tool"
				type="button"
				title="Zoom in"
				aria-label="Zoom in"
				aria-disabled={zoom >= maxZoom - 0.01}
				onclick={() => step(zoom * STEP)}
			>
				<Icon name="plus" />
			</button>
		{/if}
		<button
			class="lightbox__tool lightbox__tool--close"
			type="button"
			title="Close"
			aria-label={item?.kind === 'video' ? 'Close the maximised video' : 'Close the maximised image'}
			bind:this={closeButton}
			onclick={close}
		>
			<Icon name="minimize" />
		</button>
	</div>

	{#if item && (item.caption || item.label)}
		<!-- A figure without a caption shows its alt text instead. That is already what the
		     image announces, so it is not read out a second time. -->
		<div class="lightbox__caption" aria-hidden={item.caption ? undefined : true}>
			<div class="lightbox__caption-text">
				{#if item.caption}{@html item.caption}{:else}{item.label}{/if}
			</div>
		</div>
	{/if}
</dialog>

<style>
	/* The UA sheet centres a modal dialog and caps it short of the viewport; all of that is
	   undone so it *is* the viewport. Sized by `inset` rather than by `100vh`, which on iOS
	   Safari is the height with the toolbars retracted and would put the caption under them. */
	.lightbox {
		position: fixed;
		inset: 0;
		width: auto;
		height: auto;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		overflow: hidden;
		/* The scrim is the dialog's own background, not `::backdrop`: in older engines —
		   Safari before 17.4 among them — a backdrop does not inherit custom properties,
		   so it could not read the palette. */
		background: rgba(var(--bg-deep-rgb), 0.97);
		color: var(--text-secondary);
		/* No gesture started anywhere in here belongs to the page — not a scroll, not
		   Safari's double-tap or pinch zoom. */
		touch-action: none;
		overscroll-behavior: contain;
	}

	.lightbox::backdrop {
		background: transparent;
	}

	/* Only when open: a `display` on the bare class would show the closed dialog. */
	.lightbox[open] {
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		animation: lightbox-in var(--dur-base) var(--ease-out);
	}

	@keyframes lightbox-in {
		from {
			opacity: 0;
		}
	}

	.lightbox__stage {
		position: relative;
		min-width: 0;
		overflow: hidden;
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
		/* Anywhere that is not the picture is the way back out. */
		cursor: zoom-out;
	}

	.lightbox__frame {
		position: absolute;
		top: 0;
		left: 0;
		border-radius: 6px;
		overflow: hidden;
		/* The page's own ground, so a transparent image sits on what it was drawn for
		   rather than on the ghost of the article showing through the scrim. */
		background: var(--bg);
		/* The hairline every post image wears, drawn as a shadow so it adds nothing to the
		   box the zoom arithmetic sizes. */
		box-shadow:
			0 0 0 1px var(--line),
			var(--shadow-4);
		cursor: zoom-in;
	}

	.lightbox__frame--plate {
		background: var(--plate);
	}

	.lightbox__frame--zoomed {
		cursor: grab;
	}

	/* Nothing to zoom on a player, so nothing promises it. */
	.lightbox__frame--player {
		cursor: auto;
	}

	.lightbox__stage--dragging .lightbox__frame {
		cursor: grabbing;
	}

	.lightbox__frame--animate {
		transition:
			width var(--dur-fast) var(--ease-out),
			height var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-out);
	}

	/* The image itself, or the box a video's copy is put into. */
	.lightbox__media,
	.lightbox__media :global(video) {
		display: block;
		width: 100%;
		height: 100%;
		max-width: none;
		object-fit: contain;
	}

	/* A mouse drag on an image starts a native drag-and-drop, and a long press on iOS
	   raises the save sheet — either would take the gesture away from the pan. */
	img.lightbox__media {
		-webkit-user-drag: none;
		-webkit-touch-callout: none;
	}

	/* — Controls: over the stage's corner, where a zoomed image passes beneath them — */

	.lightbox__tools {
		position: absolute;
		top: max(var(--s-3), env(safe-area-inset-top));
		right: max(var(--s-3), env(safe-area-inset-right));
		display: flex;
		gap: var(--s-2);
	}

	.lightbox__tool {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 1px solid var(--line-strong);
		border-radius: 6px;
		/* Translucent like the scrolled header, but without its blur: what moves under
		   these is the image being dragged, and blurring that every frame is the one thing
		   DESIGN.md §8 rules out. */
		background: rgba(var(--surface-rgb), 0.82);
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			color var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out),
			opacity var(--dur-fast) var(--ease-out);
	}

	/* Set apart from the zoom pair — when there is one. */
	.lightbox__tool + .lightbox__tool--close {
		margin-left: var(--s-2);
	}

	@media (hover: hover) and (pointer: fine) {
		.lightbox__tool:hover:not([aria-disabled='true']) {
			background: var(--surface-hover);
			color: var(--text);
		}
	}

	.lightbox__tool:active:not([aria-disabled='true']) {
		background: var(--surface-active);
		color: var(--text-pressed);
	}

	.lightbox__tool:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* `aria-disabled`, not `disabled`: a button that disables itself under a keyboard user
	   — zoom out, at the last step — would drop their focus on the floor. */
	.lightbox__tool[aria-disabled='true'] {
		opacity: 0.45;
		cursor: default;
	}

	@media (pointer: coarse) {
		.lightbox__tool {
			width: 2.75rem;
			height: 2.75rem;
		}
	}

	/* — Caption: its own row, so the image is fitted above it and never hides it — */

	.lightbox__caption {
		padding-block: var(--s-4) max(var(--s-4), env(safe-area-inset-bottom));
		padding-inline: max(var(--gutter), env(safe-area-inset-left))
			max(var(--gutter), env(safe-area-inset-right));
		border-top: 1px solid var(--line);
		background: var(--bg-deep);
		font-size: 0.8125rem;
		line-height: 1.6;
		/* A caption long enough to need it scrolls by itself rather than squeezing the image. */
		max-height: 30vh;
		overflow-y: auto;
		touch-action: pan-y;
		overscroll-behavior: contain;
	}

	/* One line sits under the middle of the image; more than one reads as a paragraph —
	   the same shrink-wrap LatexBlock uses for a formula's note. */
	.lightbox__caption-text {
		width: fit-content;
		max-width: var(--measure-prose);
		margin-inline: auto;
	}

	.lightbox__caption :global(a) {
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: var(--accent-dim);
		text-underline-offset: 0.2em;
	}

	.lightbox__caption :global(a:focus-visible) {
		outline: none;
		border-radius: 2px;
		box-shadow: var(--focus-ring);
	}
</style>
