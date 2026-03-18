import { expect, test } from 'vitest'
import FP from '../src/index'

test('FP.concurrency()', () => {
  const squareAndFormatDecimal = FP.chain()
    .concurrency(100)
    .map((x: number) => x * x)
    .concurrency(2)
    .map((x: number) => parseFloat(`${x}`).toFixed(2))
    .chainEnd()

  return squareAndFormatDecimal([5, 10, 20]).then((num: unknown) => {
    expect(num).toEqual(['25.00', '100.00', '400.00'])
  })
})

test('FP.concurrency(Infinity)', () => {
  const squareAndFormatDecimal = FP.chain()
    .concurrency(Infinity)
    .map((x: number) => x * x)
    .chainEnd()

  return squareAndFormatDecimal([5, 10, 20]).then((num: unknown) => {
    expect(num).toEqual([25, 100, 400])
  })
})
