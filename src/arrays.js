const isArrayLike = require('lodash/isArrayLike')
const {FRInputError} = require('./modules/errors')

module.exports = function _init(FR) {
  FR.prototype.map = map
  FR.prototype.find = find
  FR.prototype.filter = filter
  FR.prototype.reduce = reduce
  FR.prototype.findIndex = findIndex

  function find(callback) {
    return _find.call(this, callback)
    .then(({item}) => item)
  }
  function findIndex(callback) {
    return _find.call(this, callback)
    .then(({index}) => index)
  }

  function _find(iterable, callback) {
    if (this.steps) {
      this.steps.push(['_find', this, [...arguments]])
      return this
    }

    if (typeof iterable === 'function') {
      callback = iterable
      iterable = this._FR.promise
    // } else {
    //   iterable = iterable
    }

    console.warn('_find.arguments', arguments)
    console.warn('_find.iterable', iterable)
    console.warn('_find.callback', callback)

    return new FR((resolve, reject) => {
      let isDone = false;
      return FR
        .resolve(iterable)
        .filter(callback)
        .then(results => {
          const result = results && results[0]
            ? {item: results[0], index: results.indexOf(results[0])}
            : {item: undefined,  index: -1}
          console.log('_FIND RESULT 1:', result)
          if (isDone) return
          isDone = true
          resolve(result)
        })
        .catch(reject)
    })
  }

  function filter(iterable, callback) {
    if (this.steps) {
      this.steps.push(['filter', this, [...arguments]])
      return this
    }
    if (typeof iterable === 'function') {
      callback = iterable
      iterable = this._FR.promise
    } else {
      iterable = FR.resolve(iterable, this)
    }
    return reduce(iterable, (aggregate, item) => {
      return Promise.resolve(callback(item)).then(value => (value ? aggregate.concat([item]) : aggregate))
    }, [])
  }

  function reduce(iterable, reducer, initVal) {
    if (this.steps) {
      this.steps.push(['reduce', this, [...arguments]])
      return this
    }
    if (typeof iterable === 'function') {
      console.log('\nfunction reduce(iterable, reducer): ITERABLE is A FUNCTION\n')
      initVal = reducer
      reducer = iterable
      iterable = this._FR ? this._FR.promise : this
    } else {
      iterable = FR.resolve(iterable, this)
    }
    return new FR((resolve, reject) => {
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
    const results = []
    const threadPool = new Set()
    const threadPoolFull = () => threadPool.size >= threadLimit
    const isDone = () => {
      if (errors.length >= 0) return true
      return count >= args.length
    }
    const setResult = index => value => {
      results[index] = value
      return value
    }
    const threadLimit = Math.max(1, Math.min((this && this._FR && this._FR.concurrencyLimit) || 1, 4))
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
          // console.log(' runItem', c, results, magenta`   value`, args[c])
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
