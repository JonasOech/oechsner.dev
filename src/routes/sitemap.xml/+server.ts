import { posts } from '$lib/posts';
import { site } from '$lib/data/site';
import type { RequestHandler } from './$types';

export const prerender = true;

const staticPaths = ['/', '/about', '/blog', '/contact', '/impressum', '/datenschutz'];

export const GET: RequestHandler = () => {
	const urls = [
		...staticPaths.map((path) => ({ loc: `${site.url}${path === '/' ? '' : path}`, lastmod: '' })),
		...posts.map((post) => ({ loc: `${site.url}/blog/${post.slug}`, lastmod: post.date }))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		({ loc, lastmod }) =>
			`  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'max-age=0, s-maxage=3600'
		}
	});
};
