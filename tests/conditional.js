const test = require('ava')
const FR = require('../src')

test('Functional River: .thenIf(true)', t => {
  return FR.resolve(true)
    .thenIf(x => x, x => t.truthy(x), () => t.fail())

})

test('Functional River: .thenIf(false)', t => {
  return FR.resolve(false)
    .thenIf(x => x, () => t.fail(), x => t.falsy(x))

})

test('Functional River: .thenIf(true) short', t => {
  return FR.resolve(true)
    .thenIf(x => t.truthy(x))
})

