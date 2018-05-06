const {isEnumerable} = require('./modules/utils')
const {FPInputError, FunctionalError} = require('./modules/errors')

module.exports = {map, find, findIndex, filter, reduce}

function find(callback) {
  return _find.call(this, callback).then(({item}) => item)
}
function findIndex(callback) {
  return _find.call(this, callback).then(({index}) => index)
}

function _find(iterable, callback) {
  const FP = require('./index')
  if (this.steps) return this.addStep('_find', [...arguments])
  if (typeof iterable === 'function') {
    callback = iterable
    iterable = this._FP.promise
  }

  return FP.resolve(iterable)
    .filter(callback)
    .then(results => results && results[0]
        ? {item: results[0], index: results.indexOf(results[0])}
        : {item: undefined,  index: -1})
}

function filter(iterable, callback) {
  if (this.steps) return this.addStep('filter', [...arguments])
  if (typeof iterable === 'function') {
    callback = iterable
    iterable = this._FP.promise
  }

  return reduce(iterable, (aggregate, item) => {
    return Promise.resolve(callback(item)).then(value => (value ? aggregate.concat([item]) : aggregate))
  }, [])
}

function reduce(iterable, reducer, initVal) {
  const FP = require('./index')
  if (this.steps) return this.addStep('reduce', [...arguments])
  if (typeof iterable === 'function') {
    initVal = reducer
    reducer = iterable
    iterable = this._FP ? this._FP.promise : this
  } else {
    iterable = FP.resolve(iterable, this)
  }
  return new FP((resolve, reject) => {
    return iterable.then(iterable => {
      const iterator = iterable[Symbol.iterator]()
      let i = 0

      const next = total => {
        const current = iterator.next()
        if (current.done) return resolve(total)

        Promise.all([total, current.value])
          .then(([total, item]) => next(reducer(total, item, i++)))
          .catch(reject)
      }

      next(initVal)
    })
  })
}

/*eslint max-statements: ["error", 60]*/
function map(args, fn, options) {
  const FP = require('./index')
  if (this.steps) return this.addStep('map', [...arguments])
  if (arguments.length === 1 && this && this._FP) {
    fn = args
    args = this && this._FP && this._FP.promise
  }

  let resolvedOrRejected = false
  const threadLimit = Math.max(1, Math.min((this && this._FP && this._FP.concurrencyLimit) || 1, 4))
  const innerValues = this && this._FP && this._FP.promise ? this._FP.promise : Promise.resolve(args)
  let initialThread = 0
  let errors = []
  let count = 0
  const results = [], altResults = []
  const threadPool = new Set()
  const threadPoolFull = () => threadPool.size >= threadLimit
  const isDone = () =>  count >= args.length || resolvedOrRejected || errors.length > this._FP.errors.limit
  const setResult = index => value => {
    threadPool.delete(index)
    results[index] = value
    return value
  }

  return new FP((resolve, reject) => {
    const resolveIt = x => {
      if (resolvedOrRejected) return;
      resolvedOrRejected = true
      resolve(x)
    }
    const rejectIt = x => {
      if (resolvedOrRejected) return;
      resolvedOrRejected = true
      reject(x)
    }
    innerValues.then(items => {
      args = [...items]
      if (!isEnumerable(items)) return reject(new FPInputError('Invalid input data passed into FP.map()'))
      const complete = () => {
        if (errors.length > this._FP.errors.limit) {
          Promise.all(altResults)
            .then(data => rejectIt(results))
          return true
        }
        if (isDone()) {
          Promise.all(altResults)
            .then(data => resolveIt(results))
          return true
        }
        return false
      }
      const checkAndRun = val => {
        if (resolvedOrRejected) return;
        if (!complete() && !results[count]) runItem(count)
        return val
      }

      const runItem = c => {
        if (resolvedOrRejected) return;
        count++
        if (threadPoolFull()) return setTimeout(() => runItem(c), 0)
        // const isComplete = complete()
        if (results[c]) {
          // console.error('completed/processing item already', c, results[c])
          return results[c]
        }
        threadPool.add(c)
        // either get value with `fn(item)` or `item.then(fn)`
        altResults[c] = Promise.resolve(args[c])
          .then(val => fn(val, c, args))
          .then(val => setResult(c)(val))
          .then(checkAndRun)
          .catch(err => {
            this._FP.errors.count++
            errors.push(err)
            if (errors.length > this._FP.errors.limit) {
              const fpErr = errors.length === 1 ? err : new FunctionalError(`Error Limit ${this._FP.errors.limit} Exceeded. CurrentArrayIndex=${c} ActualNumberOfErrors=${this._FP.errors.count}`, {errors, results, ctx: this})
              // console.warn('Error Limit:', c, JSON.stringify(this._FP.errors))
              Promise.resolve(setResult(c)(err))
                .then(() => {
                  // console.log('\nAHHHHH SHOULD END RUNNING NOW-ish!!!!!!!!!\n')
                  rejectIt(fpErr)
                })
            } else {
              // console.warn('Error OK:', JSON.stringify(this._FP.errors))
              return Promise
                .resolve()
                .then(() => setResult(c)(err))
                .then(checkAndRun)
            }
          })

        return altResults[c]
      }

      // Kick off x number of initial threads
      while (initialThread < threadLimit && initialThread < args.length) runItem(initialThread++)
    })
  })
}
