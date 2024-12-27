
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const DATABASE_URL: string;
	export const CLERK_SECRET_KEY: string;
	export const SHELL: string;
	export const npm_command: string;
	export const npm_package_dependencies_mode_watcher: string;
	export const npm_package_scripts_db_studio: string;
	export const COLORTERM: string;
	export const HYPRLAND_CMD: string;
	export const CSF_MDTVTexturesDirectory: string;
	export const XDG_SESSION_PATH: string;
	export const TERM_PROGRAM_VERSION: string;
	export const GTK_IM_MODULE: string;
	export const npm_package_devDependencies_eslint_plugin_svelte: string;
	export const XDG_BACKEND: string;
	export const CSF_DrawPluginDefaults: string;
	export const npm_package_devDependencies_prettier_plugin_tailwindcss: string;
	export const npm_package_scripts_test_e2e: string;
	export const NODE: string;
	export const npm_package_devDependencies_embla_carousel_svelte: string;
	export const npm_package_devDependencies_autoprefixer: string;
	export const npm_package_dependencies_clerk_sveltekit: string;
	export const LC_ADDRESS: string;
	export const npm_package_devDependencies_tailwindcss: string;
	export const CSF_LANGUAGE: string;
	export const npm_package_scripts_check_watch: string;
	export const npm_package_dependencies_drizzle_zod: string;
	export const LC_NAME: string;
	export const CSF_MIGRATION_TYPES: string;
	export const ARGV0: string;
	export const GRADLE_HOME: string;
	export const npm_package_private: string;
	export const XMODIFIERS: string;
	export const DESKTOP_SESSION: string;
	export const LC_MONETARY: string;
	export const npm_package_devDependencies__clerk_backend: string;
	export const CSF_OCCTResourcePath: string;
	export const HL_INITIAL_WORKSPACE_TOKEN: string;
	export const NO_AT_BRIDGE: string;
	export const npm_package_scripts_db_seed: string;
	export const npm_package_devDependencies_drizzle_kit: string;
	export const CSF_STEPDefaults: string;
	export const EDITOR: string;
	export const npm_package_scripts_test_unit: string;
	export const XDG_SEAT: string;
	export const PWD: string;
	export const GSETTINGS_SCHEMA_DIR: string;
	export const npm_package_devDependencies_vite: string;
	export const XDG_SESSION_DESKTOP: string;
	export const LOGNAME: string;
	export const QT_QPA_PLATFORMTHEME: string;
	export const XDG_SESSION_TYPE: string;
	export const DRAWHOME: string;
	export const npm_package_dependencies_drizzle_orm: string;
	export const PNPM_HOME: string;
	export const npm_package_scripts_build: string;
	export const CSF_StandardLiteDefaults: string;
	export const npm_package_devDependencies_prettier: string;
	export const npm_config_recursive: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const npm_package_devDependencies_eslint_config_prettier: string;
	export const MOTD_SHOWN: string;
	export const VSCODE_INJECTION: string;
	export const HOME: string;
	export const LANG: string;
	export const LC_PAPER: string;
	export const npm_package_devDependencies_typescript: string;
	export const _JAVA_AWT_WM_NONREPARENTING: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const npm_package_dependencies__smart_home_finder_scraper: string;
	export const npm_package_version: string;
	export const STARSHIP_SHELL: string;
	export const npm_package_devDependencies_tailwind_merge: string;
	export const WAYLAND_DISPLAY: string;
	export const GIT_ASKPASS: string;
	export const XDG_SEAT_PATH: string;
	export const npm_package_devDependencies_prettier_plugin_svelte: string;
	export const INIT_CWD: string;
	export const CSF_ShadersDirectory: string;
	export const npm_package_dependencies_zod: string;
	export const CHROME_DESKTOP: string;
	export const CSF_EXCEPTION_PROMPT: string;
	export const npm_package_devDependencies__sveltejs_adapter_vercel: string;
	export const CSF_XmlOcafResource: string;
	export const STARSHIP_SESSION_KEY: string;
	export const npm_package_scripts_format: string;
	export const npm_package_scripts_db_start: string;
	export const APPDIR: string;
	export const npm_package_scripts_preview: string;
	export const npm_lifecycle_script: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const CSF_SHMessage: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const npm_package_scripts_db_migrate: string;
	export const npm_package_devDependencies_svelte_check: string;
	export const npm_package_devDependencies_tailwind_variants: string;
	export const XDG_SESSION_CLASS: string;
	export const npm_package_devDependencies_lucide_svelte: string;
	export const TERM: string;
	export const LC_IDENTIFICATION: string;
	export const npm_package_name: string;
	export const npm_package_type: string;
	export const USER: string;
	export const npm_package_devDependencies_tailwindcss_animate: string;
	export const npm_config_frozen_lockfile: string;
	export const npm_package_devDependencies_typescript_eslint: string;
	export const npm_package_devDependencies_vitest: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const OWD: string;
	export const CSF_StandardDefaults: string;
	export const CSF_IGESDefaults: string;
	export const HYPRLAND_INSTANCE_SIGNATURE: string;
	export const DISPLAY: string;
	export const CSF_XCAFDefaults: string;
	export const npm_package_devDependencies__eslint_compat: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const MOZ_ENABLE_WAYLAND: string;
	export const npm_package_devDependencies_eslint: string;
	export const LC_TELEPHONE: string;
	export const QT_IM_MODULE: string;
	export const LC_MEASUREMENT: string;
	export const XDG_VTNR: string;
	export const npm_package_dependencies__tanstack_table_core: string;
	export const npm_package_dependencies_postgres: string;
	export const CSF_PluginDefaults: string;
	export const CSF_TObjMessage: string;
	export const XDG_SESSION_ID: string;
	export const npm_package_devDependencies_clsx: string;
	export const npm_config_user_agent: string;
	export const CASROOT: string;
	export const npm_package_scripts_lint: string;
	export const ROCM_PATH: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const npm_execpath: string;
	export const LD_LIBRARY_PATH: string;
	export const npm_package_devDependencies_svelte: string;
	export const APPIMAGE: string;
	export const npm_package_scripts_test: string;
	export const XDG_RUNTIME_DIR: string;
	export const npm_package_devDependencies_bits_ui: string;
	export const npm_package_dependencies__smart_home_finder_common: string;
	export const NODE_PATH: string;
	export const MKLROOT: string;
	export const DEBUGINFOD_URLS: string;
	export const LC_TIME: string;
	export const BUN_INSTALL: string;
	export const npm_package_scripts_dev: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const CSF_XSMessage: string;
	export const MMGT_CLEAR: string;
	export const XDG_DATA_DIRS: string;
	export const npm_package_scripts_check: string;
	export const GDK_BACKEND: string;
	export const BROWSER: string;
	export const PATH: string;
	export const CSF_TObjDefaults: string;
	export const npm_config_node_gyp: string;
	export const npm_package_devDependencies_tsx: string;
	export const npm_package_scripts_db_push: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const npm_package_devDependencies_globals: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const npm_package_devDependencies__playwright_test: string;
	export const MAIL: string;
	export const npm_config_registry: string;
	export const DRAWDEFAULT: string;
	export const npm_node_execpath: string;
	export const npm_config_engine_strict: string;
	export const LC_NUMERIC: string;
	export const TERM_PROGRAM: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	export const PUBLIC_CLERK_PUBLISHABLE_KEY: string;
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		DATABASE_URL: string;
		CLERK_SECRET_KEY: string;
		SHELL: string;
		npm_command: string;
		npm_package_dependencies_mode_watcher: string;
		npm_package_scripts_db_studio: string;
		COLORTERM: string;
		HYPRLAND_CMD: string;
		CSF_MDTVTexturesDirectory: string;
		XDG_SESSION_PATH: string;
		TERM_PROGRAM_VERSION: string;
		GTK_IM_MODULE: string;
		npm_package_devDependencies_eslint_plugin_svelte: string;
		XDG_BACKEND: string;
		CSF_DrawPluginDefaults: string;
		npm_package_devDependencies_prettier_plugin_tailwindcss: string;
		npm_package_scripts_test_e2e: string;
		NODE: string;
		npm_package_devDependencies_embla_carousel_svelte: string;
		npm_package_devDependencies_autoprefixer: string;
		npm_package_dependencies_clerk_sveltekit: string;
		LC_ADDRESS: string;
		npm_package_devDependencies_tailwindcss: string;
		CSF_LANGUAGE: string;
		npm_package_scripts_check_watch: string;
		npm_package_dependencies_drizzle_zod: string;
		LC_NAME: string;
		CSF_MIGRATION_TYPES: string;
		ARGV0: string;
		GRADLE_HOME: string;
		npm_package_private: string;
		XMODIFIERS: string;
		DESKTOP_SESSION: string;
		LC_MONETARY: string;
		npm_package_devDependencies__clerk_backend: string;
		CSF_OCCTResourcePath: string;
		HL_INITIAL_WORKSPACE_TOKEN: string;
		NO_AT_BRIDGE: string;
		npm_package_scripts_db_seed: string;
		npm_package_devDependencies_drizzle_kit: string;
		CSF_STEPDefaults: string;
		EDITOR: string;
		npm_package_scripts_test_unit: string;
		XDG_SEAT: string;
		PWD: string;
		GSETTINGS_SCHEMA_DIR: string;
		npm_package_devDependencies_vite: string;
		XDG_SESSION_DESKTOP: string;
		LOGNAME: string;
		QT_QPA_PLATFORMTHEME: string;
		XDG_SESSION_TYPE: string;
		DRAWHOME: string;
		npm_package_dependencies_drizzle_orm: string;
		PNPM_HOME: string;
		npm_package_scripts_build: string;
		CSF_StandardLiteDefaults: string;
		npm_package_devDependencies_prettier: string;
		npm_config_recursive: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		npm_package_devDependencies_eslint_config_prettier: string;
		MOTD_SHOWN: string;
		VSCODE_INJECTION: string;
		HOME: string;
		LANG: string;
		LC_PAPER: string;
		npm_package_devDependencies_typescript: string;
		_JAVA_AWT_WM_NONREPARENTING: string;
		XDG_CURRENT_DESKTOP: string;
		npm_package_dependencies__smart_home_finder_scraper: string;
		npm_package_version: string;
		STARSHIP_SHELL: string;
		npm_package_devDependencies_tailwind_merge: string;
		WAYLAND_DISPLAY: string;
		GIT_ASKPASS: string;
		XDG_SEAT_PATH: string;
		npm_package_devDependencies_prettier_plugin_svelte: string;
		INIT_CWD: string;
		CSF_ShadersDirectory: string;
		npm_package_dependencies_zod: string;
		CHROME_DESKTOP: string;
		CSF_EXCEPTION_PROMPT: string;
		npm_package_devDependencies__sveltejs_adapter_vercel: string;
		CSF_XmlOcafResource: string;
		STARSHIP_SESSION_KEY: string;
		npm_package_scripts_format: string;
		npm_package_scripts_db_start: string;
		APPDIR: string;
		npm_package_scripts_preview: string;
		npm_lifecycle_script: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		CSF_SHMessage: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		npm_package_scripts_db_migrate: string;
		npm_package_devDependencies_svelte_check: string;
		npm_package_devDependencies_tailwind_variants: string;
		XDG_SESSION_CLASS: string;
		npm_package_devDependencies_lucide_svelte: string;
		TERM: string;
		LC_IDENTIFICATION: string;
		npm_package_name: string;
		npm_package_type: string;
		USER: string;
		npm_package_devDependencies_tailwindcss_animate: string;
		npm_config_frozen_lockfile: string;
		npm_package_devDependencies_typescript_eslint: string;
		npm_package_devDependencies_vitest: string;
		VSCODE_GIT_IPC_HANDLE: string;
		OWD: string;
		CSF_StandardDefaults: string;
		CSF_IGESDefaults: string;
		HYPRLAND_INSTANCE_SIGNATURE: string;
		DISPLAY: string;
		CSF_XCAFDefaults: string;
		npm_package_devDependencies__eslint_compat: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		MOZ_ENABLE_WAYLAND: string;
		npm_package_devDependencies_eslint: string;
		LC_TELEPHONE: string;
		QT_IM_MODULE: string;
		LC_MEASUREMENT: string;
		XDG_VTNR: string;
		npm_package_dependencies__tanstack_table_core: string;
		npm_package_dependencies_postgres: string;
		CSF_PluginDefaults: string;
		CSF_TObjMessage: string;
		XDG_SESSION_ID: string;
		npm_package_devDependencies_clsx: string;
		npm_config_user_agent: string;
		CASROOT: string;
		npm_package_scripts_lint: string;
		ROCM_PATH: string;
		PNPM_SCRIPT_SRC_DIR: string;
		npm_execpath: string;
		LD_LIBRARY_PATH: string;
		npm_package_devDependencies_svelte: string;
		APPIMAGE: string;
		npm_package_scripts_test: string;
		XDG_RUNTIME_DIR: string;
		npm_package_devDependencies_bits_ui: string;
		npm_package_dependencies__smart_home_finder_common: string;
		NODE_PATH: string;
		MKLROOT: string;
		DEBUGINFOD_URLS: string;
		LC_TIME: string;
		BUN_INSTALL: string;
		npm_package_scripts_dev: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		CSF_XSMessage: string;
		MMGT_CLEAR: string;
		XDG_DATA_DIRS: string;
		npm_package_scripts_check: string;
		GDK_BACKEND: string;
		BROWSER: string;
		PATH: string;
		CSF_TObjDefaults: string;
		npm_config_node_gyp: string;
		npm_package_devDependencies_tsx: string;
		npm_package_scripts_db_push: string;
		npm_package_devDependencies__sveltejs_kit: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		npm_package_devDependencies_globals: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		npm_package_devDependencies__playwright_test: string;
		MAIL: string;
		npm_config_registry: string;
		DRAWDEFAULT: string;
		npm_node_execpath: string;
		npm_config_engine_strict: string;
		LC_NUMERIC: string;
		TERM_PROGRAM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		PUBLIC_CLERK_PUBLISHABLE_KEY: string;
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
