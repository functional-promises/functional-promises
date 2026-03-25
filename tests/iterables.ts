import { EventEmitter } from 'node:events'
import { Readable, Writable } from 'node:stream'
import { expect, test, vi } from 'vitest'
import {
  // streaming-iterables core
  batch, buffer, collect, concat, consume, drop,
  filter, flatten, flatMap, map, merge, pipeline,
  reduce, take, takeLast, takeWhile, tap,
  transform, parallelMap, getIterator,
  // v3 generators
  range, repeat, interval, zip, enumerate,
  scan, distinct, window, pairwise, cycle,
  partition, retry,
  // stream helpers (issue #16 — previously untested)
  batchWithTimeout, throttle, time, fromEvents, fromStream, writeToStream,
  flatTransform, parallelFlatMap, parallelMerge,
  // FP class
  FP,
} from '../src/iterables'

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
async function toArray<T>(it: AsyncIterable<T> | Iterable<T>): Promise<T[]> {
  const out: T[] = []
  for await (const v of it) out.push(v)
  return out
}

// ---------------------------------------------------------------------------
// range
// ---------------------------------------------------------------------------
test('range: ascending', () => {
  expect([...range(0, 5)]).toEqual([0, 1, 2, 3, 4])
})

test('range: step', () => {
  expect([...range(0, 10, 2)]).toEqual([0, 2, 4, 6, 8])
})

test('range: descending', () => {
  expect([...range(5, 0, -1)]).toEqual([5, 4, 3, 2, 1])
})

test('range: step=0 throws', () => {
  expect(() => [...range(0, 5, 0)]).toThrow(RangeError)
})

test('range: empty when start >= end with positive step', () => {
  expect([...range(5, 5)]).toEqual([])
})

// ---------------------------------------------------------------------------
// repeat
// ---------------------------------------------------------------------------
test('repeat: finite', () => {
  expect([...repeat('x', 3)]).toEqual(['x', 'x', 'x'])
})

test('repeat: zero count', () => {
  expect([...repeat('x', 0)]).toEqual([])
})

test('repeat: infinite (take first 4)', async () => {
  expect(await toArray(take(4, repeat(7)))).toEqual([7, 7, 7, 7])
})

