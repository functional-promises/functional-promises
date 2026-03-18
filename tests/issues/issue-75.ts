import { expect, test } from 'vitest'
import FP from '../../src/index'

test('Issue #75, UnhandledRejections', async () => {
  const iThrowThings = async () => {
    throw new Error('🔪🔪🔪🔪🔪🔪🔪')
  }

  const brokenPromises = () =>
    FP.resolve([{ tears: true }])
      .map(iThrowThings)
      .then(() => undefined)
      .catch((ex: Error) => {
        throw ex
      })

  await expect(brokenPromises()).rejects.toBeTruthy()
})
