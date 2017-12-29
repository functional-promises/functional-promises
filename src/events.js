const {FRInputError} = require('./modules/errors')

module.exports = function _init(FR) {

  FR.prototype.on = on
  FR.prototype.listen = listen

  function on(obj, ...eventNames) {
    this.events = {
      context: obj,
      eventNames,
    }
    this.steps = []
    return FR.resolve(obj)
  }

  function listen() {
    // TODO: finish listen()
    console.warn('TODO: listen')
    const obj = this.events.context
    const {eventNames} = this.events
    console.log('  Setting up events for', obj, eventNames)
    if (!obj[obj.addEventListener ? 'addEventListener' : 'on']) {
      throw new FRInputError('Input object isn\'t a valid EventEmitter or similar.')
    }

    // Sets up the handlers
    this.cleanupHandles = eventNames.map(eventName => {
      const handler = (e) => this.runSteps(e)
      obj[obj.addEventListener ? 'addEventListener' : 'on'](eventName, handler)
      return () => obj[obj.removeEventListener ? 'removeEventListener' : 'off'](eventName, handler)
    })

    return this
  }

  function runSteps(event) {
    console.log('runSteps', this.steps && this.steps.length)
    const steps = [...this.steps]
    return steps.reduce((p, fnCallArgs) => {
      const [fnName, ctx, args] = fnCallArgs
      return p[fnName].call(ctx, ...args)
    }, FR.resolve(event))
  }
}