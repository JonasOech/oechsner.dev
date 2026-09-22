/**
 * Single source of truth for identity, navigation and contact details.
 *
 * The portfolio pages deliberately show email and profile links only. The postal
 * address and phone number appear in exactly one place, `impressum` below, because
 * § 5 DDG requires them there — see src/routes/impressum/+page.svelte.
 */

export const site = {
	name: 'Jonas Öchsner',
	shortName: 'oechsner.dev',
	url: 'https://oechsner.dev',
	intro: "Hi, I'm Jonas. Welcome to my Blog.",

	prebyline: 'About me',
	byline:
		'Applied computer science at Uni Bamberg. Mostly on Machine learning, Statistics and Distributed Systems. Interested in the Concepts behind the Software.',
	role: 'B.Sc. Applied Computer Science, Universität Bamberg',
	description:
		'Applied computer science student in Bamberg, building machine-learning and data-protection systems. Writing about ML, distributed systems and the software behind them.',
	locale: 'en',
	startYear: 2026
} as const;

/** The feeds, prerendered by src/routes/rss.xml and src/routes/atom.xml. RSS is the one offered first. */
export const feeds = {
	rss: '/rss.xml',
	atom: '/atom.xml'
} as const;

export type NavItem = { href: string; label: string };

// `/` is the writing index, so there is no separate Blog entry — a "Home" link and a
// "Blog" link pointing at the same page would just be noise.
export const nav: NavItem[] = [
	{ href: '/', label: 'Writing' },
	{ href: '/about', label: 'About' },
	{ href: '/skills', label: 'Skills' },
	{ href: '/contact', label: 'Contact' }
];

export const footerNav: NavItem[] = [
	{ href: '/', label: 'Writing' },
	{ href: '/about', label: 'About' },
	{ href: '/skills', label: 'Skills' },
	{ href: '/contact', label: 'Contact' }
];

/**
 * Contact channels rendered on /contact and in the footer.
 *
 * TODO(jonas): replace the two placeholder handles below with your real ones,
 * or delete the entry entirely — the page renders whatever is in this list.
 */
export const contacts = [
	{
		label: 'Email',
		value: 'jonasoechsner06@gmail.com',
		href: 'mailto:jonasoechsner06@gmail.com',
		icon: 'mail' as const,
		primary: true
	},
	{
		label: 'University',
		value: 'j_oechsner@stud.uni-bamberg.de',
		href: 'mailto:j_oechsner@stud.uni-bamberg.de',
		icon: 'mail' as const,
		primary: false
	},
	{
		label: 'GitHub',
		value: '@jonasoech',
		href: 'https://github.com/jonasoech',
		icon: 'github' as const,
		primary: false
	},
	{
		label: 'LinkedIn',
		value: 'in/jonas-oechsner',
		href: 'https://www.linkedin.com/in/jonas-oechsner',
		icon: 'linkedin' as const,
		primary: false
	}
];

/** Compiled from `resume.tex` — see `npm run cv`. */
export const cvPath = '/resume-en.pdf';

/**
 * Operator details for the Impressum (§ 5 DDG, formerly § 5 TMG) and the
 * content-responsibility statement under § 18 Abs. 2 MStV.
 *
 * The law requires a *ladungsfähige Anschrift* — a real postal address that can
 * receive service of process. A P.O. box is explicitly not sufficient, and neither
 * is an email address alone. This is the one place on the site that carries it.
 */
export const impressum = {
	legalName: 'Jonas Christian Öchsner',
	street: 'Schleifweg 23',
	postalCode: '97273',
	city: 'Kürnach',
	country: 'Deutschland',
	phone: '+49 1573 5544890',
	phoneHref: 'tel:+4915735544890',
	email: 'jonasoechsner06@gmail.com',
	/** § 18 Abs. 2 MStV — responsible for journalistic-editorial content (the blog). */
	responsibleForContent: 'Jonas Christian Öchsner',
	/** Last substantive revision of the Impressum text. */
	updated: '2026-08-28'
} as const;
