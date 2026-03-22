# Functional Promises

[![CI](https://github.com/functional-promises/functional-promises/actions/workflows/node.js.yml/badge.svg)](https://github.com/functional-promises/functional-promises/actions/workflows/node.js.yml)
[![GitHub package version](https://img.shields.io/github/package-json/v/functional-promises/functional-promises.svg?style=flat)](https://github.com/functional-promises/functional-promises)
[![GitHub stars](https://img.shields.io/github/stars/functional-promises/functional-promises.svg?label=Stars&style=flat)](https://github.com/functional-promises/functional-promises)

> A lightweight [Fluent API](https://en.wikipedia.org/wiki/Fluent_interface#JavaScript) for composing sync and async data pipelines in JavaScript and TypeScript.
> Ships two independent entry points: a promise-chain API (`/async`, v2) and a lazy async-iterable API (`/iterable`, v3).

## Library Comparison

| Library | Approach | Min bundle (gzip) | Zero dependencies |
|---|---|---|---|
| **functional-promises** v2.9.0 | Lazy async-iterable pipeline with fluent `FP` class | ~10 kB | Yes |
| [streaming-iterables](https://github.com/reconbot/streaming-iterables) | Standalone curried async-iterable utilities | ~5 kB | Yes |
| [RxJS](https://rxjs.dev) | Observable push-streams; rich operator library | ~40 kB | No |
| [IxJS](https://github.com/ReactiveX/IxJS) | Pull-based iterable/async-iterable operators | ~20 kB | No |

> RxJS and IxJS are excellent, mature libraries with far larger operator surfaces. `functional-promises` targets projects that want a zero-dependency, tree-shakeable async-iterable pipeline without the Observable mental model or the bundle weight.

## Which API Should I Use?

`functional-promises` ships two independent entry points with different execution models. Choose based on what you are processing.

### Decision table

| Question | Answer | Use |
|---|---|---|
| Do you have a **single value** moving through transforms? | Yes | `functional-promises/async` (v2) |
| Are you **reacting to DOM or Node events** with `.listen()`? | Yes | `functional-promises/async` (v2) |
| Do you need `.thenIf()` conditional branching in a chain? | Yes | `functional-promises/async` (v2) |
| Are you working in an **existing v2 codebase**? | Yes | `functional-promises/async` (v2) |
| Do you need to process a **large dataset or stream**? | Yes | `functional-promises/iterable` (v3) |
| Do you need **backpressure** so fast producers don't overwhelm slow consumers? | Yes | `functional-promises/iterable` (v3) |
| Are you making **many concurrent HTTP requests** with a concurrency cap? | Yes | `functional-promises/iterable` (v3) |
| Are you walking a **paginated API** or infinite sequence? | Yes | `functional-promises/iterable` (v3) |
| Do you want to replace an **RxJS Observable pipeline**? | Yes | `functional-promises/iterable` (v3) |

### When to pick `/async` (v2)

The v2 API wraps a single Promise and evaluates eagerly — each step runs as soon as the previous one resolves.

```js
import FP from 'functional-promises/async'

// Good fit: single value, conditional branching, event listeners
FP.resolve(userId)
  .then(fetchUser)
  .thenIf(
    user => user.isAdmin,
    user => grantAccess(user),
    user => denyAccess(user)
  )
  .listen(button, 'click', handleClick)
```

Pick v2 when:
- You are wrapping one async operation (a network call, a file read, a database query).
- You already use `.thenIf()`, `.listen()`, or `.tap()` from v2 and the chain is not processing a collection.
- You are maintaining an existing v2 codebase and do not need stream semantics.

### When to pick `/iterable` (v3)

The v3 API is a lazy async-generator pipeline. Nothing runs until you pull from the end of the chain with a terminal method. It natively supports backpressure, early termination, and controllable concurrency.

```js
import { FP } from 'functional-promises/iterable'

// Good fit: paginated API, concurrency cap, stop after first 50 matches
const results = await FP.from(paginatedRecords())   // async generator, possibly infinite
  .filter(record => record.status === 'active')
  .parallelMap(8, record => enrichFromAPI(record))  // 8 in-flight at a time
  .take(50)                                         // stop after 50 — no wasted requests
  .collect()
```

Pick v3 when:
- Your source is a stream, an event emitter, a paginated API, or any large collection.
- You want controllable concurrency (`parallelMap`, `transform`, `buffer`, `throttle`).
- You want early exit (`take`, `takeWhile`) to genuinely stop upstream work.
- You want reusable pipeline factories (see the next section).
- You are migrating away from RxJS Observables or IxJS AsyncIterables.

### Using both in the same project

The two entry points are completely independent — they do not share state and can coexist in any combination. A common pattern is to use v3 for data ingestion pipelines and v2 for individual event-driven interactions:

```js
import FP from 'functional-promises/async'
import { FP as Pipeline } from 'functional-promises/iterable'

// v3 pipeline produces enriched records
const enriched = Pipeline.from(rawEventStream)
  .filter(isRelevant)
  .map(normalize)
  .collect()

// v2 wraps the single resulting promise with conditional logic
FP.resolve(enriched)
  .thenIf(records => records.length === 0, notifyEmpty, saveToDatabase)
```

---

## Installation

```sh
npm install functional-promises
```

The package ships two independent entry points:

| Import path                    | What you get
|--------------------------------|-------------------------------
| `functional-promises/async`    | v2 — promise-chain API (original)
| `functional-promises/iterable` | v3 — lazy async-generator API (new)

### v2 — Promise chains (`/async`)

```js
import FP from 'functional-promises/async'
// or CommonJS:
const FP = require('functional-promises/async')
```

The v2 API is a [Fluent](https://en.wikipedia.org/wiki/Fluent_interface#JavaScript) promise-chain builder. It is stable, well-tested, and suitable for existing projects. See [v2 API Reference (Legacy)](#v2-api-reference-legacy) for the full method list.

### v3 — Async iterables (`/iterable`)

```js
import { FP, map, filter, range, zip } from 'functional-promises/iterable'
```

### Lazy evaluation — nothing runs until you ask

The v3 API follows a **lazy pull model**: building a chain of transforms creates a description of work, not the work itself. Processing begins only when a terminal method pulls the first item through the chain.

### Building the chain costs nothing

```js
import { FP } from 'functional-promises/iterable'

let sideEffectCount = 0

// Define the pipeline — zero items are processed here
const pipeline = FP.range(0, 1_000_000)
  .filter(n => {
    sideEffectCount++   // this function has NOT been called yet
    return n % 2 === 0
  })
  .map(n => n * n)
  .take(5)

console.log(sideEffectCount) // 0 — nothing has run

// Pull results — processing begins NOW
const results = await pipeline.collect()

console.log(results)         // [0, 4, 16, 36, 64]
console.log(sideEffectCount) // 11 — filter ran only until take(5) was satisfied
                             //      (not 1,000,000 times)
```

The generator is pulled one item at a time from the terminal (`collect`) back through the chain. As soon as `take(5)` has received five items it stops requesting more, so `filter` and `range` stop producing. With an eager model you would have allocated an array of a million entries first.

### Only terminal methods trigger execution

| Terminal method | What it does |
|---|---|
| `.collect()` | Resolves to an array of all items |
| `.first()` | Resolves to the first item, then stops |
| `.consume()` | Drains the pipeline for side-effects, resolves to `void` |
| `.reduce(fn, seed)` | Folds all items into a single value |
| `.find(predicate)` | Resolves to the first matching item, then stops |
| `for await...of fp` | Manual iteration — you control the pace |

Calling any transform method (`.map()`, `.filter()`, `.take()`, etc.) returns a new lazy `FP` wrapper. No data moves.

### Reusable pipeline factories

Because a pipeline is just an object describing the computation, you can build it once and hand it around before deciding when — or whether — to run it.

```js
import { FP } from 'functional-promises/iterable'

function buildEventPipeline(source, transform) {
  // Construct the pipeline — nothing runs here
  return FP.from(source)
    .filter(isRelevant)
    .map(transform)
    .take(100)
}

// --- later, in different call sites ---

const processEvents = buildEventPipeline(liveStream, normalizeEvent)
// nothing has run yet — we can pass this around, inspect it, compose it further

// Option A: run it eagerly and get all results
const results = await processEvents.collect()

// Option B: run it lazily, item by item
for await (const event of processEvents) {
  await writeToDatabase(event)  // backpressure: next item waits for this to finish
}

// Option C: extend the pipeline before running
const urgentOnly = processEvents.filter(e => e.priority === 'high').first()
const firstUrgent = await urgentOnly
```

### Why early termination matters for upstream work

With a pull-based model, `.take(n)` is not a filter applied after everything is produced — it is a signal that propagates upstream to stop the generator entirely.

```js
import { FP } from 'functional-promises/iterable'

async function* fetchPages(cursor = null) {
  while (true) {
    const { items, next } = await apiClient.getPage(cursor)
    yield* items
    if (!next) break
    cursor = next
  }
}

// Only fetches pages until 10 results accumulate — then stops making HTTP requests
const firstTen = await FP.from(fetchPages())
  .filter(item => item.published)
  .take(10)
  .collect()
```

With an eager model you would have fetched every page before filtering. With the lazy pull model, the async generator `fetchPages` is suspended as soon as `take(10)` is satisfied — no further API calls are made.

### Factory methods (static, return `FP<T>`)

| Signature | Description |
|---|---|
| `FP.from<T>(source: AnyIterable<T>): FP<T>` | Wrap any sync or async iterable in a chainable `FP` pipeline. |
| `FP.of<T>(...values: T[]): FP<T>` | Create an `FP` from a list of inline values. |
| `FP.range(start: number, end: number, step?: number): FP<number>` | Yield numbers from `start` (inclusive) to `end` (exclusive) by `step` (default `1`). |
| `FP.repeat<T>(value: T, count?: number): FP<T>` | Yield `value` exactly `count` times, or infinitely if `count` is omitted. |
| `FP.interval(ms: number, limit?: number): FP<number>` | Yield incrementing integers every `ms` milliseconds; stop after `limit` ticks if given. |
| `FP.fromEvents<T>(emitter: EventEmitterLike, event: string, endEvent?: string): FP<T>` | Yield values from a Node.js-style event emitter until `endEvent` (default `'end'`) fires. |
| `FP.empty<T = never>(): FP<T>` | An immediately-exhausted pipeline that yields nothing. |

---

### Transform methods (fluent, return `FP<…>`)

| Signature | Description |
|---|---|
| `.map<R>(fn: (val: T) => R \| Promise<R>): FP<R>` | Apply `fn` to every value; supports async functions. |
| `.flatMap<R>(fn: (val: T) => FlatMapValue<R>): FP<NonNullable<R>>` | Map, flatten one level, and drop `null`/`undefined` results. |
| `.filter(fn: (val: T) => boolean \| Promise<boolean>): FP<T>` | Keep only values for which `fn` returns `true`. |
| `.tap(fn: (val: T) => any): FP<T>` | Run a side-effect function for each value; passes values through unchanged. |
| `.flatten(): FP<…>` | Recursively flatten nested iterables depth-first. |
| `.scan<R>(fn: (acc: R, val: T) => R \| Promise<R>, initial: R): FP<R>` | Emit the running accumulator after each step. |
| `.take(count: number): FP<T>` | Emit at most the first `count` values. |
| `.takeLast(count: number): FP<T>` | Emit only the last `count` values (buffers the full stream). |
| `.takeWhile(fn: (val: T) => boolean \| Promise<boolean>): FP<T>` | Emit values until `fn` returns `false`, then stop. |
| `.drop(count: number): FP<T>` | Skip the first `count` values. |
| `.batch(size: number): FP<T[]>` | Group values into arrays of up to `size`; last batch may be shorter. |
| `.batchWithTimeout(size: number, timeout: number): FP<T[]>` | Like `.batch()` but flushes early if `timeout` ms elapses between items. |
| `.window(size: number): FP<T[]>` | Emit sliding windows of exactly `size` consecutive values. |
| `.buffer(size: number): FP<T>` | Pre-fetch up to `size` items ahead, hiding upstream latency. |
| `.transform<R>(concurrency: number, fn: (val: T) => R \| Promise<R>): FP<R>` | Concurrent map; up to `concurrency` async operations at once; output order follows resolution order. |
| `.parallelMap<R>(concurrency: number, fn: (val: T) => R \| Promise<R>): FP<R>` | Concurrent map with preserved input order; up to `concurrency` operations at once. |
| `.throttle(limit: number, intervalMs: number): FP<T>` | Rate-limit throughput to `limit` values per `intervalMs` ms without discarding items. |
| `.concat(...others: AnyIterable<T>[]): FP<T>` | Append one or more iterables sequentially after the current pipeline. |
| `.merge(...others: AnyIterable<T>[]): FP<T>` | Interleave values from this and `others` in round-robin order. |
| `.zip<U>(other: AnyIterable<U>): FP<[T, U]>` | Pair each value with the corresponding item from `other`; stops at the shorter iterable. |
| `.enumerate(): FP<[number, T]>` | Prepend a zero-based index to each value, yielding `[index, value]` tuples. |
| `.distinct(keyFn?: (val: T) => any): FP<T>` | Suppress duplicates; `keyFn` computes the identity key (defaults to identity). |
| `.pairwise(): FP<[T, T]>` | Yield consecutive `[prev, current]` pairs; yields nothing for fewer than 2 items. |
| `.cycle(): FP<T>` | Infinitely repeat the sequence by collecting all values on first pass then looping. |

---

### Terminal methods (return `Promise`)

| Signature | Description |
|---|---|
| `.collect(): Promise<T[]>` | Drain the pipeline into an array. |
| `.consume(): Promise<void>` | Drain the pipeline, discarding all values. |
| `.reduce<R>(fn: (acc: R, val: T) => R, initial: R): Promise<R>` | Fold the pipeline to a single value. |
| `.partition(fn: (val: T) => boolean \| Promise<boolean>): Promise<[T[], T[]]>` | Eagerly split into `[matching[], nonMatching[]]`. |
| `.first(): Promise<T \| undefined>` | Return the first value, or `undefined` if the pipeline is empty. |
| `.last(): Promise<T \| undefined>` | Return the last value, or `undefined` if the pipeline is empty. |
| `.find(fn: (val: T) => boolean \| Promise<boolean>): Promise<T \| undefined>` | Return the first value satisfying `fn`, or `undefined`. |
| `.findIndex(fn: (val: T) => boolean \| Promise<boolean>): Promise<number>` | Return the index of the first matching value, or `-1`. |
| `.some(fn: (val: T) => boolean \| Promise<boolean>): Promise<boolean>` | `true` if at least one value satisfies `fn`. |
| `.every(fn: (val: T) => boolean \| Promise<boolean>): Promise<boolean>` | `true` if every value satisfies `fn`. |
| `.count(): Promise<number>` | Return the total number of values in the pipeline. |
| `.toMap<K, V>(): Promise<Map<K, V>>` | Collect `[K, V]` tuple values into a `Map`. Requires `T` to be a two-element tuple. |
| `.toSet(): Promise<Set<T>>` | Collect values into a `Set`. |

---

### Standalone exported functions

All functions support currying: called with one fewer argument they return a function expecting the rest.

#### Generators

| Signature | Description |
|---|---|
| `range(start: number, end: number, step?: number): Generator<number>` | Sync generator from `start` to `end` (exclusive) by `step`. Throws `RangeError` if `step` is `0`. |
| `repeat<T>(value: T, count?: number): Generator<T>` | Sync generator yielding `value` `count` times; infinite if `count` is omitted. |
| `interval(ms: number, limit?: number): AsyncGenerator<number>` | Async generator yielding incrementing integers every `ms` ms; runs forever unless `limit` is given. |
| `zip<A, B, ...>(...iterables: [AnyIterable<A>, AnyIterable<B>, ...]): AsyncGenerator<[A, B, ...]>` | Yield tuples of one item per iterable; TypeScript infers element types; stops at the shortest iterable. |
| `enumerate<T>(iterable: AnyIterable<T>): AsyncGenerator<[number, T]>` | Yield `[index, value]` pairs. |
| `cycle<T>(iterable: AnyIterable<T>): AsyncGenerator<T>` | Infinitely repeat the iterable; collects all values on first pass. |
| `pairwise<T>(iterable: AnyIterable<T>): AsyncGenerator<[T, T]>` | Yield consecutive overlapping `[prev, current]` pairs. |

#### Transform operators

| Signature | Description |
|---|---|
| `map<T, B>(fn: (data: T) => B \| Promise<B>, iterable: AnyIterable<T>): AsyncGenerator<B>` | Apply `fn` to every item; supports async functions. |
| `filter<T>(fn: (data: T) => boolean \| Promise<boolean>, iterable: AnyIterable<T>): AsyncGenerator<T>` | Keep only items for which `fn` returns truthy. |
| `flatMap<T, B>(fn: (data: T) => FlatMapValue<B>, iterable: AnyIterable<T>): AsyncGenerator<NonNullable<B>>` | Map, flatten one level, drop `null`/`undefined`. |
| `flatten<B>(iterable: AnyIterable<B \| AnyIterable<B>>): AsyncIterableIterator<B>` | Recursively flatten nested iterables depth-first. |
| `tap<T>(fn: (data: T) => any, iterable: AnyIterable<T>): AsyncGenerator<T>` | Run a side-effect per item; passes values through. |
| `scan<T, R>(fn: (acc: R, val: T) => R \| Promise<R>, initial: R, iterable: AnyIterable<T>): AsyncGenerator<R>` | Emit running accumulator after each step. |
| `distinct<T>(keyFn?: (val: T) => any, iterable: AnyIterable<T>): AsyncGenerator<T>` | Suppress duplicates, optionally keyed by `keyFn`. |
| `window<T>(size: number, iterable: AnyIterable<T>): AsyncGenerator<T[]>` | Emit sliding windows of `size` items. |
| `transform<T, R>(concurrency: number, fn: (data: T) => R \| Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>` | Concurrent map; output order by resolution time; up to `concurrency` ops in flight. |
| `parallelMap<T, R>(concurrency: number, fn: (data: T) => R \| Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>` | Concurrent map preserving input order; up to `concurrency` ops in flight. |
| `flatTransform<T, R>(concurrency: number, fn: (data: T) => FlatMapValue<R>, iterable: AnyIterable<T>): AsyncGenerator<R>` | Concurrent flat-map; flattens async iterables returned by `fn` concurrently. |
| `parallelFlatMap<T, R>(concurrency: number, fn: (data: T) => R \| Promise<R>, iterable: AnyIterable<T>): AsyncGenerator<R>` | Concurrent flat-map with order-preserving `parallelMap` semantics. |
| `throttle<T>(limit: number, interval: number, iterable: AnyIterable<T>): AsyncGenerator<T>` | Rate-limit to `limit` items per `interval` ms without dropping items. |
| `time<T>(config: TimeConfig, iterable: AnyIterable<T>): AnyIterable<T>` | Pass-through that calls `config.progress` with `hrtime` per item and `config.total` on completion. |

#### Slicing operators

| Signature | Description |
|---|---|
| `take<T>(count: number, iterable: AnyIterable<T>): AnyIterable<T>` | Emit the first `count` values; sync for sync input, async otherwise. |
| `takeLast<T>(count: number, iterable: AnyIterable<T>): AnyIterable<T>` | Emit the last `count` values (must consume the full iterable first). |
| `takeWhile<T>(predicate: (data: T) => boolean \| Promise<boolean>, iterable: AnyIterable<T>): AsyncGenerator<T>` | Emit values until `predicate` returns `false`. |
| `drop<T>(count: number, iterable: AnyIterable<T>): AnyIterable<T>` | Skip the first `count` values. |
| `batch<T>(size: number, iterable: AnyIterable<T>): AnyIterable<T[]>` | Group into arrays of `size`; final batch may be shorter. |
| `batchWithTimeout<T>(size: number, timeout: number, iterable: AnyIterable<T>): AnyIterable<T[]>` | Like `batch` but flushes early after `timeout` ms of inactivity. |

#### Combining operators

| Signature | Description |
|---|---|
| `concat<T>(...iterables: AnyIterable<T>[]): AnyIterable<T>` | Yield all items from each iterable in sequence. Sync if all inputs are sync. |
| `merge<T>(...iterables: AnyIterable<T>[]): AsyncGenerator<T>` | Interleave items in round-robin order. |
| `parallelMerge<T>(...iterables: AnyIterable<T>[]): AsyncGenerator<T>` | Yield items as soon as each resolves across all iterables (first-ready-first-out). |
| `buffer<T>(size: number, iterable: AnyIterable<T>): AnyIterable<T>` | Pre-fetch up to `size` items ahead to hide upstream latency. |

#### Terminal / sink functions

| Signature | Description |
|---|---|
| `collect<T>(iterable: Iterable<T>): T[]` | Collect a sync iterable to an array synchronously. |
| `collect<T>(iterable: AsyncIterable<T>): Promise<T[]>` | Collect an async iterable to an array. |
| `consume<T>(iterable: AnyIterable<T>): void \| Promise<void>` | Drain an iterable, discarding all values. |
| `reduce<T, B>(fn: (acc: B, value: T) => B, start: B, iterable: AnyIterable<T>): Promise<B>` | Fold the iterable to a single accumulated value. |
| `partition<T>(fn: (val: T) => boolean \| Promise<boolean>, iterable: AnyIterable<T>): Promise<[T[], T[]]>` | Eagerly split into `[matching[], nonMatching[]]`. |
| `pipeline<T0, …>(firstFn: () => T0, …fns): TN` | Pipe the return of each function into the next; up to 10 typed stages. |
| `writeToStream(stream: WritableStreamish, iterable: AnyIterable<any>): Promise<void>` | Write all values to a Node.js writable stream, respecting back-pressure. |

#### Utility functions

| Signature | Description |
|---|---|
| `retry<T>(times: number, fn: () => T \| Promise<T>): Promise<T>` | Call `fn` up to `times` total attempts; throws the last error if all fail. |
| `fromEvents<T>(emitter: EventEmitterLike, event: string, endEvent?: string): AsyncIterable<T>` | Convert a Node.js-style event emitter to an async iterable. |
| `fromStream<T>(stream: ReadableStreamish): AsyncIterable<T>` | Wrap a Node.js readable stream as an async iterable. |
| `getIterator<T>(iterable: Iterableish<T>): Iterator<T> \| AsyncIterator<T>` | Unwrap any iterable or iterator to its underlying iterator object. |

## Backpressure & Concurrency

### The problem: fast producers overwhelming slow consumers

Async iterables are pull-based by design — a consumer asks for the next value and the producer provides it. But when a producer can generate items far faster than the consumer can process them (think: reading a file line-by-line while making an HTTP request per line), naively collecting everything first blows up memory. The solution is **backpressure**: the consumer signals how much work it can accept, and the pipeline respects that limit.

The v3 API ships several primitives for controlling this:

| Primitive | What it controls |
|---|---|
| `buffer(size)` | How many items to prefetch ahead of the consumer |
| `parallelMap(concurrency, fn)` | How many async operations run simultaneously (order preserved) |
| `transform(concurrency, fn)` | Like `parallelMap` but yields results as they complete (unordered) |
| `throttle(limit, ms)` | Rate: items emitted per time window |
| `batchWithTimeout(size, ms)` | Downstream batch size with a time-based flush safety valve |

---

### `buffer(size)` — prefetch without blowing up memory

`buffer(size)` eagerly pulls up to `size` items from the upstream source while the downstream consumer is busy processing the current item. This decouples the producer and consumer speeds without ever holding the full dataset in memory.

```ts
import { FP, buffer, parallelMap, collect } from 'functional-promises/iterable'
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

async function* readLines(path: string) {
  const rl = createInterface({ input: createReadStream(path) })
  for await (const line of rl) yield line
}

// Buffer 50 lines ahead while we process each one.
// At most 50 + (current batch being processed) lines are in memory at once.
const results = await collect(
  parallelMap(
    10,                              // 10 concurrent fetch calls
    (line) => fetch(`/api/enrich?q=${encodeURIComponent(line)}`).then(r => r.json()),
    buffer(50, readLines('/data/queries.txt'))
  )
)
```

The `buffer(50)` call means the file reader keeps 50 lines ready so `parallelMap` is never starved waiting for I/O. Without it, every fetch completion would stall while the next line is read from disk.

---

### `parallelMap()` vs `transform()` — order-preserving vs throughput-maximizing

Both run your async function on multiple items simultaneously, but they differ in what they guarantee about output order:

- **`parallelMap(concurrency, fn)`** — output arrives in the same order as input. Item 3 will never appear in the result before item 1, even if item 3's promise resolves first. Use this when downstream depends on order (writing to a file, correlating with the original list, etc.).

- **`transform(concurrency, fn)`** — output arrives in *completion order*. A fast item can overtake a slow one. Use this when downstream doesn't care about order and you want maximum throughput (e.g., writing results to independent database rows).

```ts
import { FP } from 'functional-promises/iterable'

const urls = [
  'https://api.example.com/slow-resource',   // takes 500 ms
  'https://api.example.com/fast-resource',   // takes 50 ms
  'https://api.example.com/medium-resource', // takes 200 ms
]

// parallelMap: results always come back in [slow, fast, medium] order
const ordered = await FP.from(urls)
  .parallelMap(3, url => fetch(url).then(r => r.json()))
  .collect()

// transform: results come back as [fast, medium, slow] — first finished, first out
// Use when you just want to process all results as fast as possible
const unordered = await FP.from(urls)
  .transform(3, url => fetch(url).then(r => r.json()))
  .collect()
```

A practical rule of thumb: use `parallelMap` by default for correctness, switch to `transform` only when profiling shows order-preservation is a bottleneck.

---

### `throttle()` — rate-limiting API calls

`throttle(limit, ms)` ensures no more than `limit` items flow through per `ms` milliseconds. Items that arrive too fast are held back (applying backpressure upstream) rather than dropped.

```ts
import { FP, range } from 'functional-promises/iterable'

interface GitHubUser { login: string; public_repos: number }

// GitHub's unauthenticated API allows 60 requests/minute.
// throttle(1, 1000) = 1 request per second = 60/minute, safely under the limit.
const userStats = await FP.range(1, 61)          // user IDs 1–60
  .throttle(1, 1000)
  .map(id =>
    fetch(`https://api.github.com/user/${id}`)
      .then(r => r.json() as Promise<GitHubUser>)
  )
  .collect()

console.log(`Fetched ${userStats.length} users without hitting rate limits`)
```

For higher-throughput APIs (e.g., 10 requests/second), use `throttle(10, 1000)`. The throttle distributes the `limit` evenly across the window rather than sending bursts.

---

### Full example: bounded parallel downloads with backpressure

This pattern is the workhorse for any ETL or batch processing pipeline:

```ts
import { FP } from 'functional-promises/iterable'

interface Product { id: number; name: string; price: number }

async function* productIds(): AsyncGenerator<number> {
  let page = 0
  while (true) {
    const ids: number[] = await fetch(`/api/products?page=${page++}&size=100`)
      .then(r => r.json())
    if (ids.length === 0) return
    yield* ids
  }
}

async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`/api/products/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status} for product ${id}`)
  return res.json()
}

async function processAll() {
  const products = await FP.from(productIds())
    .buffer(200)             // prefetch 200 IDs from the paginated source
    .parallelMap(20, fetchProduct)   // fetch 20 products concurrently, preserve order
    .filter(p => p.price > 0)
    .map(p => ({ ...p, name: p.name.trim() }))
    .collect()

  console.log(`Processed ${products.length} products`)
  return products
}
```

The `buffer(200)` keeps the paginator running ahead while `parallelMap(20)` works through the queue, so neither the network fetcher nor the paginator ever sits idle waiting for the other.

---

## Recipes

### 1. Paginated API — fetch pages until empty, yield individual items

```ts
import { FP } from 'functional-promises/iterable'

interface Issue { id: number; title: string; state: string }

async function* githubIssues(repo: string): AsyncGenerator<Issue> {
  let page = 1
  while (true) {
    const issues: Issue[] = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=all&per_page=100&page=${page++}`
    ).then(r => r.json())

    if (issues.length === 0) return  // no more pages

    yield* issues                    // yield individual items, not the whole array
  }
}

// Now process the full issue list as a stream — never loads all pages at once
const openTitles = await FP.from(githubIssues('facebook/react'))
  .filter(issue => issue.state === 'open')
  .map(issue => issue.title)
  .take(50)        // stop after 50 results — cancels upstream pagination automatically
  .collect()
```

---

### 2. Rate-limited HTTP — N requests per second

```ts
import { FP } from 'functional-promises/iterable'

interface SearchResult { query: string; hits: number }

const queries = [
  'async iterables typescript',
  'backpressure streams node',
  'rate limiting api calls',
  // ... potentially thousands more
]

// 5 requests per second, staying well under typical API limits
const results: SearchResult[] = await FP.from(queries)
  .throttle(5, 1000)
  .map(async query => {
    const res = await fetch(`https://search.example.com/api?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    return { query, hits: data.total } satisfies SearchResult
  })
  .collect()

console.log(results.map(r => `${r.query}: ${r.hits} hits`).join('\n'))
```

---

### 3. Process a Node.js Readable stream

Node.js `Readable` streams implement `Symbol.asyncIterator` in Node 12+, so `FP.from()` wraps them directly. For older streams or third-party readable-like objects, the same pattern works.

```ts
import { FP } from 'functional-promises/iterable'
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

async function processLogFile(path: string) {
  // readline emits line-by-line via asyncIterator
  const lines = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  })

  const errorLines = await FP.from(lines)
    .filter(line => line.includes('ERROR'))
    .map(line => {
      const [timestamp, ...rest] = line.split(' ')
      return { timestamp, message: rest.join(' ') }
    })
    .collect()

  console.log(`Found ${errorLines.length} errors`)
  return errorLines
}

// Works identically with any async iterable source:
// FP.from(response.body)           — fetch() Response body (Web Streams)
// FP.from(someTransformStream)     — Node Transform streams
// FP.from(csvParser.parse(file))   — csv-parse / similar libraries
```

---

### 4. Live event stream with graceful stop

```ts
import { FP } from 'functional-promises/iterable'
import { EventEmitter } from 'node:events'

interface LogEvent { level: string; message: string; ts: number }

// fromEvents turns an EventEmitter into an async iterable.
// It completes when the endEvent fires (default: 'end').
const logEmitter = new EventEmitter()

async function watchLogs(shutdownSignal: Promise<void>) {
  let stopping = false
  shutdownSignal.then(() => { stopping = true })

  const events = await FP.fromEvents<LogEvent>(logEmitter, 'log', 'close')
    .takeWhile(() => !stopping)          // gracefully drain on shutdown
    .filter(e => e.level === 'ERROR')
    .tap(e => console.error(`[${new Date(e.ts).toISOString()}] ${e.message}`))
    .collect()

  return events
}

// Usage
const { promise: shutdown, resolve: stop } = Promise.withResolvers<void>()
watchLogs(shutdown)

logEmitter.emit('log', { level: 'INFO', message: 'started', ts: Date.now() })
logEmitter.emit('log', { level: 'ERROR', message: 'disk full', ts: Date.now() })

// When ready to stop:
stop()
logEmitter.emit('close')
```

---

### 5. Retry failed requests

The standalone `retry(attempts, fn)` function retries `fn` up to `attempts` times, re-throwing the last error if all attempts fail. Combine it with `parallelMap` for resilient concurrent fetching.

```ts
import { FP, retry } from 'functional-promises/iterable'

interface WeatherData { city: string; temp: number; humidity: number }

async function fetchWeather(city: string): Promise<WeatherData> {
  // retry wraps a single async operation — not a stream
  return retry(3, async () => {
    const res = await fetch(`https://weather.example.com/api/${encodeURIComponent(city)}`)
    if (res.status === 429 || res.status >= 500) {
      throw new Error(`Retryable HTTP ${res.status}`)
    }
    if (!res.ok) throw new Error(`Non-retryable HTTP ${res.status}`)
    return res.json() as Promise<WeatherData>
  })
}

const cities = ['London', 'Tokyo', 'New York', 'Sydney', 'Berlin']

const forecasts = await FP.from(cities)
  .parallelMap(3, fetchWeather)   // 3 concurrent requests, each retried up to 3×
  .collect()
```

`retry` attempts the function immediately on failure with no delay between attempts. For production use, add exponential backoff inside `fn` (e.g., using a `sleep` helper) before the next `throw`.

---

### 6. Parallel downloads, preserve order

Download multiple files simultaneously while ensuring the final result array matches the input order. `buffer` keeps the URL queue primed; `parallelMap` processes up to `concurrency` downloads at once and guarantees the output is in the same order as the input URLs.

```ts
import { FP } from 'functional-promises/iterable'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

interface DownloadResult { url: string; path: string; bytes: number }

async function downloadAll(
  urls: string[],
  outDir: string,
  concurrency = 8
): Promise<DownloadResult[]> {
  return FP.from(urls)
    .buffer(concurrency * 2)   // keep 2× the concurrency window prefetched
    .parallelMap(concurrency, async (url): Promise<DownloadResult> => {
      const filename = url.split('/').pop() ?? `file-${Date.now()}`
      const dest = join(outDir, filename)

      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to download ${url}: HTTP ${res.status}`)

      const bytes = await res.arrayBuffer()
      await writeFile(dest, Buffer.from(bytes))

      return { url, path: dest, bytes: bytes.byteLength }
    })
    .collect()
}

// Downloads 8 files at once; results[i] corresponds to urls[i]
const results = await downloadAll(
  ['https://cdn.example.com/a.zip', 'https://cdn.example.com/b.zip', /* ... */],
  '/tmp/downloads'
)

const totalMB = results.reduce((sum, r) => sum + r.bytes, 0) / 1_048_576
console.log(`Downloaded ${results.length} files (${totalMB.toFixed(1)} MB total)`)
```

The key insight: `parallelMap` fires all `concurrency` fetches simultaneously but holds back results that finish out of order until earlier items are ready, so `results[0]` always corresponds to `urls[0]`. If you don't need that guarantee, swap to `.transform(concurrency, ...)` for a small throughput gain on highly variable download times.

## TypeScript Usage

The `functional-promises/iterable` module is written in TypeScript and ships `.d.ts` declaration files. All APIs are fully typed, including generic type parameters for source and result elements.

### 1. Typed `FP.from()` with an explicit generic

When the element type cannot be inferred from the source (e.g. an empty array or a loosely typed value), supply the generic explicitly.

```ts
import { FP } from 'functional-promises/iterable'

// Explicit generic prevents widening to `never[]`
const fp: FP<number> = FP.from<number>([])

// Inferred when the source already carries a type
const words: FP<string> = FP.from(['hello', 'world'])
```

### 2. Typed `reduce` accumulator

`reduce` accepts two type parameters: the element type `A` and the accumulator type `B`. Annotate the initial value when they differ.

```ts
import { FP } from 'functional-promises/iterable'

// Sum — A and B are the same type
const total: number = await FP.of(1, 2, 3, 4, 5)
  .reduce<number, number>((acc, x) => acc + x, 0)

// Build a Map — A is string, B is Map<string, number>
const lengths: Map<string, number> = await FP.of('cat', 'elephant', 'ox')
  .reduce<string, Map<string, number>>(
    (acc, word) => acc.set(word, word.length),
    new Map()
  )
```

### 3. Using `AnyIterable<T>` in your own functions

`AnyIterable<T>` is `Iterable<T> | AsyncIterable<T>`. Use it to write helpers that accept any FP-compatible source — arrays, generators, `FP` instances, or other async iterables.

```ts
import { AnyIterable, collect, map } from 'functional-promises/iterable'

async function doubleAll(source: AnyIterable<number>): Promise<number[]> {
  return collect(map(x => x * 2, source))
}

// All of these are valid:
await doubleAll([1, 2, 3])                 // plain array
await doubleAll(FP.range(0, 5))            // FP instance (implements AsyncIterable)
await doubleAll(someAsyncGenerator())      // async generator
```

### 4. Fully-typed `pipeline()` with curried standalone functions

`pipeline()` is typed with overloads that propagate types through each stage. The curried standalone functions (`map`, `filter`, `reduce`, `collect`) are designed to compose with it.

```ts
import { pipeline, map, filter, reduce } from 'functional-promises/iterable'

const sumOfSquaresOfEvens: number = await pipeline(
  (): number[]             => [1, 2, 3, 4, 5, 6],
  filter<number>           (x => x % 2 === 0),     // number[] → AsyncGenerator<number>
  map<number, number>      (x => x * x),            // → AsyncGenerator<number>
  reduce<number, number>   ((acc, x) => acc + x, 0) // → Promise<number>
)
// 56  (4 + 16 + 36)
```

TypeScript infers the return type of each stage from the previous one, so a type mismatch is caught at compile time:

```ts
// Type error — map callback returns string but reduce expects number
await pipeline(
  (): number[] => [1, 2, 3],
  map<number, string>(x => String(x)),
  reduce<number, number>((acc, x) => acc + x, 0)
  //                              ^
  // TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
)
```

### 5. Custom typed generator as input to `FP.from()`

Any `AsyncIterable<T>` — including an `async function*` generator — can be wrapped with `FP.from()`.

```ts
import { FP } from 'functional-promises/iterable'

async function* fibonacci(): AsyncGenerator<number> {
  let [a, b] = [0, 1]
  while (true) {
    yield a;
    [a, b] = [b, a + b]
  }
}

const first10: number[] = await FP.from(fibonacci())
  .take(10)
  .collect()
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

## Error Handling

### 1. Errors in `.map()` and `.filter()` callbacks

Callback errors are not thrown synchronously. Because `.map()` and `.filter()` return lazy async generators, an exception thrown inside a callback propagates when the pipeline is consumed — at the terminal method (`.collect()`, `.reduce()`, etc.). Attach `.catch()` to the terminal call.

```ts
import { FP } from 'functional-promises/iterable'

FP.of(1, 2, 3)
  .map(x => {
    if (x === 2) throw new Error('bad value')
    return x * 10
  })
  .collect()
  .then(result => console.log(result))
  .catch(err => console.error('Pipeline failed:', err.message))
  // Pipeline failed: bad value
```

The same applies to the standalone `map` and `filter` functions:

```ts
import { map, collect } from 'functional-promises/iterable'

try {
  await collect(map(x => {
    if (x === 0) throw new Error('divide by zero')
    return 100 / x
  }, [5, 0, 2]))
} catch (err) {
  console.error(err.message) // divide by zero
}
```

### 2. `retry(times, fn)` — retrying async operations

**Signature:**

```ts
function retry<T>(times: number, fn: () => T | Promise<T>): Promise<T>
```

`retry` calls `fn` up to `times` times. If a call succeeds the result is returned immediately. If every attempt throws, the error from the final attempt is re-thrown.

```ts
import { retry } from 'functional-promises/iterable'

// Try up to 3 times, no delay
const data = await retry(3, () => fetch('/api/data').then(r => r.json()))
```

For an exponential backoff pattern, manage the delay inside the callback:

```ts
import { retry } from 'functional-promises/iterable'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let attempt = 0
const result = await retry(5, async () => {
  if (attempt > 0) {
    await sleep(200 * 2 ** (attempt - 1)) // 200 ms, 400 ms, 800 ms …
  }
  attempt++
  return fetchUnstableResource()
})
```

On exhaustion `retry` re-throws the last error:

```ts
try {
  const result = await retry(3, unreliableFn)
} catch (err) {
  console.error('All 3 attempts failed:', err)
}
```

### 3. Error handling with `for await...of`

`FP` implements `AsyncIterable<T>`, so you can consume it with `for await...of` and a standard `try/catch`.

```ts
import { FP } from 'functional-promises/iterable'

try {
  for await (const value of FP.range(0, 10).map(fetchItem)) {
    process(value)
  }
} catch (err) {
  // Catches the first error thrown by any callback in the pipeline
  console.error('Stream error:', err)
}
```

The loop terminates on the first error. Items already yielded before the failure have been processed; remaining items are abandoned.

### 4. Partial failures in `parallelMap`

`parallelMap` runs up to `concurrency` tasks at a time and preserves output order. If any single task throws, the error is stored internally and re-thrown when that slot is consumed by the reader. This causes the **entire pipeline to reject** — subsequent items are never yielded.

```ts
import { FP } from 'functional-promises/iterable'

try {
  const results = await FP.of(1, 2, 3, 4, 5)
    .parallelMap(3, async x => processItem(x))
    .collect()
} catch (err) {
  console.error('One task failed, pipeline aborted:', err)
}
```

To continue processing remaining items despite individual failures, absorb errors inside the callback and return a sentinel value:

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: Error }

const results: Result<ProcessedItem>[] = await FP.of(1, 2, 3, 4, 5)
  .parallelMap(3, async (x): Promise<Result<ProcessedItem>> => {
    try {
      return { ok: true, value: await processItem(x) }
    } catch (err) {
      return { ok: false, error: err as Error }
    }
  })
  .collect()

const successes = results.filter(r => r.ok)
const failures  = results.filter(r => !r.ok)
```

### 5. `transform()` vs `parallelMap()` — error behavior

Both functions run async callbacks with bounded concurrency, but they differ in ordering and error delivery timing.

| | `transform(concurrency, fn)` | `parallelMap(concurrency, fn)` |
|---|---|---|
| **Output order** | Completion order (unordered) | Input order (preserved) |
| **Error delivery** | Delivered when the next item is read after the failing task resolves | Delivered when the failing slot reaches the front of the output queue |
| **Implication** | A slow-but-succeeding task can delay error visibility | An error in task 1 surfaces before task 2's result even if task 2 finished first |

In practice both abort the pipeline on the first uncaught error. The difference is *when* the consumer sees it:

```ts
import { transform, parallelMap, collect } from 'functional-promises/iterable'

// transform — yields results as they complete; error surfaces as soon as the
// failed task's slot is pulled from the generator
const out1 = await collect(transform(3, async x => {
  if (x === 3) throw new Error('fail')
  return x
}, [1, 2, 3, 4, 5])).catch(err => console.error('transform error:', err))

// parallelMap — yields results in input order; error in position 3 is held
// until positions 1 and 2 have been emitted
const out2 = await collect(parallelMap(3, async x => {
  if (x === 3) throw new Error('fail')
  return x
}, [1, 2, 3, 4, 5])).catch(err => console.error('parallelMap error:', err))
```

Choose `parallelMap` when deterministic output ordering matters (e.g. writing rows in sequence). Choose `transform` when throughput matters more than order and you want errors surfaced as quickly as possible. In both cases, wrap errors inside the callback if you need fault-tolerant partial processing.

## v2 API Reference (Legacy)

> The v2 Promise-chain API is stable and supported. For greenfield projects, the v3 iterable API (`/iterable`) is recommended.

### [API Outline](http://fpromises.io/)

* [Thenable Methods](http://www.fpromises.io/#thenable-methods)
    * [Arrays](http://www.fpromises.io/#array-methods)
        * [`.map(fn)`](http://www.fpromises.io/#fp-map)
        * [`.filter(fn)`](http://www.fpromises.io/#fp-filter)
        * [`.find(fn)`](http://www.fpromises.io/#fp-find)
        * [`.findIndex(fn)`](http://www.fpromises.io/#fp-findIndex)
        * [`.some(fn)`](http://www.fpromises.io/#fp-some)
        * [`.none(fn)`](http://www.fpromises.io/#fp-none)
        * [`.series(fn)`](http://www.fpromises.io/#fp-series)
    * [Errors](http://www.fpromises.io/#errors)
        * [`.catch(fn)`](http://www.fpromises.io/#fp-catch)
        * [`.catch(filter, fn)`](http://www.fpromises.io/#fp-catch)
    * [Conditional](http://www.fpromises.io/#conditional)
        * [`.thenIf(fn, ifTrue, ifFalse)`](http://www.fpromises.io/#fp-thenIf)
    * [Utilities](http://www.fpromises.io/#utilities)
        * [`.tap(fn)`](http://www.fpromises.io/#fp-tap)
        * [`.delay(msec)`](http://www.fpromises.io/#fp-delay)
    * [Properties](http://www.fpromises.io/#properties)
        * [`.get(keyName)`](http://www.fpromises.io/#fp-get)
        * [`.set(keyName, value)`](http://www.fpromises.io/#fp-set)
* [Specialty Methods](http://www.fpromises.io/#specialty-methods)
    * [Helpers](http://www.fpromises.io/#helpers)
        * [`FP.resolve()`](http://www.fpromises.io/#fp-resolve)
        * [`FP.all(Object/Array)`](http://www.fpromises.io/#fp-all)
        * [`FP.unpack()`](http://www.fpromises.io/#fp-unpack)
    * [Events](http://www.fpromises.io/#events)
        * [`.listen(obj, ...eventNames)`](http://www.fpromises.io/#fp-listen)
    * [Composition Pipelines](http://www.fpromises.io/#composition-pipelines)
        * [`FP.chain(options)`](http://www.fpromises.io/#fp-chain)
        * [`.chainEnd()`](http://www.fpromises.io/#fp-chainend)
    * [Modifiers](http://www.fpromises.io/#modifiers)
        * [`.quiet()` - prevents errors from stopping array methods mid-loop](http://www.fpromises.io/#fp-quiet)
        * [`.concurrency(threadLimit)` - limits parallel workers for array methods](http://www.fpromises.io/#fp-concurrency)

### v2 Quick Examples

**Using `.map()`**

```js
FP.resolve([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .map(x => x * 2)
  .then(results => {
    // results === [4, 8, 12, 16, 20]
  })
```

**Handling Events**

Create function chains to handle the case where promises don't fit very naturally.

For example, streams and event handlers must (usually) support multiple calls over time.

Here's how `FP.chain()` and `FP.chainEnd()`/`FP.listen(obj, event)` help:

```js
const button = document.getElementById('submitBtn')
FP.chain() // start a reusable chain
  .then(({target}) => {
    target.textContent = 'Clicked!'
  })
  .listen(button, 'click') // attach to DOM event
```

## Development

```sh
git clone git@github.com:functional-promises/functional-promises.git
cd functional-promises
pnpm install
pnpm test
```

## Acknowledgments

> Thanks to several influential projects: [RxJS](https://github.com/ReactiveX/RxJS), [IxJS](https://github.com/ReactiveX/IxJS), [Bluebird](https://github.com/petkaantonov/bluebird), [asynquence](https://github.com/getify/asynquence), [FantasyLand](https://github.com/fantasyland/fantasy-land), [Gulp](https://github.com/gulpjs/gulp), [HighlandJS](https://github.com/caolan/highland), et al.
>
> Special thanks to [Kyle Simpson](https://github.com/getify), [Eric Elliot](https://medium.com/@_ericelliott), and [Sarah Drasner](https://sarahdrasnerdesign.com/) for their work for the OSS community, as well as their advice and encouragement.
