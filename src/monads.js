const {FRInputError} = require('./modules/errors')

module.exports = function _init(FR) {
  FR.chain = chain
  FR.prototype.chainEnd = chainEnd

  /**
   * Start 'recording' a chain of commands, after steps defined call `.chainEnd()`
   * @returns FunctionalPromise
   */
  function chain() {
    // create a placeholder/initial promise to hold the steps/chain data
    const promise = FR.resolve()
    promise.steps = []
    return promise
  }

  /**
   * Call after starting a `.chain()`.
   *
   * One of the few non-chainable methods in the API.
   * @returns a Function. It runs your functional chain!
   */
  function chainEnd() {

    return input => {
      return new FR((resolve, reject) => {
        const iterator = this.steps[Symbol.iterator]()

        const next = promise => {
          const current = iterator.next()
          if (current.done) return resolve(promise)
          const [fnName, , args] = current.value
          return next(promise[fnName](...args))
        }
        next(FR.resolve(input))
      })
    }
  }
}
