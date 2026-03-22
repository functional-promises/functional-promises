import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    async: 'src/index.ts',
    iterable: 'src/iterables.ts',
  },
  clean: true,
  sourcemap: true,
  minify: true,
  target: 'node20',
  format: ['esm', 'cjs'],
  dts: true,
})
