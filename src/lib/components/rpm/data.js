// All numbers below are transcribed from the report's result tables.
// sec-res.tex: T-Test / T-Test-2 (full pipeline) and standalone / standalone-F.

export const CLASS_LABELS = {
	center: 'Center',
	'2x2': '2x2 Grid',
	'o-ic': 'O-IC',
	'o-ig': 'O-IG',
	'l-r': 'Left-Right',
	'3x3': '3x3 Grid',
	'u-d': 'Up-Down'
};

/** Full FCNN -> sVAE -> CMRB pipeline, mean of 3 folds, vs. Zhao et al. (2023) Table 4. */
export const pipeline = {
	raven: [
		{ id: 'center', ours: 94.63, zhao: 99.2, p: '1.4e-7' },
		{ id: '2x2', ours: 94.02, zhao: 98.79, p: '7.7e-6' },
		{ id: 'o-ic', ours: 94.2, zhao: 99.45, p: '1.1e-4' },
		{ id: 'o-ig', ours: 93.98, zhao: 87.6, p: '9.9e-5' },
		{ id: 'l-r', ours: 94.08, zhao: 99.63, p: '3.8e-5' },
		{ id: '3x3', ours: 93.88, zhao: 99.31, p: '2.4e-6' },
		{ id: 'u-d', ours: 94.07, zhao: 99.68, p: '2.4e-6' }
	],
	ravenF: [
		{ id: 'center', ours: 94.37, zhao: 99.32, p: '6.6e-6' },
		{ id: '2x2', ours: 93.96, zhao: 99.21, p: '3.5e-5' },
		{ id: 'o-ic', ours: 93.83, zhao: 99.58, p: '2.2e-3' },
		{ id: 'o-ig', ours: 93.88, zhao: 94.36, p: '4.2e-2' },
		{ id: 'l-r', ours: 93.95, zhao: 99.75, p: '3.3e-6' },
		{ id: '3x3', ours: 93.84, zhao: 99.54, p: '1.7e-7' },
		{ id: 'u-d', ours: 94.02, zhao: 99.79, p: '2.6e-5' }
	]
};

/** The two submodules measured on their own, with ground-truth inputs. */
export const standalone = {
	raven: [
		{ id: 'center', fcnn: 100.0, cmrb: 99.2 },
		{ id: '2x2', fcnn: 100.0, cmrb: 98.93 },
		{ id: 'o-ic', fcnn: 100.0, cmrb: 99.77 },
		{ id: 'o-ig', fcnn: 100.0, cmrb: 99.13 },
		{ id: 'l-r', fcnn: 100.0, cmrb: 99.63 },
		{ id: '3x3', fcnn: 100.0, cmrb: 99.63 },
		{ id: 'u-d', fcnn: 100.0, cmrb: 99.57 }
	],
	ravenF: [
		{ id: 'center', fcnn: 100.0, cmrb: 99.6 },
		{ id: '2x2', fcnn: 100.0, cmrb: 99.27 },
		{ id: 'o-ic', fcnn: 100.0, cmrb: 100.0 },
		{ id: 'o-ig', fcnn: 100.0, cmrb: 99.63 },
		{ id: 'l-r', fcnn: 100.0, cmrb: 99.73 },
		{ id: '3x3', fcnn: 100.0, cmrb: 99.93 },
		{ id: 'u-d', fcnn: 100.0, cmrb: 99.8 }
	]
};

/** sec-dis.tex, Table "Performance of different models on Raven-Fair". */
export const baselines = [
	{ name: 'sVAE-CMRB (Zhao et al.)', acc: 98.8, kind: 'reported' },
	{ name: 'sVAE-CMRB (our reconstruction)', acc: 93.9, kind: 'ours' },
	{ name: 'Rel-base', acc: 92.8, kind: 'baseline' },
	{ name: 'SCL', acc: 91.7, kind: 'baseline' },
	{ name: 'MRNet', acc: 88.4, kind: 'baseline' },
	{ name: 'PrAE', acc: 88.3, kind: 'baseline' },
	{ name: 'SRAN', acc: 71.3, kind: 'baseline' }
];

/** The 29 supervised dimensions of the sVAE's semantic layer: 5 + 10 + 6 + 8. */
export const SEMANTIC_GROUPS = [
	{
		key: 'type',
		label: 'Type',
		values: ['triangle', 'square', 'pentagon', 'hexagon', 'circle']
	},
	{
		key: 'color',
		label: 'Color',
		values: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
	},
	{
		key: 'size',
		label: 'Size',
		values: ['0', '1', '2', '3', '4', '5']
	},
	{
		key: 'angle',
		label: 'Angle',
		values: ['-135', '-90', '-45', '0', '45', '90', '135', '180']
	}
];

export const SEMANTIC_DIM = SEMANTIC_GROUPS.reduce((n, g) => n + g.values.length, 0); // 29
