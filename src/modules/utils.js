module.exports = {isPromiseLike}

function isPromiseLike(p) {
  return p && typeof p.then === 'function'
}
