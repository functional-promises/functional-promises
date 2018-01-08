const test = require('ava')
const FP = require('../src')
const jsdom = require('jsdom')
const EventEmitter = require('events')

const getFakeWindow = (html) => {
  const { JSDOM } = jsdom
  const dom = new JSDOM(`<!DOCTYPE html>${html}`)
  const {window} = dom
  return {window, dom, document: window.document}
}

test.cb('FP.chain().listen() EventEmitter', t => {
  // const cleanupHandlers = []
  const eventBus = new EventEmitter()

  FP.chain()
    .then(event => {
      t.truthy(event)
      t.truthy(event.worked)
      t.end()
    })
    .listen(eventBus, 'hit')
  eventBus.emit('hit', {worked: true})
})


test.cb('FP.chain().listen() DOM', t => {
  const buttonUi = getFakeWindow(`<button id='btn'>Click me!</button>`)
  const {document, window} = buttonUi
  global.window = window
  global.document = document
  const btn = document.querySelector('#btn')

  const listenChain = () => {
    const cleanupHandlers = []
    FP.chain()
    .then(el => {
      t.truthy(el)
      t.end()
    })
    .listen(btn, 'click')
    return {btn, cleanupHandlers}
  }
  Promise.resolve(listenChain())
    .then(({btn}) => {
      btn.click()
    })
})
