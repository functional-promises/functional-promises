# Functional Promises


[![Build Status](https://travis-ci.org/justsml/functional-promises.svg?branch=master)](https://travis-ci.org/justsml/functional-promises)
[![GitHub package version](https://img.shields.io/github/package-json/v/justsml/functional-promises.svg?style=flat)](https://github.com/justsml/functional-promises)
[![GitHub stars](https://img.shields.io/github/stars/justsml/functional-promises.svg?label=Stars&style=flat)](https://github.com/justsml/functional-promises)


## [Updated Documentation Site](http://www.fpromises.io/)

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

## [View API](http://fpromises.io/#api)





> Thanks to several influencial projects: RxJS, Bluebird, asynquence, FantasyLand, Gulp, HighlandJS, et al.
>
> Special thanks to [Kyle Simpson](https://github.com/getify), [Eric Elliot](https://medium.com/@_ericelliott), [MPJ](https://www.youtube.com/channel/UCO1cgjhGzsSYb1rsB4bFe4Q).
