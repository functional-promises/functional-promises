import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.ts'],
    exclude: ['tests/data/**'],
    environment: 'node',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['tests/**', 'docs/**', 'docs-source/**', 'dist/**'],
    },
  },
})
