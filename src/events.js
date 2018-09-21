import { FPInputError } from './modules/errors'

export const listen = function(obj, ...eventNames) {
  if (typeof eventNames === 'string') eventNames = [eventNames]
  if (!obj[obj.addEventListener ? 'addEventListener' : 'on']) throw new FPInputError('Valid EventEmitter required.')
  // Gets callback to attach to the event handlers
  const handler = this.chainEnd()
  this._FP.destroy = () => this._FP.destroyHandles.map(fn => fn() || true).filter(v => v).length
  this._FP.destroyHandles = eventNames.map(eventName => {
    obj[obj.addEventListener ? 'addEventListener' : 'on'](eventName, handler)
    return () => obj[obj.removeEventListener ? 'removeEventListener' : 'off'](eventName, handler)
  })
  return this
}