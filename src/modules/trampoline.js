
module.exports = {
  isPromiseLike,
  syncPromise,
  trampoline,
}

function isPromiseLike(p) { return p && typeof p.then === 'function' }

function syncPromise(p, throwError = true) {
  var promiseValue = null, promiseError = null;
  p.then(val => {
    promiseValue = val
  })
  .catch(err = {
    promiseError = err
  })
  while (true) {
    if (promiseValue !== null) return promiseValue
    if (promiseError) throw err
  }
}

function trampoline(fn) {
  return (...args) => {
    let result = fn(...args)

    while (typeof result === 'function') result = result()
    // while (isPromiseLike(result)) result = syncPromise(result)

    return result
  }
}
