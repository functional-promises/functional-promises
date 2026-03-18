import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  sourcemap: true,
  minify: true,
  target: 'node20',
  format: ['esm', 'cjs'],
  dts: true,
})
