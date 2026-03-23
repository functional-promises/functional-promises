import path from 'node:path'
import { expect, test, vi } from 'vitest'
import FP from '../src/index'

test('FP.resolve(true)', () => FP.resolve(true).then((x: boolean) => expect(x).toBeTruthy()))

test('FP.resolve(false)', () => FP.resolve(false).then((x: boolean) => expect(x).toBeFalsy()))

test('FP.all(Object)', () =>
  FP.all({
    one: Promise.resolve(1),
    two: Promise.resolve(2),
  }).then((results: unknown) => expect(results).toEqual({ one: 1, two: 2 })))

test('FP.all(Array)', () =>
  FP.all([Promise.resolve(1), Promise.resolve(2)]).then((results: unknown) => expect(results).toEqual([1, 2])))

test('FP.promisify(fn)', async () => {
  const readFile = FP.promisify(require('node:fs').readFile)
  const data = await readFile(path.resolve(__dirname, '../package.json'), 'utf8')
  const pkg = typeof data === 'string' ? JSON.parse(data) : data
  expect(pkg.name).toBeTruthy()
  expect(pkg.version).toBeTruthy()
  expect(pkg.license).toBe('MIT')
})

test('FP.promisifyAll(obj)', async () => {
  const fs = FP.promisifyAll(require('node:fs'))
  const data = await fs.readFileAsync(path.resolve(__dirname, '../package.json'), 'utf8')
  const pkg = typeof data === 'string' ? JSON.parse(data) : data
  expect(pkg.name).toBeTruthy()
  expect(pkg.version).toBeTruthy()
  expect(pkg.license).toBe('MIT')
})

test('FP.unpack() resolve', async () => {
  const asyncFunc = () => {
    const { promise, resolve } = FP.unpack()
    Promise.resolve(true).then((x) => resolve(x))
    return promise
  }

  await expect(asyncFunc()).resolves.toBeTruthy()
})

test('FP.unpack() reject', async () => {
  const asyncFunc = () => {
    const { promise, reject } = FP.unpack()
    Promise.resolve('Error!').then((x) => reject(x))
    return promise
  }

  await expect(asyncFunc()).rejects.toBeTruthy()
})

// ---------------------------------------------------------------------------
// Issue #18: timing tests replaced with fake timers to eliminate flakiness.
// The original assertions used real clock measurements (Date.now()) which are
// inherently non-deterministic under load or on slow CI runners.
// ---------------------------------------------------------------------------

test('FP.delay() — sequential delays accumulate', async () => {
  vi.useFakeTimers()
  try {
    const items = [1, 2, 3]
    let resolved = false
    const p = FP.resolve(items)
      .concurrency(1)
      .map(() => FP.resolve(Date.now()).delay(50))
      .then(() => { resolved = true })

    // Before any timer fires, the promise should still be pending
    expect(resolved).toBe(false)

    // Advance past all three 50ms delays (150ms total, sequential with concurrency=1)
    await vi.advanceTimersByTimeAsync(160)
    await p
    expect(resolved).toBe(true)
  } finally {
    vi.useRealTimers()
  }
})

test('FP.delay() — static usage', async () => {
  vi.useFakeTimers()
  try {
    let resolved = false
    const p = FP.resolve([1, 2, 3])
      .concurrency(1)
      .map(() => FP.delay(50).then(() => Date.now()))
      .then(() => { resolved = true })

    expect(resolved).toBe(false)
    await vi.advanceTimersByTimeAsync(160)
    await p
    expect(resolved).toBe(true)
  } finally {
    vi.useRealTimers()
  }
})

test('FP.delay() with .concurrency(Infinity) — all delays run in parallel', async () => {
  vi.useFakeTimers()
  try {
    let resolved = false
    const p = FP.resolve([1, 2, 3, 4])
      .concurrency(Infinity)
      .map((num: number) => FP.resolve(num).delay(50))
      .then(() => { resolved = true })

    // All 4 items run in parallel, so only 50ms needed
    expect(resolved).toBe(false)
    await vi.advanceTimersByTimeAsync(55)
    await p
    expect(resolved).toBe(true)
  } finally {
    vi.useRealTimers()
  }
})

test('FP.delay() with .concurrency(10) — effectively parallel for 4 items', async () => {
  vi.useFakeTimers()
  try {
    let resolved = false
    const p = FP.resolve([1, 2, 3, 4])
      .concurrency(10)
      .map((num: number) => FP.resolve(num).delay(50))
      .then(() => { resolved = true })

    expect(resolved).toBe(false)
    await vi.advanceTimersByTimeAsync(55)
    await p
    expect(resolved).toBe(true)
  } finally {
    vi.useRealTimers()
  }
})

test('FP.delay() with .concurrency(1) — strictly sequential', async () => {
  vi.useFakeTimers()
  try {
    let resolved = false
    const p = FP.resolve([1, 2, 3, 4])
      .concurrency(1)
      .map((num: number) => FP.resolve(num).delay(50))
      .then(() => { resolved = true })

    // With concurrency=1, 4 * 50ms = 200ms minimum
    await vi.advanceTimersByTimeAsync(150)
    // Should still be pending after 150ms (only 3 of 4 done)
    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(60)
    await p
    expect(resolved).toBe(true)
  } finally {
    vi.useRealTimers()
  }
})
