// streaming-iterables - all methods in a single file

// --- Types ---

/**
 * Any iterable or iterator.
 */
export type Iterableish<T> = Iterable<T> | Iterator<T> | AsyncIterable<T> | AsyncIterator<T>
/**
 * Literally any `Iterable` (async or regular).
 */
export type AnyIterable<T> = Iterable<T> | AsyncIterable<T>
/**
 * A value, an array of that value, undefined, null or promises for any of them. Used in the `flatMap` and `flatTransform` functions as possible return values of the mapping function.
 */
export type FlatMapValue<B> = B | AnyIterable<B> | undefined | null | Promise<B | AnyIterable<B> | undefined | null>
export type UnArrayAnyIterable<A extends AnyIterable<unknown>[]> = A extends AnyIterable<infer T>[] ? T : never
export type ErrorCallback = null | ((err: unknown) => void)
export type NotifyCallback = null | (() => void)
export type UnwrapAnyIterable<M extends AnyIterable<unknown>> = M extends Iterable<infer T>
  ? Iterable<T>
  : M extends AsyncIterable<infer B>
    ? AsyncIterable<B>
    : never

export type UnwrapAnyIterableArray<M extends AnyIterable<unknown>> = M extends Iterable<infer T>
  ? Generator<T[]>
  : M extends AsyncIterable<infer B>
    ? AsyncGenerator<B[]>
    : never

export interface ReadableStreamish {
  once(event: string, handler: () => void): void
  read(): unknown
  _readableState?: { ended: boolean }
  [Symbol.asyncIterator]?: () => AsyncIterator<unknown>
}

export interface WritableStreamish {
  once(event: string, handler: (...args: unknown[]) => void): void
  write(chunk: unknown): boolean
  removeListener(event: string, handler: (...args: unknown[]) => void): void
}

export interface TimeConfig {
  progress?: (delta: [number, number], total: [number, number]) => void
  total?: (time: [number, number]) => void
}

export interface IDeferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
}

// --- Internal helpers ---

function defer<T>(): IDeferred<T> {
  let reject!: (error: Error) => void
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolveFunc, rejectFunc) => {
    resolve = resolveFunc
    reject = rejectFunc
  })
  return { promise, reject, resolve }
}

function isAsyncIterable<T>(iterable: AnyIterable<T>): iterable is AsyncIterable<T> {
  return iterable != null && Symbol.asyncIterator in (iterable as object)
}

/**
 * Get the iterator from any iterable or just return an iterator itself.
 */
export function getIterator<T>(iterable: Iterable<T> | Iterator<T>): Iterator<T>
export function getIterator<T>(iterable: AsyncIterable<T> | AsyncIterator<T>): AsyncIterator<T>
export function getIterator<T>(iterable: AnyIterable<T>): AsyncIterator<T> | Iterator<T>
export function getIterator<T>(iterable: Iterableish<T>): AsyncIterator<T> | Iterator<T> {
  if (typeof (iterable as Iterator<T>).next === 'function') {
    return iterable as Iterator<T> | AsyncIterator<T>
  }

  if (typeof (iterable as Iterable<T>)[Symbol.iterator] === 'function') {
    return (iterable as Iterable<T>)[Symbol.iterator]()
  }

  if (typeof (iterable as AsyncIterable<T>)[Symbol.asyncIterator] === 'function') {
    return (iterable as AsyncIterable<T>)[Symbol.asyncIterator]()
  }

  throw new TypeError('"values" does not to conform to any of the iterator or iterable protocols')
}

// --- batch ---

async function* _batch<T>(size: number, iterable: AsyncIterable<T>) {
  let dataBatch: T[] = []
  for await (const data of iterable) {
    dataBatch.push(data)
    if (dataBatch.length === size) {
      yield dataBatch
      dataBatch = []
    }
  }
  if (dataBatch.length > 0) {
    yield dataBatch
  }
}

function* _syncBatch<T>(size: number, iterable: Iterable<T>) {
  let dataBatch: T[] = []
  for (const data of iterable) {
    dataBatch.push(data)
    if (dataBatch.length === size) {
      yield dataBatch
      dataBatch = []
    }
  }
  if (dataBatch.length > 0) {
    yield dataBatch
  }
}

/**
 * Batch objects from `iterable` into arrays of `size` length. The final array may be shorter than size if there is not enough items. Returns a sync iterator if the `iterable` is sync, otherwise an async iterator. Errors from the source `iterable` are immediately raised.

`size` can be between 1 and `Infinity`.

```ts
import { batch } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

// batch 10 pokemon while we process them
for await (const pokemons of batch(10, getPokemon())) {
  console.log(pokemons) // 10 pokemon at a time!
}
```
 */
