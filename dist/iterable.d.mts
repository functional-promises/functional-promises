/**
 * Any iterable or iterator.
 */
type Iterableish<T> = Iterable<T> | Iterator<T> | AsyncIterable<T> | AsyncIterator<T>;
/**
 * Literally any `Iterable` (async or regular).
 */
type AnyIterable<T> = Iterable<T> | AsyncIterable<T>;
/**
 * A value, an array of that value, undefined, null or promises for any of them. Used in the `flatMap` and `flatTransform` functions as possible return values of the mapping function.
 */
type FlatMapValue<B> = B | AnyIterable<B> | undefined | null | Promise<B | AnyIterable<B> | undefined | null>;
type UnArrayAnyIterable<A extends AnyIterable<any>[]> = A extends AnyIterable<infer T>[] ? T : never;
type NullOrFunction = null | ((anything?: any) => void);
type UnwrapAnyIterable<M extends AnyIterable<any>> = M extends Iterable<infer T> ? Iterable<T> : M extends AsyncIterable<infer B> ? AsyncIterable<B> : never;
type UnwrapAnyIterableArray<M extends AnyIterable<any>> = M extends Iterable<infer T> ? Generator<T[]> : M extends AsyncIterable<infer B> ? AsyncGenerator<B[]> : never;
interface ReadableStreamish {
    once: any;
    read: any;
    [Symbol.asyncIterator]?: () => AsyncIterator<any>;
}
interface WritableStreamish {
    once: any;
    write: any;
    removeListener: any;
}
interface TimeConfig {
    progress?: (delta: [number, number], total: [number, number]) => any;
    total?: (time: [number, number]) => any;
}
interface IDeferred<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
}
/**
 * Get the iterator from any iterable or just return an iterator itself.
 */
