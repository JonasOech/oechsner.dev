// Every route on this site is static: posts are `.svx` files compiled at build time and
// there are no server routes. Prerendering the whole thing means Cloudflare serves plain
// HTML from the edge cache and the Worker is only a fallback.
export const prerender = true;
export const trailingSlash = 'never';
