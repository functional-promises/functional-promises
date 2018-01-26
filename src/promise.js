const {FPInputError} = require('./modules/errors')

module.exports = {all, cast, reject, delay}

function all(promises) {
  const FP = require('./')
  return FP.resolve(Array.isArray(promises)
   ? Promise.all(promises)
   : promiseAllObject(promises))
}

function promiseAllObject(obj) {
  const keys = Object.getOwnPropertyNames(obj)
  const values = keys.map(key => obj[key])
  return Promise.all(values)
  .then(results => {
    return results.reduce((obj, val, index) => {
      const key = keys[index]
      return Object.assign({[key]: val}, obj)
    }, {})
  })
}

function cast(obj) {
  return Promise.resolve(obj)
}

function reject(err) {
  // ret._captureStackTrace();
  // ret._rejectCallback(reason, true);
  if (err instanceof Error) {
    if (this) this._error = err
    return Promise.reject(err)
  }
  throw new Error(`Reject only accepts a new instance of Error!`)
}

function delay(value, delay) {
  const FP = require('./')
  if (arguments.length === 1) {
    delay = value
    value = this || null
  }
  if (!Number.isInteger(delay)) throw new FPInputError('fp.delay([promise,] millisec) requires a numeric arg.')
  return new FP(resolve => {
    setTimeout(() => resolve(value), delay)
  })
}
