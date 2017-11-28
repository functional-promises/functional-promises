
module.exports = {
  tapIf,
  thenIf,
  _thenIf,
}

function thenIf(cond, ifTrue, ifFalse) {
  if (this instanceof FR) {
    return this.then(value => _thenIf(cond, ifTrue, ifFalse)(value))
  }
  return _thenIf(cond, ifTrue, ifFalse)
}

function tapIf(cond, ifTrue, ifFalse) {
  if (this instanceof FR) {
    return this.then(value => _thenIf(cond, ifTrue, ifFalse, true)(value))
  }
  return _thenIf(cond, ifTrue, ifFalse, true)
}

function _thenIf(cond = (x) => x, ifTrue = (x) => x, ifFalse = () => null, returnValue = false) {
  return value => FR.resolve(cond(value))
    .then(ans => ans ? ifTrue(value) : ifFalse(value))
    .then(v => returnValue ? value : v)
}
