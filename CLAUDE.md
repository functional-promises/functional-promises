# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build          # Build ESM + CJS outputs to dist/
pnpm build:watch    # Rebuild on changes
pnpm test           # Run full test suite with coverage
pnpm test:watch     # Vitest watch mode
pnpm typecheck      # Type-check without emitting
```

Run a single test file:
```bash
pnpm vitest run tests/arrays.ts
```

## Architecture

This library exposes two distinct APIs built from a single TypeScript source:

### V2 API (`src/index.ts` → `dist/async.js`)
Imported as `functional-promises` or `functional-promises/async`. A **promise-chain fluent interface** that wraps a single Promise internally (`_FP.promise`). Key patterns:
- `FP` is both a constructor and callable factory (new-guard in constructor)
- Prototype methods are injected from separate modules: [src/arrays.ts](src/arrays.ts), [src/conditional.ts](src/conditional.ts), [src/monads.ts](src/monads.ts), [src/events.ts](src/events.ts), [src/promise.ts](src/promise.ts)
- `chain()`/`chainEnd()` implement a delayed-execution builder pattern — steps are accumulated, then replayed at `chainEnd()`
- Concurrency control is implemented as a thread-pool inside `map()` using configurable limits

### V3 API (`src/iterables.ts` → `dist/iterable.js`)
Imported as `functional-promises/iterable`. A **lazy async-iterable pipeline** (~74K lines) with:
- 50+ standalone functions that each wrap a source `AsyncIterable` and return a generator
- An `FP<T>` class wrapping any iterable, implementing `Symbol.asyncIterator`
- Pull-based backpressure: execution only starts when a terminal method (`collect`, `reduce`, `first`, etc.) is called
- `_IDeferred<T>` internal utility for producer/consumer buffering in `buffer()` and concurrency operators

### Build
[tsup.config.ts](tsup.config.ts) compiles both entry points (`src/index.ts` and `src/iterables.ts`) to ESM + CJS with minification, source maps, and `.d.ts` generation. Target is Node 20.

### Tests
[vitest.config.mjs](vitest.config.mjs) — all tests live in `tests/`, run in Node environment, with `fileParallelism: false`. Coverage uses v8 provider over `src/**/*.ts`.

### Types
- [src/public-types.ts](src/public-types.ts) — exported API types
- [src/internal-types.ts](src/internal-types.ts) — internal module types

### Error handling
[src/modules/errors.ts](src/modules/errors.ts) defines a custom error hierarchy (`FunctionalError`, `FPCollectionError`) with error count/limit tracking used by the collection operators.
