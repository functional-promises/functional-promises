const {isFunction, isArrayLike} = require('lodash')

function series(array, fn, thisArg) {
  return [...array]
  .reduce((promise, ...args) => promise
    .then(results => fn.apply(thisArg, args)
      .then(result => results.concat(result))
  ), Promise.resolve([]))
}


function map(args, fn) {
  if (!isArrayLike(args)) {
    throw new Error('FR.map requires a valid array argument')
  }
  if (!isFunction(fn)) {
    throw new Error('FR.map requires a valid callback function argument')
  }

  const threadPool = new Set()
  const threadLimit = (this && this._concurrencyLimit) || 1
  const queue = [...args]

  const queueStepper = item => {}

  const runQueue = () => {
    Array.from({length: threadLimit})
      .fill(null)
      .map(getNext)
      .map(processItem)
  }

  const getNext = () => (queue.length >= 1 ? queue.shift() : undefined)

  const processItem = item => {
    if (isFunction(item)) {
      return item()
    }
  }

  const promiseStepper = p => {
    threadPool.add(p)
    return p
      .then(val => {
        threadPool.delete(p)
        return v
      })
      .catch(err => {
        threadPool.delete(p)
        return Promise.reject(err)
      })
  }

  // return (...args) => {
  //   let result = fn(...args)

  //   while (typeof result === 'function') result = result()

  //   while (isPromiseLike(result)) {
  //     result = syncPromise(result)
  //   }

  //   return result
  // }
}
