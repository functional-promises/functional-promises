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
