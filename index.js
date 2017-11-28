const {assign, functions,
  isFunction}             = require('lodash')
const promiseBase         = require('./src/promise')
const conditionalMixin    = require('./src/conditional')

function FunctionalRiver(resolveRejectCB) {
  if (!(this instanceof FunctionalRiver)) {return new FunctionalRiver(...arguments)}
  this._concurrencyLimit = Infinity
  this.resolveRejectCB = resolveRejectCB
  assign(this, promiseBase, conditionalMixin)
}

FunctionalRiver.prototype.all = promiseBase.all
FunctionalRiver.prototype.race = promiseBase.race

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
  return this._value
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

const promisify = FunctionalRiver.denodeify = FunctionalRiver.promisify = function(cb) {
  return (...args) => new FunctionalRiver((yah, nah) => {
    return cb(...args, (err, res) => {
      if (err) return nah(err)
      return yah(res)
    })
  })
}

const promisifyAll = function(obj) {
  if (!obj || !Object.getPrototypeOf(obj)) { throw new Error('Invalid Argument') }
  functions(obj.prototype)
  .forEach(fn => {
    if (isFunction(obj[`${fn.name}`]) && !obj[`${fn.name}Async`]) {
      obj[`${fn.name}Async`] = promisify(obj[`${fn.name}`])
    }
  })
  return obj
}

FunctionalRiver.promisifyAll = promisifyAll

module.exports = FunctionalRiver
