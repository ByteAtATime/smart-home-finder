import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['packages/*/src/**/*.{test,spec}.{js,ts}'],
		alias: {
			'$env/dynamic/private': path.resolve('./packages/frontend/test/__mocks__/env.ts')
		}
	},
	resolve: {
		alias: {
			$lib: path.resolve('./packages/frontend/src/lib')
		}
	}
});
