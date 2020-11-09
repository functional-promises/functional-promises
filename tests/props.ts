const test = require('ava')
const FP = require('../index.js')

test('FP.get(keys) static "partial app" function', t => {
  const result = FP.get('foo')
  t.true(typeof result === 'function', 'result should be a Function')
  t.is(result({foo: 'bar'}), 'bar', 'getter Function should return correct string')
})

test('fp.resolve(obj).get(...keyNames)', t => FP
  .resolve({foo: 'bar', baz: 'woo'})
  .get('foo', 'baz')
  .then(obj => t.is(obj.foo, 'bar'))
)

test('fp.resolve(obj).get(key, key2)', t => {
  return FP
  .resolve({foo: 'bar', baz: 'woo'})
  .get('foo', 'baz')
  .then(obj => t.is(obj.foo, 'bar'))
})

test('fp.get([keyNames])', t => FP
  .resolve({foo: 'bar', baz: 'woo'})
  .get(['foo', 'baz'])
  .then(obj => t.is(obj.foo, 'bar'))
)

test('fp.get(keyName)', t => FP
  .resolve({foo: 'bar'})
  .get('foo')
  .then(bar => t.is(bar, 'bar'))
)

test('FP.get(keyName, obj)', t => FP
  .resolve({foo: 'bar'})
  .get('foo')
  .then(bar => t.is(bar, 'bar'))
)

test('FP.get(o, k) static method', t => {
  const result = FP.get({foo: 'bar'}, 'foo')
  t.is(result, 'bar')
})

test('FP.get(keyNames, obj)', t => {
  const result = FP.get('foo', {foo: 'bar'})
  t.is(result, 'bar')
})

test('fp.set(keyName, value)', t => FP
  .resolve({foo: 'bar'})
  .set('foo', 'baz')
  .then(obj => t.is(obj.foo, 'baz'))
)



