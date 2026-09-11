# The `/beta` surface

A place to **push work-in-progress features and look at them on a live URL before they
reach the site.** Built for the workflow where agents (Claude Code sessions) build features
and a human reviews them.

## How it works

The site deploys through **Cloudflare Pages' Git integration**: `main` builds to
`oechsner.dev`, and *every other branch that is pushed is built automatically as a preview
deployment* with its own URL. `/beta` is a page that reads a registry
(`src/lib/data/beta.ts`) and renders each entry as a card — but its contents are **gated to
non-production builds only**. On `oechsner.dev/beta` the page is an empty stub; on any
preview deployment (and in local dev) it shows the full gallery.

The gate is a build-time constant, `__BETA__`, resolved in `vite.config.ts` from Cloudflare's
`CF_PAGES_BRANCH` (true unless `CF_PAGES_BRANCH === 'main'`) and inlined identically into the
server render and the client bundle. Nothing half-finished can leak to the public site even if
`/beta` and its registry are sitting on `main`.

`/beta` is also `noindex, nofollow` and `Disallow`ed in `robots.txt`, and is not in the nav or
the sitemap. It is reachable only by typing the URL.

## Where to review

Cloudflare gives each branch a **stable alias URL** that tracks its latest commit:

```
https://<branch>.oechsner-dev.pages.dev/beta
```

(`/` in a branch name becomes `-`, and long names are truncated — the Cloudflare dashboard,
under Workers & Pages → oechsner-dev → Deployments, always shows the exact URL plus a unique
per-commit `https://<hash>.oechsner-dev.pages.dev`.)

Preview deployments are **public to anyone with the URL** by default. To require a login,
enable **Cloudflare Access** on preview deployments in the Cloudflare Zero Trust dashboard —
that gates `*.oechsner-dev.pages.dev` while leaving `oechsner.dev` open. It is a dashboard
setting, not part of this repo.

The intended long-lived target is a branch literally named **`beta`**, reviewed at
`https://beta.oechsner-dev.pages.dev/beta`.

## Adding a feature (for agents and humans)

1. Build the feature on a branch. If it has a UI, give it a demo route under
   `src/routes/beta/<slug>/` so there's something to link to.
2. Append **one entry** to `betaFeatures` in `src/lib/data/beta.ts`. The type is documented
   in that file; `slug`, `title`, `summary`, `added` (ISO date), `author` and `status` are
   required, `href` and `tags` optional.
3. Run `npm run check` and `npm run build` — CI runs both on every non-`main` push.
4. Push the branch. The card appears on that branch's preview `/beta`.

## Promoting or dropping a feature

- **Keep it:** merge (or cherry-pick) the feature to `main`, and **delete its entry** from
  `src/lib/data/beta.ts` — once it's live it isn't "beta" any more. Move its route out of
  `src/routes/beta/` to wherever it belongs.
- **Drop it:** delete the entry (and its `src/routes/beta/<slug>/` route, if any). Nothing on
  `main` depends on beta entries, so removing one is always safe.
