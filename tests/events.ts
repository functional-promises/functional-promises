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
    FP.chain()
      .then((event: any) => resolve(event))
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
    FP.chain()
      .then((el: unknown) => resolve(el))
      .listen(btn, 'click')

    btn.click()
  })

  expect(result).toBeTruthy()
})
