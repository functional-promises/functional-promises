import test from 'ava'
import FP from '../../'


test('Issue #75, UnhandledRejections', t => {
  const iThrowThings = async () => {
    throw new Error('🔪🔪🔪🔪🔪🔪🔪')
  }
  
  const brokenPromises = () => FP.resolve([{ tears: true }])
    .map(iThrowThings)
    .then(() => {
      console.log('whaaaa')
    }).catch(ex => { throw ex })
  
  try {
    return brokenPromises()
    // .then(() => t.fail())
    .catch(() => t.pass())

  } catch (ex) {
    console.log('dumb me')
  }
})

