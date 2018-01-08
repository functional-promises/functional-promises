const {FPInputError} = require('./modules/errors')

module.exports = function _init(FP) {
  FP.prototype.listen = listen

  /**
   *
   * Shortcut to run the function returned by `.chainEnd()`
   *
   * @param {any} obj element or event emitter
   * @param {any} eventNames list of event names
   * @returns FunctionalPromise
   */
  function listen(obj, ...eventNames) {
    if (typeof eventNames === 'string') eventNames = [eventNames]
    if (!obj[obj.addEventListener ? 'addEventListener' : 'on']) {
      throw new FPInputError('Input object isn\'t a valid EventEmitter or similar.')
    }

    // Sets up the handlers
    const handler = this.chainEnd()
    // console.log(`   > Attaching ${eventNames} handler`, eventNames)
    this.cleanupHandles = eventNames.map(eventName => {
      obj[obj.addEventListener ? 'addEventListener' : 'on'](eventName, handler)
      return () => obj[obj.removeEventListener ? 'removeEventListener' : 'off'](eventName, handler)
    })

    return this
  }
}
