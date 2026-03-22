import path from 'node:path'
import { expect, test } from 'vitest'
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

test('FP.delay()', async () => {
  const started = Date.now()
  await FP.resolve([1, 2, 3])
    .concurrency(1)
    .map(() => FP.resolve(Date.now()).delay(5))
  expect(Date.now() - started).toBeGreaterThanOrEqual(15)
})

test('FP.delay() - static usage', async () => {
  const started = Date.now()
  await FP.resolve([1, 2, 3])
    .concurrency(1)
    .map(() => FP.delay(5).then(() => Date.now()))
  expect(Date.now() - started).toBeGreaterThanOrEqual(15)
})

test('FP.delay() with .concurrency(Infinity)', async () => {
  const started = Date.now()
  await FP.resolve([1, 2, 3, 4])
    .concurrency(Infinity)
    .map((num: number) => FP.resolve(num).delay(50))
  expect(Date.now() - started).toBeGreaterThanOrEqual(45)
})

test('FP.delay() with .concurrency(10)', async () => {
  const started = Date.now()
  await FP.resolve([1, 2, 3, 4])
    .concurrency(10)
    .map((num: number) => FP.resolve(num).delay(50))
  expect(Date.now() - started).toBeGreaterThanOrEqual(45)
})

test('FP.delay() with .concurrency(1)', async () => {
  const started = Date.now()
  await FP.resolve([1, 2, 3, 4])
    .concurrency(1)
    .map((num: number) => FP.resolve(num).delay(50))
  expect(Date.now() - started).toBeGreaterThan(50)
})
