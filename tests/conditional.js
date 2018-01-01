const test = require('ava')
const FR = require('../src')

test('FP.thenIf(true)', t => {
  return FR.resolve(true)
    .thenIf(x => x, x => t.truthy(x), () => t.fail())

})

test('FP.thenIf(false)', t => {
  return FR.resolve(false)
    .thenIf(x => x, () => t.fail(), x => t.falsy(x))

})

test('FP.thenIf(true) short', t => {
  return FR.resolve(true)
    .thenIf(x => t.truthy(x))
})

