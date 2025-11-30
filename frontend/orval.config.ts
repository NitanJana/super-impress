import { defineConfig } from 'orval';

export default defineConfig({
	'super-impress': {
		input: 'http://localhost:8000/openapi.json',
		output: {
			target: './src/lib/api/superimpress.ts',
			mode: 'tags-split',
			client: 'fetch'
		},
		hooks: {
			afterAllFilesWrite: 'prettier --write'
		}
	}
});
