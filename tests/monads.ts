import { expect, test } from 'vitest'
import FP from '../src/index'
import fetch from './data/justsml.github'

test('Validate Multiple Chained Steps', () =>
  FP.resolve(fetch('https://api.github.com/users/justsml'))
    .delay(1)
    .tap((res: { ok: boolean }) => `github user req ok? ${res.ok}`)
    .then((res: { json: () => Promise<unknown> }) => res.json())
    .then((data: { avatar_url: string }) => data.avatar_url)
    .tap((url: string) => expect(url).toBe('https://avatars2.githubusercontent.com/u/397632?v=4')))

test('Validate .chain() w/ Multiple Steps', async () => {
  const loadAvatar = FP.chain()
    .then(fetch)
    .delay(1)
    .tap((res: { ok: boolean }) => `github user req ok? ${res.ok}`)
    .then((res: { json: () => Promise<unknown> }) => res.json())
    .then((data: { avatar_url: string }) => data.avatar_url)
    .chainEnd()

  const avatar = await loadAvatar('https://api.github.com/users/justsml')
  expect(avatar).toBe('https://avatars2.githubusercontent.com/u/397632?v=4')
})
