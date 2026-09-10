import data from './obsidian-plugins.json';

export type Plugin = {
	name: string;
	/** The one-line "what it does for me" shown when the plugin's title is clicked. */
	use: string;
	/**
	 * Plugins I have installed but am not currently running stay in the file with
	 * `false` rather than being deleted — the write-up is already done, so publishing
	 * one is a boolean flip rather than a rewrite.
	 */
	enabled: boolean;
};

export type PluginGroup = {
	/** The `##`/`###` the group sits under in the post, kept for provenance. */
	section: string;
	title: string;
	plugins: Plugin[];
};

const groups = data as Record<string, PluginGroup>;

/**
 * A typo'd group name should break the build, not render an empty box in the
 * middle of the post — the same reasoning as the front-matter guard in `posts.ts`.
 */
export function pluginGroup(key: string): PluginGroup {
	const group = groups[key];
	if (!group) {
		throw new Error(
			`Unknown plugin group "${key}". Known groups: ${Object.keys(groups).join(', ')}.`
		);
	}
	return group;
}

/** The plugins a group actually renders, in file order. */
export function activePlugins(key: string): Plugin[] {
	return pluginGroup(key).plugins.filter((p) => p.enabled);
}

/** Every group, in post order. */
export const pluginGroups: [string, PluginGroup][] = Object.entries(groups);
