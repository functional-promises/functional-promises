const path = require('path')
const test = require('ava')
const FR = require('../')
const {once, functionsIn} = require('lodash')

test('Functional River: .resolve(true)', t => {
  return FR.resolve(true)
    .then(x => t.truthy(x))
})

test('Functional River: .resolve(false)', t => {
  const p = FR.resolve(false)
  // console.log('FR:', functions(p))
  // console.log('FR:', functions(FR))
  return FR.resolve(false)
    .then(x => t.falsy(x))
})

test('Functional River: .promisify', t => {
  const readFile = FR.promisify(require('fs').readFile);
  // now `readFile` will return a promise rather than a cb
  return readFile(path.resolve(__dirname, '../package.json'), 'utf8')
    .then(data => {
      data = typeof data === 'string' ? JSON.parse(data) : data
      t.truthy(data.name)
      t.truthy(data.version)
      t.truthy(data.license === 'MIT')
    })
})

test('Functional River: .promisifyAll', t => {
  const fs = FR.promisifyAll(require('fs'));
  // console.log('fs.readFileAsync', fs.readFileAsync)
  // console.error('promisifyAll: ', fs)
  // now `readFile` will return a promise rather than a cb
  return fs.readFileAsync(path.resolve(__dirname, '../package.json'), 'utf8')
    .then(data => {
      data = typeof data === 'string' ? JSON.parse(data) : data
      t.truthy(data.name)
      t.truthy(data.version)
      t.truthy(data.license === 'MIT')
    })
})


test('Functional River: .map(x * 2)', t => {
  return FR.resolve([1, 2, 3, 4, 5])
    .map(x => x * 2)
    .then(results => {
      console.warn('results', results)
      t.deepEqual(results, [2, 4, 6, 8, 10])
    })
})

test('Functional River: .resolve(true)', t => {
  return FR.resolve(true)
    .then(x => t.truthy(x))
})
