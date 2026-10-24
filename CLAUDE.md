# CLAUDE.md

Personal blog + portfolio for Jonas Öchsner. SvelteKit 2 / Svelte 5, mdsvex posts, fully
prerendered, deployed to Cloudflare Pages via Cloudflare's Git integration (push to `main`
deploys; there are no deploy credentials in the repo).

`README.md` documents the publishing and deploy flow. `DESIGN.md` is the design contract.
Both are current — read the relevant one instead of re-deriving it from the CSS.

## Commands

```sh
npm run dev      # vite dev server
npm run check    # wrangler types --check + svelte-check — this is what CI runs
npm run build    # wrangler types --check + vite build
npm run preview  # serves the real Pages output through wrangler
npm run og       # rasterise static/img/<post>/cover.svg → cover.png (needs playwright)
npm run cv       # resume.tex → static/resume-en.pdf (needs local pdflatex)
npm run gen      # regenerate worker-configuration.d.ts from wrangler.jsonc
```

`npm run check` must pass before anything is considered done. It is the whole CI job
(plus `npm run build`), and it fails if the committed `worker-configuration.d.ts` has
drifted from `wrangler.jsonc` — run `npm run gen` and commit the result when you touch
Wrangler config.

## Styling: read DESIGN.md first

`DESIGN.md` is the spec; `src/app.css` is its implementation and holds every CSS variable
in the project. Non-negotiables that come out of it:

- **No component hard-codes a colour.** Everything resolves to a `var(--…)` token declared
  in `src/app.css`. (`src/lib/components/rpm/` is a deliberate exception — that figure set
  renders on a light plate and in feed readers.)
- **This branch is the "Glacier" design exploration** (an editorial magazine spread): a
  fixed ice-blue side rail replaces the header, and the home and post pages are a sticky panel
  composition (`Spread.svelte`: charcoal story, cover image, round `Tile`s, ice pull quote)
  beside a scrolling reading column. Playfair Display sets everything, body included (still
  exposed as `--font-sans`); DM Sans survives only as `--font-ui` for small labels. Light theme
  plus a dark one behind a toggle (`src/lib/theme.svelte.ts`). Where DESIGN.md says dark-only
  or fixes other type roles, this branch deliberately differs.
- Type roles are fixed: Playfair Display for the lead-post title and rail labels only,
  DM Sans for everything else, JetBrains Mono for code. `--text-muted` is meta text only
  and has no contrast headroom — re-measure against both `--bg` and `--surface` if changed.
- Icons are inline SVG in `src/lib/components/Icon.svelte`. No emoji, no icon font.
- §11 ("content-first hierarchy") governs the home page: the largest type on the site is
  always a piece of writing, never the author's name. Read it before moving anything above
  the fold.

## Posts

Posts live in `src/posts/*.svx` and are **authored in Obsidian through a symlink into the
vault**. Treat them as the author's prose: make the smallest edit that does the job, keep
the file `.svx`, and keep the body valid plain Markdown so it still renders in Obsidian.

- Filename `YYYY-MM-DD-slug.svx` → `/blog/slug`; the date prefix is stripped.
- `title` and `date` are required — a post missing either fails the build
  (`src/lib/posts.ts`). `draft: true` hides a post in production but shows it in dev.
  `hero: true` makes a post *eligible* for the home page lead slot (newest eligible wins);
  omitted means not eligible. `ai: false` is the only value that earns the human-written
  laurel. `readingMinutes` and `headings` are injected at build time — never write them
  by hand.
- `src/posts/archive/` is outside the glob, so archived posts do not publish.
- Citations are pandoc-style (`[@key]`, `-@key`, bare `@key`) against the shared
  `src/posts/references.bib`, which also lives in the vault. An unknown key fails the build.
- Display math becomes a `<LatexBlock>` figure automatically, in both the `$$…$$` one-line
  and fenced forms, with the following line as an optional note.
- New cover image: add `static/img/<post>/cover.svg`, run `npm run og`, commit both files.
  Social platforms reject SVG for `og:image`, so the PNG is not optional.

## The mdsvex pipeline (`svelte.config.js`)

Most of the build's real logic is in this one file, as five local unified plugins in a
deliberate order: `remarkMath` → `latexBlocks` → `citations` → `readingTime` →
`headingOutline`, then `rehypeKatex` → `escapeKatexBraces`. Each plugin's doc comment
explains why it sits where it does. Before reordering or adding one, read them.

Two traps worth knowing up front:

- **`remark-math` is pinned to v3 on purpose.** mdsvex bundles pre-micromark remark; v4+
  registers extensions nothing here reads and silently leaves `$…$` as plain text.
- **KaTeX output is full of literal braces**, which the Svelte compiler reads as
  expressions. `escapeKatexBraces` rewrites them as numeric entities. The same plugin turns
  a KaTeX parse error into a build failure rather than shipping a red formula.

## Architecture notes

- `src/routes/+layout.ts` sets `prerender = true` for the whole site. The single exception
  is `src/routes/blog/+server.ts`, which opts out to return a real 301 for the retired
  `/blog` index — a `_redirects` file cannot do this (see README for why).
- `src/lib/posts.ts` uses an **eager** `import.meta.glob`, which is what makes every page
  render synchronously with no loading state. Past ~50 posts, switch to a lazy glob plus a
  build-time manifest; the change is contained to that file.
- Feeds: `src/routes/rss.xml` and `atom.xml` share `src/lib/feed.ts`; full post bodies are
  rewritten for feed readers in `src/lib/server/feed-content.ts`. **If you add an
  interactive figure component, check how it degrades there** — it either needs a flattened
  form (like `PluginRack`) or falls back to a link to the post.
- Runes mode is forced project-wide (`compilerOptions.runes` in `svelte.config.js`), so
  use `$props`/`$state`/`$derived`, never the legacy `export let` / `$:` forms.
- `src/lib/data/site.ts` is the single source of identity, nav and contact links.
  `src/lib/data/resume.ts` mirrors `resume.tex` and is kept in step by hand.

## Repo conventions

- `static/resume-en.pdf` and the `og` PNGs are **committed build artefacts** — the
  Cloudflare build image can produce neither.
- `.claude/worktrees/` is gitignored; committing one breaks the Cloudflare build with
  "No url found for submodule path".
- Tabs for indentation, single quotes, no semicolon-free style — match the file you're in.
