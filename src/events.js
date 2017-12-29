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

  function listen() {
    // TODO: finish listen()
    console.warn('TODO: listen', this)
    const obj = this.events.ctx
    const {eventNames} = this.events
    console.log('\nSetting up events for', obj, eventNames)
    if (!obj[obj.addEventListener ? 'addEventListener' : 'on']) {
      throw new FRInputError('Input object isn\'t a valid EventEmitter or similar.')
    }

    // Sets up the handlers
    this.cleanupHandles = eventNames.map(eventName => {
      const handler = (e) => {
        console.log(`   > Firing ${eventName} handler`)
        this.runSteps(e)
      }
      console.log(`   > Attaching ${eventName} handler`)
      obj[obj.addEventListener ? 'addEventListener' : 'on'](eventName, handler)
      return () => obj[obj.removeEventListener ? 'removeEventListener' : 'off'](eventName, handler)
    })

    return this
  }

  function runSteps(event) {
    console.log('runSteps', this.steps && this.steps.length)
    const steps = [...this.steps]
    const finalP =  steps.reduce((p, fnCallArgs) => {
      const [fnName, ctx, args] = fnCallArgs
      return ctx[fnName].call(ctx, ...args)
    }, FR.resolve(event))
    console.log(`\n    > Steps promise:`, finalP)
    return FR.all([finalP])
  }

}
