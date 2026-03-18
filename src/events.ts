import { FPInputError } from './modules/errors'

type EmitterLike = {
  on?: (eventName: string, handler: (...args: unknown[]) => void) => void
  off?: (eventName: string, handler: (...args: unknown[]) => void) => void
  addEventListener?: (eventName: string, handler: (...args: unknown[]) => void) => void
  removeEventListener?: (eventName: string, handler: (...args: unknown[]) => void) => void
}

export const listen = function listen(this: any, obj: EmitterLike, ...eventNames: string[]) {
  if (typeof eventNames === 'string') eventNames = [eventNames]
  if (!obj[(obj.addEventListener ? 'addEventListener' : 'on') as 'addEventListener' | 'on']) {
    throw new FPInputError('Valid EventEmitter required.')
  }

  const handler = this.chainEnd()
  this._FP.destroy = () => this._FP.destroyHandles.map((fn: () => unknown) => fn() || true).filter((v: unknown) => v).length
  this._FP.destroyHandles = eventNames.map((eventName: string) => {
    obj[(obj.addEventListener ? 'addEventListener' : 'on') as 'addEventListener' | 'on']?.(eventName, handler)
    return () => obj[(obj.removeEventListener ? 'removeEventListener' : 'off') as 'removeEventListener' | 'off']?.(eventName, handler)
  })
  return this
}
