import "regenerator-runtime/runtime"
import test from 'ava'
import FP from '../'
import chalk from 'chalk'


test('FP.map(x * 2)', t => {
  return FP.resolve([1, 2, 3, 4, 5])
    .map(x => x * 2)
    .then(results => {
      t.deepEqual(results, [2, 4, 6, 8, 10])
    })
})

test('FP.map(x * 2).map(x * 2)', t => {
  return FP.resolve([1, 2, 3, 4, 5])
    .map(x => Number(x) * 2)
    .map(x => Number(x) * 2)
    .then(results => {
      // console.warn('results', results)
      t.deepEqual(results, [4, 8, 12, 16, 20])
    })
})

test('[...Promise].map(x * 4)', t => {
  return FP.resolve([FP.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
    .map(x => Number(x) * 4)
    .then(results => {
      // console.warn('results', results)
      t.deepEqual(results, [4, 8, 12, 16, 20])
    })
})

test('FP.flatMap(x * 2)', t => {
  return FP.resolve([[1, 2], [3, 4]])
    .flatMap(x => x)
    .then(results => {
      t.deepEqual(results, [1, 2, 3, 4])
    })
})

test('[...Promise].flatMap(f(x) * 2)', t => {
  return FP.resolve([FP.resolve([1, 2]), FP.resolve([3, 4])])
    .flatMap(x => x)
    .then(results => {
      t.deepEqual(results, [1, 2, 3, 4])
    })
})

test('FP.flatMap(f(x) * 2)', t => {
  return FP.resolve([1, 3])
    .flatMap(x => [x, x + 1])
    .then(results => {
      t.deepEqual(results, [1, 2, 3, 4])
    })
})

test('FP.reduce(sum)', t => {
  return FP.resolve([1, 2, 3, 4, 5])
    .reduce((total, n) => total + n, 0)
    .then(results => {
      t.is(results, 15)
    })
})

test('FP.filter(predicate)', t => {
  const isEven = x => x % 2 === 0
  return FP.resolve([1, 2, 3, 4, 5])
    .filter(isEven)
    .then(results => {
      t.deepEqual(results, [2, 4])
    })
})

test('FP.find(predicate)', t => {
  const isEven = x => x % 2 === 0
  return FP.resolve([1, 2, 3, 4, 5])
    .find(isEven)
    .then(results => {
      t.deepEqual(results, 2)
    })
})

test('FP.map handles invalid input arguments', t => {
  t.plan(2)
  return FP.resolve(void { tears: true })
    .map(() => t.fail('Should not be called'))
    .then(() => t.fail(`Shouldn't get here!`))
    .catch(ex => {
      // console.warn(chalk.cyanBright`ERR:`, ex)
      t.deepEqual(ex.__proto__.constructor.name, 'FPInputError')
      t.truthy(ex.message.includes('Value must be iterable'), `Unexpected response: ${ex.message}`)
    })
})

test('FP.map handles first exception correctly', t => {
  t.plan(2)
  const throwThings = async () => {
    throw new Error('🔪🔪🔪🔪🔪🔪🔪')
  }
  return FP.resolve([1, 2, 3])
    .map(throwThings)
    .then(() => t.fail(`Shouldn't get here!`))
    .catch(ex => {
      // console.log(ex)
      // t.truthy(ex instanceof FunctionalError)
      // console.warn(chalk.yellowBright`ERR:`, ex.__proto__.constructor.name)
      // console.warn(chalk.yellowBright`ERR:`, Object.getOwnPropertyNames(ex.__proto__.constructor))
      t.truthy(ex.__proto__.constructor.name === 'Error')
      t.truthy(ex.message.includes('🔪'), `Unexpected message: ${ex.message}`)
    })
})

test('FP.map handles multiple exceptions', t => {
  t.plan(2)
  const throwThings = async () => {
    throw new Error('🔪🔪🔪🔪🔪🔪🔪')
  }
  return FP.resolve([1, 2, 3])
    .quiet(2)
    .map(throwThings)
    .then(() => t.fail(`Shouldn't get here!`))
    .catch(ex => {
      t.truthy(ex.__proto__.constructor.name === 'FPCollectionError')
      t.truthy(ex.errors.length === 3)
    })
})

test('Can FP.quiet(42) Error', t => {
  t.plan(1)
  return FP.resolve([1, 2, 3, 4])
    .quiet(42)
    .map((n) => {
      if (n === 4) {
        return Promise.reject(new TypeError('#4 found, dummy error!'))
      }
      return n
    })
    .then((results) => {
      t.truthy(results[3] instanceof TypeError)
    })
    .catch(ex => {
      // console.warn(chalk.red`ERR:`, ex)
      t.fail(`Shouldn't get here!`)
    })
})

test('Can FP.quiet(1) + 2 errors trigger .catch()', t => {
  return FP.resolve([1, 2, 3, 4])
    .quiet(1)
    .map((n) => {
      if (n <= 3) {
        throw new TypeError(n + ' Found #3 or #4 found, dummy error!')
      }
      return n
    })
    .then(() => t.fail('shouldn\'t get here'))
    .catch(ex => {
      // console.warn(chalk.yellowBright`ERR:`, ex)
      t.truthy(ex.__proto__.constructor.name === 'FPCollectionError')
      t.truthy(ex.errors.length === 3)
      return ex
    })
})

test('Can FP.quiet() swallow Errors', t => {
  return FP.resolve([1, 2, 3, 4])
    .quiet(1)
    .map((n) => {
      if (n === 4) { throw new TypeError('#4 found, dummy error!') }
      return n
    })
    .then((results) => {
      t.truthy(results[3] instanceof TypeError)
    })
    .catch(ex => {
      console.log(chalk.cyanBright`FAILED TO QUIET ERROR:`, ex)
      t.fail('shouldnt get here')
    })
})

