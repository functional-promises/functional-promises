import { expect, test } from 'vitest'
import FP from '../../src/index'

test('Issue #102, Resolving multiple times: Promise behavior', async () => {
  const p = new Promise((resolve) => {
    resolve(42)
    resolve(-1)
  })

  const value = await p
  expect(value).toBe(42)
})

test('Issue #102, Resolving multiple times: FP behavior', async () => {
  const p = new FP((resolve: (value: number) => void) => {
    resolve(42)
    resolve(-1)
  })

  const value = await (p as any)
  expect(value).toBe(42)
})

test('Issue #102, Rejecting multiple times: Promise behavior', async () => {
  const p = new Promise((_, reject) => {
    reject(42)
    reject(-1)
  })

  await expect(p).rejects.toBe(42)
})

test('Issue #102, Rejecting multiple times: FP behavior', async () => {
  const p = new FP((_, reject: (value: number) => void) => {
    reject(42)
    reject(-1)
  })

  await expect(p as any).rejects.toBe(42)
})
