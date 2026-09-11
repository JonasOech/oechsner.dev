/**
 * The beta registry — the single source of truth for the `/beta` review surface.
 *
 * `/beta` is where an agent (or a human) parks a work-in-progress feature so it can be
 * *looked at* on a live preview deployment before it is allowed anywhere near the
 * production site. See BETA.md for the full workflow; the short version:
 *
 *   1. Build your feature on a branch. If it has a UI, give it a demo route under
 *      `src/routes/beta/<slug>/` so it has somewhere to live.
 *   2. Append one entry to `betaFeatures` below.
 *   3. Push. Cloudflare builds a preview deployment; the entry appears on `/beta` there.
 *   4. Jonas reviews it on the preview URL and, if he likes it, promotes it to `main`
 *      (at which point the entry is deleted from here — the feature is no longer "beta").
 *
 * The page renders newest-first, so the order here does not matter.
 */

export type BetaStatus = 'proposed' | 'in-review' | 'accepted';

export type BetaFeature = {
	/** URL-safe id, unique within this list. Also the folder name if there's a demo route. */
	slug: string;
	/** One line. This is the card title. */
	title: string;
	/** A sentence or two: what it is and why it might be worth keeping. */
	summary: string;
	/** ISO date the entry was added, e.g. '2026-09-11'. Sorts the gallery. */
	added: string;
	/** Who added it — a person's name, or an agent/session label. */
	author: string;
	/** Where it stands. Drives the badge colour. */
	status: BetaStatus;
	/**
	 * Optional link to a live demo. A path like `/beta/my-thing` (a route you added), or an
	 * in-page anchor. Omit if the entry is a note or a change with no standalone demo.
	 */
	href?: string;
	/** Optional short tags, mirroring the blog's tag style. */
	tags?: string[];
};

export const betaFeatures: BetaFeature[] = [
	{
		slug: 'beta-surface',
		title: 'The /beta review surface itself',
		summary:
			'This page. A place agents push experimental features to, gated to preview deployments only so nothing half-finished can reach oechsner.dev. Delete this entry once the mechanism has earned its keep.',
		added: '2026-09-11',
		author: 'Claude Code (agent)',
		status: 'in-review',
		tags: ['meta', 'workflow']
	}
];
