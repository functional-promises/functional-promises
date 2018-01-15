const FP = require('./')

module.exports = function _init(FP) {
  FP.prototype.all = FP.all = all
  FP.prototype.cast = cast
  FP.prototype.reject = reject
}

function all(promises) {
  return Array.isArray(promises) ? Promise.all(promises) : allObjectKeys(promises)
}

function allObjectKeys(object) {
  return FP.resolve(Object.keys(object))
  .map(key => FP.all([key, object[key]]))
  .reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {})
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
