import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/node/cli.ts', 'src/node/index.ts', 'src/node/dev.ts'],
  bundle: true,
  splitting: true,
  format: ['cjs', 'esm'],
  outDir: 'dist',
  dts: true,
  shims: true,
  clean: true,
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
  }
});
