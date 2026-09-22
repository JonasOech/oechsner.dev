import { posts } from '$lib/posts';
import { site } from '$lib/data/site';
import { escapeXml as escape, feedUpdated, postInstant, postUrl } from '$lib/feed';
import { feedContent } from '$lib/server/feed-content';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const entries = posts
		.map(
			(post) => `  <entry>
    <title>${escape(post.title)}</title>
    <link rel="alternate" type="text/html" href="${postUrl(post.slug)}" />
    <id>${postUrl(post.slug)}</id>
    <published>${postInstant(post.date)}</published>
    <updated>${postInstant(post.date)}</updated>
    <summary type="text">${escape(post.summary)}</summary>
    <content type="html">${escape(feedContent(post))}</content>
${post.tags.map((tag) => `    <category term="${escape(tag)}" />`).join('\n')}
  </entry>`
		)
		.join('\n');

	// The feed <id> must never change once published — keep it the bare site URL.
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-gb">
  <title>${escape(site.name)}</title>
  <subtitle>${escape(site.description)}</subtitle>
  <id>${site.url}/</id>
  <updated>${feedUpdated(posts)}</updated>
  <link rel="self" type="application/atom+xml" href="${site.url}/atom.xml" />
  <link rel="alternate" type="text/html" href="${site.url}/" />
  <author><name>${escape(site.name)}</name></author>
${entries}
</feed>`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/atom+xml; charset=utf-8',
			'cache-control': 'max-age=0, s-maxage=3600'
		}
	});
};
