const path = require('path')
const test = require('ava')
const FP = require('../src')

test('FP.resolve(true)', t => {
  return FP.resolve(true)
    .then(x => t.truthy(x))
})

test('FP.resolve(false)', t => {
  return FP.resolve(false)
    .then(x => t.falsy(x))
})

test('FP.promisify', t => {
  const readFile = FP.promisify(require('fs').readFile);
  // now `readFile` will return a promise rather than a cb
  return readFile(path.resolve(__dirname, '../package.json'), 'utf8')
    .then(data => {
      data = typeof data === 'string' ? JSON.parse(data) : data
      t.truthy(data.name)
      t.truthy(data.version)
      t.truthy(data.license === 'MIT')
    })
})

test('FP.promisifyAll', t => {
  const fs = FP.promisifyAll(require('fs'));
  // now `readFile` will return a promise rather than a cb
  return fs.readFileAsync(path.resolve(__dirname, '../package.json'), 'utf8')
    .then(data => {
      data = typeof data === 'string' ? JSON.parse(data) : data
      t.truthy(data.name)
      t.truthy(data.version)
      t.truthy(data.license === 'MIT')
    })
})

test('FP.unpack resolve', t => {
  const asyncFunc = () => {
    const { promise, resolve } = FP.unpack()
    Promise.resolve(true)
      .then(x => resolve(x))
    return promise
  }
  return asyncFunc()
    .then(x => t.truthy(x))
    .catch(err => t.fail())
})

test('FP.unpack reject', t => {
  const asyncFunc = () => {
    const { promise, reject } = FP.unpack()
    Promise.resolve('Error!')
      .then(x => reject(x))
    return promise
  }
  return asyncFunc()
    .then(x => t.fail())
    .catch(err => t.truthy(err))
})