export function batch(size: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterableArray<M>
export function batch<T, M extends AnyIterable<T>>(size: number, iterable: M): UnwrapAnyIterableArray<M>
export function batch<T>(size: number, iterable?: AnyIterable<T>): UnwrapAnyIterableArray<AnyIterable<T>> | (<U, M extends AnyIterable<U>>(curriedIterable: M) => UnwrapAnyIterableArray<M>) {
  if (size < 1) {
    throw new RangeError('batch size must be at least 1')
  }
  if (iterable === undefined) {
    return <U, M extends AnyIterable<U>>(curriedIterable: M) => batch(size, curriedIterable)
  }
  if (isAsyncIterable(iterable)) {
    return _batch(size, iterable)
  }
  return _syncBatch(size, iterable as Iterable<T>)
}

// --- batchWithTimeout ---

const TIMEOUT = Symbol('TIMEOUT')

const createTimer = (duration: number): [Promise<typeof TIMEOUT>, () => void] => {
  let timeoutId: ReturnType<typeof setTimeout>
  return [
    new Promise(resolve => {
      timeoutId = setTimeout(() => resolve(TIMEOUT), duration)
    }),
    () => clearTimeout(timeoutId),
  ]
}

async function* _batchWithTimeout<T>(size: number, timeout: number, iterable: AsyncIterable<T>) {
  const iterator = iterable[Symbol.asyncIterator]()
  let pendingData: Promise<IteratorResult<T, unknown>> | undefined
  let batchData: T[] = []
  let timer: Promise<typeof TIMEOUT> | undefined
  let clearTimer: (() => void) | undefined
  const startTimer = () => {
    deleteTimer()
    ;[timer, clearTimer] = createTimer(timeout)
  }
  const deleteTimer = () => {
    if (clearTimer) clearTimer()
    timer = undefined
  }
  pendingData = iterator.next()

  while (true) {
    const res = await (timer ? Promise.race([pendingData, timer]) : pendingData)
    if (res === TIMEOUT || (res as IteratorResult<T>).done) {
      if (batchData.length) {
        yield batchData
        batchData = []
      }
      deleteTimer()
      if (res !== TIMEOUT) break
      continue
    }
    pendingData = iterator.next()
    batchData.push((res as IteratorYieldResult<T>).value)
    if (batchData.length === 1) startTimer()
    if (batchData.length === size) {
      yield batchData
      batchData = []
      deleteTimer()
      continue
    }
  }
}

/**
 * Like `batch` but flushes early if the `timeout` is reached. The batches may be shorter than size if there are not enough items. Returns a sync iterator if the `iterable` is sync, otherwise an async iterator. Errors from the source `iterable` are immediately raised.

`size` can be between 1 and `Infinity`.
`timeout` can be between 0 and `Infinity`.

```ts
import { batchWithTimeout } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

// batch 10 pokemon while we process them
for await (const pokemons of batchWithTimeout(10, 100, getPokemon())) {
  console.log(pokemons) // Up to 10 pokemon at a time!
}
```
 */
export function batchWithTimeout(size: number, timeout: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterableArray<M>
export function batchWithTimeout<T, M extends AnyIterable<T>>(size: number, timeout: number, iterable: M): UnwrapAnyIterableArray<M>
export function batchWithTimeout<T>(size: number, timeout: number, iterable?: AnyIterable<T>): UnwrapAnyIterableArray<AnyIterable<T>> | (<U, M extends AnyIterable<U>>(curriedIterable: M) => UnwrapAnyIterableArray<M>) {
  if (iterable === undefined) {
    return <U, M extends AnyIterable<U>>(curriedIterable: M) => batchWithTimeout(size, timeout, curriedIterable)
  }
  if (isAsyncIterable(iterable) && timeout !== Infinity) {
    return _batchWithTimeout(size, timeout, iterable)
  }
  return batch(size, iterable as Iterable<T>)
}

// --- buffer ---

interface IValueObj<T> {
  error?: Error
  value?: T
}

function _buffer<T>(size: number, iterable: AsyncIterable<T>): AsyncIterableIterator<T> {
  const iterator = getIterator(iterable)
  const resultQueue: IValueObj<T>[] = []
  const readQueue: IDeferred<IteratorResult<T>>[] = []
  let reading = false
  let ended = false

  function fulfillReadQueue() {
    while (readQueue.length > 0 && resultQueue.length > 0) {
      const readDeferred = readQueue.shift()!
      const { error, value } = resultQueue.shift()!
      if (error) readDeferred.reject(error)
      else readDeferred.resolve({ done: false, value } as IteratorResult<T>)
    }
    while (readQueue.length > 0 && ended) {
      readQueue.shift()!.resolve({ done: true, value: undefined } as IteratorResult<T>)
    }
  }

  async function fillQueue() {
    if (ended || reading || resultQueue.length >= size) return
    reading = true
    try {
      const { done, value } = await iterator.next()
      if (done) ended = true
      else resultQueue.push({ value })
    } catch (error) {
      ended = true
      resultQueue.push({ error: error as Error })
    }
    fulfillReadQueue()
    reading = false
    fillQueue()
  }

  async function next(): Promise<IteratorResult<T>> {
    if (resultQueue.length > 0) {
      const { error, value } = resultQueue.shift()!
      if (error) throw error
      fillQueue()
      return { done: false, value } as IteratorResult<T>
    }
    if (ended) return { done: true, value: undefined } as IteratorResult<T>
    const deferred = defer<IteratorResult<T>>()
    readQueue.push(deferred)
    fillQueue()
    return deferred.promise
  }

  async function returnIterator(): Promise<IteratorResult<T>> {
    ended = true
    resultQueue.length = 0
    while (readQueue.length > 0) {
      readQueue.shift()!.resolve({ done: true, value: undefined } as IteratorResult<T>)
    }
    await iterator.return?.()
    return { done: true, value: undefined } as IteratorResult<T>
  }

  const asyncIterableIterator: AsyncIterableIterator<T> = {
    next,
    return: returnIterator,
    [Symbol.asyncIterator]: () => asyncIterableIterator,
  }
  return asyncIterableIterator
}

function* syncBuffer<T>(size: number, iterable: Iterable<T>): IterableIterator<T> {
  const valueQueue: T[] = []
  let e: Error | undefined
  try {
    for (const value of iterable) {
      valueQueue.push(value)
      if (valueQueue.length <= size) continue
      yield valueQueue.shift() as T
    }
  } catch (error) {
    e = error as Error
  }
  for (const value of valueQueue) yield value
  if (e) throw e
}

/**
 * Buffer keeps a number of objects in reserve available for immediate reading. This is helpful with async iterators as it will pre-fetch results so you don't have to wait for them to load. For sync iterables it will pre-compute up to `size` values and keep them in reserve. The internal buffer will start to be filled once `.next()` is called for the first time and will continue to fill until the source `iterable` is exhausted or the buffer is full. Errors from the source `iterable` will be raised after all buffered values are yielded.

`size` can be between 0 and `Infinity`.

```ts
import { buffer } from 'streaming-iterables'
import { getPokemon, trainMonster } from 'iterable-pokedex'

// load 10 monsters in the background while we process them one by one
for await (const monster of buffer(10, getPokemon())) {
  await trainMonster(monster) // got to do some pokéwork
}
```
 */
export function buffer(size: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>
export function buffer<T, M extends AnyIterable<T>>(size: number, iterable: M): UnwrapAnyIterable<M>
export function buffer<T>(size: number, iterable?: AnyIterable<T>): UnwrapAnyIterable<AnyIterable<T>> | AnyIterable<T> | (<U, M extends AnyIterable<U>>(curriedIterable: M) => UnwrapAnyIterable<M>) {
  if (iterable === undefined) {
    return <U, M extends AnyIterable<U>>(curriedIterable: M) => buffer(size, curriedIterable)
  }
  if (size === 0) return iterable
  if (isAsyncIterable(iterable)) return _buffer(size, iterable)
  return syncBuffer(size, iterable as Iterable<T>)
}

// --- collect ---

async function _collect<T>(iterable: AsyncIterable<T>) {
  const values: T[] = []
  for await (const value of iterable) values.push(value)
  return values
}

/**
 * Collect all the values from an iterable into an array. Returns an array if you pass it an iterable and a promise for an array if you pass it an async iterable. Errors from the source `iterable` are raised immediately.

```ts
import { collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

console.log(await collect(getPokemon()))
// [bulbasaur, ivysaur, venusaur, charmander, ...]
```
 */
export function collect<T>(iterable: Iterable<T>): T[]
export function collect<T>(iterable: AsyncIterable<T>): Promise<T[]>
export function collect<T>(iterable: AnyIterable<T>): T[] | Promise<T[]> {
  if (isAsyncIterable(iterable)) return _collect(iterable)
  return Array.from(iterable as Iterable<T>)
}

// --- concat ---

async function* _concat<I extends AnyIterable<unknown>[]>(iterables: I): AsyncIterable<UnArrayAnyIterable<I>> {
  for await (const iterable of iterables) yield* iterable as AsyncIterable<UnArrayAnyIterable<I>>
}

function* _syncConcat<I extends Iterable<unknown>[]>(iterables: I): Iterable<UnArrayAnyIterable<I>> {
  for (const iterable of iterables) yield* iterable as Iterable<UnArrayAnyIterable<I>>
}

/**
 * Combine multiple iterators into a single iterable. Reads each iterable completely one at a time. Returns a sync iterator if all `iterables` are sync, otherwise it returns an async iterable. Errors from the source `iterable` are raised immediately.

```ts
import { concat } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'
import { getTransformers } from './util'

for await (const hero of concat(getPokemon(2), getTransformers(2))) {
  console.log(hero)
}
// charmander
// bulbasaur <- end of pokemon
// megatron
// bumblebee <- end of transformers
```
 */
export function concat<I extends Iterable<unknown>[]>(...iterables: I): Iterable<UnArrayAnyIterable<I>>
export function concat<I extends AnyIterable<unknown>[]>(...iterables: I): AsyncIterable<UnArrayAnyIterable<I>>
export function concat(...iterables: AnyIterable<unknown>[]): AnyIterable<unknown> {
  const hasAnyAsync = iterables.find(itr => isAsyncIterable(itr))
  if (hasAnyAsync) return _concat(iterables)
  return _syncConcat(iterables as Iterable<unknown>[])
}

// --- consume ---

async function _consume<T>(iterable: AnyIterable<T>) {
  for await (const _val of iterable) {
    // do nothing
  }
}

/**
 * A promise that resolves after the function drains the iterable of all data. Useful for processing a pipeline of data. Errors from the source `iterable` are raised immediately.

```ts
import { consume, map } from 'streaming-iterables'
import { getPokemon, trainMonster } from 'iterable-pokedex'

const train = map(trainMonster)
await consume(train(getPokemon())) // load all the pokemon and train them!
```
 */
export function consume<T>(iterable: Iterable<T>): void
export function consume<T>(iterable: AsyncIterable<T>): Promise<void>
export function consume<T>(iterable: AnyIterable<T>): void | Promise<void> {
  if (isAsyncIterable(iterable)) return _consume(iterable)
  for (const _val of iterable as Iterable<T>) {
    // do nothing
  }
}

// --- drop ---

async function* _drop<T>(count: number, iterable: AsyncIterable<T>) {
  let skipped = 0
  for await (const val of iterable) {
    if (skipped < count) { skipped++; continue }
    yield val
  }
}

function* _syncDrop<T>(count: number, iterable: Iterable<T>) {
  let skipped = 0
  for (const val of iterable) {
    if (skipped < count) { skipped++; continue }
    yield val
  }
}

/**
 * Returns a new iterator that skips a specific number of items from `iterable`. When used with generators it advances the generator `count` items, when used with arrays it gets a new iterator and skips `count` items.

```ts
import { pipeline, drop, collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

const allButFirstFive = await collect(drop(5, getPokemon()))
// first five pokemon
```
 */
export function drop(count: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>
export function drop<T, M extends AnyIterable<T>>(count: number, iterable: M): UnwrapAnyIterable<M>
export function drop<T>(count: number, iterable?: AnyIterable<T>): UnwrapAnyIterable<AnyIterable<T>> | (<U, M extends AnyIterable<U>>(curriedIterable: M) => UnwrapAnyIterable<M>) {
  if (iterable === undefined) {
    return <U, M extends AnyIterable<U>>(curriedIterable: M) => drop(count, curriedIterable)
  }
  if (isAsyncIterable(iterable)) return _drop(count, iterable)
  return _syncDrop(count, iterable as Iterable<T>)
}

// --- filter ---

async function* _filter<T>(filterFunc: (data: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>) {
  for await (const data of iterable) {
    if (await filterFunc(data)) yield data
  }
}

/**
 * Takes a `filterFunc` and a `iterable`, and returns a new async iterator of the same type containing the members of the given iterable which cause the `filterFunc` to return true.

```ts
import { filter } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

const filterWater = filter(pokemon => pokemon.types.include('Water'))

for await (const pokemon of filterWater(getPokemon())) {
  console.log(pokemon)
}
// squirtle
// vaporeon
// magikarp
```
 */
export function filter<T, S extends T>(filterFunc: (data: T) => data is S): (curriedIterable: AnyIterable<T>) => AsyncGenerator<S>
export function filter<T>(filterFunc: (data: T) => boolean | Promise<boolean>): (curriedIterable: AnyIterable<T>) => AsyncGenerator<T>
export function filter<T, S extends T>(filterFunc: (data: T) => data is S, iterable: AnyIterable<T>): AsyncGenerator<S>
export function filter<T>(filterFunc: (data: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>): AsyncGenerator<T>
export function filter<T>(filterFunc: (data: T) => boolean | Promise<boolean>, iterable?: AnyIterable<T>) {
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => _filter(filterFunc, curriedIterable)
  }
  return _filter(filterFunc, iterable)
}

// --- flatten ---

/**
 * Returns a new iterator by pulling every item out of `iterable` (and all its sub iterables) and yielding them depth-first. Checks for the iterable interfaces and iterates it if it exists. If the value is a string it is not iterated as that ends up in an infinite loop. Errors from the source `iterable` are raised immediately.

*note*: Typescript doesn't have recursive types but you can nest iterables as deep as you like.

```ts
import { flatten } from 'streaming-iterables'

for await (const item of flatten([1, 2, [3, [4, 5], 6])) {
  console.log(item)
}
// 1
// 2
// 3
// 4
// 5
// 6
```
 */
export async function* flatten<B>(iterable: AnyIterable<B | AnyIterable<B>>): AsyncIterableIterator<B> {
  for await (const maybeItr of iterable) {
    if (maybeItr && typeof maybeItr !== 'string' && (typeof maybeItr === 'object' || typeof maybeItr === 'function') && (Symbol.iterator in (maybeItr as object) || Symbol.asyncIterator in (maybeItr as object))) {
      yield* flatten(maybeItr as AnyIterable<B>)
    } else {
      yield maybeItr as B
    }
  }
}

// --- map ---

async function* _map<T, B>(func: (data: T) => B | Promise<B>, iterable: AnyIterable<T>) {
  for await (const val of iterable) yield await func(val)
}

/**
 * Map a function or async function over all the values of an iterable. Errors from the source `iterable` and `func` are raised immediately.

```ts
import { consume, map } from 'streaming-iterables'
import got from 'got'

const urls = ['https://http.cat/200', 'https://http.cat/201', 'https://http.cat/202']
const download = map(got)

// download one at a time
for await (page of download(urls)) {
  console.log(page)
}
```
 */
export function map<T, B>(func: (data: T) => B | Promise<B>): (iterable: AnyIterable<T>) => AsyncGenerator<B>
export function map<T, B>(func: (data: T) => B | Promise<B>, iterable: AnyIterable<T>): AsyncGenerator<B>
export function map<T, B>(func: (data: T) => B | Promise<B>, iterable?: AnyIterable<T>) {
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => _map(func, curriedIterable)
  }
  return _map(func, iterable)
}

// --- flatMap ---

/**
 * Map `func` over the `iterable`, flatten the result and then ignore all null or undefined values. It's the transform function we've always needed. It's equivalent to;

```ts
(func, iterable) => filter(i => i !== undefined && i !== null, flatten(map(func, iterable)))
```

*note*: The return value for `func` is `FlatMapValue<B>`. Typescript doesn't have recursive types but you can nest iterables as deep as you like.

The ordering of the results is guaranteed. Errors from the source `iterable` are raised after all mapped values are yielded. Errors from `func` are raised after all previously mapped values are yielded.

```ts
import { flatMap } from 'streaming-iterables'
import { getPokemon, lookupStats } from 'iterable-pokedex'

async function getDefeatedGyms(pokemon) {
  if (pokemon.gymBattlesWon > 0) {
    const stats = await lookupStats(pokemon)
    return stats.gyms
  }
}

for await (const gym of flatMap(getDefeatedGyms, getPokemon())) {
  console.log(gym.name)
}
// "Pewter Gym"
// "Cerulean Gym"
// "Vermilion Gym"
```
 */
export function flatMap<T, B>(func: (data: T) => FlatMapValue<B>): (iterable: AnyIterable<T>) => AsyncGenerator<NonNullable<B>>
export function flatMap<T, B>(func: (data: T) => FlatMapValue<B>, iterable: AnyIterable<T>): AsyncGenerator<NonNullable<B>>
export function flatMap<T, B>(func: (data: T) => FlatMapValue<B>, iterable?: AnyIterable<T>): AsyncGenerator<NonNullable<B>> | ((iterable: AnyIterable<T>) => AsyncGenerator<NonNullable<B>>) {
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => flatMap(func, curriedIterable) as AsyncGenerator<NonNullable<B>>
  }
  const mapped = flatten(map<T, B | AnyIterable<B> | undefined | null>(func, iterable))
  return filter(
    (i: unknown): boolean => i !== undefined && i !== null,
    mapped as unknown as AnyIterable<NonNullable<B>>
  ) as AsyncGenerator<NonNullable<B>>
}

// --- transform ---

function _transform<T, R>(
  concurrency: number,
  func: (data: T) => R | Promise<R>,
  iterable: AnyIterable<T>
): AsyncIterableIterator<R> {
  const iterator = getIterator(iterable)
  const resultQueue: R[] = []
  const readQueue: IDeferred<IteratorResult<R>>[] = []
  let ended = false
  let reading = false
  let inflightCount = 0
  let lastError: Error | null = null

  function fulfillReadQueue() {
    while (readQueue.length > 0 && resultQueue.length > 0) {
      const { resolve } = readQueue.shift()!
      resolve({ done: false, value: resultQueue.shift()! } as IteratorResult<R>)
    }
    while (readQueue.length > 0 && inflightCount === 0 && ended) {
      const { resolve, reject } = readQueue.shift()!
      if (lastError) { reject(lastError); lastError = null }
      else resolve({ done: true, value: undefined } as IteratorResult<R>)
    }
  }

  async function fillQueue() {
    if (ended) { fulfillReadQueue(); return }
    if (reading || inflightCount + resultQueue.length >= concurrency) return
    reading = true
    inflightCount++
    try {
      const { done, value } = await iterator.next()
      if (done) { ended = true; inflightCount--; fulfillReadQueue() }
      else mapAndQueue(value)
    } catch (error) {
      ended = true; inflightCount--; lastError = error as Error; fulfillReadQueue()
    }
    reading = false
    fillQueue()
  }

  async function mapAndQueue(itrValue: T) {
    try {
      resultQueue.push(await func(itrValue))
    } catch (error) {
      ended = true; lastError = error as Error
    }
    inflightCount--
    fulfillReadQueue()
    fillQueue()
  }

  async function next(): Promise<IteratorResult<R>> {
    if (resultQueue.length === 0) {
      const deferred = defer<IteratorResult<R>>()
      readQueue.push(deferred)
      fillQueue()
      return deferred.promise
    }
    const value = resultQueue.shift()!
    fillQueue()
    return { done: false, value }
  }

  async function returnIterator(): Promise<IteratorResult<R>> {
    ended = true
    resultQueue.length = 0
    while (readQueue.length > 0) {
      readQueue.shift()!.resolve({ done: true, value: undefined } as IteratorResult<R>)
    }
    await iterator.return?.()
    return { done: true, value: undefined } as IteratorResult<R>
  }

  const asyncIterableIterator: AsyncIterableIterator<R> = { next, return: returnIterator, [Symbol.asyncIterator]: () => asyncIterableIterator }
  return asyncIterableIterator
}

/**
 * Map a function or async function over all the values of an iterable. Order is determined by when `func` resolves. And it will run up to `concurrency` async `func` operations at once. If you care about order see [`parallelMap()`](#parallelmap). Errors from the source `iterable` are raised after all transformed values are yielded. Errors from `func` are raised after all previously transformed values are yielded.

`concurrency` can be between 1 and `Infinity`.

```ts
import { consume, transform } from 'streaming-iterables'
import got from 'got'

const urls = ['https://http.cat/200', 'https://http.cat/201', 'https://http.cat/202']
const download = transform(1000, got)

// download all of these at the same time
for await (page of download(urls)) {
  console.log(page)
}
```
 */
export function transform(concurrency: number): {
  <T, R>(func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>
  <T, R>(func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncIterableIterator<R>
}
export function transform<T, R>(concurrency: number, func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncIterableIterator<R>
export function transform<T, R>(concurrency: number, func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>
export function transform<T, R>(concurrency: number, func?: (data: T) => R | Promise<R>, iterable?: AnyIterable<T>) {
  if (func === undefined) {
    return <A, B>(curriedFunc: (data: A) => B | Promise<B>, curriedIterable?: AnyIterable<A>) =>
      curriedIterable
        ? transform<A, B>(concurrency, curriedFunc, curriedIterable)
        : transform<A, B>(concurrency, curriedFunc)
  }
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => transform<T, R>(concurrency, func, curriedIterable)
  }
  return _transform(concurrency, func, iterable)
}

// --- flatTransform ---

function _flatTransform<T, R>(
  concurrency: number,
  func: (data: T) => R | Promise<R>,
  iterable: AnyIterable<T>
): AsyncIterableIterator<R> {
  const iterator = getIterator(iterable)
  const resultQueue: R[] = []
  const readQueue: IDeferred<IteratorResult<R>>[] = []
  let ended = false
  let reading = false
  let inflightCount = 0
  let lastError: Error | null = null

  function fulfillReadQueue() {
    while (readQueue.length > 0 && resultQueue.length > 0) {
      const { resolve } = readQueue.shift()!
      resolve({ done: false, value: resultQueue.shift()! } as IteratorResult<R>)
    }
    while (readQueue.length > 0 && inflightCount === 0 && ended) {
      const { resolve, reject } = readQueue.shift()!
      if (lastError) { reject(lastError); lastError = null }
      else resolve({ done: true, value: undefined } as IteratorResult<R>)
    }
  }

  async function fillQueue() {
    if (ended) { fulfillReadQueue(); return }
    if (reading || inflightCount + resultQueue.length >= concurrency) return
    reading = true
    inflightCount++
    try {
      const { done, value } = await iterator.next()
      if (done) { ended = true; inflightCount--; fulfillReadQueue() }
      else mapAndQueue(value)
    } catch (error) {
      ended = true; inflightCount--; lastError = error as Error; fulfillReadQueue()
    }
    reading = false
    fillQueue()
  }

  async function mapAndQueue(itrValue: T) {
    try {
      const value = await func(itrValue)
      if (value && Symbol.asyncIterator in (value as object)) {
        for await (const asyncVal of value as unknown as AsyncIterable<R>) resultQueue.push(asyncVal)
      } else {
        resultQueue.push(value)
      }
    } catch (error) {
      ended = true; lastError = error as Error
    }
    inflightCount--
    fulfillReadQueue()
    fillQueue()
  }

  async function next(): Promise<IteratorResult<R>> {
    if (resultQueue.length === 0) {
      const deferred = defer<IteratorResult<R>>()
      readQueue.push(deferred)
      fillQueue()
      return deferred.promise
    }
    const value = resultQueue.shift()!
    fillQueue()
    return { done: false, value }
  }

  async function returnIterator(): Promise<IteratorResult<R>> {
    ended = true
    resultQueue.length = 0
    while (readQueue.length > 0) {
      readQueue.shift()!.resolve({ done: true, value: undefined } as IteratorResult<R>)
    }
    await iterator.return?.()
    return { done: true, value: undefined } as IteratorResult<R>
  }

  const asyncIterableIterator: AsyncIterableIterator<R> = { next, return: returnIterator, [Symbol.asyncIterator]: () => asyncIterableIterator }
  return asyncIterableIterator
}

/**
 * Map `func` over the `iterable`, flatten the result and then ignore all null or undefined values. Returned async iterables are flattened concurrently too. It's the transform function we've always wanted.

It's similar to;

```ts
const filterEmpty = filter(i => i !== undefined && i !== null)
(concurrency, func, iterable) => filterEmpty(flatten(transform(concurrency, func, iterable)))
```

*note*: The return value for `func` is `FlatMapValue<B>`. Typescript doesn't have recursive types but you can nest iterables as deep as you like. However only directly returned async iterables are processed concurrently. (Eg, if you use an async generator function as `func` it's output will be processed concurrently, but if it's nested inside other iterables it will be processed sequentially.)

Order is determined by when async operations resolve. And it will run up to `concurrency` async operations at once. This includes promises and async iterables returned from `func`. Errors from the source `iterable` are raised after all transformed values are yielded. Errors from `func` are raised after all previously transformed values are yielded.

`concurrency` can be between 1 and `Infinity`.

Promise Example;

```ts
import { flatTransform } from 'streaming-iterables'
import { getPokemon, lookupStats } from 'iterable-pokedex'

async function getDefeatedGyms(pokemon) {
  if (pokemon.gymBattlesWon > 0) {
    const stats = await lookupStats(pokemon)
    return stats.gyms
  }
}

// lookup 10 stats at a time
for await (const gym of flatTransform(10, getDefeatedGyms, getPokemon())) {
  console.log(gym.name)
}
// "Pewter Gym"
// "Cerulean Gym"
// "Vermilion Gym"
```

Async Generator Example

```ts
import { flatTransform } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'
import { findFriendsFB, findFriendsMySpace } from './util'


async function* findFriends (pokemon) {
  yield await findFriendsFB(pokemon.name)
  yield await findFriendsMySpace(pokemon.name)
}

for await (const pokemon of flatTransform(10, findFriends, getPokemon())) {
  console.log(pokemon.name)
}
// Pikachu
// Meowth
// Ash - FB
// Jessie - FB
// Misty - MySpace
// James - MySpace
```
 */
export function flatTransform(concurrency: number): {
  <T, R>(func: (data: T) => FlatMapValue<R>, iterable: AnyIterable<T>): AsyncGenerator<R>
  <T, R>(func: (data: T) => FlatMapValue<R>): (iterable: AnyIterable<T>) => AsyncGenerator<R>
}
export function flatTransform<T, R>(concurrency: number, func: (data: T) => FlatMapValue<R>): (iterable: AnyIterable<T>) => AsyncGenerator<R>
export function flatTransform<T, R>(concurrency: number, func: (data: T) => FlatMapValue<R>, iterable: AnyIterable<T>): AsyncGenerator<R>
export function flatTransform<T, R>(concurrency: number, func?: (data: T) => FlatMapValue<R>, iterable?: AnyIterable<T>) {
  if (func === undefined) {
    return <A, B>(curriedFunc: (data: A) => FlatMapValue<B>, curriedIterable?: AnyIterable<A>) =>
      curriedIterable
        ? flatTransform<A, B>(concurrency, curriedFunc, curriedIterable)
        : flatTransform<A, B>(concurrency, curriedFunc)
  }
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => flatTransform<T, R>(concurrency, func, curriedIterable)
  }
  return filter(
    (i: unknown): boolean => i !== undefined && i !== null,
    flatten(_flatTransform(concurrency, func as (data: T) => unknown, iterable) as unknown as AnyIterable<unknown>) as unknown as AnyIterable<R>
  ) as unknown as AsyncGenerator<R>
}

// --- merge ---

type AnyIterator<T> = Iterator<T> | AsyncIterator<T>

/**
 * Combine multiple iterators into a single iterable. Reads one item off each iterable in order repeatedly until they are all exhausted. If you care less about order and want them faster see `parallelMerge()`.
 */
export async function* merge<I extends AnyIterable<unknown>[]>(...iterables: I): AsyncGenerator<UnArrayAnyIterable<I>> {
  const sources = new Set(iterables.map(i => getIterator(i) as AnyIterator<UnArrayAnyIterable<I>>))
  try {
    while (sources.size > 0) {
      for (const iterator of Array.from(sources)) {
        const nextVal = await iterator.next()
        if (nextVal.done) {
          sources.delete(iterator)
        } else {
          yield nextVal.value
        }
      }
    }
  } finally {
    for (const iterator of sources) {
      await iterator.return?.()
    }
  }
}

// --- parallelMerge ---

/**
 *Combine multiple iterators into a single iterable. Reads one item off of every iterable and yields them as they resolve. This is useful for pulling items out of a collection of iterables as soon as they're available. Errors `iterables` are raised immediately.

```ts
import { parallelMerge } from 'streaming-iterables'
import { getPokemon, getTransformer } from 'iterable-pokedex'

// pokemon are much faster to load btw
const heros = parallelMerge(getPokemon(), getTransformer())
for await (const hero of heros) {
  console.log(hero)
}
// charmander
// bulbasaur
// megatron
// pikachu
// eevee
// bumblebee
// jazz
```
 */
export async function* parallelMerge<I extends AnyIterable<unknown>[]>(...iterables: I): AsyncGenerator<UnArrayAnyIterable<I>> {
  type T = UnArrayAnyIterable<I>
  type Itr = AnyIterator<T>
  const inputs: Itr[] = iterables.map(i => getIterator(i) as Itr)
  const activeInputs = new Set<Itr>(inputs)
  const concurrentWork = new Set<Promise<void>>()
  const values = new Map<Itr, T>()
  let lastError: Error | null = null
  let errCb: ErrorCallback = null
  let valueCb: NotifyCallback = null

  const notifyError = (err: unknown) => { lastError = err as Error; if (errCb) errCb(err) }
  const notifyDone = () => { if (valueCb) valueCb() }
  const waitForQueue = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (lastError) reject(lastError)
      if (values.size > 0) return resolve()
      valueCb = resolve
      errCb = reject
    })

  const queueNext = (input: Itr) => {
    const nextVal = Promise.resolve(input.next()).then(async ({ done, value }: IteratorResult<T>) => {
      if (!done) values.set(input, value)
      else activeInputs.delete(input)
      concurrentWork.delete(nextVal)
    })
    concurrentWork.add(nextVal)
    nextVal.then(notifyDone, notifyError)
  }

  for (const input of inputs) queueNext(input)

  try {
    while (true) {
      if (concurrentWork.size === 0 && values.size === 0) return
      await waitForQueue()
      for (const [input, value] of Array.from(values)) {
        values.delete(input)
        yield value
        queueNext(input)
      }
    }
  } finally {
    for (const input of activeInputs) {
      await input.return?.()
    }
  }
}

// --- parallelMap ---

async function* _parallelMap<T, R>(
  concurrency: number,
  func: (data: T) => R | Promise<R>,
  iterable: AnyIterable<T>
): AsyncIterableIterator<R> {
  let transformError: Error | null = null
  const wrapFunc = (value: T) => ({ value: func(value) })
  const stopOnError = async function* <P>(source: AnyIterable<P>) {
    for await (const value of source) {
      if (transformError) return
      yield value
    }
  }
  const output = pipeline(() => iterable, buffer(1), stopOnError, map(wrapFunc), buffer(concurrency - 1))
  const itr = getIterator(output) as AsyncIterator<{ value: Promise<R> | R }>
  while (true) {
    const { value, done } = await itr.next()
    if (done) break
    try {
      const val = await value.value
      if (!transformError) yield val
    } catch (error) {
      transformError = error as Error
    }
  }
  if (transformError) throw transformError
}

/**
 * Map a function or async function over all the values of an iterable, maintaining the order of the results. Runs up to `concurrency` async operations at once. If you don't care about order see [`transform()`](#transform). Errors from the source `iterable` are raised after all transformed values are yielded. Errors from `func` are raised after all previously transformed values are yielded.

`concurrency` can be between 1 and `Infinity`.
 */
export function parallelMap(concurrency: number): {
  <T, R>(func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>
  <T, R>(func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncIterableIterator<R>
}
export function parallelMap<T, R>(concurrency: number, func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncIterableIterator<R>
export function parallelMap<T, R>(concurrency: number, func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>
export function parallelMap<T, R>(concurrency: number, func?: (data: T) => R | Promise<R>, iterable?: AnyIterable<T>) {
  if (func === undefined) {
    return <A, B>(curriedFunc: (data: A) => B | Promise<B>, curriedIterable?: AnyIterable<A>) =>
      curriedIterable
        ? parallelMap<A, B>(concurrency, curriedFunc, curriedIterable)
        : parallelMap<A, B>(concurrency, curriedFunc)
  }
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => parallelMap<T, R>(concurrency, func, curriedIterable)
  }
  if (concurrency === 1) return map(func, iterable)
  return _parallelMap(concurrency, func, iterable)
}

// --- parallelFlatMap ---

export function parallelFlatMap(concurrency: number): {
  <T, R>(func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncGenerator<R>
  <T, R>(func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncGenerator<R>
}
export function parallelFlatMap<T, R>(concurrency: number, func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncGenerator<R>
export function parallelFlatMap<T, R>(concurrency: number, func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncGenerator<R>
export function parallelFlatMap<T, R>(concurrency: number, func?: (data: T) => R | Promise<R>, iterable?: AnyIterable<T>) {
  if (func === undefined) {
    return <A, B>(curriedFunc: (data: A) => B | Promise<B>, curriedIterable?: AnyIterable<A>) =>
      curriedIterable
        ? parallelFlatMap<A, B>(concurrency, curriedFunc, curriedIterable)
        : parallelFlatMap<A, B>(concurrency, curriedFunc)
  }
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => parallelFlatMap<T, R>(concurrency, func, curriedIterable)
  }
  return filter(
    (i: unknown): boolean => i !== undefined && i !== null,
    flatten(parallelMap(concurrency, func, iterable) as unknown as AnyIterable<unknown>) as unknown as AnyIterable<R>
  ) as unknown as AsyncGenerator<R>
}

// --- pipeline ---

/**
 * Calls `firstFn` and then every function in `fns` with the result of the previous function. The final return is the result of the last function in `fns`.

```ts
import { pipeline, map, collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'
const getName = map(pokemon => pokemon.name)

// equivalent to `await collect(getName(getPokemon()))`
await pipeline(getPokemon, getName, collect)
// charmander
// bulbasaur
// MissingNo.
```
 */
export function pipeline<T0>(firstFn: () => T0): T0
export function pipeline<T0, T1>(a0: () => T0, a1: (a: T0) => T1): T1
export function pipeline<T0, T1, T2>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2): T2
export function pipeline<T0, T1, T2, T3>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3): T3
export function pipeline<T0, T1, T2, T3, T4>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4): T4
export function pipeline<T0, T1, T2, T3, T4, T5>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5): T5
export function pipeline<T0, T1, T2, T3, T4, T5, T6>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5, a6: (a: T5) => T6): T6
export function pipeline<T0, T1, T2, T3, T4, T5, T6, T7>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5, a6: (a: T5) => T6, a7: (a: T6) => T7): T7
export function pipeline<T0, T1, T2, T3, T4, T5, T6, T7, T8>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5, a6: (a: T5) => T6, a7: (a: T6) => T7, a8: (a: T7) => T8): T8
export function pipeline<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5, a6: (a: T5) => T6, a7: (a: T6) => T7, a8: (a: T7) => T8, a9: (a: T8) => T9): T9
export function pipeline(firstFn: (...args: never[]) => unknown, ...fns: Array<(a: never) => unknown>): unknown {
  let previousFn = firstFn()
  for (const func of fns) previousFn = (func as (a: unknown) => unknown)(previousFn)
  return previousFn
}

// --- reduce ---

async function _reduce<T, B>(func: (acc: B, value: T) => B, start: B, iterable: AnyIterable<T>) {
  let value = start
  for await (const nextItem of iterable) value = await func(value, nextItem)
  return value
}

/**
 * An async function that takes a reducer function, an initial value and an iterable.

Reduces an iterable to a value which is the accumulated result of running each value from the iterable thru `func`, where each successive invocation is supplied the return value of the previous. Errors are immediate raised.
 */
export function reduce<T, B>(func: (acc: B, value: T) => B): {
  (start: B): (iterable: AnyIterable<T>) => Promise<B>
  (start: B, iterable: AnyIterable<T>): Promise<B>
}
export function reduce<T, B>(func: (acc: B, value: T) => B, start: B): (iterable: AnyIterable<T>) => Promise<B>
export function reduce<T, B>(func: (acc: B, value: T) => B, start: B, iterable: AnyIterable<T>): Promise<B>
export function reduce<T, B>(func: (acc: B, value: T) => B, start?: B, iterable?: AnyIterable<T>) {
  if (start === undefined) {
    return (curriedStart: B, curriedIterable?: AnyIterable<T>) =>
      curriedIterable ? _reduce(func, curriedStart, curriedIterable) : reduce(func, curriedStart)
  }
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => reduce(func, start, curriedIterable)
  }
  return _reduce(func, start, iterable)
}

