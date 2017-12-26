# Functional Promises

[![Build Status](https://travis-ci.org/justsml/functional-promises.svg?branch=master)](https://travis-ci.org/justsml/functional-promises)



## Installation

```sh
npm install functional-promises
```

> Thanks to several influencial projects: RxJS, Bluebird, FantasyLand, Gulp, HighlandJS, et al.
> Special thanks to Eric Elliot & Kyle Simpson, even if you don't support the goals behind my crazy little library. :)

## Summary

This library is aimed at supporting a specific **Function Chaining technique** (using composition).

There are many names for this code, Composition Pipeline,
The pattern is called a `Functional River` - it makes your code easier to follow.

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
```

#### Array Examples

> STATUS: COMPLETED w/ TESTS

##### map Example

```js
FP.resolve([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .map(x => x * 2)
  .then(results => {
    // results === [4, 8, 12, 16, 20]
  })
```

#### Event Examples

> STATUS: Work in Progress

**Events Proposal**

```js
FP.on('click', button)
  .get('target')
  .set('textContent', 'Clicked!')
  .listen()
```

It may be unfamiliar at first, but I bet you can guess what that does.

Here's basically the same code, a little less fancy:

```js
FP.on('click', button)
  .get('target')
  .then(element => element.textContent = 'Clicked!')
  .listen()
```

And again, using a more pure ES2015 + native-promise solution:

```js
FP.on('click', button)
  .then(({target}) => {
    target.textContent = 'Clicked!'
  })
  .listen()
```


## API

#### Collection Methods

##### `FP.map()`
##### `FP.filter()`
##### `FP.find()`
##### `FP.findIndex()`
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

Promise.resolve()

```

##### `FP.thenIf()`

##### `FP.all()`

FP.all provides an extended utility above the native `Promise.all()`, supporting Objects and Arrays.

```
FP.all({
  one: <promise>,
  two: <promise>
})
.then(results =>
  // results === {
    one: 1,
    two: 2
  })
```

```
FP.all([
  Promise.resolve(1),
  Promise.resolve(2)
])
.then(results =>
  // results === [
    1,
    2
  ])
```

