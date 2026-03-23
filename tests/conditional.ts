import { expect, test } from 'vitest'
import FP from '../src/index'

test('FP.thenIf(true)', () => FP.resolve(true)
  .thenIf(x => x, x => expect(x).toBeTruthy(), () => {
    throw new Error('Expected truthy branch')
  }))

test('FP.thenIf(false)', () => FP.resolve(false)
  .thenIf(x => x, () => {
    throw new Error('Expected falsey branch')
  }, x => expect(x).toBeFalsy()))

test('FP.thenIf(true) short', () => FP.resolve(true)
  .thenIf(x => expect(x).toBeTruthy()))

// ---------------------------------------------------------------------------
// tapIf — issue #15: was completely untested
// ---------------------------------------------------------------------------

test('tapIf: runs side-effect when condition is true', async () => {
  let called = false
  const result = await FP.resolve(42).tapIf(
    (v: number) => v > 0,
    () => { called = true },
  )
  expect(called).toBe(true)
  // tapIf must pass the original value through unchanged
  expect(result).toBe(42)
})

test('tapIf: skips side-effect when condition is false', async () => {
  let called = false
  const result = await FP.resolve(-1).tapIf(
    (v: number) => v > 0,
    () => { called = true },
  )
  expect(called).toBe(false)
  expect(result).toBe(-1)
})

test('tapIf: runs ifFalse branch when condition is false', async () => {
  let trueCalled = false
  let falseCalled = false
  const result = await FP.resolve('hello').tapIf(
    (v: string) => v === 'goodbye',
    () => { trueCalled = true },
    () => { falseCalled = true },
  )
  expect(trueCalled).toBe(false)
  expect(falseCalled).toBe(true)
  expect(result).toBe('hello')
})

test('tapIf: return value from handler is ignored — original value passes through', async () => {
  const result = await FP.resolve({ x: 1 }).tapIf(
    () => true,
    (v: any) => ({ ...v, y: 2 }), // returning a modified object should have no effect
  )
  // tapIf is a tap — mutations in the handler are ignored; original value returned
  expect(result).toEqual({ x: 1 })
})

test('tapIf: async predicate supported', async () => {
  let called = false
  await FP.resolve(10).tapIf(
    async (v: number) => v > 5,
    () => { called = true },
  )
  expect(called).toBe(true)
})

test('tapIf: single-argument form treats arg as ifTrue handler', async () => {
  let called = false
  const result = await FP.resolve(99).tapIf(() => { called = true })
  expect(called).toBe(true)
  expect(result).toBe(99)
})
