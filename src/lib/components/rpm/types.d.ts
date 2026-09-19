// Shared types for the RPM widgets. The panel object mirrors the sVAE's
// four supervised attribute blocks (see shapes.js / data.js).

/** A single RAVEN-style panel: four semantic attributes, each an index. */
export interface PanelObj {
	type: number;
	color: number;
	size: number;
	angle: number;
}

/** The four semantic attribute names, keys of {@link PanelObj}. */
export type Attr = keyof PanelObj;

/** The two answer-set generators / datasets the widgets switch between. */
export type Dataset = 'raven' | 'ravenF';
