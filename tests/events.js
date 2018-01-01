const test = require('ava')
const FR = require('../src')
const jsdom = require('jsdom')
const EventEmitter = require('events')

const getFakeWindow = (html) => {
  const { JSDOM } = jsdom
  const dom = new JSDOM(`<!DOCTYPE html>${html}`)
  const {window} = dom
  return {window, dom, document: window.document}
}
const trigger = (el, name, data) => {
  const event = document.createEvent( 'MouseEvents' )
  event.initMouseEvent(name, true, true, window, null, 0, 0, 0, 0, '', false, false, false, false, 0, el.parentNode)
  el.dispatchEvent(event)

}

test.cb('FP.on().listen() EventEmitter', t => {
  const cleanupHandlers = []
  const eventBus = new EventEmitter()

  FR.on(eventBus, 'hit')
    .then(event => {
      // console.log('FP EVENT HANDLED:', event)
      t.truthy(event)
      t.truthy(event.worked)
      t.end()
    })
    .listen({cleanupHandlers})
  eventBus.emit('hit', {worked: true})
})


test.cb('FP.on().listen() DOM', t => {
  const buttonUi = getFakeWindow(`<button id='btn'>Click me!</button>`)
  const {document, window} = buttonUi
  global.window = window
  global.document = document
  // const simulant = require('simulant')
  const btn = document.querySelector('#btn')

  const listenChain = () => {
    const cleanupHandlers = []
    FR.on(btn, 'click')
    .then(el => {
      // console.log('FR CLICK HANDLED:', el)
      t.truthy(el)
      // t.truthy(el.textContent)
      t.end()
    })
    .listen({cleanupHandlers})
    return {btn, cleanupHandlers}
  }
  Promise.resolve(listenChain())
    .then(({btn}) => {
      btn.click()
    })
})
