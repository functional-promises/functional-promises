require("regenerator-runtime/runtime")
const test = require('ava')
const FP = require('../index.js')

const fetch = require('./data/justsml.github')

// https://github.com/functional-promises/functional-promises/issues/27
test('Validate Multiple Chained Steps', t => {
  return FP.resolve(fetch('https://api.github.com/users/justsml'))
    .delay(1)
    .tap(res => `github user req ok? ${res.ok}`)
    .then(res => res.json())
    .then(data => data.avatar_url)
    .tap(url => t.truthy(url === 'https://avatars2.githubusercontent.com/u/397632?v=4'))
    // .tap(url => console.log('url', url))
    // NEXT LINE SHOULD WORK!!!
})

test('Validate .chain() w/ Multiple Steps', async t => {
  t.plan(1)
  const loadAvatar = FP.chain()
    .then(fetch)
    .delay(1)
    .tap(res => `github user req ok? ${res.ok}`)
    .then(res => res.json())
    .then(data => data.avatar_url)
    .chainEnd()

  const avatar = await loadAvatar(`https://api.github.com/users/justsml`)
  t.truthy(avatar === `https://avatars2.githubusercontent.com/u/397632?v=4`)
})
