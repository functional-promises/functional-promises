const {assign, functionsIn,
  isFunction}             = require('lodash')
const getFunctions = functionsIn
const promiseBase         = require('./src/promise')
const conditionalMixin    = require('./src/conditional')

function FunctionalRiver(resolveRejectCB) {
  if (!(this instanceof FunctionalRiver)) {return new FunctionalRiver(...arguments)}
  this._concurrencyLimit = Infinity
  this.resolveRejectCB = resolveRejectCB
  assign(this, promiseBase, conditionalMixin)
}

FunctionalRiver.prototype.all = promiseBase.all
// FunctionalRiver.prototype.race = promiseBase.race

FunctionalRiver.prototype.concurrency = function(limit = Infinity) {
  this._concurrencyLimit = limit
  return this
}

FunctionalRiver.prototype.serial = function() {
  return this.concurrency(1)
}

FunctionalRiver.prototype.catch = function(fn) {
  if (this._error) {
    const result = fn(this._error)
    this._error = undefined // no dbl-catch
    return result
  }
  // bypass error handling
  return FunctionalRiver.resolve(this._value)
}

FunctionalRiver.prototype.then = function(fn) {
  const _reject  = err => this._error = err
  const _resolve = val => {
    this._value = val
    return fn(val)
  }

  if (this._value)  { return fn(this._value); }

  if (!this._error) {
    setImmediate(() => this.resolveRejectCB(_resolve, _reject))
  }
  return this
}

FunctionalRiver.resolve = function(value) {
  return new FunctionalRiver((resolve, reject) => {
    if (value && isFunction(value.then)) {
      return value.then(resolve)
    }
    resolve(value)
  })
}

FunctionalRiver.denodeify = FunctionalRiver.promisify = promisify

function promisify(cb) {
  return (...args) => new FunctionalRiver((yah, nah) => {
    try {
      cb(...args, (err, res) => {
        if (err) return nah(err)
        return yah(res)
      })
    } catch(err) {
      nah(err)
    }
  })
}

const promisifyAll = function(obj, force = false) {
  if (!obj) { throw new Error('Invalid Argument') }
  const extendAsync = o => getFunctions(o)
    .forEach(fn => {
      if (isFunction(o[`${fn}`]) && !o[`${fn}Async`]) {
        o[`${fn}Async`] = promisify(o[`${fn}`])
      }
    })

  if (typeof obj === 'object' && Object.getPrototypeOf(obj)) {
    extendAsync(Object.getPrototypeOf(obj))
  }
  if (force) extendAsync(obj)


  return obj
}

FunctionalRiver.promisifyAll = promisifyAll

module.exports = FunctionalRiver