declare function getIterator<T>(iterable: Iterable<T> | Iterator<T>): Iterator<T>;
declare function getIterator<T>(iterable: AsyncIterable<T> | AsyncIterator<T>): AsyncIterator<T>;
declare function getIterator<T>(iterable: AnyIterable<T>): AsyncIterator<T> | Iterator<T>;
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
declare function batch(size: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterableArray<M>;
declare function batch<T, M extends AnyIterable<T>>(size: number, iterable: M): UnwrapAnyIterableArray<M>;
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
declare function batchWithTimeout(size: number, timeout: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterableArray<M>;
declare function batchWithTimeout<T, M extends AnyIterable<T>>(size: number, timeout: number, iterable: M): UnwrapAnyIterableArray<M>;
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
declare function buffer(size: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>;
declare function buffer<T, M extends AnyIterable<T>>(size: number, iterable: M): UnwrapAnyIterable<M>;
/**
 * Collect all the values from an iterable into an array. Returns an array if you pass it an iterable and a promise for an array if you pass it an async iterable. Errors from the source `iterable` are raised immediately.

```ts
import { collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

console.log(await collect(getPokemon()))
// [bulbasaur, ivysaur, venusaur, charmander, ...]
```
 */
declare function collect<T>(iterable: Iterable<T>): T[];
declare function collect<T>(iterable: AsyncIterable<T>): Promise<T[]>;
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
declare function concat<I extends Iterable<any>[]>(...iterables: I): Iterable<UnArrayAnyIterable<I>>;
declare function concat<I extends AnyIterable<any>[]>(...iterables: I): AsyncIterable<UnArrayAnyIterable<I>>;
/**
 * A promise that resolves after the function drains the iterable of all data. Useful for processing a pipeline of data. Errors from the source `iterable` are raised immediately.

```ts
import { consume, map } from 'streaming-iterables'
import { getPokemon, trainMonster } from 'iterable-pokedex'

const train = map(trainMonster)
await consume(train(getPokemon())) // load all the pokemon and train them!
```
 */
declare function consume<T>(iterable: Iterable<T>): void;
declare function consume<T>(iterable: AsyncIterable<T>): Promise<void>;
/**
 * Returns a new iterator that skips a specific number of items from `iterable`. When used with generators it advances the generator `count` items, when used with arrays it gets a new iterator and skips `count` items.

```ts
import { pipeline, drop, collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

const allButFirstFive = await collect(drop(5, getPokemon()))
// first five pokemon
```
 */
declare function drop(count: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>;
declare function drop<T, M extends AnyIterable<T>>(count: number, iterable: M): UnwrapAnyIterable<M>;
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
declare function filter<T, S extends T>(filterFunc: (data: T) => data is S): (curriedIterable: AnyIterable<T>) => AsyncGenerator<S>;
declare function filter<T>(filterFunc: (data: T) => boolean | Promise<boolean>): (curriedIterable: AnyIterable<T>) => AsyncGenerator<T>;
declare function filter<T, S extends T>(filterFunc: (data: T) => data is S, iterable: AnyIterable<T>): AsyncGenerator<S>;
declare function filter<T>(filterFunc: (data: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>): AsyncGenerator<T>;
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
declare function flatten<B>(iterable: AnyIterable<B | AnyIterable<B>>): AsyncIterableIterator<B>;
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
declare function map<T, B>(func: (data: T) => B | Promise<B>): (iterable: AnyIterable<T>) => AsyncGenerator<B>;
declare function map<T, B>(func: (data: T) => B | Promise<B>, iterable: AnyIterable<T>): AsyncGenerator<B>;
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
declare function flatMap<T, B>(func: (data: T) => FlatMapValue<B>): (iterable: AnyIterable<T>) => AsyncGenerator<NonNullable<B>>;
declare function flatMap<T, B>(func: (data: T) => FlatMapValue<B>, iterable: AnyIterable<T>): AsyncGenerator<NonNullable<B>>;
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
declare function transform(concurrency: number): {
    <T, R>(func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>;
    <T, R>(func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncIterableIterator<R>;
};
declare function transform<T, R>(concurrency: number, func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncIterableIterator<R>;
declare function transform<T, R>(concurrency: number, func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>;
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
declare function flatTransform(concurrency: number): {
    <T, R>(func: (data: T) => FlatMapValue<R>, iterable: AnyIterable<T>): AsyncGenerator<R>;
    <T, R>(func: (data: T) => FlatMapValue<R>): (iterable: AnyIterable<T>) => AsyncGenerator<R>;
};
declare function flatTransform<T, R>(concurrency: number, func: (data: T) => FlatMapValue<R>): (iterable: AnyIterable<T>) => AsyncGenerator<R>;
declare function flatTransform<T, R>(concurrency: number, func: (data: T) => FlatMapValue<R>, iterable: AnyIterable<T>): AsyncGenerator<R>;
/**
 * Combine multiple iterators into a single iterable. Reads one item off each iterable in order repeatedly until they are all exhausted. If you care less about order and want them faster see `parallelMerge()`.
 */
declare function merge<I extends AnyIterable<any>[]>(...iterables: I): AsyncGenerator<UnArrayAnyIterable<I>>;
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
declare function parallelMerge<I extends AnyIterable<any>[]>(...iterables: I): AsyncGenerator<UnArrayAnyIterable<I>>;
/**
 * Map a function or async function over all the values of an iterable, maintaining the order of the results. Runs up to `concurrency` async operations at once. If you don't care about order see [`transform()`](#transform). Errors from the source `iterable` are raised after all transformed values are yielded. Errors from `func` are raised after all previously transformed values are yielded.

`concurrency` can be between 1 and `Infinity`.
 */
declare function parallelMap(concurrency: number): {
    <T, R>(func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>;
    <T, R>(func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncIterableIterator<R>;
};
declare function parallelMap<T, R>(concurrency: number, func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncIterableIterator<R>;
declare function parallelMap<T, R>(concurrency: number, func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncIterableIterator<R>;
declare function parallelFlatMap(concurrency: number): {
    <T, R>(func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncGenerator<R>;
    <T, R>(func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncGenerator<R>;
};
declare function parallelFlatMap<T, R>(concurrency: number, func: (data: T) => R | Promise<R>): (iterable: AnyIterable<T>) => AsyncGenerator<R>;
declare function parallelFlatMap<T, R>(concurrency: number, func: (data: T) => R | Promise<R>, iterable: AnyIterable<T>): AsyncGenerator<R>;
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
declare function pipeline<T0>(firstFn: () => T0): T0;
declare function pipeline<T0, T1>(a0: () => T0, a1: (a: T0) => T1): T1;
declare function pipeline<T0, T1, T2>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2): T2;
declare function pipeline<T0, T1, T2, T3>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3): T3;
declare function pipeline<T0, T1, T2, T3, T4>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4): T4;
declare function pipeline<T0, T1, T2, T3, T4, T5>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5): T5;
declare function pipeline<T0, T1, T2, T3, T4, T5, T6>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5, a6: (a: T5) => T6): T6;
declare function pipeline<T0, T1, T2, T3, T4, T5, T6, T7>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5, a6: (a: T5) => T6, a7: (a: T6) => T7): T7;
declare function pipeline<T0, T1, T2, T3, T4, T5, T6, T7, T8>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5, a6: (a: T5) => T6, a7: (a: T6) => T7, a8: (a: T7) => T8): T8;
declare function pipeline<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(a0: () => T0, a1: (a: T0) => T1, a2: (a: T1) => T2, a3: (a: T2) => T3, a4: (a: T3) => T4, a5: (a: T4) => T5, a6: (a: T5) => T6, a7: (a: T6) => T7, a8: (a: T7) => T8, a9: (a: T8) => T9): T9;
/**
 * An async function that takes a reducer function, an initial value and an iterable.

Reduces an iterable to a value which is the accumulated result of running each value from the iterable thru `func`, where each successive invocation is supplied the return value of the previous. Errors are immediate raised.
 */
declare function reduce<T, B>(func: (acc: B, value: T) => B): {
    (start: B): (iterable: AnyIterable<T>) => Promise<B>;
    (start: B, iterable: AnyIterable<T>): Promise<B>;
};
declare function reduce<T, B>(func: (acc: B, value: T) => B, start: B): (iterable: AnyIterable<T>) => Promise<B>;
declare function reduce<T, B>(func: (acc: B, value: T) => B, start: B, iterable: AnyIterable<T>): Promise<B>;
/**
 * Returns a new iterator that reads a specific number of items from `iterable`. When used with generators it advances the generator, when used with arrays it gets a new iterator and starts from the beginning.

```ts
import { pipeline, take, collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

const topFive = await collect(take(5, getPokemon()))
// first five pokemon
```
 */
declare function take(count: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>;
declare function take<T, M extends AnyIterable<T>>(count: number, iterable: M): UnwrapAnyIterable<M>;
/**
 * Returns a new iterator that reads a specific number of items from the end of `iterable` once it has completed. When used with generators it advances the generator, when used with arrays it gets a new iterator and starts from the beginning.

```ts
import { pipeline, takeLast, collect } from 'streaming-iterables'
import { getPokemon } from 'iterable-pokedex'

const bottomFive = await collect(takeLast(5, getPokemon()))
// last five pokemon
```
 */
declare function takeLast(count: number): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>;
declare function takeLast<T, M extends AnyIterable<T>>(count: number, iterable: M): UnwrapAnyIterable<M>;
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
declare function takeWhile<T, S extends T>(predicate: (data: T) => data is S): (curriedIterable: AnyIterable<T>) => AsyncGenerator<S>;
declare function takeWhile<T>(predicate: (data: T) => boolean | Promise<boolean>): (curriedIterable: AnyIterable<T>) => AsyncGenerator<T>;
declare function takeWhile<T, S extends T>(predicate: (data: T) => data is S, iterable: AnyIterable<T>): AsyncGenerator<S>;
declare function takeWhile<T>(predicate: (data: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>): AsyncGenerator<T>;
/**
 * Returns a new iterator that yields the data it consumes, passing the data through to a function. If you provide an async function, the iterator will wait for the promise to resolve before yielding the value. This is useful for logging, or processing information and passing it along.
 */
declare function tap<T>(func: (data: T) => any): (iterable: AnyIterable<T>) => AsyncGenerator<T>;
declare function tap<T>(func: (data: T) => any, iterable: AnyIterable<T>): AsyncGenerator<T>;
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
declare function throttle<T>(limit: number, interval: number): (iterable: AnyIterable<T>) => AsyncGenerator<T>;
declare function throttle<T>(limit: number, interval: number, iterable: AnyIterable<T>): AsyncGenerator<T>;
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
declare function time(config?: TimeConfig): <T, M extends AnyIterable<T>>(curriedIterable: M) => UnwrapAnyIterable<M>;
declare function time<T, M extends AnyIterable<T>>(config: TimeConfig, iterable: M): UnwrapAnyIterable<M>;
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
declare function fromStream<T>(stream: ReadableStreamish): AsyncIterable<T>;
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
declare function writeToStream(stream: WritableStreamish): (iterable: AnyIterable<any>) => Promise<void>;
declare function writeToStream(stream: WritableStreamish, iterable: AnyIterable<any>): Promise<void>;
/**
 * Creates a sync generator that yields numbers from `start` (inclusive) to `end` (exclusive) by `step`.
 *
 * ```ts
 * [...range(0, 5)]          // [0, 1, 2, 3, 4]
 * [...range(10, 0, -2)]     // [10, 8, 6, 4, 2]
 * ```
 */
declare function range(start: number, end: number, step?: number): Generator<number>;
/**
 * Yields `value` `count` times, or infinitely if `count` is omitted.
 *
 * ```ts
 * [...repeat('x', 3)]  // ['x', 'x', 'x']
 * ```
 */
declare function repeat<T>(value: T, count?: number): Generator<T>;
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
declare function interval(ms: number, limit?: number): AsyncGenerator<number>;
type UnzipIterables<T extends AnyIterable<any>[]> = {
    [K in keyof T]: T[K] extends AnyIterable<infer U> ? U : never;
};
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
declare function zip<T extends AnyIterable<any>[]>(...iterables: T): AsyncGenerator<UnzipIterables<T>>;
/**
 * Yields `[index, value]` pairs for each item in the iterable.
 *
 * ```ts
 * for await (const [i, val] of enumerate(['a', 'b', 'c'])) {
 *   console.log(i, val) // 0 'a', 1 'b', 2 'c'
 * }
 * ```
 */
declare function enumerate<T>(iterable: AnyIterable<T>): AsyncGenerator<[number, T]>;
/**
 * Like `reduce`, but yields the accumulated value after each step. Useful for running totals.
 *
 * ```ts
 * for await (const sum of scan((acc, x) => acc + x, 0, [1, 2, 3, 4])) {
 *   console.log(sum) // 1, 3, 6, 10
 * }
 * ```
 */
declare function scan<T, R>(fn: (acc: R, val: T) => R | Promise<R>, initial: R): (iterable: AnyIterable<T>) => AsyncGenerator<R>;
declare function scan<T, R>(fn: (acc: R, val: T) => R | Promise<R>, initial: R, iterable: AnyIterable<T>): AsyncGenerator<R>;
/**
 * Yields only unique values. An optional `keyFn` computes the identity key (defaults to identity).
 *
 * ```ts
 * for await (const val of distinct([1, 2, 2, 3, 1])) {
 *   console.log(val) // 1, 2, 3
 * }
 * ```
 */
declare function distinct<T>(keyFn?: (val: T) => any): (iterable: AnyIterable<T>) => AsyncGenerator<T>;
declare function distinct<T>(keyFn: (val: T) => any, iterable: AnyIterable<T>): AsyncGenerator<T>;
/**
 * Yields sliding windows of `size` items over the iterable.
 *
 * ```ts
 * for await (const w of window(3, [1, 2, 3, 4, 5])) {
 *   console.log(w) // [1,2,3], [2,3,4], [3,4,5]
 * }
 * ```
 */
declare function window<T>(size: number): (iterable: AnyIterable<T>) => AsyncGenerator<T[]>;
declare function window<T>(size: number, iterable: AnyIterable<T>): AsyncGenerator<T[]>;
/**
 * Yields consecutive `[prev, current]` pairs. Yields nothing if the iterable has fewer than 2 items.
 *
 * ```ts
 * for await (const [prev, curr] of pairwise([1, 2, 3, 4])) {
 *   console.log(prev, curr) // 1 2, 2 3, 3 4
 * }
 * ```
 */
declare function pairwise<T>(iterable: AnyIterable<T>): AsyncGenerator<[T, T]>;
/**
 * Infinitely cycles through the iterable by collecting values on the first pass and repeating.
 *
 * ```ts
 * for await (const val of take(7, cycle([1, 2, 3]))) {
 *   console.log(val) // 1, 2, 3, 1, 2, 3, 1
 * }
 * ```
 */
declare function cycle<T>(iterable: AnyIterable<T>): AsyncGenerator<T>;
/**
 * Eagerly splits an iterable into `[matching, nonMatching]` based on a predicate.
 *
 * ```ts
 * const [evens, odds] = await partition(x => x % 2 === 0, [1, 2, 3, 4, 5])
 * // evens: [2, 4], odds: [1, 3, 5]
 * ```
 */
declare function partition<T>(fn: (val: T) => boolean | Promise<boolean>): (iterable: AnyIterable<T>) => Promise<[T[], T[]]>;
declare function partition<T>(fn: (val: T) => boolean | Promise<boolean>, iterable: AnyIterable<T>): Promise<[T[], T[]]>;
interface EventEmitterLike {
    on(event: string, listener: (...args: any[]) => void): any;
    once(event: string, listener: (...args: any[]) => void): any;
    off(event: string, listener: (...args: any[]) => void): any;
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
declare function fromEvents<T = any>(emitter: EventEmitterLike, event: string, endEvent?: string): AsyncIterable<T>;
/**
 * Retries an async function up to `times` total attempts. Throws the last error if all fail.
 *
 * ```ts
 * const data = await retry(3, () => fetch('/api/data').then(r => r.json()))
 * ```
 */
declare function retry<T>(times: number, fn: () => T | Promise<T>): Promise<T>;
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
declare class FP<T> implements AsyncIterable<T> {
    #private;
    private constructor();
    /** Wrap any iterable or async iterable. */
    static from<T>(source: AnyIterable<T>): FP<T>;
    /** Create from a list of values. */
    static of<T>(...values: T[]): FP<T>;
    /** Number sequence — see `range()`. */
    static range(start: number, end: number, step?: number): FP<number>;
    /** Repeat a value — see `repeat()`. */
    static repeat<T>(value: T, count?: number): FP<T>;
    /** Async timer ticks — see `interval()`. */
    static interval(ms: number, limit?: number): FP<number>;
    /** Event emitter to async iterable — see `fromEvents()`. */
    static fromEvents<T = any>(emitter: EventEmitterLike, event: string, endEvent?: string): FP<T>;
    /** An empty iterable. */
    static empty<T = never>(): FP<T>;
    [Symbol.asyncIterator](): AsyncIterator<T>;
    map<R>(fn: (val: T) => R | Promise<R>): FP<R>;
    flatMap<R>(fn: (val: T) => FlatMapValue<R>): FP<NonNullable<R>>;
    filter<S extends T>(fn: (val: T) => val is S): FP<S>;
    filter(fn: (val: T) => boolean | Promise<boolean>): FP<T>;
    tap(fn: (val: T) => any): FP<T>;
    flatten(): FP<T extends AnyIterable<infer U> ? U : T>;
    scan<R>(fn: (acc: R, val: T) => R | Promise<R>, initial: R): FP<R>;
    take(count: number): FP<T>;
    takeLast(count: number): FP<T>;
    takeWhile(fn: (val: T) => boolean | Promise<boolean>): FP<T>;
    drop(count: number): FP<T>;
    batch(size: number): FP<T[]>;
    batchWithTimeout(size: number, timeout: number): FP<T[]>;
    window(size: number): FP<T[]>;
    buffer(size: number): FP<T>;
    transform<R>(concurrency: number, fn: (val: T) => R | Promise<R>): FP<R>;
    parallelMap<R>(concurrency: number, fn: (val: T) => R | Promise<R>): FP<R>;
    throttle(limit: number, intervalMs: number): FP<T>;
    concat(...others: AnyIterable<T>[]): FP<T>;
    merge(...others: AnyIterable<T>[]): FP<T>;
    zip<U>(other: AnyIterable<U>): FP<[T, U]>;
    enumerate(): FP<[number, T]>;
    distinct(keyFn?: (val: T) => any): FP<T>;
    pairwise(): FP<[T, T]>;
    cycle(): FP<T>;
    /** Collect all values into an array. */
    collect(): Promise<T[]>;
    /** Drain without collecting. */
    consume(): Promise<void>;
    /** Reduce to a single value. */
    reduce<R>(fn: (acc: R, val: T) => R, initial: R): Promise<R>;
    /** Split into [matching, nonMatching]. */
    partition(fn: (val: T) => boolean | Promise<boolean>): Promise<[T[], T[]]>;
    /** First value, or `undefined` if empty. */
    first(): Promise<T | undefined>;
    /** Last value, or `undefined` if empty. */
    last(): Promise<T | undefined>;
    /** First value matching predicate, or `undefined`. */
    find(fn: (val: T) => boolean | Promise<boolean>): Promise<T | undefined>;
    /** Index of first matching value, or `-1`. */
    findIndex(fn: (val: T) => boolean | Promise<boolean>): Promise<number>;
    /** True if any value satisfies the predicate. */
    some(fn: (val: T) => boolean | Promise<boolean>): Promise<boolean>;
    /** True if all values satisfy the predicate. */
    every(fn: (val: T) => boolean | Promise<boolean>): Promise<boolean>;
    /** Count all values. */
    count(): Promise<number>;
    /** Collect into a Map. Requires T to be `[K, V]` tuples. */
    toMap<K, V>(this: FP<[K, V]>): Promise<Map<K, V>>;
    /** Collect into a Set. */
    toSet(): Promise<Set<T>>;
}

export { type AnyIterable, type EventEmitterLike, FP, type FlatMapValue, type IDeferred, type Iterableish, type NullOrFunction, type ReadableStreamish, type TimeConfig, type UnArrayAnyIterable, type UnwrapAnyIterable, type UnwrapAnyIterableArray, type WritableStreamish, batch, batchWithTimeout, buffer, collect, concat, consume, cycle, distinct, drop, enumerate, filter, flatMap, flatTransform, flatten, fromEvents, fromStream, getIterator, interval, map, merge, pairwise, parallelFlatMap, parallelMap, parallelMerge, partition, pipeline, range, reduce, repeat, retry, scan, take, takeLast, takeWhile, tap, throttle, time, transform, window, writeToStream, zip };
