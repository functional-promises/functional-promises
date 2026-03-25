import { expect, test } from 'vitest'
import FP from '../src/index'

test('FP.get(keys) static "partial app" function', () => {
  const result = FP.get('foo')
  expect(typeof result).toBe('function')
  expect(result({ foo: 'bar' })).toBe('bar')
})

test('fp.resolve(obj).get(...keyNames)', () =>
  FP.resolve({ foo: 'bar', baz: 'woo' })
    .get('foo', 'baz')
    .then((obj: { foo: string }) => expect(obj.foo).toBe('bar')))

test('fp.resolve(obj).get(key, key2)', () =>
  FP.resolve({ foo: 'bar', baz: 'woo' })
    .get('foo', 'baz')
    .then((obj: { foo: string }) => expect(obj.foo).toBe('bar')))

test('fp.get([keyNames])', () =>
  FP.resolve({ foo: 'bar', baz: 'woo' })
    .get(...(['foo', 'baz'] as [string, string]))
    .then((obj: { foo: string }) => expect(obj.foo).toBe('bar')))

test('fp.get(keyName)', () => FP.resolve({ foo: 'bar' }).get('foo').then((bar: string) => expect(bar).toBe('bar')))

test('FP.get(keyName, obj)', () => FP.resolve({ foo: 'bar' }).get('foo').then((bar: string) => expect(bar).toBe('bar')))

test('FP.get(o, k) static method', () => {
  const result = FP.get({ foo: 'bar' }, 'foo')
  expect(result).toBe('bar')
})

test('FP.get(keyNames, obj)', () => {
  const result = FP.get('foo', { foo: 'bar' })
  expect(result).toBe('bar')
})

test('fp.set(keyName, value)', () =>
  FP.resolve({ foo: 'bar' })
    .set('foo', 'baz')
    .then((obj: { foo: string }) => expect(obj.foo).toBe('baz')))

// ---------------------------------------------------------------------------
// Issue 18: get/set additional coverage
// ---------------------------------------------------------------------------

test('FP.prototype.get — single key on chained object', () =>
  FP.resolve({ name: 'Alice', age: 30 })
    .get('name')
    .then((result: unknown) => expect(result).toBe('Alice')))

test('FP.prototype.get — multiple keys returns subset object', () =>
  FP.resolve({ name: 'Alice', age: 30, city: 'NYC' })
    .get('name', 'age')
    .then((result: unknown) => expect(result).toEqual({ name: 'Alice', age: 30 })))

test('FP.get — curried static usage', () => {
  const getName = FP.get('name')
  expect(getName({ name: 'Bob', score: 99 })).toBe('Bob')
})

test('FP.prototype.get — missing key returns undefined', () =>
  FP.resolve({ name: 'Alice' })
    .get('nonExistent' as 'name')
    .then((result: unknown) => expect(result).toBeUndefined()))

test('FP.prototype.set — updates named key on object', () =>
  FP.resolve({ name: 'Alice', age: 30 })
    .set('name', 'Bob')
    .then((result: unknown) => expect(result).toEqual({ name: 'Bob', age: 30 })))

test('FP.prototype.set — passes through non-objects unchanged', () =>
  FP.resolve(42 as unknown)
    .set('key', 'value')
    .then((result: unknown) => expect(result).toBe(42)))

test('FP.prototype.set — does not lose other properties', () =>
  FP.resolve({ a: 1, b: 2, c: 3 })
    .set('b', 99)
    .then((result: unknown) => expect(result).toEqual({ a: 1, b: 99, c: 3 })))
