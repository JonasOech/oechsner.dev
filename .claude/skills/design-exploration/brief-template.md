# Round 2 brief: elegant, professional redesigns of oechsner.dev

Repo: SvelteKit 2 / Svelte 5 / mdsvex personal blog + portfolio (owner Jonas Öchsner, CS student). You work in your own git worktree. Nine other agents work on other directions in parallel; never look at their branches (design-11..design-20) or at round-1 branches' code except where this brief says so.

## What the owner said
Round 1 produced 10 wild variations. The owner liked #1 (editorial print), #4 (Swiss grid), #8 (retro desktop) and #9 (ultra-minimal). They do NOT like extreme designs. They want elegant, professional looks and are especially interested in exploring "paper" aesthetics. Blog post covers are vector graphics (static/img/<post>/cover.svg); you may recolour them and change their backgrounds to fit your style.

## Underlying patterns shared by the four liked designs (your baseline)
1. A light, paper-like ground (warm off-white or pure white), ink-black text, ONE restrained accent colour used for signal only (links, kickers, numerals, hover), never as a fill behind running text.
2. Structure from typography and rules (hairlines, one heavy rule), not from shadows, glows, gradients, blur, rounded cards or illustration. No decoration without function.
3. Small type vocabulary: at most two families (one serif or one neo-grotesque, plus mono for code only), a clear scale, small-caps/tracked uppercase for meta, tabular figures for dates and numbers. Self-hosted via @fontsource(-variable) packages.
4. Controlled measure: 62-68ch prose, flush-left or justified-with-hyphenation, generous vertical rhythm.
5. Section "rails": a small label in a margin column beside content (editorial, Swiss numerals, minimal italic labels, window titles). Post pages: outline/TOC in a side column, marginalia for tags and meta.
6. Content-first home page: the largest type on the site is the lead post title; the author's name is small. Newest hero-eligible post leads, then a plain, scannable post list.
7. A single, consistent interaction language (underline/colour shift, inversion, fade); motion is minimal and respects prefers-reduced-motion.
8. Square or near-square corners (0-4px radius), 1px hairlines, no shadows (or at most one very soft paper-lift shadow if your concept demands it).

## Hard rules (from CLAUDE.md; read CLAUDE.md, README.md and the current DESIGN.md first)
- No component hard-codes a colour: everything is a var(--...) token declared in src/app.css (src/lib/components/rpm/ is the one exception; keep it legible on whatever ground you choose).
- Svelte 5 runes only. Icons are inline SVG in src/lib/components/Icon.svelte; no emoji, no icon font.
- Tabs, single quotes, semicolons: match the file you are in.
- Do not touch the mdsvex pipeline in svelte.config.js, post content in src/posts, feed logic, or src/lib/posts.ts behaviour.
- Home stays content-first. Keep every route, link and function. Restyle EVERY route: home, blog post, about, contact, skills, impressum, datenschutz, 404, layout/nav/footer.
- A11y: body text AA contrast (measure it with a quick script, do not guess), visible focus, reduced motion, works down to 360px with no horizontal scroll.
- You may add plausible, clearly editable copy where the design needs it (section intros, colophon, pull-quote styling) but NEVER fabricate facts about the person. Prefer reusing existing site facts.
- Light or dark is your call within your concept, but stay calm and readable. If you ship a dark theme it must be a considered "ink on charcoal" sibling, not neon.
- Fonts: self-host with @fontsource packages. If you change which fonts the site uses, update the Datenschutz "Schriftarten" paragraph and its privacy.updated date to match (state facts only: self-hosted, no third-party requests), and mention it in your report because it is legal text.
- Rewrite DESIGN.md to document YOUR language (concept, palette table with contrast ratios, type roles, grid, shape, motion, components). Rewrite the token layer in src/app.css. If CLAUDE.md or README.md styling lines would contradict your design (e.g. "dark is the only theme"), edit only those lines minimally.

## Covers
Each post has static/img/<post>/cover.svg (and committed cover.png for og). Restyle the cover SVGs so they belong to your design: recolour with your palette, change the background/plate, simplify strokes if needed, keep each cover's subject legible. Cover SVGs are static assets, so literal colours inside them are fine, but pick them from your palette. After editing, regenerate PNGs with `npm run og` (needs playwright; chromium is preinstalled, do not reinstall playwright) and commit both svg and png. Also make sure the covers look good where the site shows them (home lead, list thumbnails, post header).

## Environment gotchas learned in round 1
- Your worktree is nested inside the main repo, which makes `npm run build` fail with "Tsconfig not found /home/user/oechsner.dev/.svelte-kit/tsconfig.json". `npm run check` works in place. For the build, copy the tree OUTSIDE the repo (e.g. rsync -a --exclude node_modules --exclude .svelte-kit --exclude .git <worktree>/ <scratchpad>/build-design-N/, then npm ci and npm run build there, or symlink node_modules). Do not create stub files in the main checkout.
- `vite dev` / `wrangler pages dev` may crash in this sandbox. Serving the built output with a tiny static server of your own (unique port, e.g. 4000+N, script saved inside YOUR OWN directory) works. NEVER run pkill/killall on shared process names; only kill the PID you started. Never overwrite files you did not create in the scratchpad.
- Screenshots: Playwright (`require('playwright')`, chromium preinstalled) at 1280x800 and 390x844, full-page. Look at them yourself (you can read images) and iterate until polished. Also eyeball: a long post, about, contact, skills and the 404 at desktop and mobile, and the rpm figures post if one exists. Check no horizontal overflow at 360px programmatically (document.documentElement.scrollWidth <= innerWidth) on every route you can.

## Delivery
1. `git checkout -b design-N origin/main` (N given in your task).
2. `npm ci`, implement, `npm run check` must pass with 0 errors (fix warnings you introduce); build must pass in the outside copy.
3. Save screenshots to /tmp/claude-0/-home-user-oechsner-dev/7843c844-eef2-5572-9d42-363f6616ddbf/scratchpad/shots2/design-N/{home-desktop,home-mobile,post-desktop,post-mobile}.png (mkdir -p). Do not commit screenshots or node_modules.
4. Commit (end every commit message with these two lines: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01Hv2L2ae4zKq3yiC2GXRKva`), then `git push -u origin design-N` (retry only on network errors, 2/4/8/16s backoff). No PR. Never push another branch.
5. Final report under 170 words: branch, the language in two sentences, key layout ideas, what you changed outside styling (legal text, docs, copy you wrote), and an honest list of what you did NOT verify or what failed.
