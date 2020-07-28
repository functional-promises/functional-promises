import { FPInputError } from './modules/errors'
export interface IEventBus {
  on: (name: string, callback: Function) => void
  off: (name: string, callback: Function) => void
  once: (name: string, callback: Function) => void
}
export interface IListenable {
  addEventListener: (name: string, callback: Function) => void
  removeEventListener: (name: string, callback: Function) => void
}
export const listen = function listen<T>(this: FP<T>, obj: IListenable & IEventBus, ...eventNames: string[]) {
  const addKey = typeof obj.addEventListener !== 'undefined' ? 'addEventListener' : 'on'
  if (!obj[addKey]) throw new FPInputError('Valid EventEmitter required.')
  // Gets callback to attach to the event handlers
  const handler = this.chainEnd()
  this._FP.destroy = () => this._FP.destroyHandles.map(fn => fn() || true).filter(v => v).length
  this._FP.destroyHandles = eventNames.map(eventName => {
    obj[obj.addEventListener ? 'addEventListener' : 'on'](eventName, handler)
    return () => obj[obj.removeEventListener ? 'removeEventListener' : 'off'](eventName, handler)
  })
  return this
}