// --- take ---

async function* _take<T>(count: number, iterable: AsyncIterable<T>) {
  if (count <= 0) return
  let taken = 0
  for await (const val of iterable) {
    yield val
    taken++
    if (taken >= count) break
  }
}

function* _syncTake<T>(count: number, iterable: Iterable<T>) {
  if (count <= 0) return
  let taken = 0
  for (const val of iterable) {
    yield val
    taken++
    if (taken >= count) break
  }
}

/**
 * Returns a new iterator that reads a specific number of items from `iterable`. When used with generators it advances the generator, when used with arrays it gets a new iterator and starts from the beginning.

```ts
import { pipeline, take, collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

const topFive = await collect(take(5, getPokemon()))
// first five pokemon
```
 */
export function take(count: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>
export function take<T, M extends AnyIterable<T>>(count: number, iterable: M): UnwrapAnyIterable<M>
export function take<T>(count: number, iterable?: AnyIterable<T>): UnwrapAnyIterable<AnyIterable<T>> | (<U, M extends AnyIterable<U>>(curriedIterable: M) => UnwrapAnyIterable<M>) {
  if (iterable === undefined) {
    return <U, M extends AnyIterable<U>>(curriedIterable: M) => take(count, curriedIterable)
  }
  if (isAsyncIterable(iterable)) return _take(count, iterable)
  return _syncTake(count, iterable as Iterable<T>)
}

// --- takeLast ---

async function* _takeLast<T>(count: number, iterable: AsyncIterable<T>) {
  const buf: Awaited<T>[] = []
  for await (const res of iterable) {
    buf.push(res)
    if (buf.length > count) buf.shift()
  }
  while (buf.length) yield buf.shift()!
}

function* _syncTakeLast<T>(count: number, iterable: Iterable<T>) {
  const buf: T[] = []
  for (const res of iterable) {
    buf.push(res)
    if (buf.length > count) buf.shift()
  }
  while (buf.length) yield buf.shift()!
}

/**
 * Returns a new iterator that reads a specific number of items from the end of `iterable` once it has completed. When used with generators it advances the generator, when used with arrays it gets a new iterator and starts from the beginning.

```ts
import { pipeline, takeLast, collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

const bottomFive = await collect(takeLast(5, getPokemon()))
// last five pokemon
```
 */
export function takeLast(count: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>
export function takeLast<T, M extends AnyIterable<T>>(count: number, iterable: M): UnwrapAnyIterable<M>
export function takeLast<T>(count: number, iterable?: AnyIterable<T>): UnwrapAnyIterable<AnyIterable<T>> | (<U, M extends AnyIterable<U>>(curriedIterable: M) => UnwrapAnyIterable<M>) {
  if (iterable === undefined) {
    return <U, M extends AnyIterable<U>>(curriedIterable: M) => takeLast(count, curriedIterable)
  }
  if (isAsyncIterable(iterable)) return _takeLast(count, iterable)
  return _syncTakeLast(count, iterable as Iterable<T>)
}

// --- takeWhile ---

async function* _takeWhile<T>(predicate: (data: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>) {
  for await (const data of iterable) {
    if (!await predicate(data)) return
    yield data
  }
}

/**
 * Takes a `predicate` and a `iterable`, and returns a new async iterator of the same type containing the members of the given iterable until the `predicate` returns false.

```ts
import { takeWhile } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

const firstSlowOnes = takeWhile(pokemon => pokemon.baseStats.speed < 100)

for await (const pokemon of firstSlowOnes(getPokemon())) {
  console.log(pokemon)
}
// Abomasnow
// Abra
// Absol
```
 */
export function takeWhile<T, S extends T>(predicate: (data: T) => data is S): (curriedIterable: AnyIterable<T>) => AsyncGenerator<S>
export function takeWhile<T>(predicate: (data: T) => boolean | Promise<boolean>): (curriedIterable: AnyIterable<T>) => AsyncGenerator<T>
export function takeWhile<T, S extends T>(predicate: (data: T) => data is S, iterable: AnyIterable<T>): AsyncGenerator<S>
export function takeWhile<T>(predicate: (data: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>): AsyncGenerator<T>
export function takeWhile<T>(predicate: (data: T) => boolean | Promise<boolean>, iterable?: AnyIterable<T>) {
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => _takeWhile(predicate, curriedIterable)
  }
  return _takeWhile(predicate, iterable)
}

// --- tap ---

async function* _asyncTap<T>(func: (data: T) => void | Promise<void> | unknown, iterable: AnyIterable<T>) {
  for await (const val of iterable) {
    await func(val)
    yield val
  }
}

/**
 * Returns a new iterator that yields the data it consumes, passing the data through to a function. If you provide an async function, the iterator will wait for the promise to resolve before yielding the value. This is useful for logging, or processing information and passing it along.
 */
export function tap<T>(func: (data: T) => void | Promise<void> | unknown): (iterable: AnyIterable<T>) => AsyncGenerator<T>
export function tap<T>(func: (data: T) => void | Promise<void> | unknown, iterable: AnyIterable<T>): AsyncGenerator<T>
export function tap<T>(func: (data: T) => void | Promise<void> | unknown, iterable?: AnyIterable<T>) {
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => _asyncTap(func, curriedIterable)
  }
  return _asyncTap(func, iterable)
}

// --- throttle ---

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

function _throttle<T>(limit: number, interval: number, iterable: AnyIterable<T>) {
  if (!Number.isFinite(limit)) throw new TypeError('Expected `limit` to be a finite number')
  if (limit <= 0) throw new TypeError('Expected `limit` to be greater than 0')
  if (!Number.isFinite(interval)) throw new TypeError('Expected `interval` to be a finite number')
  return (async function* () {
    let sent = 0
    let time: number | undefined
    for await (const val of iterable) {
      if (sent < limit) {
        if (typeof time === 'undefined') time = Date.now()
        sent++
        yield val
        continue
      }
      const elapsedMs = Date.now() - (time || 0)
      const waitFor = interval - elapsedMs
      if (waitFor > 0) await sleep(waitFor)
      time = Date.now()
      sent = 1
      yield val
    }
  })()
}

/**
 * Throttles `iterable` at a rate of `limit` per `interval` without discarding data. Useful for throttling rate limited APIs.

`limit` can be greater than 0 but less than `Infinity`.
`interval` can be greater than or equal to 0 but less than `Infinity`.

```ts
import { throttle } from 'streaming-iterables'
import { getPokemon, trainMonster } from 'iterable-pokedex'

// load monsters at a maximum rate of 1 per second
for await (const monster of throttle(1, 1000, getPokemon())) {
  await trainMonster(monster)
}
```
 */
export function throttle<T>(limit: number, interval: number): (iterable: AnyIterable<T>) => AsyncGenerator<T>
export function throttle<T>(limit: number, interval: number, iterable: AnyIterable<T>): AsyncGenerator<T>
export function throttle<T>(limit: number, interval: number, iterable?: AnyIterable<T>) {
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<T>) => _throttle(limit, interval, curriedIterable)
  }
  return _throttle(limit, interval, iterable)
}

