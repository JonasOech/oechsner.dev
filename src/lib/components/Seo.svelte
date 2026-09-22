<script lang="ts">
	import { page } from '$app/state';
	import { feeds, site } from '$lib/data/site';

	let {
		title,
		description = site.description,
		type = 'website',
		published,
		image = '/img/og.svg'
	}: {
		title: string;
		description?: string;
		type?: 'website' | 'article';
		published?: string;
		image?: string;
	} = $props();

	const fullTitle = $derived(title === site.name ? title : `${title} — ${site.shortName}`);
	const canonical = $derived(new URL(page.url.pathname, site.url).href);

	/**
	 * Social platforms reject SVG for og:image / twitter:image — the accepted formats are
	 * JPEG, PNG, WebP and GIF, so an SVG here means every shared link previews with no
	 * image at all. `npm run og` rasterises each SVG in static/img to a PNG beside it;
	 * this swaps the extension so pages keep the crisp SVG while previews get the PNG.
	 */
	const absoluteImage = $derived(new URL(image.replace(/\.svg$/, '.png'), site.url).href);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<link
		rel="alternate"
		type="application/rss+xml"
		title="{site.shortName} — RSS"
		href="{site.url}{feeds.rss}"
	/>
	<link
		rel="alternate"
		type="application/atom+xml"
		title="{site.shortName} — Atom"
		href="{site.url}{feeds.atom}"
	/>

	<meta property="og:type" content={type} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={absoluteImage} />
	<meta property="og:site_name" content={site.shortName} />
	<meta property="og:locale" content="en_GB" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={absoluteImage} />

	{#if type === 'article' && published}
		<meta property="article:published_time" content={published} />
		<meta property="article:author" content={site.name} />
	{/if}
</svelte:head>
