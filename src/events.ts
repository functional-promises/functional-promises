import { FPInputError } from './modules/errors'
import type { FPInternalInstance } from './internal-types'

type EmitterLike = {
  on?: (eventName: string, handler: (...args: unknown[]) => void) => void
  off?: (eventName: string, handler: (...args: unknown[]) => void) => void
  addEventListener?: (eventName: string, handler: (...args: unknown[]) => void) => void
  removeEventListener?: (eventName: string, handler: (...args: unknown[]) => void) => void
}

type SubscribeMethod = 'addEventListener' | 'on'
type UnsubscribeMethod = 'removeEventListener' | 'off'

/**
 * Attaches the current chain as an event handler on `obj`.
 *
 * **Must** be called at the end of a `.chain()` pipeline — calling it outside
 * a chain throws at runtime. Use `FP.chain().then(...).listen(emitter, event)`.
 *
 * @throws {FPInputError} If called outside a `.chain()` context (i.e. no steps defined).
 *
 * @example
 * const off = FP.chain()
 *   .then(handler)
 *   .listen(emitter, 'data')
 * // call off._FP.destroy() to remove listeners
 */
export const listen = function listen(this: FPInternalInstance, obj: EmitterLike, ...eventNames: string[]) {
  const subscribeKey: SubscribeMethod = obj.addEventListener ? 'addEventListener' : 'on'
  const unsubscribeKey: UnsubscribeMethod = obj.removeEventListener ? 'removeEventListener' : 'off'

  if (!obj[subscribeKey]) {
    throw new FPInputError('Valid EventEmitter required.')
  }

  if (!this.steps || this.steps.length === 0) {
    throw new FPInputError(
      '.listen() must be called at the end of a .chain() pipeline. ' +
      'Use FP.chain().then(...).listen(emitter, eventName) instead.'
    )
  }

  const handler = this.chainEnd()
  this._FP.destroy = () => this._FP.destroyHandles!.map((fn: () => boolean | undefined) => fn() || true).filter((v: boolean | undefined) => v).length
  this._FP.destroyHandles = eventNames.map((eventName: string) => {
    obj[subscribeKey]?.(eventName, handler)
    return () => { obj[unsubscribeKey]?.(eventName, handler); return true as const }
  })
  return this
}
