const test = require('ava').default
const FP = require('../src').default
// const FP = require('../index.d.ts')
const chalk = require('chalk').default

/// <reference types="../index.d.ts" />

test('Can FP.quiet() Error', t => {
  t.plan(1)
  return FP.resolve([1, 2, 3, 4])
    .quiet(42)
    .map((n) => {
      if (n === 4) {
        return Promise.reject(new TypeError('#4 found, dummy error!'))
      }
      return n
    })
    .then((results) => {
      t.truthy(results[3] instanceof TypeError)
    })
    .catch(err => {
      console.warn(chalk.yellowBright`ERR:`, err.message)
      t.fail('shouldnt get here')
    })
})

test('Can FP.quiet(1) + 2 errors trigger .catch()', t => {
  return FP.resolve([1, 2, 3, 4])
    .quiet(1)
    .map((n) => {
      if (n <= 3) {
        throw new TypeError(n + ' Found #3 or #4 found, dummy error!')
      }
      return n
    })
    .then((results) => t.fail('shouldn\'t get here'))
    .catch(() => t.pass('overflowed .quiet() w/ errors.'))
})

test('Can FP.quiet() swallow Errors', t => {
  return FP.resolve([1, 2, 3, 4])
    .quiet(1)
    .map((n) => {
      if (n === 4) { throw new TypeError('#4 found, dummy error!') }
      return n
    })
    .then((results) => {
      t.truthy(results[3] instanceof TypeError)
    })
    .catch(err => {
      console.log(chalk.cyanBright`FAILED TO QUIET ERROR:`, err)
      t.fail('shouldnt get here')
    })
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

test('Can override .catch() w/ .chain()', t => {
  const pipeline = FP.chain()
    .map(() => FP.reject(new Error('Fail!')))
    .chainEnd()

  return pipeline([1])
    .then(result => {
      // console.log(result)
      t.fail('FAIL: unexpected .then hit')
    })
    .catch(() => t.pass('Testing Expected Error'))
})

test('Can override .catch() w/ .chain().quiet()', t => {
  const pipeline = FP.chain()
    .quiet(3)
    .map(() => FP.reject(new Error('Fail!')))
    .chainEnd()

  return Promise.all([
    pipeline([1])
      .then(() => t.pass('Silenced err correctly!'))
      .catch(() => t.fail('Error failed .quiet()')),
    pipeline([1, 2, 3 ,4])
      .then(() => t.fail('FAIL: Should have fired a .catch()!'))
      .catch(() => t.pass('Success: Exceeded .quiet() error limit'))
  ])
})
