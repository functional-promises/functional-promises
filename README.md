# Functional Promises

[![Build Status](https://travis-ci.org/justsml/functional-promises.svg?branch=master)](https://travis-ci.org/justsml/functional-promises)
[![GitHub package version](https://img.shields.io/github/package-json/v/justsml/functional-promises.svg?style=flat)](https://github.com/justsml/functional-promises)
[![GitHub stars](https://img.shields.io/github/stars/justsml/functional-promises.svg?label=Stars&style=flat)](https://github.com/justsml/functional-promises)

## Installation

```sh
npm install functional-promise
```

## Summary

This library is aimed at supporting a specific **Function Chaining technique** (using composition).

There are many names for this pattern. Including Composition Pipeline and Promise Chain.
The emphasis here is a seamless async/sync Developer Experience. I call this pattern a `Functional River` - essentially your data is processed in a deterministic sequence of steps (functions).

### Advantages

* Easily handle Sync, Async, Events, Promises, and Callbacks.
* Familiar methods, including `Array.prototype.map`, `[].filter()`, `[].find()`, `[].some()`, etc.
* Create Monads in JavaScript (so far as they contain side-effects to a sequence of instructions).
* Point-free code is easily achieved.
* Higher code test coverage w/ less repetitive code in tests.
* Use the best features from multiple programming styles: a little imperative, plenty functional, a pinch of OOP, yet still resembling declarative methods!!!

How? Let's look at some examples...

## Getting Started

Use one of the following:

```js
const FP = require('functional-promise')
// or:
import FP from 'functional-promise'
```

### Quick Examples

**Using `.map()`**

```js
FP.resolve([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .map(x => x * 2)
  .then(results => {
    // results === [4, 8, 12, 16, 20]
  })
```

**Handling Events**

Create function chains to handle the case where memoized promises don't fit very naturally.

For example streams & event handlers must (usually) support multiple calls over time.

Here's how `FP.chain()` and `FP.chainEnd()`/`FP.listen(obj, event)` help you handle this like a pro:

```js
const button = document.getElementById('submitBtn')
FP.chain() // start a chain
  .then(({target}) => { // destructure 'target' from the `event`
    target.textContent = 'Clicked!'
  })
  .listen(button, 'click') // end the repeatable chain, started at `.chain()`
```

## API

* Then-based extensions
  * Arrays
    * `.map(fn)`
    * `.filter(fn)`
    * `.find(fn)`
    * `.findIndex(fn)`
    * `.some(fn)`
    * `.none(fn)`
    * `.series(fn)`
    * `.forEach(fn)` - use `.map()` - write _proper_ `functions`
  * Errors _(WIP)_
    * `.catch(fn)`
    * `.catch(filter, fn)`
  * Conditional
    * `.thenIf()`
  * Utilities
    * `FP.all(Object/Array)`
    * `.tap(fn)`
    * `FP.iPromise`
  * Chaining and Composition
    * `.chain()`
    * `.chainEnd()`
  * Properties
    * `.get(keyName)`
    * `.set(keyName, value)`
* Modifier extensions
  * `.quiet()` - prevents errors from stopping array methods mid-loop
  * `.concurrency(threadLimit)` - limits parallel workers for array methods

#### Arrays

##### `FP.map(iterable, transformFn)`

```js
FP.resolve([1, 2, 3, 4, Promise.resolve(5)])
  .map(x => x * 2)
  .then(results => {
    assert.deepEqual(results, [2, 4, 6, 8, 10])
  })
```

##### `FP.filter(iterable, filterFn)`

```js
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 3, 4, 5])
  .filter(isEven)
  .then(results => {
    assert.deepEqual(results, [2, 4])
  })
```

##### `FP.find(fn)`

Returns first item to return truthy for `fn(item)`

If no match is found it will return `undefined`.

```js
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 3, 4, 5])
  .find(isEven)
  .then(results => {
    assert.deepEqual(results, 2)
  })
```

##### `FP.findIndex()`

Returns first **item's index** to return truthy for `fn(item)`

If no match is found it will return `-1`.

```js
const isEven = x => x % 2 === 0
FP.resolve([1, 2, 3, 4, 5])
  .findIndex(isEven)
  .then(results => {
    assert.equal(results, 1)
  })
```

##### `FP.some()`
##### `FP.none()`
##### `FP.series()`
##### `FP.forEach()` alias of `.map()`

#### Properties

##### `FP.get(keyName)`
##### `FP.set(keyName, value)`

```js
// create a chain to handle events:
FP.chain()
  .get('target')
  .set('textContent', 'Clicked!')
  .listen(button, 'click')
```

It may be unfamiliar at first, but I bet you can guess what that does.

Here's basically the same code:

```js
const button = document.getElementById('submitBtn')
FP.chain()
  .get('target')
  .then(element => element.textContent = 'Clicked!')
  .listen(button, 'click')
```

#### Chains

> (Forgive me Haskell people, but I'm calling this a monad)

`const pChain = FP.chain()...[chain].chainEnd()`

##### Usage:

Create a re-usable sequence of steps:

```js
const squareAndFormatDecimal = FP
  .chain()
  .map(x => x * x)
  .map(x => parseFloat(x).toFixed(2))
  .chainEnd()
// typeof squareAndFormatDecimal === 'function'
squareAndFormatDecimal([5])
.then(num => {
  console.log('squareAndFormatDecimal() Results: ', num)
  // num === ['25.00']
})

```


Create a re-usable event handler - all with simple functions.

```js
function addTodoHandler() {
  const statusLbl = document.querySelector('label.status')
  const setStatus = s => statusLbl.textContent = s
  const setError  = err => setStatus(`ERROR: ${err}`)

  return FP
    .chain()
    .then(event => event.target)
    .then(form => form.querySelector('input.todo-text').value)
    .then(todoText => ({id: null, complete: false, text: todoText}))
    .then(todoAPI.create)
    .then(createResult => setStatus(createResult.message))
    .catch(setError)
    .chainEnd()
}

const form = document.querySelector('form')
const submitHandler = addTodoHandler()
form.addEventListener('submit', submitHandler)

```

##### Realistic .chain() Example

A more realistic 'class' like object.

Again, still all with simple functions:


```js
// implement a simple controller/component interface:
const todoCtrl = TodoController()

todoCtrl
  .add('new item')
  .then(result => {
    todoCtrl.update({id: 1, text: 'updated item', complete: true})
  })

/**
 * Here's a more realistic, 'tighter' example:
 * TodoController will return an object with `add` and `update` methods
 *  - based on FP.chain()
 */
function TodoController() {
  const statusLbl = document.querySelector('label.status')
  const setStatus = s => statusLbl.textContent = s

  return {
    add: FP.chain()
      .then(input => ({id: null, complete: false, text: input}))
      .then(todoAPI.create)
      .tap(createResult => setStatus(createResult.message))
      .chainEnd(),
    update: FP.chain()
      .then(input => ({id: input.id, complete: input.complete, text: input.text}))
      .then(todoAPI.update)
      .tap(updateResult => setStatus(updateResult.message))
      .chainEnd(),
  }

}
```



#### Events

`FP.chain()...[chain].listen(element, ...eventNames)`

`.listen()` calls the function returned by `.chainEnd()`


#### Utilities

##### `FP.resolve(<anything>)`

Turn anything into an FP Promise.


Use with existing Promise supporting libraries.

```js
FP.resolve(Promise.resolve(anything))
```

##### `FP.thenIf()`

> Use `fetch` with `FP.thenIf()` to handle 4xx or 5xx responses as proper exceptions.

```js
FP.resolve(fetch('/profile', {method: 'GET'}))
  .thenIf(
    res => res.ok, // Check for 2xx status code using `fetch`'s behavior
    res => res.json(), // Success, so pass along the JSON-parsed body
    res => Promise.reject(new Error('Profile GET Failed'))) // Fails here if response not `ok`
  .get('avatar') // Get the response JSON object's `avatar` key value
  .then(avatarUrl => imageElem.src = avatarUrl)
```

> Email validation
```js
// Use like so:
FP.resolve(email)
  .thenIf(
    e => e.length > 5, // Conditional
    e => console.log('Valid: ', e), // ifTrue
    e => console.error('Bad Email: ', e)) // ifFalse

// Or use small helper methods like so:
const checkEmail = email => FP.resolve(email)
  .thenIf(e => e.length > 5)

// Or to check if a user login successfully returned a token:
const authUser = (email, pass) =>
  FP.resolve({email, pass})
  .then(({email, pass}) => svc.loginAndGetUser(email, pass))
  .thenIf(
    user => user.token, // is valid login
    user => user, // return user to next .then function
    () => {throw new Error('Login Failed!')})) // failed token test
```

##### `FP.all()`

FP.all provides an extended utility above the native `Promise.all()`, supporting Objects and Arrays.

```js
FP.all({
  one: promise,
  two: promise
})
.then(results =>
  // results === {
  //   one: 1,
  //   two: 2}
)
```

```js
FP.all([
  Promise.resolve(1),
  Promise.resolve(2)
])
.then(results =>
  // results === [1, 2])
)
```

##### `FP.iPromise`

Use sparingly, this is uses destructuring to (more cleanly) achieve what `deferred` attempts. `deferred` is an anti-pattern 90% of the time. Stream & event handling are exempt from this 'rule'.

```js
function uncommonEventHandlingEdgeCase() {
  const { promise, resolve, reject } = FP.iPromise()
  setTimeout(() => { resolve('All done!') }, 1000)
  return promise
}
uncommonEventHandlingEdgeCase()
  .then(result =>
    // result === 'All done!'
  )
```

> Thanks to several influencial projects: RxJS, Bluebird, asynquence, FantasyLand, Gulp, HighlandJS, et al.
>
> Special thanks to [Kyle Simpson](https://github.com/getify), [Eric Elliot](https://medium.com/@_ericelliott), [MPJ](https://www.youtube.com/channel/UCO1cgjhGzsSYb1rsB4bFe4Q).
