const {FPInputError} = require('./modules/errors')

module.exports = {listen}

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
