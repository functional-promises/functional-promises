const path = require('path')
const test = require('ava')
const FR = require('../src')

test('FP.resolve(true)', t => {
  return FR.resolve(true)
    .then(x => t.truthy(x))
})

test('FP.resolve(false)', t => {
  return FR.resolve(false)
    .then(x => t.falsy(x))
})

test('FP.promisify', t => {
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

test('FP.promisifyAll', t => {
  const fs = FR.promisifyAll(require('fs'));
  // now `readFile` will return a promise rather than a cb
  return fs.readFileAsync(path.resolve(__dirname, '../package.json'), 'utf8')
    .then(data => {
      data = typeof data === 'string' ? JSON.parse(data) : data
      t.truthy(data.name)
      t.truthy(data.version)
      t.truthy(data.license === 'MIT')
    })
})

