import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  shims: true, // adds compatibility shims if needed
  banner: {
    js: '#!/usr/bin/env node',
  },
});
