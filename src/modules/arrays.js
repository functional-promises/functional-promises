const {isFunction, isArrayLike} = require('lodash')
const {isPromiseLike} = require('./utils')

module.exports = {map: map2, series, }
function series(array, fn, thisArg) {
  thisArg = thisArg || this
  return [...array]
  .reduce((promise, ...args) => promise
    .then(results => fn.apply(thisArg, args)
      .then(result => results.concat(result))
  ), Promise.resolve([]))
}

// eslint max-statements 29
async function map2(args, fn) {
  if (arguments.length === 1 && this && this._FR) {
    fn = args
    args = this && this._FR && this._FR.promise
  }
  var count = 0
  const threadPool  = new Set()
  const setResult   = index => value => {
    results[index] = value
    return value
  }
  const nextItem    = () => {
    const item = [fn(args[count], count, args), count]
    count++
    return item
  }
  const threadLimit = this && this._FR && this._FR.concurrencyLimit || Infinity
  const results     = []
  const innerValues = this && this._FR && this._FR.promise ? this._FR.promise : Promise.resolve(args)

  args = await innerValues

  console.warn('args', args)

  args = [...args]

  while (count < args.length) {
    console.warn('count=', count, 'threadPool=', threadPool.size, 'args.length=', args.length)
    while (count < args.length && threadPool.size < threadLimit) {
      let [next, nextIndex] = nextItem()
      console.warn('    count=', count, 'nextIndex=', nextIndex, 'args.length=', args.length)

      if (isPromiseLike(next)) {
        threadPool.add(next)
        next
          .then(setResult(nextIndex))
          .then(() => {
            threadPool.delete(next)
          })
      } else {
        setResult(nextIndex)(next)
      }
    }
    // if (count === )
  }
  return results
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
