const utils = {
  isPromiseLike(p: PromiseLike<any>) { return !!(p && typeof p.then === 'function') },
  isFunction(fn: Function) { return typeof fn === 'function' },
  isEnumerable(list: any) { return list && (Array.isArray(list) || list[Symbol.iterator] || list[Symbol.asyncIterator]) },
  isObject(o: any) { return o !== null && typeof o === 'object' && Object.prototype.toString.call(o) === '[object Object]' },

  flatten<Iterable>(arr: Iterable): Iterable {
    if (!Array.isArray(arr)) throw new Error('Method `flatten` requires valid array parameter')
    return arr.reduce((results, item) => results.concat(Array.isArray(item) ? utils.flatten(item) : [item]), [])
  },
}

export default utils
