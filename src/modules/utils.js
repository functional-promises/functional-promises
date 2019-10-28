const utils = {
  isPromiseLike(p) { return !!(p && typeof p.then === 'function') },
  isFunction(fn) { return typeof fn === 'function' },
  isEnumerable(list) { return list && Array.isArray(list) || typeof list[Symbol.iterator] === 'function' },
  isObject(o) { return !!Object.prototype.toString.call(o) === '[object Object]' },

  flatten(arr) {
    if (!Array.isArray(arr)) throw new Error('Method `flatten` requires valid array parameter')
    return arr.reduce((results, item) => results.concat(Array.isArray(item) ? utils.flatten(item) : [item]), [])
  },
}

export default utils