// --- time ---

function nsToHrTime(ns: bigint): [number, number] {
  const n = Number(ns)
  return [Math.floor(n / 1_000_000_000), n % 1_000_000_000]
}

function addBigIntTime(a: bigint, b: bigint): bigint {
  return a + b
}

async function* _asyncTime<T>(config: TimeConfig, iterable: AsyncIterable<T>) {
  const itr = iterable[Symbol.asyncIterator]()
  let totalNs = BigInt(0)
  while (true) {
    const start = process.hrtime.bigint()
    const { value, done } = await itr.next()
    const deltaNs = process.hrtime.bigint() - start
    totalNs = addBigIntTime(totalNs, deltaNs)
    if (config.progress) config.progress(nsToHrTime(deltaNs), nsToHrTime(totalNs))
    if (done) {
      if (config.total) config.total(nsToHrTime(totalNs))
      return value
    }
    yield value
  }
}

function* _syncTime<T>(config: TimeConfig, iterable: Iterable<T>) {
  const itr = iterable[Symbol.iterator]()
  let totalNs = BigInt(0)
  while (true) {
    const start = process.hrtime.bigint()
    const { value, done } = itr.next()
    const deltaNs = process.hrtime.bigint() - start
    totalNs = addBigIntTime(totalNs, deltaNs)
    if (config.progress) config.progress(nsToHrTime(deltaNs), nsToHrTime(totalNs))
    if (done) {
      if (config.total) config.total(nsToHrTime(totalNs))
      return value
    }
    yield value
  }
}

