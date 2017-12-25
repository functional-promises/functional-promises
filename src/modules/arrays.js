const isArrayLike = require('lodash/isArrayLike')
const {isPromiseLike} = require('./utils')
const {FunctionalError, FRUnexpectedError,
  FRInputError, FunctionalUserError} = require('./errors')

module.exports = function _init(FR) {
  Object.assign(FR.prototype, {map, series})

  function series(array, fn, thisArg) {
    thisArg = thisArg || this
    return [...array]
    .reduce((promise, ...args) => promise
      .then(results => fn.apply(thisArg, args)
        .then(result => results.concat(result))
    ), Promise.resolve([]))
  }

  // eslint max-statements 29
  function map(args, fn, options) {
    if (arguments.length === 1 && this && this._FR) {
      fn = args
      args = this && this._FR && this._FR.promise
    }
    var count = 0
    const results     = []
    const threadPool  = new Set()
    const setResult   = index => value => {
      results[index]  = value
      return value
    }
    const nextItem    = (c) => {
      const result = [args[c], c];
      if (result[0] && typeof result[0].then === 'function') {
        result[0] = result[0].then(val => fn(val, c, args))
      } else {
        result[0] = fn(result[0], c, args)
      }
      count++
      return result
    }
    const threadLimit = this && this._FR && this._FR.concurrencyLimit || Infinity
    const innerValues = this && this._FR && this._FR.promise ? this._FR.promise : Promise.resolve(args)

    return FR.resolve(innerValues.then(items => {
      if (!isArrayLike(items)) throw new FRInputError('Invalid input data passed into FR.map()')
      args = [...items]

      while (count < args.length) {
        console.warn('count=', count, 'threadPool=', threadPool.size, 'args.length=', args.length)
        while (count < args.length && threadPool.size <= threadLimit) {
          let [next, nextIndex] = nextItem(count)
          console.log('  next', nextIndex, next)
          if (isPromiseLike(next)) {
            console.warn('    count=', count, 'nextIndex=', nextIndex, 'args.length=', args.length)
            threadPool.add(next)
            next
              .then(setResult(nextIndex))
              .then(() => {
                threadPool.delete(next)
              })
          } else {
            // console.warn('    not p-like:', nextIndex, next)
            setResult(nextIndex)(next)
          }
        }
      }
      return results
    }))
  }
}
