import { expect, test } from 'vitest'
import FP from '../src/index'

test('FP.map(x * 2)', () =>
  FP.resolve([1, 2, 3, 4, 5])
    .map((x: number) => x * 2)
    .then((results: unknown) => expect(results).toEqual([2, 4, 6, 8, 10])))

test('FP.map(x * 2).map(x * 2)', () =>
  FP.resolve([1, 2, 3, 4, 5])
    .map((x: number) => Number(x) * 2)
    .map((x: number) => Number(x) * 2)
    .then((results: unknown) => expect(results).toEqual([4, 8, 12, 16, 20])))

test('[...Promise].map(x * 4)', () =>
  FP.resolve([FP.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
    .map((x: unknown) => Number(x) * 4)
    .then((results: unknown) => expect(results).toEqual([4, 8, 12, 16, 20])))

test('FP.flatMap(x * 2)', () =>
  FP.resolve([[1, 2], [3, 4]])
    .flatMap((x: unknown) => x)
    .then((results: unknown) => expect(results).toEqual([1, 2, 3, 4])))

test('[...Promise].flatMap(f(x) * 2)', () =>
  FP.resolve([FP.resolve([1, 2]), FP.resolve([3, 4])])
    .flatMap((x: unknown) => x)
    .then((results: unknown) => expect(results).toEqual([1, 2, 3, 4])))

test('FP.flatMap(f(x) * 2)', () =>
  FP.resolve([1, 3])
    .flatMap((x: number) => [x, x + 1])
    .then((results: unknown) => expect(results).toEqual([1, 2, 3, 4])))

test('FP.reduce(sum)', () =>
  FP.resolve([1, 2, 3, 4, 5])
    .reduce((total: number, n: number) => total + n, 0)
    .then((results: unknown) => expect(results).toBe(15)))

test('FP.filter(predicate)', () => {
  const isEven = (x: number) => x % 2 === 0
  return FP.resolve([1, 2, 3, 4, 5])
    .filter(isEven)
    .then((results: unknown) => expect(results).toEqual([2, 4]))
})

test('FP.find(predicate)', () => {
  const isEven = (x: number) => x % 2 === 0
  return FP.resolve([1, 2, 3, 4, 5])
    .find(isEven)
    .then((results: unknown) => expect(results).toEqual(2))
})

test('FP.findIndex', () => {
  const rawData = [-99, null, undefined, Number.NaN, 20, 40, 50, '99']
  return FP.resolve(rawData)
    .map((x: unknown) => Number(x))
    .findIndex((n: number) => n >= 50)
    .then((index: unknown) => expect(index).toBe(6))
})

test('FP.findIndex, no match', () => {
  const rawData = [-99, null, undefined, Number.NaN, 20, 40, 50, '99']
  return FP.resolve(rawData)
    .map((x: unknown) => Number(x))
    .findIndex((n: number) => n >= 99999)
    .then((index: unknown) => expect(index).toBe(-1))
})

test('FP.map handles invalid input arguments', async () => {
  await expect(
    FP.resolve(undefined as unknown)
      .map(() => {
        throw new Error('Should not be called')
      })
      .then(() => {
        throw new Error("Shouldn't get here!")
      })
  ).rejects.toMatchObject({
    message: expect.stringContaining('Value must be iterable'),
    name: 'FPInputError',
  })
})

test('FP.map handles first exception correctly', async () => {
  const throwThings = async () => {
    throw new Error('🔪🔪🔪🔪🔪🔪🔪')
  }

  await expect(
    FP.resolve([1, 2, 3])
      .map(throwThings)
      .then(() => {
        throw new Error("Shouldn't get here!")
      })
  ).rejects.toMatchObject({
    name: 'Error',
    message: expect.stringContaining('🔪'),
  })
})

test('FP.map handles multiple exceptions', async () => {
  const throwThings = async () => {
    throw new Error('🔪🔪🔪🔪🔪🔪🔪')
  }

  await expect(
    FP.resolve([1, 2, 3])
      .quiet(2)
      .map(throwThings)
      .then(() => {
        throw new Error("Shouldn't get here!")
      })
  ).rejects.toMatchObject({
    name: 'FPCollectionError',
    errors: expect.any(Array),
  })
})

test('Can FP.quiet(42) Error', async () => {
  const results = await FP.resolve([1, 2, 3, 4])
    .quiet(42)
    .map((n: number) => {
      if (n === 4) {
        return Promise.reject(new TypeError('#4 found, dummy error!'))
      }
      return n
    })

  expect((results as unknown[])[3]).toBeInstanceOf(TypeError)
})

test('Can FP.quiet(1) + 2 errors trigger .catch()', async () => {
  await expect(
    FP.resolve([1, 2, 3, 4])
      .quiet(1)
      .map((n: number) => {
        if (n <= 3) {
          throw new TypeError(`${n} Found #3 or #4 found, dummy error!`)
        }
        return n
      })
  ).rejects.toMatchObject({
    name: 'FPCollectionError',
    errors: expect.any(Array),
  })
})

test('Can FP.quiet() swallow Errors', async () => {
  const results = await FP.resolve([1, 2, 3, 4])
    .quiet(1)
    .map((n: number) => {
      if (n === 4) {
        throw new TypeError('#4 found, dummy error!')
      }
      return n
    })

  expect((results as unknown[])[3]).toBeInstanceOf(TypeError)
})

// ---------------------------------------------------------------------------
// Issue 17: map() falsy values, quiet() boundaries, concurrency order
// ---------------------------------------------------------------------------

test('FP.map() with falsy mapped values (0, false, null)', () =>
  FP.resolve([1, 2, 3, 4])
    .map((n: number) => {
      if (n === 1) return 0
      if (n === 2) return false
      if (n === 3) return null
      return n
    })
    .then((results: unknown) => expect(results).toEqual([0, false, null, 4])))

test('FP.map() on empty array', () =>
  FP.resolve([])
    .map((x: unknown) => x)
    .then((results: unknown) => expect(results).toEqual([])))

test('FP.quiet(1) with exactly 1 error does not reject', async () => {
  const results = await FP.resolve([1, 2, 3])
    .quiet(1)
    .map((n: number) => {
      if (n === 1) throw new Error('one error')
      return n * 2
    })
  expect((results as unknown[])[0]).toBeInstanceOf(Error)
  expect((results as unknown[])[1]).toBe(4)
  expect((results as unknown[])[2]).toBe(6)
})

test('FP.quiet(1) with 2 errors rejects with FPCollectionError', async () => {
  await expect(
    FP.resolve([1, 2, 3])
      .quiet(1)
      .map((n: number) => { if (n <= 2) throw new Error(`error ${n}`); return n })
  ).rejects.toMatchObject({ name: 'FPCollectionError' })
})

test('FP.map() with concurrency(1) preserves order', () =>
  FP.resolve([3, 1, 2])
    .concurrency(1)
    .map((n: number) => n * 10)
    .then((results: unknown) => expect(results).toEqual([30, 10, 20])))
