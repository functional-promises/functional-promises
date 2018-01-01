const {FRInputError} = require('./modules/errors')

module.exports = function _init(FR) {

  FR.on = on
  FR.prototype.listen = listen
  FR.prototype.runSteps = runSteps

  function on(obj, ...eventNames) {
    const startingPromise = FR.resolve(obj)

    startingPromise.events = {
      ctx: obj,
      eventNames,
    }
    startingPromise.steps = []
    return startingPromise
  }

  function listen(callback) {
    // TODO: finish listen()
    const obj = this.events.ctx
    const {eventNames} = this.events
    if (!obj[obj.addEventListener ? 'addEventListener' : 'on']) {
      throw new FRInputError('Input object isn\'t a valid EventEmitter or similar.')
    }

    // Sets up the handlers
    this.cleanupHandles = eventNames.map(eventName => {
      const handler = (e) => {
        this.runSteps(e)
      }
      // console.log(`   > Attaching ${eventName} handler`)
      obj[obj.addEventListener ? 'addEventListener' : 'on'](eventName, handler)
      return () => obj[obj.removeEventListener ? 'removeEventListener' : 'off'](eventName, handler)
    })

    return this
  }

  function runSteps(event) {

    return new FR((resolve, reject) => {
      const iterator = this.steps[Symbol.iterator]()

      const next = promise => {
        const current = iterator.next()
        if (current.done) return resolve(promise)
        const [fnName, , args] = current.value
        // console.log('promise.next')
        return next(promise[fnName](...args))
      }

      next(FR.resolve(event))
    })
  }

}
