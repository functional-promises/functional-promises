const test = require('ava')
const FP = require('../src').default

const fetch = require('./data/justsml.github')

// https://github.com/functional-promises/functional-promises/issues/27
test('Validate Multiple Chained Steps', t => {
  return FP.resolve(fetch('https://api.github.com/users/justsml'))
    .delay(1)
    .tap(res => `github user req ok? ${res.ok}`)
    .then(res => res.json())
    .then(data => data.avatar_url)
    .tap(url => t.truthy(url && url.length >= 4))
    // .tap(url => console.log('url', url))
    // NEXT LINE SHOULD WORK!!!
})
