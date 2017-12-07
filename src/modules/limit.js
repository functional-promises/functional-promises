module.exports = concurrency => {
  const queue = []
  let activeCount = 0

  const next = () => {
    activeCount--
    if (queue.length > 0) queue.shift()()
  }

  return fn =>
    new Promise((resolve, reject) => {
      const run = () => {
        activeCount++

        fn().then(
          val => {
            resolve(val)
            next()
          },
          err => {
            reject(err)
            next()
          }
        )
      }

      if (activeCount < concurrency) {
        run()
      } else {
        queue.push(run)
      }
    })
}
