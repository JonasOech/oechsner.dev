/**
 * Content transcribed from `resume.tex` (English branch of the `\bi{}` macro).
 *
 * `resume.tex` stays the source of truth for the PDF; this file is the source of
 * truth for the site. When you edit one, edit the other — they are intentionally
 * decoupled so the web copy can breathe a little more than a one-page CV allows.
 */

export type Entry = {
	title: string;
	org?: string;
	place?: string;
	period: string;
	stack?: string;
	points: string[];
};

export const about = [
	`I'm a third-semester Applied Computer Science student at Universität Bamberg, currently
	 building an AI-powered data-protection classifier at the Leibniz Institute for Educational
	 Trajectories. I'm interested in ML, Operating Systems (Linux), and IT in general, this is why this blog exists.`,

	`Most of my work sits where machine learning needs to be integrated into resilient software systems.
	 The goal is to build models that produce a safe answer, and an architecture that can explain where the answer came
	 from (XAI). I spent last semester reproducing a neuro-symbolic reasoning pipeline from the literature,
	 and the rest of it making LLM inference run entirely on-premise so sensitive research data
	 never leaves our servers.`,
	`Currently on an ERASMUS exchange year at TU Dublin, where I want to do deep learning research in the context of cloud computing.`
];

export const experience: Entry[] = [
	{
		title: 'Software Development for AI-Powered Data Protection Classification',
		org: 'LIfBi — Leibniz-Institut für Bildungsverläufe',
		place: 'Bamberg, Germany',
		period: 'Oct 2025 — Present',
		points: [
			'Run my own agile-managed software project end to end, from requirements engineering through to maintenance.',
			'Ensure the solution complies with European data protection law.',
			'Handle customer communication and set up continuous integration for the project.'
		]
	},
	{
		title: 'Tutor — "Introduction to AI"',
		org: 'Cognitive Systems Chair, Otto-Friedrich-Universität Bamberg',
		place: 'Bamberg, Germany',
		period: 'Mar 2026 — Aug 2026',
		points: ['Teach and support students in the "Introduction to AI" course.']
	},
	{
		title: 'Temporary Delivery Driver',
		org: 'Viktor Nußbaumer Bestes für Küche und Gastlichkeit GmbH & Co. KG',
		place: 'Kürnach, Germany',
		period: 'Jul 2024 — Aug 2024',
		points: []
	},
	{
		title: 'Picker',
		org: 'Hans Geis GmbH + Co KG',
		place: 'Kürnach, Germany',
		period: 'Jul 2022 — Aug 2022',
		points: []
	}
];

export const education: Entry[] = [
	{
		title: 'TU Dublin',
		org: 'ERASMUS Exchange (Computing)',
		place: 'Dublin, Ireland',
		period: 'Sep 2026 — May 2027',
		points: []
	},
	{
		title: 'Universität Bamberg',
		org: 'B.Sc. Angewandte Informatik (Applied Computer Science)',
		place: 'Bamberg, Germany',
		period: 'Oct 2024 — Present',
		points: ['Average score 1.98 across 99 credited ECTS.']
	},
	{
		title: 'Röntgen-Gymnasium Würzburg',
		org: 'Abitur',
		place: 'Würzburg, Germany',
		period: 'Sep 2016 — Jul 2024',
		points: ['Grade 2.0']
	}
];

export const projects: Entry[] = [
	{
		title: "Raven's Progressive Matrices — Abstract Visual Reasoning",
		org: 'Cognitive Systems, Universität Bamberg',
		period: 'Mar 2026 — Aug 2026',
		stack: 'Python · PyTorch',
		points: [
			`Team project attempting to replicate "An Interpretable Neuro-symbolic Model for Raven's
			 Progressive Matrices Reasoning" (Zhao et al., 2023).`,
			'Reproduced two published dataset generators, RAVEN and RAVEN-FAIR.',
			`Reproduced the paper's three-stage neuro-symbolic pipeline — CNN → supervised VAE for
			 semantic attribute extraction → cognitive-map relational reasoning — reaching 94%
			 prediction accuracy.`
		]
	},
	{
		title: 'LLM-Powered GDPR Compliance Classifier',
		org: 'LIfBi',
		period: 'Oct 2025 — Present',
		stack: 'Python · SvelteKit · PostgreSQL · Docker · Ollama',
		points: [
			`Built a tool that classifies survey questions against the special categories of personal
			 data defined in Art. 9 GDPR.`,
			`Developed the full stack: SvelteKit/TypeScript frontend and API routes, PostgreSQL schema,
			 and a three-container Docker Compose deployment. Kubernetes load balancing is planned.`,
			'Ran all LLM inference locally through Ollama so sensitive institute data never leaves the network.'
		]
	}
];

/** Both projects above are closed source — there are no repository links by design. */
export const projectsNote = 'Both projects are closed source.';

export const grades = {
	summary: 'Some highlights from my transcript, sorted by grade. Full transcript available on request.',
	items: [
		['Distributed Systems', '1.0'],
		['Discrete Modelling', '1.3'],
		['Java Programming', '1.3'],
		['Linear Algebra', '1.3'],
		['DevOps for AI Systems', '1.3'],
		['Analysis', '1.7'],
		['Introduction to AI', '1.7'],
		['Introduction to ML', '1.7'],
		['Statistics & Data Science', '2.0'],
		['European Data Protection Law', '2.3']
	] as const
};

export const skills = [
	{
		label: 'Languages',
		items: ['Python', 'Java', 'TypeScript', 'R', 'SPSS (introductory)', 'C-style languages (introductory)']
	},
	{ label: 'Libraries & Tools', items: ['PyTorch', 'NumPy', 'Pandas', 'Docker', 'Ollama', 'UML', 'Git'] },
	{
		label: 'Concepts',
		items: [
			'Machine Learning',
			'Data Science',
			'Distributed Systems',
			'Object-Oriented Architecture Patterns'
		]
	},
	{
		label: 'Practices',
		items: [
			'Agile Project Management',
			'Requirements Engineering',
			'Continuous Integration',
			'Software Maintenance'
		]
	},
	{ label: 'Spoken', items: ['German (native)', 'English (certified B2)'] }
];
