const path = require('path')
const test = require('ava')
const FR = require('../src')

test('Functional River: .map(x * 2)', t => {
  return FR.resolve([1, 2, 3, 4, 5])
    .map(x => x * 2)
    .then(results => {
      // console.warn('results', results)
      t.deepEqual(results, [2, 4, 6, 8, 10])
    })
})

test('Functional River: .map(x * 2).map(x * 2)', t => {
  return FR.resolve([1, 2, 3, 4, 5])
    .map(x => x * 2)
    .map(x => x * 2)
    .then(results => {
      // console.warn('results', results)
      t.deepEqual(results, [4, 8, 12, 16, 20])
    })
})

test('Functional River: [...Promise].map(x * 4)', t => {
  return FR.resolve([FR.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
    .map(x => x * 4)
    .then(results => {
      // console.warn('results', results)
      t.deepEqual(results, [4, 8, 12, 16, 20])
    })
})

test('Functional River: sum with .reduce()', t => {
  return FR.resolve([1, 2, 3, 4, 5])
    .reduce((total, n) => total + n, 0)
    .then(results => {
      t.is(results, 15)
    })
})

test('Functional River: [].filter()', t => {
  const isEven = x => x % 2 === 0

  return FR.resolve([1, 2, 3, 4, 5])
    .filter(isEven)
    .then(results => {
      t.deepEqual(results, [2, 4])
    })
})

test('Functional River: [].find()', t => {
  const isEven = x => x % 2 === 0

  return FR.resolve([1, 2, 3, 4, 5])
    .find(isEven)
    .then(results => {
      t.deepEqual(results, 2)
    })
})


