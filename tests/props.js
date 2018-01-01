const test = require('ava')
const FP = require('../src')

test('FP.get(keyName)', t => FP
  .resolve({foo: 'bar'})
  .get('foo')
  .then(bar => t.is(bar, 'bar'))
)

test('FP.set(keyName, value)', t => FP
  .resolve({foo: 'bar'})
  .set('foo', 'baz')
  .then(obj => t.is(obj.foo, 'baz'))
)