/**
 * Returns a new iterator that yields the data it consumes and calls the `progress` and `total` callbacks with the [`hrtime`](https://nodejs.org/api/process.html#process_process_hrtime_time) it took for `iterable` to provide a value when `.next()` was called on it. That is to say, the time returned is the time this iterator spent waiting for data, not the time it took to finish being read. The `hrtime` tuple looks like `[seconds, nanoseconds]`.

```ts
import { consume, transform, time } from 'streaming-iterables'
import got from 'got'

const urls = ['https://http.cat/200', 'https://http.cat/201', 'https://http.cat/202']
const download = transform(1000, got)
const timer = time({
  total: total => console.log(`Spent ${total[0]} seconds and ${total[1]}ns downloading cats`),
})
// download all of these at the same time
for await (page of timer(download(urls))) {
  console.log(page)
}
```
 */
export function time(config?: TimeConfig): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>
export function time<T, M extends AnyIterable<T>>(config: TimeConfig, iterable: M): UnwrapAnyIterable<M>
export function time<T>(config: TimeConfig = {}, iterable?: AnyIterable<T>): UnwrapAnyIterable<AnyIterable<T>> | (<U, M extends AnyIterable<U>>(curriedIterable: M) => UnwrapAnyIterable<M>) {
  if (iterable === undefined) {
    return <U, M extends AnyIterable<U>>(curriedIterable: M) => time(config, curriedIterable)
  }
  if (isAsyncIterable(iterable)) return _asyncTime(config, iterable)
  return _syncTime(config, iterable as Iterable<T>)
}

