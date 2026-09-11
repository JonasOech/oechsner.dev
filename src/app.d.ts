// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	/**
	 * Build-time flag, inlined by Vite's `define` (see vite.config.ts). `true` on every build
	 * except the production `main` build on Cloudflare Pages, where `/beta` must show nothing.
	 */
	const __BETA__: boolean;

	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
