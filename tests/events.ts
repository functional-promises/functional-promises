import { EventEmitter } from 'node:events'
import { expect, test } from 'vitest'
import { JSDOM } from 'jsdom'
import FP from '../src/index'

const getFakeWindow = (html: string) => {
  const dom = new JSDOM(`<!DOCTYPE html>${html}`)
  const { window } = dom
  return { window, dom, document: window.document }
}

test('FP.chain().listen() EventEmitter', async () => {
  const eventBus = new EventEmitter()

  const result = await new Promise((resolve) => {
    ;(FP.chain()
      .then((event: any) => resolve(event)) as any)
      .listen(eventBus, 'hit')
    eventBus.emit('hit', { worked: true })
  })

  expect(result).toBeTruthy()
  expect((result as { worked: boolean }).worked).toBe(true)
})

test('FP.chain().listen() DOM', async () => {
  const buttonUi = getFakeWindow("<button id='btn'>Click me!</button>")
  const { document, window } = buttonUi

  ;(global as any).window = window
  ;(global as any).document = document
  const btn = document.querySelector('#btn') as HTMLButtonElement

  const result = await new Promise((resolve) => {
    ;(FP.chain()
      .then((el: unknown) => resolve(el)) as any)
      .listen(btn, 'click')

    btn.click()
  })

  expect(result).toBeTruthy()
})

// ---------------------------------------------------------------------------
// Issue #17: event listener cleanup / destroy() was never tested
// ---------------------------------------------------------------------------

test('listen() destroy() removes EventEmitter listener', async () => {
  const eventBus = new EventEmitter()
  let callCount = 0

  const fp = FP.chain()
    .then(() => { callCount++ })
    .listen(eventBus, 'ping')

  // Listener is active — first emit should trigger it
  eventBus.emit('ping')
  await new Promise(r => setTimeout(r, 10))
  expect(callCount).toBe(1)

  // Destroy removes all registered listeners
  fp._FP.destroy()

  // Subsequent emit should NOT trigger the handler
  eventBus.emit('ping')
  await new Promise(r => setTimeout(r, 10))
  expect(callCount).toBe(1) // unchanged
})

test('listen() destroy() removes multiple event listeners', async () => {
  const eventBus = new EventEmitter()
  const seen: string[] = []

  const fp = FP.chain()
    .then((eventName: unknown) => { seen.push(eventName as string) })
    .listen(eventBus, 'a', 'b')

  eventBus.emit('a', 'a')
  eventBus.emit('b', 'b')
  await new Promise(r => setTimeout(r, 10))
  expect(seen).toEqual(['a', 'b'])

  fp._FP.destroy()

  eventBus.emit('a', 'a')
  eventBus.emit('b', 'b')
  await new Promise(r => setTimeout(r, 10))
  expect(seen).toHaveLength(2) // no new entries
})

test('listen() without chain() throws descriptive error', () => {
  const eventBus = new EventEmitter()
  expect(() => FP.resolve(1).listen(eventBus, 'ping')).toThrow(
    /must be called at the end of a .chain\(\) pipeline/
  )
})