// --- fromStream ---

async function onceReadable(stream: ReadableStreamish) {
  return new Promise<void>(resolve => {
    stream.once('readable', () => resolve())
  })
}

async function* _fromStream(stream: ReadableStreamish) {
  while (true) {
    const data = stream.read()
    if (data !== null) { yield data; continue }
    if ((stream as ReadableStreamish)._readableState?.ended) break
    await onceReadable(stream)
  }
}

/**
 * Wraps the stream in an async iterator or returns the stream if it already is an async iterator.

*note*: Since Node 10, streams already async iterators. This function may be used to ensure compatibility with older versions of Node.

```ts
import { fromStream } from 'streaming-iterables'
import { createReadStream } from 'fs'

const pokeLog = fromStream(createReadStream('./pokedex-operating-system.log'))

for await (const pokeData of pokeLog) {
  console.log(pokeData) // Buffer(...)
}
```
 * @deprecated This method is deprecated since, node 10 is out of LTS. It may be removed in an upcoming major release.
 */
export function fromStream<T>(stream: ReadableStreamish): AsyncIterable<T> {
  if (typeof stream[Symbol.asyncIterator] === 'function') return stream as unknown as AsyncIterable<T>
  return _fromStream(stream) as AsyncIterable<T>
}

// --- writeToStream ---

async function _writeToStream(stream: WritableStreamish, iterable: AnyIterable<unknown>): Promise<void> {
  let lastError: Error | null = null
  let errCb: ErrorCallback = null
  let drainCb: NotifyCallback = null

  const notifyError = (err: unknown) => { lastError = err as Error; if (errCb) errCb(err) }
  const notifyDrain = () => { if (drainCb) drainCb() }
  const cleanup = () => {
    stream.removeListener('error', notifyError)
    stream.removeListener('drain', notifyDrain)
  }

  stream.once('error', notifyError)

  const waitForDrain = () =>
    new Promise<void>((resolve, reject) => {
      if (lastError) return reject(lastError)
      stream.once('drain', notifyDrain)
      drainCb = resolve
      errCb = reject
    })

  for await (const value of iterable) {
    if (stream.write(value) === false) await waitForDrain()
    if (lastError) break
  }
  cleanup()
  if (lastError) throw lastError
}

/**
 * Writes the `iterable` to the stream respecting the stream back pressure. Resolves when the iterable is exhausted, rejects if the stream errors during calls to `write()` or if there are `error` events during the write.

As it is when working with streams there are a few caveats;

- It is possible for the stream to error after `writeToStream()` has finished writing due to internal buffering and other concerns, so always handle errors on the stream as well.
- `writeToStream()` doesn't close the stream like `stream.pipe()` might. This is done so you can write to the stream multiple times. You can call `stream.write(null)` or any stream specific end function if you are done with the stream.

```ts
import { pipeline, map, writeToStream } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'
import { createWriteStream } from 'fs'

const file = createWriteStream('pokemon.ndjson')
const serialize = map(pokemon => `${JSON.stringify(pokemon)}\n`)
await pipeline(getPokemon, serialize, writeToStream(file))
file.end() // close the stream
// now all the pokemon are written to the file!
```
 */
export function writeToStream(stream: WritableStreamish): (iterable: AnyIterable<unknown>) => Promise<void>
export function writeToStream(stream: WritableStreamish, iterable: AnyIterable<unknown>): Promise<void>
export function writeToStream(stream: WritableStreamish, iterable?: AnyIterable<unknown>) {
  if (iterable === undefined) {
    return (curriedIterable: AnyIterable<unknown>) => _writeToStream(stream, curriedIterable)
  }
  return _writeToStream(stream, iterable)
}

// ============================================================
// v3 additions — new generators, combinators, and FP class
// ============================================================

// --- range ---

/**
 * Creates a sync generator that yields numbers from `start` (inclusive) to `end` (exclusive) by `step`.
 *
 * ```ts
 * [...range(0, 5)]          // [0, 1, 2, 3, 4]
 * [...range(10, 0, -2)]     // [10, 8, 6, 4, 2]
 * ```
 */
export function* range(start: number, end: number, step = 1): Generator<number> {
  if (step === 0) throw new RangeError('range step must not be zero')
  if (step > 0) {
    for (let i = start; i < end; i += step) yield i
  } else {
    for (let i = start; i > end; i += step) yield i
  }
}

// --- repeat ---

/**
 * Yields `value` `count` times, or infinitely if `count` is omitted.
 *
 * ```ts
 * [...repeat('x', 3)]  // ['x', 'x', 'x']
 * ```
 */
export function* repeat<T>(value: T, count?: number): Generator<T> {
  if (count === undefined) {
    while (true) yield value
  } else {
    for (let i = 0; i < count; i++) yield value
  }
}

