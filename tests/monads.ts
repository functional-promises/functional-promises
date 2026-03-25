import { expect, test } from 'vitest'
import FP from '../src/index'
import fetch from './data/justsml.github'

test('Validate Multiple Chained Steps', () =>
  (FP.resolve(fetch('https://api.github.com/users/justsml'))
    .delay(1)
    .tap((res: { ok: boolean }) => `github user req ok? ${res.ok}`)
    .then((res: { json: () => Promise<unknown> }) => res.json())
    .then((data: { avatar_url: string }) => data.avatar_url) as any)
    .tap((url: string) => expect(url).toBe('https://avatars2.githubusercontent.com/u/397632?v=4')))

test('Validate .chain() w/ Multiple Steps', async () => {
  const loadAvatar = (FP.chain()
    .then(fetch) as any)
    .delay(1)
    .tap((res: { ok: boolean }) => `github user req ok? ${res.ok}`)
    .then((res: { json: () => Promise<unknown> }) => res.json())
    .then((data: { avatar_url: string }) => data.avatar_url)
    .chainEnd()

  const avatar = await loadAvatar('https://api.github.com/users/justsml')
  expect(avatar).toBe('https://avatars2.githubusercontent.com/u/397632?v=4')
})

// ---------------------------------------------------------------------------
// Issue 19: chain()/chainEnd() error cases and reuse
// ---------------------------------------------------------------------------

test('chainEnd() — rejects when a step throws', async () => {
  const process = FP.chain()
    .then((x: unknown) => { throw new Error(`chain error: ${x}`) })
    .chainEnd()

  await expect(process('input')).rejects.toThrow('chain error: input')
})

test('chainEnd() — catch step handles errors in chain', async () => {
  const process = FP.chain()
    .then(() => { throw new Error('oops') })
    .catch(() => 'recovered')
    .chainEnd()

  const result = await process('anything')
  expect(result).toBe('recovered')
})

test('chainEnd() result function can be called multiple times', async () => {
  const double = FP.chain()
    .then((x: unknown) => (x as number) * 2)
    .chainEnd()

  expect(await double(3)).toBe(6)
  expect(await double(5)).toBe(10)
  expect(await double(0)).toBe(0)
})

test('chain() with map() step processes arrays', async () => {
  const processItems = FP.chain()
    .map((x: number) => x * 3)
    .chainEnd()

  const result = await processItems([1, 2, 3])
  expect(result).toEqual([3, 6, 9])
})
