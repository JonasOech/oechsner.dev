# RSS / Syndication — Planning Document

_Status: draft · Owner: Jonas · Last updated: 2026-09-22_

## 0. TL;DR

A working RSS 2.0 feed **already exists** at `/rss.xml`. This document
first records what that feed does today, then plans three concrete
additions decided in review:

1. **Keep the feed summary-only** (no full-content `content:encoded`).
2. **Add an Atom 1.0 feed** at `/atom.xml` alongside the RSS one.
3. **Add feed autodiscovery** — a `<link rel="alternate">` in the
   site-wide `<head>` so readers find the feeds automatically.

Explicit non-goals for this round: full-content feeds, JSON Feed,
per-tag feeds, per-post timestamps, and pulling archived posts into the
feed. Each is discussed under [§6 Non-goals](#6-non-goals-decided-out-of-scope)
so the reasoning is on record rather than lost.

---

## 1. What already exists (as of this document)

The feed is not a greenfield build — it shipped already and works. The
plan below is an *upgrade*, so it helps to state the baseline precisely.

### 1.1 The endpoint

`src/routes/rss.xml/+server.ts` is a SvelteKit endpoint that:

- Is **prerendered** (`export const prerender = true`), so it becomes a
  static `rss.xml` file at build time — no runtime cost on Cloudflare.
- Reads the published posts from `$lib/posts` (`posts`, newest-first).
- Reads channel identity from `$lib/data/site` (`site.name`, `site.url`,
  `site.description`).
- Emits **RSS 2.0** with an `atom:self` link and per-item
  `title`, `link`, `guid` (permalink), `description`, `pubDate`, and one
  `<category>` per tag.
- Escapes `& < > "` via a small local `escape()` helper.
- Sets `content-type: application/xml; charset=utf-8` and
  `cache-control: max-age=0, s-maxage=3600` (fresh at the edge for 1h).

### 1.2 Where the data comes from

`src/lib/posts.ts` eagerly globs `/src/posts/*.svx` (mdsvex), validates
that each post has a `title` and `date`, and exposes `posts` sorted
newest-first with `draft` posts filtered out in production. The RSS
route consumes this list directly, so the feed automatically tracks
whatever the blog index shows.

Each `Post` carries: `slug`, `title`, `date` (a `YYYY-MM-DD` string),
`summary`, `tags`, and rendering metadata (`readingMinutes`,
`headings`, `nerdyness`, `ai`, `hero`).

### 1.3 Known limitations of the current feed

These are observations, not all of them in scope to fix now:

| # | Observation | In scope this round? |
|---|-------------|----------------------|
| L1 | `<description>` is `post.summary` only — no article body. | No — decided summary-only |
| L2 | `pubDate` is always `…T00:00:00Z`; same-day posts have no stable order and times are fabricated. | No |
| L3 | Archived posts (`src/posts/archive/*.svx`) never reach the feed. | No — deliberate |
| L4 | No `<link rel="alternate">` autodiscovery anywhere in `<head>`. | **Yes** |
| L5 | RSS 2.0 only — no Atom, no JSON Feed. | **Yes (Atom)** |

---

## 2. Goals

1. Give feed readers a **second standard format (Atom 1.0)** so tools
   that prefer or require Atom work cleanly.
2. Make both feeds **discoverable automatically** by browsers and
   readers, so a user can paste `oechsner.dev` into a reader and have it
   find the feed without knowing the exact URL.
3. Do the above **without changing the reading model** — the feed stays a
   summary that drives clicks back to the site, matching the blog's
   "read it on the page" design.

## 3. Decisions (from review)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Item content | ~~Summary only~~ → **Full content** (revised 2026-09-22) | Now ships the whole post (`content:encoded` / Atom `<content>`), rendered at build by `src/lib/server/feed-content.ts`: inline styles, MathML-only KaTeX, absolute URLs, PluginRacks as lists, other widgets as a link back to the post. `<description>`/`<summary>` stay the summary. |
| Formats | **RSS 2.0 + Atom 1.0** | RSS stays as-is; Atom added for broader reader/tool compatibility. |
| Discovery | **Add autodiscovery `<link>`** | The one piece of "make it findable" that's currently missing. |
| Archive posts | **Stay excluded** | The archive is intentionally off the main index; the feed mirrors the index. |
| Timestamps | **Leave date-only** | Not worth fabricating per-post times; date-level ordering is acceptable for a personal blog. |

---

## 4. Design

### 4.1 Atom feed — `src/routes/atom.xml/+server.ts`

Mirror the existing RSS route's structure and data source exactly; only
the serialization differs. This keeps the two feeds in lockstep — same
posts, same ordering, same summary-only content.

Atom-specific requirements to get right (these are where Atom differs
from RSS and where feeds most often fail validation):

- Root: `<feed xmlns="http://www.w3.org/2005/Atom">`.
- Channel-level:
  - `<title>` = `site.name`
  - `<subtitle>` = `site.description`
  - `<id>` = a stable IRI for the feed. Use `${site.url}/` (the site
    URL). It must never change once published.
  - `<updated>` = the newest post's date as RFC 3339
    (`YYYY-MM-DDT00:00:00Z`), or the build time if there are no posts.
  - `<link rel="self" type="application/atom+xml" href="…/atom.xml"/>`
  - `<link rel="alternate" type="text/html" href="…/"/>`
  - `<author><name>${site.name}</name></author>`
- Per `<entry>`:
  - `<title>`, `<link rel="alternate" href="…/blog/{slug}"/>`
  - `<id>` = `${site.url}/blog/${slug}` (permalink; stable)
  - `<updated>` and `<published>` = post date as RFC 3339
  - `<summary type="text">${summary}</summary>`
  - `<category term="{tag}"/>` per tag
- Same `prerender = true`, same escaping helper, same
  `content-type` — but use `application/atom+xml; charset=utf-8`.
- Same `cache-control` as the RSS route for consistency.

**Refactor opportunity (recommended, low risk):** the escaping helper,
the item/entry field derivation, and the post→URL mapping are shared
between the two routes. Extract a tiny `src/lib/feed.ts` with:

- `escapeXml(s: string): string`
- `postUrl(slug: string): string` → `${site.url}/blog/${slug}`
- `feedUpdated(posts): string` → newest post date as an ISO instant

Both `+server.ts` files then import from it. This avoids the two feeds
drifting apart (e.g. one escaping a field the other forgets). Keep the
actual XML templates in their respective routes — they're the part that
legitimately differs.

### 4.2 Autodiscovery link — `src/lib/components/Seo.svelte`

`Seo.svelte` renders into `<svelte:head>` on every page, so it's the
right single place to advertise the feeds site-wide. Add, inside the
existing `<svelte:head>`:

```svelte
<link
  rel="alternate"
  type="application/rss+xml"
  title="{site.shortName} — RSS"
  href="{site.url}/rss.xml"
/>
<link
  rel="alternate"
  type="application/atom+xml"
  title="{site.shortName} — Atom"
  href="{site.url}/atom.xml"
/>
```

Notes:
- Use absolute URLs (`site.url` + path) for maximum reader compatibility.
- Distinct `title` attributes let readers that surface both let the user
  choose; most will just take the first they support.
- Confirm every page actually renders `Seo`. If any route omits it, the
  links won't appear there — acceptable, since readers only need them on
  pages a subscriber would land on (home, posts). A quick check of the
  routes is a task item below.

### 4.3 Optional: a visible feed link

Beyond machine discovery, a human-visible link (footer or blog index)
lets people copy the feed URL on purpose. Low effort:
add an RSS entry to `footerNav`/`Footer.svelte`, or an icon in the
header. **Optional / stretch** — not required for this round, listed so
it isn't forgotten.

---

## 5. Implementation plan

Ordered, each step independently shippable and verifiable.

1. **Extract `src/lib/feed.ts`** with `escapeXml`, `postUrl`,
   `feedUpdated`. Repoint `rss.xml/+server.ts` at it; confirm the built
   `rss.xml` is byte-for-byte equivalent (or intentionally tidied).
2. **Add `src/routes/atom.xml/+server.ts`** using the shared helpers and
   the Atom serialization from §4.1.
3. **Add autodiscovery links** to `Seo.svelte` (§4.2).
4. **(Optional)** Add a visible feed link in the footer.

## 6. Non-goals (decided out of scope)

- **Full-content feeds (`content:encoded` / Atom `content`).** Would
  require rendering each `.svx` to standalone HTML at build; interactive
  components and KaTeX don't survive in a reader. Revisit only if
  subscribers ask to read full posts in their reader.
- **JSON Feed (`/feed.json`).** Easy to add later on the same shared
  helpers; no demand yet.
- **Per-tag feeds (`/blog/tag/{tag}/rss.xml`).** Adds N prerendered
  routes; defer until the tag taxonomy stabilizes and there's demand.
- **Per-post timestamps.** Would need a time component in front-matter
  (`date: 2026-09-07T14:00:00Z`) and a `posts.ts` change. Date-level
  ordering is fine for now.
- **Archived posts in the feed.** The archive is deliberately off the
  main index; the feed mirrors the index.

## 7. Testing & validation

- **Build:** `npm run build` — the two feeds must prerender without
  errors (they're `prerender = true`, so a broken feed fails the build).
- **Well-formedness:** the XML must parse. A cheap guard is to `fetch`
  each feed in a small check or pipe the built files through an XML
  parser.
- **Feed validators:** run both feeds through the W3C Feed Validator
  (`validator.w3.org/feed`) — Atom in particular is strict about
  `<id>`, `<updated>`, and RFC 3339 dates.
- **Reader smoke test:** subscribe to both in a real reader
  (e.g. NetNewsWire / Feedly) and confirm titles, links, dates and
  summaries render.
- **Autodiscovery:** load the home page, view source, confirm both
  `<link rel="alternate">` tags are present with absolute hrefs; a
  browser reader extension should offer to subscribe.
- **Escaping regression:** include a post whose title/summary contains
  `& < > "` and an apostrophe; confirm both feeds stay valid.

## 8. Open questions

- Do you want the **optional visible footer link** in this round, or keep
  it machine-discovery only?
- Author identity in Atom: use `site.name` ("Jonas Öchsner"). Add an
  `<email>` in the Atom author block, or name only? (Leaning name-only to
  keep the address off yet another surface.)

## 9. Affected files (summary)

| File | Change |
|------|--------|
| `src/lib/feed.ts` | **New** — shared feed helpers |
| `src/routes/rss.xml/+server.ts` | Refactor to use shared helpers (no output change) |
| `src/routes/atom.xml/+server.ts` | **New** — Atom 1.0 feed |
| `src/lib/components/Seo.svelte` | Add two `<link rel="alternate">` tags |
| `src/lib/components/Footer.svelte` (optional) | Visible feed link |