// --- interval ---

/**
 * An async generator that yields incrementing numbers every `ms` milliseconds.
 * Stops after `limit` values if provided, otherwise runs indefinitely.
 *
 * ```ts
 * for await (const tick of interval(1000, 3)) {
 *   console.log(tick) // 0, 1, 2  (one per second)
 * }
 * ```
 */
export async function* interval(ms: number, limit?: number): AsyncGenerator<number> {
  let count = 0
  while (limit === undefined || count < limit) {
    await sleep(ms)
    yield count++
  }
}

// --- zip ---

type UnzipIterables<T extends AnyIterable<unknown>[]> = { [K in keyof T]: T[K] extends AnyIterable<infer U> ? U : never }

/**
 * Zips multiple iterables together, yielding tuples of one item from each.
 * Stops when the shortest iterable is exhausted.
 *
 * ```ts
 * for await (const [a, b] of zip([1, 2, 3], ['a', 'b', 'c'])) {
 *   console.log(a, b) // 1 'a', 2 'b', 3 'c'
 * }
 * ```
 */
export async function* zip<T extends AnyIterable<unknown>[]>(...iterables: T): AsyncGenerator<UnzipIterables<T>> {
  const iterators = iterables.map(getIterator)
  try {
    while (true) {
      const results = await Promise.all(iterators.map(itr => Promise.resolve(itr.next())))
      if (results.some(r => r.done)) break
      yield results.map(r => r.value) as UnzipIterables<T>
    }
  } finally {
    for (const itr of iterators) await itr.return?.()
  }
}

// --- enumerate ---

/**
 * Yields `[index, value]` pairs for each item in the iterable.
 *
 * ```ts
 * for await (const [i, val] of enumerate(['a', 'b', 'c'])) {
 *   console.log(i, val) // 0 'a', 1 'b', 2 'c'
 * }
 * ```
 */
export async function* enumerate<T>(iterable: AnyIterable<T>): AsyncGenerator<[number, T]> {
  let i = 0
  for await (const val of iterable) yield [i++, val]
}

// --- scan ---

async function* _scan<T, R>(fn: (acc: R, val: T) => R | Promise<R>, initial: R, iterable: AnyIterable<T>): AsyncGenerator<R> {
  let acc = initial
  for await (const val of iterable) {
    acc = await fn(acc, val)
    yield acc
  }
}

/**
 * Like `reduce`, but yields the accumulated value after each step. Useful for running totals.
 *
 * ```ts
 * for await (const sum of scan((acc, x) => acc + x, 0, [1, 2, 3, 4])) {
 *   console.log(sum) // 1, 3, 6, 10
 * }
 * ```
 */
export function scan<T, R>(fn: (acc: R, val: T) => R | Promise<R>, initial: R): (iterable: AnyIterable<T>) => AsyncGenerator<R>
export function scan<T, R>(fn: (acc: R, val: T) => R | Promise<R>, initial: R, iterable: AnyIterable<T>): AsyncGenerator<R>
export function scan<T, R>(fn: (acc: R, val: T) => R | Promise<R>, initial: R, iterable?: AnyIterable<T>) {
  if (iterable === undefined) return (curried: AnyIterable<T>) => _scan(fn, initial, curried)
  return _scan(fn, initial, iterable)
}

// --- distinct ---

async function* _distinct<T>(keyFn: (val: T) => unknown, iterable: AnyIterable<T>): AsyncGenerator<T> {
  const seen = new Set<unknown>()
  for await (const val of iterable) {
    const key = keyFn(val)
    if (!seen.has(key)) { seen.add(key); yield val }
  }
}

/**
 * Yields only unique values. An optional `keyFn` computes the identity key (defaults to identity).
 *
 * ```ts
 * for await (const val of distinct([1, 2, 2, 3, 1])) {
 *   console.log(val) // 1, 2, 3
 * }
 * ```
 */
export function distinct<T>(keyFn?: (val: T) => unknown): (iterable: AnyIterable<T>) => AsyncGenerator<T>
export function distinct<T>(keyFn: (val: T) => unknown, iterable: AnyIterable<T>): AsyncGenerator<T>
export function distinct<T>(keyFn?: (val: T) => unknown, iterable?: AnyIterable<T>) {
  const fn = keyFn ?? ((v: T) => v)
  if (iterable === undefined) return (curried: AnyIterable<T>) => _distinct(fn, curried)
  return _distinct(fn, iterable)
}

// --- window ---

async function* _window<T>(size: number, iterable: AnyIterable<T>): AsyncGenerator<T[]> {
  const buf: T[] = []
  for await (const val of iterable) {
    buf.push(val)
    if (buf.length === size) { yield [...buf]; buf.shift() }
  }
}

/**
 * Yields sliding windows of `size` items over the iterable.
 *
 * ```ts
 * for await (const w of window(3, [1, 2, 3, 4, 5])) {
 *   console.log(w) // [1,2,3], [2,3,4], [3,4,5]
 * }
 * ```
 */
export function window<T>(size: number): (iterable: AnyIterable<T>) => AsyncGenerator<T[]>
export function window<T>(size: number, iterable: AnyIterable<T>): AsyncGenerator<T[]>
export function window<T>(size: number, iterable?: AnyIterable<T>) {
  if (iterable === undefined) return (curried: AnyIterable<T>) => _window(size, curried)
  return _window(size, iterable)
}

// --- pairwise ---

/**
 * Yields consecutive `[prev, current]` pairs. Yields nothing if the iterable has fewer than 2 items.
 *
 * ```ts
 * for await (const [prev, curr] of pairwise([1, 2, 3, 4])) {
 *   console.log(prev, curr) // 1 2, 2 3, 3 4
 * }
 * ```
 */
export async function* pairwise<T>(iterable: AnyIterable<T>): AsyncGenerator<[T, T]> {
  let prev: T | undefined
  let hasPrev = false
  for await (const val of iterable) {
    if (hasPrev) yield [prev as T, val]
    prev = val
    hasPrev = true
  }
}

// --- cycle ---

/**
 * Infinitely cycles through the iterable by collecting values on the first pass and repeating.
 *
 * ```ts
 * for await (const val of take(7, cycle([1, 2, 3]))) {
 *   console.log(val) // 1, 2, 3, 1, 2, 3, 1
 * }
 * ```
 */
export async function* cycle<T>(iterable: AnyIterable<T>): AsyncGenerator<T> {
  const buf: T[] = []
  for await (const val of iterable) { buf.push(val); yield val }
  if (buf.length === 0) return
  while (true) { for (const val of buf) yield val }
}

// --- partition ---

