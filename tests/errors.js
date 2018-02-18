const test = require('ava')
const FP = require('../src')

test('Can .quiet() "swallow" Error', t => {
  return FP.resolve([1, 2, 3, 4])
  .quiet(10)
  .map((n) => {
    if (n === 4) {
      throw new TypeError('#4 found, dummy error!')
    }
    return n;
  })
  .then((results) => {
    t.truthy(results[3] instanceof TypeError)
  })
  .catch(err => {
    console.warn('err', err.message)
    t.fail('shouldnt get here')
  })
})

test('Can .quiet(1) + 2 errors trigger .catch()', t => {
  return FP.resolve([1, 2, 3, 4])
  .quiet(1)
  .map((n) => {
    if (n <= 3) {
      throw new TypeError('#3 or #4 found, dummy error!')
    }
    return n;
  })
  .then((results) => t.fail('shouldnt get here'))
  .catch(err => t.pass('overflowed .quiet() w/ errors.'))
})

test('Can .quiet() swallow Errors', t => {
  return FP.resolve([1, 2, 3, 4])
  .quiet(1)
  .map((n) => {
    if (n === 4) { throw new TypeError('#4 found, dummy error!') }
    return n;
  })
  .then((results) => {
    t.truthy(resolve[3] instanceof TypeError)
  })
  .catch(err => t.fail('shouldnt get here'))
})

test('Can .catch() thrown Errors', t => {
  return FP.resolve()
  .then(() => {throw new TypeError('Single toss')})
  .tap(() => t.fail('must skip to the .catch section!'))
  .catch(err => t.truthy(err.message === 'Single toss'))
})

test('Can override .catch() results', t => {
  return FP.resolve()
  .then(() => {throw new TypeError('Single toss')})
  .tap(() => t.fail('must skip to the .catch section!'))
  .catch(err => ({message: 'temp error, plz try again', _err: err}))
  .then(data => t.truthy(data.message === 'temp error, plz try again'))
})

test('Does .catchIf(filterType, fn) filtering by TypeError', t => {
  return FP.resolve()
  .then(() => {throw new Error('Oh noes')})
  .tap(() => t.fail('must skip to the .catch section!'))
  .catchIf(TypeError, () => t.fail('arg too specific for .catch(type)'))
  .catchIf(SyntaxError, () => t.fail('arg too specific for .catch(type)'))
  .catchIf(ReferenceError, () => t.fail('arg too specific for .catch(type)'))
  .catch(err => t.truthy(err.message === 'Oh noes'))
})

test('Does .catchIf(filterType, fn) skip negative tests', t => {
  return FP.resolve()
  .then(() => {throw new TypeError('Oh noes')})
  .tap(() => t.fail('must skip to the .catch section!'))
  .catchIf(ReferenceError, () => t.fail('arg too specific for .catch(type)'))
  .catchIf(SyntaxError, () => t.fail('arg too specific for .catch(type)'))
  .catchIf(TypeError, () => t.pass('successfully filtered .catch(type)'))
  .catch(err => t.fail(err.message === 'Oh noes'))
})


test('Does .catch(filterType, fn) filtering by TypeError', t => {
  return FP.resolve()
  .then(() => {throw new Error('Oh noes')})
  .tap(() => t.fail('must skip to the .catch section!'))
  .catch(TypeError, () => t.fail('arg too specific for .catch(type)'))
  .catch(SyntaxError, () => t.fail('arg too specific for .catch(type)'))
  .catch(ReferenceError, () => t.fail('arg too specific for .catch(type)'))
  .catch(err => t.truthy(err.message === 'Oh noes'))
})

test('Does .catch(filterType, fn) skip negative tests', t => {
  return FP.resolve()
  .then(() => {throw new TypeError('Oh noes')})
  .tap(() => t.fail('must skip to the .catch section!'))
  .catch(ReferenceError, () => t.fail('arg too specific for .catch(type)'))
  .catch(SyntaxError, () => t.fail('arg too specific for .catch(type)'))
  .catch(TypeError, () => t.pass('successfully filtered .catch(type)'))
  .catch(err => t.fail(err.message === 'Oh noes'))
})

