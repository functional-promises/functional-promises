const utils = module.exports = {
  isPromiseLike(p) {
    return p && typeof p.then === 'function'
  },

  flatten(arr) {
    if (!Array.isArray(arr)) throw new Error('Method `flatten` requires valid array parameter')
    return arr.reduce((item, results) => results.concat(Array.isArray(item) ? utils.flatten(item) : [item]), [])
  }
}
