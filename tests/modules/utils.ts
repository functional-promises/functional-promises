import { expect, test } from 'vitest'
import utils from '../../src/modules/utils'

test('flatten', () => {
  expect(utils.flatten([[1], [2, 3]])).toEqual([1, 2, 3])
})

test('isPromiseLike', () => {
  expect(utils.isPromiseLike(Promise.resolve())).toBe(true)
  expect(utils.isPromiseLike({})).toBe(false)
})

test('isFunction', () => {
  expect(utils.isFunction(() => null)).toBe(true)
})