// ---------------------------------------------------------------------------
// interval
// ---------------------------------------------------------------------------
test('interval: yields incrementing numbers', async () => {
  vi.useFakeTimers()
  const gen = interval(100, 3)
  const p = toArray(gen)
  await vi.runAllTimersAsync()
  expect(await p).toEqual([0, 1, 2])
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// zip
// ---------------------------------------------------------------------------
test('zip: equal length', async () => {
  expect(await toArray(zip([1, 2, 3], ['a', 'b', 'c']))).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
})

test('zip: stops at shortest', async () => {
  expect(await toArray(zip([1, 2, 3], ['a', 'b']))).toEqual([[1, 'a'], [2, 'b']])
})

test('zip: three iterables', async () => {
  expect(await toArray(zip([1, 2], [3, 4], [5, 6]))).toEqual([[1, 3, 5], [2, 4, 6]])
})

// ---------------------------------------------------------------------------
// enumerate
// ---------------------------------------------------------------------------
test('enumerate: adds index', async () => {
  expect(await toArray(enumerate(['a', 'b', 'c']))).toEqual([[0, 'a'], [1, 'b'], [2, 'c']])
})

test('enumerate: empty', async () => {
  expect(await toArray(enumerate([]))).toEqual([])
})

// ---------------------------------------------------------------------------
// scan
// ---------------------------------------------------------------------------
test('scan: running sum', async () => {
  expect(await toArray(scan((acc, x: number) => acc + x, 0, [1, 2, 3, 4]))).toEqual([1, 3, 6, 10])
})

test('scan: curried', async () => {
  const runningSum = scan((acc: number, x: number) => acc + x, 0)
  expect(await toArray(runningSum([1, 2, 3]))).toEqual([1, 3, 6])
})

test('scan: async reducer', async () => {
  const result = await toArray(scan(async (acc, x: number) => acc + x, 0, [10, 20]))
  expect(result).toEqual([10, 30])
})

// ---------------------------------------------------------------------------
// distinct
// ---------------------------------------------------------------------------
test('distinct: removes duplicates', async () => {
  expect(await toArray(distinct(undefined, [1, 2, 2, 3, 1]))).toEqual([1, 2, 3])
})

test('distinct: with keyFn', async () => {
  const items = [{ id: 1, v: 'a' }, { id: 2, v: 'b' }, { id: 1, v: 'c' }]
  const result = await toArray(distinct(x => x.id, items))
  expect(result).toEqual([{ id: 1, v: 'a' }, { id: 2, v: 'b' }])
})

test('distinct: curried', async () => {
  const dedup = distinct<number>()
  expect(await toArray(dedup([3, 3, 4]))).toEqual([3, 4])
})

// ---------------------------------------------------------------------------
// window
// ---------------------------------------------------------------------------
test('window: slides correctly', async () => {
  expect(await toArray(window(3, [1, 2, 3, 4, 5]))).toEqual([[1, 2, 3], [2, 3, 4], [3, 4, 5]])
})

test('window: size larger than input yields nothing', async () => {
  expect(await toArray(window(5, [1, 2]))).toEqual([])
})

test('window: curried', async () => {
  expect(await toArray(window<number>(2)([1, 2, 3]))).toEqual([[1, 2], [2, 3]])
})

// ---------------------------------------------------------------------------
// pairwise
// ---------------------------------------------------------------------------
test('pairwise: consecutive pairs', async () => {
  expect(await toArray(pairwise([1, 2, 3, 4]))).toEqual([[1, 2], [2, 3], [3, 4]])
})

test('pairwise: single item yields nothing', async () => {
  expect(await toArray(pairwise([42]))).toEqual([])
})

test('pairwise: empty yields nothing', async () => {
  expect(await toArray(pairwise([]))).toEqual([])
})

// ---------------------------------------------------------------------------
// cycle
// ---------------------------------------------------------------------------
test('cycle: repeats values', async () => {
  expect(await toArray(take(7, cycle([1, 2, 3])))).toEqual([1, 2, 3, 1, 2, 3, 1])
})

test('cycle: empty stays empty', async () => {
  expect(await toArray(take(3, cycle([])))).toEqual([])
})

// ---------------------------------------------------------------------------
// partition
// ---------------------------------------------------------------------------
test('partition: splits by predicate', async () => {
  const [evens, odds] = await partition(x => x % 2 === 0, [1, 2, 3, 4, 5])
  expect(evens).toEqual([2, 4])
  expect(odds).toEqual([1, 3, 5])
})

test('partition: async predicate', async () => {
  const [yes, no] = await partition(async x => x > 2, [1, 2, 3, 4])
  expect(yes).toEqual([3, 4])
  expect(no).toEqual([1, 2])
})

test('partition: curried', async () => {
  const splitEven = partition((x: number) => x % 2 === 0)
  const [evens] = await splitEven([10, 11, 12])
  expect(evens).toEqual([10, 12])
})

// ---------------------------------------------------------------------------
// retry
// ---------------------------------------------------------------------------
test('retry: succeeds on first try', async () => {
  const fn = vi.fn().mockResolvedValue('ok')
  expect(await retry(3, fn)).toBe('ok')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('retry: retries on failure, then succeeds', async () => {
  let calls = 0
  const fn = async () => {
    if (++calls < 3) throw new Error('not yet')
    return 'done'
  }
  expect(await retry(3, fn)).toBe('done')
  expect(calls).toBe(3)
})

test('retry: throws after all attempts exhausted', async () => {
  const fn = vi.fn().mockRejectedValue(new Error('always fails'))
  await expect(retry(3, fn)).rejects.toThrow('always fails')
  expect(fn).toHaveBeenCalledTimes(3)
})

// ---------------------------------------------------------------------------
// streaming-iterables core functions
// ---------------------------------------------------------------------------
test('batch: groups into arrays of size', async () => {
  expect(await toArray(batch(2, [1, 2, 3, 4, 5]))).toEqual([[1, 2], [3, 4], [5]])
})

test('collect: async iterable to array', async () => {
  async function* gen() { yield 1; yield 2; yield 3 }
  expect(await collect(gen())).toEqual([1, 2, 3])
})

test('collect: sync iterable to array', () => {
  expect(collect([1, 2, 3])).toEqual([1, 2, 3])
})

test('map: transforms each value', async () => {
  expect(await toArray(map(x => x * 2, [1, 2, 3]))).toEqual([2, 4, 6])
})

test('map: async transform', async () => {
  expect(await toArray(map(async x => x + 10, [1, 2]))).toEqual([11, 12])
})

test('filter: keeps matching values', async () => {
  expect(await toArray(filter(x => x % 2 === 0, [1, 2, 3, 4]))).toEqual([2, 4])
})

test('reduce: folds to single value', async () => {
  expect(await reduce((a, b) => a + b, 0, [1, 2, 3, 4, 5])).toBe(15)
})

test('flatten: flattens nested iterables', async () => {
  expect(await toArray(flatten([[1, 2], [3, [4, 5]]]))).toEqual([1, 2, 3, 4, 5])
})

test('flatMap: maps and flattens, drops nulls', async () => {
  const result = await toArray(flatMap(x => x > 2 ? [x, x * 10] : null, [1, 2, 3, 4]))
  expect(result).toEqual([3, 30, 4, 40])
})

test('take: limits items', async () => {
  async function* gen() { let i = 0; while (true) yield i++ }
  expect(await toArray(take(3, gen()))).toEqual([0, 1, 2])
})

test('takeLast: takes from the end', async () => {
  expect(await toArray(takeLast(3, [1, 2, 3, 4, 5]))).toEqual([3, 4, 5])
})

test('takeWhile: stops on false', async () => {
  expect(await toArray(takeWhile(x => x < 4, [1, 2, 3, 4, 5]))).toEqual([1, 2, 3])
})

test('drop: skips first N', async () => {
  expect(await toArray(drop(2, [1, 2, 3, 4]))).toEqual([3, 4])
})

test('tap: passes through values unchanged', async () => {
  const seen: number[] = []
  expect(await toArray(tap(x => seen.push(x), [1, 2, 3]))).toEqual([1, 2, 3])
  expect(seen).toEqual([1, 2, 3])
})

test('concat: chains iterables in order', async () => {
  expect(await toArray(concat([1, 2], [3, 4]))).toEqual([1, 2, 3, 4])
})

test('merge: interleaves iterables round-robin', async () => {
  const result = await toArray(merge([1, 3], [2, 4]))
  expect(result).toEqual([1, 2, 3, 4])
})

test('buffer: pre-fetches values', async () => {
  expect(await toArray(buffer(2, [1, 2, 3]))).toEqual([1, 2, 3])
})

test('transform: concurrent map by resolution order', async () => {
  const result = await toArray(transform(2, async x => x * 2, [1, 2, 3]))
  expect(result.sort()).toEqual([2, 4, 6])
})

test('parallelMap: preserves order', async () => {
  const result = await toArray(parallelMap(2, async x => x * 3, [1, 2, 3]))
  expect(result).toEqual([3, 6, 9])
})

test('pipeline: composes functions', async () => {
  const result = await pipeline(
    () => [1, 2, 3, 4, 5],
    (it) => filter(x => x % 2 === 0, it),
    (it) => collect(it),
  )
  expect(result).toEqual([2, 4])
})

test('getIterator: works on arrays', () => {
  const itr = getIterator([1, 2])
  expect(itr.next()).toEqual({ done: false, value: 1 })
})

// ---------------------------------------------------------------------------
// FP class — factory methods
// ---------------------------------------------------------------------------
test('FP.of: creates from values', async () => {
  expect(await FP.of(1, 2, 3).collect()).toEqual([1, 2, 3])
})

test('FP.from: wraps an iterable', async () => {
  expect(await FP.from([10, 20, 30]).collect()).toEqual([10, 20, 30])
})

test('FP.range: generates number sequence', async () => {
  expect(await FP.range(0, 5).collect()).toEqual([0, 1, 2, 3, 4])
})

test('FP.repeat: finite repetition', async () => {
  expect(await FP.repeat('x', 3).collect()).toEqual(['x', 'x', 'x'])
})

test('FP.empty: yields nothing', async () => {
  expect(await FP.empty().collect()).toEqual([])
})

// ---------------------------------------------------------------------------
// FP class — transform chain
// ---------------------------------------------------------------------------
test('FP: map + filter chain', async () => {
  const result = await FP.range(0, 10)
    .filter(x => x % 2 === 0)
    .map(x => x * x)
    .collect()
  expect(result).toEqual([0, 4, 16, 36, 64])
})

test('FP: tap does not alter values', async () => {
  const seen: number[] = []
  const result = await FP.of(1, 2, 3).tap(x => seen.push(x)).collect()
  expect(result).toEqual([1, 2, 3])
  expect(seen).toEqual([1, 2, 3])
})

test('FP: flatMap drops nulls and flattens', async () => {
  const result = await FP.of(1, 2, 3).flatMap(x => x > 1 ? [x, x * 10] : null).collect()
  expect(result).toEqual([2, 20, 3, 30])
})

test('FP: flatten', async () => {
  const result = await FP.of([1, 2], [3, 4]).flatten().collect()
  expect(result).toEqual([1, 2, 3, 4])
})

// ---------------------------------------------------------------------------
// FP class — slicing
// ---------------------------------------------------------------------------
test('FP.take', async () => {
  expect(await FP.range(0, 100).take(3).collect()).toEqual([0, 1, 2])
})

test('FP.takeLast', async () => {
  expect(await FP.range(0, 5).takeLast(2).collect()).toEqual([3, 4])
})

test('FP.takeWhile', async () => {
  expect(await FP.range(0, 10).takeWhile(x => x < 3).collect()).toEqual([0, 1, 2])
})

test('FP.drop', async () => {
  expect(await FP.of(1, 2, 3, 4, 5).drop(3).collect()).toEqual([4, 5])
})

// ---------------------------------------------------------------------------
// FP class — batching / windowing
// ---------------------------------------------------------------------------
test('FP.batch', async () => {
  expect(await FP.range(0, 5).batch(2).collect()).toEqual([[0, 1], [2, 3], [4]])
})

test('FP.window', async () => {
  expect(await FP.range(1, 5).window(3).collect()).toEqual([[1, 2, 3], [2, 3, 4]])
})

// ---------------------------------------------------------------------------
// FP class — utilities
// ---------------------------------------------------------------------------
test('FP.enumerate', async () => {
  expect(await FP.of('a', 'b', 'c').enumerate().collect()).toEqual([[0, 'a'], [1, 'b'], [2, 'c']])
})

test('FP.scan: running total', async () => {
  expect(await FP.of(1, 2, 3, 4).scan((acc, x) => acc + x, 0).collect()).toEqual([1, 3, 6, 10])
})

test('FP.distinct', async () => {
  expect(await FP.of(1, 2, 2, 3, 1).distinct().collect()).toEqual([1, 2, 3])
})

test('FP.pairwise', async () => {
  expect(await FP.of(1, 2, 3).pairwise().collect()).toEqual([[1, 2], [2, 3]])
})

test('FP.cycle + take', async () => {
  expect(await FP.of(1, 2).cycle().take(5).collect()).toEqual([1, 2, 1, 2, 1])
})

// ---------------------------------------------------------------------------
// FP class — combining
// ---------------------------------------------------------------------------
test('FP.concat', async () => {
  expect(await FP.of(1, 2).concat([3, 4]).collect()).toEqual([1, 2, 3, 4])
})

test('FP.zip', async () => {
  expect(await FP.of(1, 2, 3).zip(['a', 'b', 'c']).collect()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
})

// ---------------------------------------------------------------------------
// FP class — terminal operations
// ---------------------------------------------------------------------------
test('FP.consume: drains without result', async () => {
  const seen: number[] = []
  await FP.of(1, 2, 3).tap(x => seen.push(x)).consume()
  expect(seen).toEqual([1, 2, 3])
})

test('FP.reduce', async () => {
  expect(await FP.of(1, 2, 3, 4, 5).reduce((a, b) => a + b, 0)).toBe(15)
})

test('FP.first: returns first item', async () => {
  expect(await FP.of(10, 20, 30).first()).toBe(10)
})

test('FP.first: empty returns undefined', async () => {
  expect(await FP.empty().first()).toBeUndefined()
})

test('FP.last: returns last item', async () => {
  expect(await FP.of(10, 20, 30).last()).toBe(30)
})

test('FP.last: empty returns undefined', async () => {
  expect(await FP.empty().last()).toBeUndefined()
})

test('FP.find: returns match', async () => {
  expect(await FP.of(1, 2, 3, 4).find(x => x > 2)).toBe(3)
})

test('FP.find: no match returns undefined', async () => {
  expect(await FP.of(1, 2, 3).find(x => x > 99)).toBeUndefined()
})

test('FP.findIndex: returns index', async () => {
  expect(await FP.of(10, 20, 30).findIndex(x => x === 20)).toBe(1)
})

test('FP.findIndex: no match returns -1', async () => {
  expect(await FP.of(1, 2, 3).findIndex(x => x > 99)).toBe(-1)
})

test('FP.some: true when any match', async () => {
  expect(await FP.of(1, 2, 3).some(x => x === 2)).toBe(true)
})

test('FP.some: false when none match', async () => {
  expect(await FP.of(1, 2, 3).some(x => x > 99)).toBe(false)
})

test('FP.every: true when all match', async () => {
  expect(await FP.of(2, 4, 6).every(x => x % 2 === 0)).toBe(true)
})

test('FP.every: false when one fails', async () => {
  expect(await FP.of(2, 3, 6).every(x => x % 2 === 0)).toBe(false)
})

test('FP.count', async () => {
  expect(await FP.of(1, 2, 3, 4, 5).count()).toBe(5)
})

test('FP.partition: splits by predicate', async () => {
  const [evens, odds] = await FP.of(1, 2, 3, 4, 5).partition(x => x % 2 === 0)
  expect(evens).toEqual([2, 4])
  expect(odds).toEqual([1, 3, 5])
})

test('FP.toSet', async () => {
  expect(await FP.of(1, 2, 2, 3).toSet()).toEqual(new Set([1, 2, 3]))
})

test('FP.toMap: from tuple iterable', async () => {
  const m = await FP.of<[string, number]>(['a', 1], ['b', 2]).toMap()
  expect(m).toEqual(new Map([['a', 1], ['b', 2]]))
})

// ---------------------------------------------------------------------------
// FP class — for await...of protocol
// ---------------------------------------------------------------------------
test('FP: implements AsyncIterable directly', async () => {
  const results: number[] = []
  for await (const v of FP.range(0, 3)) results.push(v)
  expect(results).toEqual([0, 1, 2])
})

// ---------------------------------------------------------------------------
// FP class — concurrency
// ---------------------------------------------------------------------------
test('FP.transform: concurrent processing', async () => {
  const result = await FP.of(1, 2, 3).transform(2, async x => x * 2).collect()
  expect(result.sort((a, b) => a - b)).toEqual([2, 4, 6])
})

test('FP.parallelMap: preserves order', async () => {
  expect(await FP.of(1, 2, 3).parallelMap(2, async x => x * 3).collect()).toEqual([3, 6, 9])
})

test('FP.buffer: passes values through', async () => {
  expect(await FP.of(1, 2, 3).buffer(2).collect()).toEqual([1, 2, 3])
})

// ---------------------------------------------------------------------------
// Issue #16: previously-untested iterable functions
// ---------------------------------------------------------------------------

// --- batchWithTimeout ---
test('batchWithTimeout: flushes full batch immediately', async () => {
  vi.useFakeTimers()
  const gen = batchWithTimeout(3, 100, [1, 2, 3, 4, 5])
  const p = collect(gen)
  await vi.runAllTimersAsync()
  const result = await p
  expect(result).toEqual([[1, 2, 3], [4, 5]])
  vi.useRealTimers()
})

test('batchWithTimeout: flushes partial batch on timeout', async () => {
  vi.useFakeTimers()
  async function* slowItems() {
    yield 1
    yield 2
    await new Promise(r => setTimeout(r, 200)) // pause > timeout
    yield 3
  }
  const p = collect(batchWithTimeout(10, 50, slowItems()))
  await vi.runAllTimersAsync()
  const result = await p
  // First two items should flush after the 50ms timeout, then [3] at the end
  expect(result).toEqual([[1, 2], [3]])
  vi.useRealTimers()
})

// --- throttle ---
test('throttle: passes all values through in order', async () => {
  vi.useFakeTimers()
  const p = collect(throttle(2, 100, [1, 2, 3, 4, 5]))
  await vi.runAllTimersAsync()
  const result = await p
  expect(result).toEqual([1, 2, 3, 4, 5])
  vi.useRealTimers()
})

// --- time ---
test('time: passes values through unchanged', async () => {
  const result = await collect(time({}, [10, 20, 30]))
  expect(result).toEqual([10, 20, 30])
})

test('time: calls progress callback for each item', async () => {
  const deltas: Array<[number, number]> = []
  await collect(time({ progress: (delta) => deltas.push(delta) }, [1, 2, 3]))
  // _syncTime calls progress once per itr.next() call, including the final done:true
  // iteration, so for 3 items it fires at least 3 times (and at most 4).
  expect(deltas.length).toBeGreaterThanOrEqual(3)
  // hrtime tuples are [seconds, nanoseconds]
  for (const d of deltas) {
    expect(d).toHaveLength(2)
    expect(typeof d[0]).toBe('number')
    expect(typeof d[1]).toBe('number')
  }
})

test('time: calls total callback on completion', async () => {
  let totalTime: [number, number] | null = null
  await collect(time({ total: (t) => { totalTime = t } }, [1, 2, 3]))
  expect(totalTime).not.toBeNull()
  expect((totalTime as unknown as [number, number])).toHaveLength(2)
})

// --- fromEvents ---
test('fromEvents: collects values from EventEmitter', async () => {
  const emitter = new EventEmitter()
  const iterable = fromEvents<number>(emitter, 'data')

  setTimeout(() => {
    emitter.emit('data', 1)
    emitter.emit('data', 2)
    emitter.emit('data', 3)
    emitter.emit('end')
  }, 0)

  expect(await collect(take(3, iterable))).toEqual([1, 2, 3])
})

test('fromEvents: stops on custom end event', async () => {
  const emitter = new EventEmitter()
  const iterable = fromEvents<string>(emitter, 'msg', 'done')

  setTimeout(() => {
    emitter.emit('msg', 'hello')
    emitter.emit('done')
  }, 0)

  const result = await collect(iterable)
  expect(result).toEqual(['hello'])
})

// --- fromStream ---
test('fromStream: reads a Node.js Readable stream', async () => {
  const readable = Readable.from(['chunk1', 'chunk2', 'chunk3'])
  const result = await collect(fromStream<string>(readable))
  expect(result).toEqual(['chunk1', 'chunk2', 'chunk3'])
})

// --- writeToStream ---
test('writeToStream: writes iterable to a Writable stream', async () => {
  const written: string[] = []
  const writable = new Writable({
    write(chunk, _encoding, cb) {
      written.push(chunk.toString())
      cb()
    },
  })
  await writeToStream(writable, ['a', 'b', 'c'])
  expect(written).toEqual(['a', 'b', 'c'])
})

test('writeToStream: curried form', async () => {
  const written: string[] = []
  const writable = new Writable({
    write(chunk, _encoding, cb) { written.push(chunk.toString()); cb() },
  })
  const writer = writeToStream(writable)
  await writer(['x', 'y'])
  expect(written).toEqual(['x', 'y'])
})

// --- flatTransform ---
test('flatTransform: concurrent flat-map by resolution order', async () => {
  const result = await collect(flatTransform(2, async (x: number) => [x, x * 10], [1, 2, 3]))
  expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 10, 20, 30])
})

// --- parallelFlatMap ---
test('parallelFlatMap: order-preserving concurrent flat-map', async () => {
  const result = await collect(parallelFlatMap(2, async (x: number) => [x, x * 10], [1, 2, 3]))
  expect(result).toEqual([1, 10, 2, 20, 3, 30])
})

// --- parallelMerge ---
test('parallelMerge: yields values as they resolve across all iterables', async () => {
  async function* slow() { yield await Promise.resolve(1); yield await Promise.resolve(3) }
  async function* fast() { yield await Promise.resolve(2); yield await Promise.resolve(4) }
  const result = await collect(parallelMerge(slow(), fast()))
  // Order is first-ready-first-out so just check all values present
  expect(result.sort()).toEqual([1, 2, 3, 4])
})

// --- FP.batchWithTimeout (fluent) ---
test('FP.batchWithTimeout: flushes on size and timeout', async () => {
  vi.useFakeTimers()
  const p = FP.of(1, 2, 3, 4, 5).batchWithTimeout(3, 100).collect()
  await vi.runAllTimersAsync()
  const result = await p
  expect(result).toEqual([[1, 2, 3], [4, 5]])
  vi.useRealTimers()
})

// --- FP.throttle (fluent) ---
test('FP.throttle: passes all values through', async () => {
  vi.useFakeTimers()
  const p = FP.of(1, 2, 3).throttle(2, 100).collect()
  await vi.runAllTimersAsync()
  const result = await p
  expect(result).toEqual([1, 2, 3])
  vi.useRealTimers()
})

// --- FP.merge (fluent) ---
test('FP.merge: interleaves round-robin', async () => {
  const result = await FP.of(1, 3).merge([2, 4]).collect()
  expect(result).toEqual([1, 2, 3, 4])
})
