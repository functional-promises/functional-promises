import test from 'ava'
import FP from '../'

test('FP.thenIf(true)', t => FP.resolve(true)
  .thenIf(x => x, x => t.truthy(x), () => t.fail()))

test('FP.thenIf(false)', t => FP.resolve(false)
  .thenIf(x => x, () => t.fail(), x => t.falsy(x)))

test('FP.thenIf(true) short', t => FP.resolve(true)
  .thenIf(x => t.truthy(x)))

