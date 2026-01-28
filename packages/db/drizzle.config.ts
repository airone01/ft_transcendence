import { defineConfig } from 'drizzle-kit';
import {connectionString} from './env.ts'

export default defineConfig({
	schema: './src/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: connectionString },
	verbose: true,
	strict: true
});
