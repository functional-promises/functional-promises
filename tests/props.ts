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
    .get(['foo', 'baz'])
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
