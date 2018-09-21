export const isPromiseLike = function(p) { return p && typeof p.then === 'function' }
export const isFunction = function(fn) { return typeof fn === 'function' }
export const isEnumerable = function(list) { return list && Array.isArray(list) || typeof list[Symbol.iterator] === 'function' }

export const flatten = function(arr) {
  if (!Array.isArray(arr)) throw new Error('Method `flatten` requires valid array parameter')
  return arr.reduce((results, item) => results.concat(Array.isArray(item) ? utils.flatten(item) : [item]), [])
}

