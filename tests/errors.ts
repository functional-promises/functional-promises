import { beforeAll, expect, test } from 'vitest'
import FP from '../src/index'
import { FunctionalError, FPCollectionError, FPInputError } from '../src/modules/errors'

beforeAll(() => {
  process.on('unhandledRejection', (error: Error) => {
    console.error('unhandledRejection', error.message)
  })
})

test('FunctionalError has expected message', () => {
  const error = new FunctionalError('Oh noes!') as any
  expect(error.message).toBe('Oh noes!')
})

test('FunctionalError has custom properties', () => {
  const error = new FunctionalError('Oh noes!', { custom: 42 }) as any
  expect(error.message).toBe('Oh noes!')
  expect(error.custom).toBe(42)
})

test('FunctionalError supports object-based message argument', () => {
  const error = new FunctionalError({ message: 'Oh noes!' }) as any
  expect(error.message).toBe('Oh noes!')
})

test('FunctionalError supports object-based argument w/ custom properties', () => {
  const error = new FunctionalError({ message: 'Oh noes!', custom: 42 }) as any
  expect(error.message).toBe('Oh noes!')
  expect(error.custom).toBe(42)
})

test('FPInputError has expected message', () => {
  const error = new FPInputError('Oh noes!') as any
  expect(error.message).toBe('Oh noes!')
})

test('FPInputError has custom properties', () => {
  const error = new FPInputError('Oh noes!', { custom: 42 }) as any
  expect(error.message).toBe('Oh noes!')
  expect(error.custom).toBe(42)
})

test('FPInputError supports object-based message argument', () => {
  const error = new FPInputError({ message: 'Oh noes!' }) as any
  expect(error.message).toBe('Oh noes!')
})

test('FPInputError supports object-based argument w/ custom properties', () => {
  const error = new FPInputError({ message: 'Oh noes!', custom: 42 }) as any
  expect(error.message).toBe('Oh noes!')
  expect(error.custom).toBe(42)
})

test('FPCollectionError has expected message', () => {
  const error = new FPCollectionError('Oh noes!') as any
  expect(error.message).toBe('Oh noes!')
})

test('FPCollectionError has custom properties', () => {
  const error = new FPCollectionError('Oh noes!', { custom: 42 }) as any
  expect(error.message).toBe('Oh noes!')
  expect(error.custom).toBe(42)
})

test('Can .catch() thrown Errors', async () => {
  await (FP.resolve()
    .then(() => {
      throw new TypeError('Single toss')
    })
    .catch((err: Error) => {
      expect(err.message).toBe('Single toss')
    }) as any)
})

test('Can override .catch() results', async () => {
  const data = await (FP.resolve()
    .then(() => {
      throw new TypeError('Single toss')
    })
    .catch((err: Error) => ({ message: 'temp error, plz try again', _err: err })) as any)
  expect((data as any).message).toBe('temp error, plz try again')
})

test('Does .catchIf(filterType, fn) filtering by TypeError', async () => {
  await (FP.resolve()
    .then(() => {
      throw new Error('Oh noes')
    })
    .catchIf(TypeError, () => {
      throw new Error('arg too specific for .catch(type)')
    })
    .catch((err: Error) => {
      expect(err.message).toBe('Oh noes')
    }) as any)
})

test('Can override .catch() w/ .chain()', async () => {
  const pipeline = FP.chain()
    .map(() => FP.reject(new Error('Fail!')))
    .chainEnd()

  await expect(pipeline([1])).rejects.toBeTruthy()
})

test('Can override .catch() w/ .chain().quiet()', async () => {
  const pipeline = FP.chain()
    .quiet(3)
    .map(() => FP.reject(new Error('Fail!')))
    .chainEnd()

  await expect(pipeline([1])).resolves.toBeTruthy()
  await expect(pipeline([1, 2, 3, 4])).rejects.toBeTruthy()
})
