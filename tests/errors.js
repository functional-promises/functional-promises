const test = require('ava')
const FP = require('../src')

test('Can .catch() thrown Errors', t => {
  return FP.resolve()
  .then(() => {throw new TypeError('Single toss')})
  .tap(() => t.fail('must skip to the .catch section!'))
  .catch(err => {
    t.truthy(err.message === 'Single toss')
  })
})

test('Can override .catch() result', t => {
  return FP.resolve()
  .then(() => {throw new TypeError('Single toss')})
  .tap(() => t.fail('must skip to the .catch section!'))
  .catch(err => ({message: 'temp error, plz try again', _err: err}))
  .then(data => t.truthy(data.message === 'temp error, plz try again'))
})

test('Can .catch(filterType, fn) filtering by Error type', t => {
  return FP.resolve()
  .then(() => {throw new Error('Oh noes')})
  .tap(() => t.fail('must skip to the .catch section!'))
  .catch(TypeError, () => t.fail('arg too specific for .catch(type)'))
  .catch(SyntaxError, () => t.fail('arg too specific for .catch(type)'))
  .catch(ReferenceError, () => t.fail('arg too specific for .catch(type)'))
  .catch(err => {
    t.truthy(err.message === 'Oh noes')
  })
})
