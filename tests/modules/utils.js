import test from 'ava'
import utils from '../../src/modules/utils'

test('flatten', t => {
  t.deepEqual(utils.flatten([[1], [2, 3]]), [1, 2, 3])
})

test('isPromiseLike', t => {
  t.is(isPromiseLike(Promise.resolve()) === true)
  t.is(isPromiseLike({then: () => null}) === true)
})

test('flatten', t => {
  t.deepEqual(utils.flatten([[1], [2, 3]]), [1, 2, 3])
})

