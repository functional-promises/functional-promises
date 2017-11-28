const test = require('ava')
const FR = require('../')
const {once, functions} = require('lodash')

test('Functional River: .resolve', t => {
  // console.log('FR:', Object.keys(FR))
  // console.log('FR:', Object.keys(FR.resolve()))
  return FR.resolve(true)
    .then(x => t.truthy(x))
})

test('Functional River: .resolve(false)', t => {
  const p = FR.resolve(false)
  console.log('FR:', functions(p))
  console.log('FR:', functions(FR))
  return FR.resolve(false)
    .then(x => t.falsy(x))
})