async function _partition<T>(fn: (val: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>): Promise<[T[], T[]]> {
  const matching: T[] = []
  const nonMatching: T[] = []
  for await (const val of iterable) {
    if (await fn(val)) matching.push(val)
    else nonMatching.push(val)
  }
  return [matching, nonMatching]
}

/**
 * Eagerly splits an iterable into `[matching, nonMatching]` based on a predicate.
 *
 * ```ts
 * const [evens, odds] = await partition(x => x % 2 === 0, [1, 2, 3, 4, 5])
 * // evens: [2, 4], odds: [1, 3, 5]
 * ```
 */
export function partition<T>(fn: (val: T) => boolean | Promise<boolean>): (iterable: AnyIterable<T>) => Promise<[T[], T[]]>
export function partition<T>(fn: (val: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>): Promise<[T[], T[]]>
export function partition<T>(fn: (val: T) => boolean | Promise<boolean>, iterable?: AnyIterable<T>) {
  if (iterable === undefined) return (curried: AnyIterable<T>) => _partition(fn, curried)
  return _partition(fn, iterable)
}

// --- fromEvents ---

export interface EventEmitterLike {
  on(event: string, listener: (...args: unknown[]) => void): unknown
  once(event: string, listener: (...args: unknown[]) => void): unknown
  off(event: string, listener: (...args: unknown[]) => void): unknown
}

/**
 * Creates an async iterable from a Node.js-style event emitter. Yields values emitted by `event`.
 * Ends when `endEvent` fires (default: `'end'`). Throws on `'error'` events.
 *
 * ```ts
 * const lines = fromEvents<string>(readline, 'line', 'close')
 * for await (const line of lines) {
 *   console.log(line)
 * }
 * ```
 */
export function fromEvents<T = unknown>(emitter: EventEmitterLike, event: string, endEvent = 'end'): AsyncIterable<T> {
  type Item = { type: 'value'; value: T } | { type: 'end' } | { type: 'error'; error: Error }
  return {
    [Symbol.asyncIterator](): AsyncIterator<T> {
      const queue: Item[] = []
      const waiting: IDeferred<IteratorResult<T>>[] = []
      let closed = false

      function dispatch() {
        while (waiting.length > 0 && queue.length > 0) {
          const waiter = waiting.shift()!
          const item = queue.shift()!
          if (item.type === 'value') waiter.resolve({ done: false, value: item.value })
          else if (item.type === 'end') waiter.resolve({ done: true, value: undefined } as IteratorResult<T>)
          else waiter.reject(item.error)
        }
      }

      const onData = (val: T) => { queue.push({ type: 'value', value: val }); dispatch() }
      const onEnd = () => { closed = true; queue.push({ type: 'end' }); dispatch(); cleanup() }
      const onError = (err: Error) => { closed = true; queue.push({ type: 'error', error: err }); dispatch(); cleanup() }

      // Cast to the interface's wider `(...args: unknown[]) => void` at each call site
      // so the internal handlers can keep their precise types.
      type Listener = (...args: unknown[]) => void
      function cleanup() {
        emitter.off(event, onData as Listener)
        emitter.off(endEvent, onEnd as Listener)
        emitter.off('error', onError as Listener)
      }

      emitter.on(event, onData as Listener)
      emitter.once(endEvent, onEnd as Listener)
      emitter.once('error', onError as Listener)

      return {
        async next(): Promise<IteratorResult<T>> {
          if (queue.length > 0) {
            const item = queue.shift()!
            if (item.type === 'value') return { done: false, value: item.value }
            if (item.type === 'end') return { done: true, value: undefined } as IteratorResult<T>
            throw item.error
          }
          if (closed) return { done: true, value: undefined } as IteratorResult<T>
          const d = defer<IteratorResult<T>>()
          waiting.push(d)
          return d.promise
        },
        async return(): Promise<IteratorResult<T>> {
          closed = true
          cleanup()
          for (const w of waiting) w.resolve({ done: true, value: undefined } as IteratorResult<T>)
          waiting.length = 0
          return { done: true, value: undefined } as IteratorResult<T>
        },
      }
    },
  }
}

// --- retry ---

/**
 * Retries an async function up to `times` total attempts. Throws the last error if all fail.
 *
 * ```ts
 * const data = await retry(3, () => fetch('/api/data').then(r => r.json()))
 * ```
 */
export async function retry<T>(times: number, fn: () => T | Promise<T>): Promise<T> {
  let lastError: Error | undefined
  for (let i = 0; i < times; i++) {
    try { return await fn() } catch (err) { lastError = err as Error }
  }
  throw lastError
}

// ============================================================
// FP — chainable lazy async iterable class
// ============================================================

/**
 * A chainable, lazy wrapper around any iterable or async iterable. Operations are not evaluated
 * until a terminal method (`.collect()`, `.consume()`, `.reduce()`, etc.) or `for await...of` is used.
 *
 * ```ts
 * const result = await FP.range(0, 100)
 *   .filter(x => x % 2 === 0)
 *   .map(x => x * x)
 *   .take(5)
 *   .collect()
 * // [0, 4, 16, 36, 64]
 * ```
 */
export class FP<T> implements AsyncIterable<T> {
  readonly #source: AnyIterable<T>

  private constructor(source: AnyIterable<T>) {
    this.#source = source
  }

  // --- factories ---

  /** Wrap any iterable or async iterable. */
  static from<T>(source: AnyIterable<T>): FP<T> { return new FP(source) }

  /** Create from a list of values. */
  static of<T>(...values: T[]): FP<T> { return new FP(values) }

  /** Number sequence — see `range()`. */
  static range(start: number, end: number, step?: number): FP<number> { return new FP(range(start, end, step)) }

  /** Repeat a value — see `repeat()`. */
  static repeat<T>(value: T, count?: number): FP<T> { return new FP(repeat(value, count)) }

  /** Async timer ticks — see `interval()`. */
  static interval(ms: number, limit?: number): FP<number> { return new FP(interval(ms, limit)) }

  /** Event emitter to async iterable — see `fromEvents()`. */
  static fromEvents<T = unknown>(emitter: EventEmitterLike, event: string, endEvent?: string): FP<T> {
    return new FP(fromEvents<T>(emitter, event, endEvent))
  }

  /** An empty iterable. */
  static empty<T = never>(): FP<T> { return new FP([] as T[]) }

  // --- AsyncIterable protocol ---

  [Symbol.asyncIterator](): AsyncIterator<T> {
    if (isAsyncIterable(this.#source)) return this.#source[Symbol.asyncIterator]()
    const src = this.#source as Iterable<T>
    return (async function* () { yield* src })()[Symbol.asyncIterator]()
  }

  // --- transforms ---

  map<R>(fn: (val: T) => R | Promise<R>): FP<R> {
    return new FP(map(fn, this.#source))
  }

  flatMap<R>(fn: (val: T) => FlatMapValue<R>): FP<NonNullable<R>> {
    return new FP(flatMap(fn, this.#source))
  }

  filter<S extends T>(fn: (val: T) => val is S): FP<S>
  filter(fn: (val: T) => boolean | Promise<boolean>): FP<T>
  filter(fn: (val: T) => boolean | Promise<boolean>): FP<T> {
    return new FP(filter(fn, this.#source))
  }

  tap(fn: (val: T) => void | Promise<void> | unknown): FP<T> {
    return new FP(tap(fn, this.#source))
  }

  flatten(): FP<T extends AnyIterable<infer U> ? U : T> {
    return new FP(flatten(this.#source as AnyIterable<AnyIterable<T extends AnyIterable<infer U> ? U : T>>)) as unknown as FP<T extends AnyIterable<infer U> ? U : T>
  }

  scan<R>(fn: (acc: R, val: T) => R | Promise<R>, initial: R): FP<R> {
    return new FP(scan(fn, initial, this.#source))
  }

  // --- slicing ---

  take(count: number): FP<T> { return new FP(take(count, this.#source)) }
  takeLast(count: number): FP<T> { return new FP(takeLast(count, this.#source)) }
  takeWhile(fn: (val: T) => boolean | Promise<boolean>): FP<T> { return new FP(takeWhile(fn, this.#source)) }
  drop(count: number): FP<T> { return new FP(drop(count, this.#source)) }

  // --- batching / windowing ---

  batch(size: number): FP<T[]> { return new FP(batch(size, this.#source)) }
  batchWithTimeout(size: number, timeout: number): FP<T[]> { return new FP(batchWithTimeout(size, timeout, this.#source)) }
  window(size: number): FP<T[]> { return new FP(window(size, this.#source)) }

  // --- concurrency ---

  buffer(size: number): FP<T> { return new FP(buffer(size, this.#source)) }

  transform<R>(concurrency: number, fn: (val: T) => R | Promise<R>): FP<R> {
    return new FP(transform(concurrency, fn, this.#source))
  }

  parallelMap<R>(concurrency: number, fn: (val: T) => R | Promise<R>): FP<R> {
    return new FP(parallelMap(concurrency, fn, this.#source))
  }

  throttle(limit: number, intervalMs: number): FP<T> {
    return new FP(throttle(limit, intervalMs, this.#source))
  }

  // --- combining ---

  concat(...others: AnyIterable<T>[]): FP<T> {
    return new FP(concat(this.#source, ...others) as AnyIterable<T>)
  }

  merge(...others: AnyIterable<T>[]): FP<T> {
    return new FP(merge(this.#source, ...others))
  }

  zip<U>(other: AnyIterable<U>): FP<[T, U]> {
    return new FP(zip(this.#source, other) as AsyncGenerator<[T, U]>)
  }

  // --- utilities ---

  enumerate(): FP<[number, T]> { return new FP(enumerate(this.#source)) }
  distinct(keyFn?: (val: T) => unknown): FP<T> { return new FP(distinct(keyFn ?? (v => v), this.#source)) }
  pairwise(): FP<[T, T]> { return new FP(pairwise(this.#source)) }
  cycle(): FP<T> { return new FP(cycle(this.#source)) }

  // --- terminal operations ---

  /** Collect all values into an array. */
  collect(): Promise<T[]> {
    return _collect(isAsyncIterable(this.#source) ? this.#source : (async function* (s) { yield* s as Iterable<T> })(this.#source))
  }

  /** Drain without collecting. */
  async consume(): Promise<void> {
    for await (const _ of this) { /* drain */ }
  }

  /** Reduce to a single value. */
  reduce<R>(fn: (acc: R, val: T) => R, initial: R): Promise<R> {
    return reduce(fn, initial, this.#source)
  }

  /** Split into [matching, nonMatching]. */
  partition(fn: (val: T) => boolean | Promise<boolean>): Promise<[T[], T[]]> {
    return partition(fn, this.#source)
  }

  /** First value, or `undefined` if empty. */
  async first(): Promise<T | undefined> {
    for await (const val of take(1, this.#source)) return val
    return undefined
  }

  /** Last value, or `undefined` if empty. */
  async last(): Promise<T | undefined> {
    let last: T | undefined
    for await (const val of this.#source) last = val
    return last
  }

  /** First value matching predicate, or `undefined`. */
  async find(fn: (val: T) => boolean | Promise<boolean>): Promise<T | undefined> {
    for await (const val of this.#source) { if (await fn(val)) return val }
    return undefined
  }

  /** Index of first matching value, or `-1`. */
  async findIndex(fn: (val: T) => boolean | Promise<boolean>): Promise<number> {
    let i = 0
    for await (const val of this.#source) { if (await fn(val)) return i; i++ }
    return -1
  }

  /** True if any value satisfies the predicate. */
  async some(fn: (val: T) => boolean | Promise<boolean>): Promise<boolean> {
    for await (const val of this.#source) { if (await fn(val)) return true }
    return false
  }

  /** True if all values satisfy the predicate. */
  async every(fn: (val: T) => boolean | Promise<boolean>): Promise<boolean> {
    for await (const val of this.#source) { if (!await fn(val)) return false }
    return true
  }

  /** Count all values. */
  async count(): Promise<number> {
    let n = 0; for await (const _ of this.#source) n++; return n
  }

  /** Collect into a Map. Requires T to be `[K, V]` tuples. */
  async toMap<K, V>(this: FP<[K, V]>): Promise<Map<K, V>> {
    const m = new Map<K, V>()
    for await (const [k, v] of this) m.set(k, v)
    return m
  }

  /** Collect into a Set. */
  async toSet(): Promise<Set<T>> {
    const s = new Set<T>(); for await (const val of this) s.add(val); return s
  }
}
