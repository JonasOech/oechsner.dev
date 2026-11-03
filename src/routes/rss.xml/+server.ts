import { posts } from '$lib/posts';
import { site } from '$lib/data/site';
import { entryUrl, escapeXml as escape, postInstant, postUrl } from '$lib/feed';
import { feedContent } from '$lib/server/feed-content';
import type { RequestHandler } from './$types';

export const prerender = true;

/** A CDATA section cannot contain its own terminator, so split any `]]>` across two. */
const cdata = (html: string) => `<![CDATA[${html.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;

export const GET: RequestHandler = () => {
	const items = posts
		.map(
			(post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${escape(entryUrl(post))}</link>
      <guid isPermaLink="true">${postUrl(post.slug)}</guid>
      <description>${escape(post.summary)}</description>
      <content:encoded>${cdata(feedContent(post))}</content:encoded>
      <pubDate>${new Date(postInstant(post.date)).toUTCString()}</pubDate>
${post.tags.map((tag) => `      <category>${escape(tag)}</category>`).join('\n')}
    </item>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escape(site.name)}</title>
    <link>${site.url}</link>
    <description>${escape(site.description)}</description>
    <language>en-gb</language>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'max-age=0, s-maxage=3600'
		}
	});
};
