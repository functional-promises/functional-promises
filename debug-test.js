const test = require('tape')
const FP = require('./src')
const chalk = require('chalk').default

test('Can .quiet() swallow Errors', t => {
  t.plan(1)
  FP.resolve([1, 2, 3, 4])
  .quiet(2)
  .map((n, index) => {
    if (n === 4) { throw new TypeError(`${n}===4 - index===${index} (dummy error)`) }
    console.log(chalk.blueBright`#3: n===`, n)
    return n;
  })
  .then((results) => {
    console.log(chalk.magenta(' #3: RESULTS:'), results)
    t.ok(results[3].resolvedError instanceof TypeError)
  })
  .catch(err => {
    console.log(chalk.redBright` #3: ERROR:`, chalk.cyan(err.message), err)
    t.fail('shouldnt get here')
  })
})

test('Can .quiet() "swallow" Error', t => {
  return FP.resolve([1, 2, 3, 4])
  .quiet(10)
  .map((n) => {
    if (n === 4) {
      return Promise.reject(new TypeError('#4 found, dummy error!'))
    }
    return n;
  })
  .then((results) => {
    console.log(chalk.green`results`, results[3].resolvedError.message)
    t.ok(results[3].resolvedError instanceof TypeError)
  })
  .catch(err => {
    console.warn(chalk.red`err`, err.message)
    t.fail('shouldnt get here')
  })
  .then(x => t.end())
})

test('Can .quiet(1) + 2 errors trigger .catch()', t => {
  t.plan(1)
  FP.resolve([1, 2, 3, 4])
  .quiet(1)
  .map((n) => {
    if (n <= 3) {
      throw new TypeError(`n <= 3 --- n == ${n} --- dummy error!`)
    }
    return n;
  })
  .then((results) => t.fail('shouldnt get here'))
  .catch(err => t.pass('overflowed .quiet() w/ errors.'))
})

// test('Can .catch() thrown Errors', t => {
//   FP.resolve()
//   .then(() => {throw new TypeError('Single toss')})
//   .tap(() => t.fail('must skip to the .catch section!'))
//   .catch(err => t.ok(err.message === 'Single toss'))
//   .then(x => t.end())
// })

// test('Can override .catch() results', t => {
//   return FP.resolve()
//   .then(() => {throw new TypeError('Single toss')})
//   .tap(() => t.fail('must skip to the .catch section!'))
//   .catch(err => ({message: 'temp error, plz try again', _err: err}))
//   .then(data => t.ok(data.message === 'temp error, plz try again'))
//   .then(x => t.end())
// })

// test('Does .catchIf(filterType, fn) filtering by TypeError', t => {
//   return FP.resolve()
//   .then(() => {throw new Error('Oh noes')})
//   .tap(() => t.fail('must skip to the .catch section!'))
//   .catchIf(TypeError, () => t.fail('arg too specific for .catch(type)'))
//   .catchIf(SyntaxError, () => t.fail('arg too specific for .catch(type)'))
//   .catchIf(ReferenceError, () => t.fail('arg too specific for .catch(type)'))
//   .catch(err => t.ok(err.message === 'Oh noes'))
//   .then(x => t.end())
// })

// test('Does .catchIf(filterType, fn) skip negative tests', t => {
//   return FP.resolve()
//   .then(() => {throw new TypeError('Oh noes')})
//   .tap(() => t.fail('must skip to the .catch section!'))
//   .catchIf(ReferenceError, () => t.fail('arg too specific for .catch(type)'))
//   .catchIf(SyntaxError, () => t.fail('arg too specific for .catch(type)'))
//   .catchIf(TypeError, () => t.pass('successfully filtered .catch(type)'))
//   .catch(err => t.fail(err.message === 'Oh noes'))
//   .then(x => t.end())
// })


// test('Does .catch(filterType, fn) filtering by TypeError', t => {
//   return FP.resolve()
//   .then(() => {throw new Error('Oh noes')})
//   .tap(() => t.fail('must skip to the .catch section!'))
//   .catch(TypeError, () => t.fail('arg too specific for .catch(type)'))
//   .catch(SyntaxError, () => t.fail('arg too specific for .catch(type)'))
//   .catch(ReferenceError, () => t.fail('arg too specific for .catch(type)'))
//   .catch(err => t.ok(err.message === 'Oh noes'))
//   .then(x => t.end())
// })

// test('Does .catch(filterType, fn) skip negative tests', t => {
//   return FP.resolve()
//   .then(() => {throw new TypeError('Oh noes')})
//   .tap(() => t.fail('must skip to the .catch section!'))
//   .catch(ReferenceError, () => t.fail('arg too specific for .catch(type)'))
//   .catch(SyntaxError, () => t.fail('arg too specific for .catch(type)'))
//   .catch(TypeError, () => t.pass('successfully filtered .catch(type)'))
//   .catch(err => t.fail(err.message === 'Oh noes'))
//   .then(x => t.end())
// })

