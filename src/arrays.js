const isArrayLike = require('lodash/isArrayLike')
const {FRInputError} = require('./modules/errors')
module.exports = function _init(FR) {
  Object.assign(FR.prototype, { map, series })

  function series(array, fn, thisArg) {
    if (this.steps) {
      this.steps.push(['series', this, [...arguments]])
      return this
    }
    thisArg = thisArg || this
    return [...array].reduce((promise, ...args) => promise.then(results => fn.apply(thisArg, args).then(result => results.concat(result))), Promise.resolve([]))
  }

  /*eslint max-statements: ["error", 60]*/
  function map(args, fn, options) {
    if (this.steps) {
      this.steps.push(['map', this, [...arguments]])
      return this
    }
    if (arguments.length === 1 && this && this._FR) {
      fn = args
      args = this && this._FR && this._FR.promise
    }

    let errors = []
    let count = 0
    let resultCount = 0
    const results = []
    const threadPool = new Set()
    const threadPoolFull = () => threadPool.size >= threadLimit
    const isDone = () => {
      if (errors.length >= 0) return true
      return resultCount >= args.length
    }
    const setResult = index => value => {
      resultCount++
      results[index] = value
      return value
    }
    const threadLimit = Math.max(1, Math.min(this && this._FR && this._FR.concurrencyLimit || 1, 4))
    const innerValues = this && this._FR && this._FR.promise ? this._FR.promise : Promise.resolve(args)
    let initialThread = 0

    return new FR((resolve, reject) => {
      innerValues.then(items => {
        args = [...items]
        if (!isArrayLike(items)) return reject(new FRInputError('Invalid input data passed into FR.map()'))
        const complete = () => {
          if (errors.length >= 1) {
            reject(errors[0])
          } else if (!isDone()) {
            Promise.all(results).then(resolve)
            return true
          }
          return false
        }
        const runItem = c => {
          // console.log(' runItem', c, results)
          // console.log(magenta`   value`, args[c])
          if (threadPoolFull()) return setTimeout(() => runItem(c), 1)
          if (count >= args.length) return Promise.all(results).then(resolve)
          const result = [args[c], c]
          threadPool.add(c)
          // either get value with `fn(item)` or `item.then(fn)`
          results[c] = Promise.resolve(args[c])
            .then(val => fn(val, c, args))
            .then(val => {
              threadPool.delete(c)
              // console.log(yellow`    pool`, threadPool.size, val)
              return setResult(c)(val)
            })
            .then(val => {
              if (!complete()) runItem(++count)
              return val
            })
            .catch(err => errors.push(err))
          return result
        }

        // Kick off x number of initial threads
        while (initialThread <= threadLimit && initialThread <= args.length) {
          runItem(initialThread)
          initialThread++
        }

      })
    })
  }
}
