# Functional Promises

[![Build Status](https://travis-ci.org/justsml/functional-promises.svg?branch=master)](https://travis-ci.org/justsml/functional-promises)


## Installation

```sh
npm install functional-promises
```

## Summary

This library is aimed at supporting a specific **Function Chaining technique** (using composition).

There are many names for this pattern. Including Composition Pipeline and Promise Chain.
The emphasis here is a seamless async/sync Developer Experience. I call this pattern a `Functional River` - essentially your data is processed in a deterministic sequence of steps (functions).

### Advantages

* Easily handle Sync, Async, Streams, Events, Promises, and Callbacks.
* Familiar methods, including `Array.prototype.map`, `[].filter()`, `[].find()`, `[].some()`, etc.
* Create Monads in JavaScript (as far as they contain side-effects to a sequence of instructions).
* Point-free code is easily achieved.
* Higher code test coverage w/ less repetitive code in tests.
* Use the best features from multiple programming styles: a little imperative, plenty functional, a pinch of OOP, yet still resembling declarative methods!!!

How? Let's look at some examples...

## Examples

Assuming the following import:

```js
const FP = require('functional-promises')
// or:
import FP from 'functional-promises'
```

#### Array Examples

##### .map

```js
FP.resolve([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .map(x => x * 2)
  .then(results => {
    // results === [4, 8, 12, 16, 20]
  })
```

#### Event Examples

> **Subject to change**

Create function chains to handle the case where memoized promises don't fit very naturally.

For example streams & event handlers must (usually) support multiple calls over time.

Here's how `FP.on()` and `FP.listen()` help you (roughly) handle this like so:

```js
const button = document.getElementById('submitBtn')
FP.on(button, 'click') // start a chain
  .then(({target}) => { // destructure 'target' from the `event`
    target.textContent = 'Clicked!'
  })
  .listen() // end the repeatable chain, started at `.on`
```

Here's the same code using some sugary extras:

```js
FP.on(button, 'click')
  .get('target')
  .set('textContent', 'Clicked!')
  .listen()
```

It may be unfamiliar at first, but I bet you can guess what that does.

Here's basically the same code:

```js
const button = document.getElementById('submitBtn')
FP.on(button, 'click')
  .get('target')
  .then(element => element.textContent = 'Clicked!')
  .listen()
```


## API

#### Collection Methods

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


#### Events

`FP.on(eventName, element)...[chain].listen()`

#### Utilities

##### `FP.resolve(<anything>)`

Turn anything into an FP Promise.


Use with existing Promise supporting libraries.

```js
FP.resolve(Promise.resolve(anything))
```

##### `FP.thenIf()`

```js
// Use like so:
FP.resolve(email)
  .thenIf(
    e => e.length > 5, // Conditional
    e => console.log('Valid: ', e), // ifTrue
    e => console.error('Bad Email: ', e)) // ifFalse
// Or like so:
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


> Thanks to several influencial projects: RxJS, Bluebird, asynquence, FantasyLand, Gulp, HighlandJS, et al.
>
> Special thanks to [Kyle Simpson](https://github.com/getify), [Eric Elliot](https://medium.com/@_ericelliott), [MPJ](https://www.youtube.com/channel/UCO1cgjhGzsSYb1rsB4bFe4Q).
