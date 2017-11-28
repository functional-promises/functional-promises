const _ = require('lodash')
const promiseBase = require('./src/promise')
const conditionalMixin = require('./src/conditional')

function FunctionalRiver(resolveRejectCB) {
  if (!(this instanceof FunctionalRiver)) {return new FunctionalRiver(...arguments)}
  this._concurrencyLimit = Infinity
  this.resolveRejectCB = resolveRejectCB
  Object.assign(this, promiseBase, conditionalMixin)
}

FunctionalRiver.prototype.concurrency = function(limit = Infinity) {
  this._concurrencyLimit = limit
  return this
}

FunctionalRiver.prototype.serial = function() {
  return this.concurrency(1)
}

FunctionalRiver.prototype.then = function(fn) {
  const _reject  = err => this._error = err
  const _resolve = val => {
    this._value = val
    return fn(val)
  }

  if (this._value)  { fn(this._value); }

  if (!this._error) {
    setImmediate(() => this.resolveRejectCB(_resolve, _reject))
  }
  return this
}

FunctionalRiver.resolve = function(value) {
  return new FunctionalRiver((resolve, reject) => {
    if (value && typeof value.then === 'function') {
      return value.then(_val => {
        resolve(_val)
      })
      .catch(reject)
    }
    resolve(value)
  })
}

module.exports = FunctionalRiver
