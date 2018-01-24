# Functional Promises


[![Build Status](https://travis-ci.org/justsml/functional-promises.svg?branch=master)](https://travis-ci.org/justsml/functional-promises)
[![GitHub package version](https://img.shields.io/github/package-json/v/justsml/functional-promises.svg?style=flat)](https://github.com/justsml/functional-promises)
[![GitHub stars](https://img.shields.io/github/stars/justsml/functional-promises.svg?label=Stars&style=flat)](https://github.com/justsml/functional-promises)


# [Updated Documentation: fpromises.io](http://www.fpromises.io/)

[![New Docs](docs-source/source/images/FunctionalPromises-Docs-Upgraded.gif?raw=true)](http://www.fpromises.io/)

## Summary

This library is aimed at supporting a specific **Function Chaining technique** (using composition).

There are many names for this pattern. Including Composition Pipeline and Promise Chain.
The emphasis here is a seamless async/sync Developer Experience. I call this pattern a `Functional River` - your `data` is the _water_, and your `functions` describe its _path_ or riverbed.

### Advantages

* Easily handle Sync, Async, Events, Promises, and Callbacks.
* Familiar methods, including `Array.prototype.map`, `[].filter()`, `[].find()`, `[].some()`, etc.
* Create Monads in JavaScript (so far as they contain side-effects to a sequence of instructions).
* Point-free code is easily achieved.
* Higher code test coverage w/ less repetitive code in tests.
* Use the best features from multiple programming styles: a little imperative, plenty functional, a pinch of OOP, yet still resembling declarative methods!!!

#### Library Comparison

| Library                     	| # Files 	| # Lines Code 	 | **Browser** Bundle Kb
|------------------------------	|---------: |--------------: |-------------------:
| **Functional Promise v1.4** 	|       8 	|          376 	 | 30 Kb
| [Bluebird](https://github.com/petkaantonov/bluebird) v3.5.1             	|      38 	|         5188 	 | 80 Kb
| [RxJS](https://github.com/ReactiveX/RxJS) v5.5.6                 	|     458 	|        12,266  | 150 Kb
| [IxJS](https://github.com/ReactiveX/IxJS) v2.3.4                 	|     521 	|        12366 	 | 145 Kb


This shows `FP` is roughly **1/30th** the LOC (lines of code) in `IxJs`. And it's bundle size is almost **1/5th** the size. `IxJS`/`RxJS` feature a far more expansive API than `FP`.

`BluebirdJS` and `FP` have roughly the same number of API methods, yet `Bluebird` has a **fair bit more code** to sort through.

> **Let me be clear: Bluebird and RxJS/IxJS are amazing.**
>
> Their patterns have clearly been influential on `FP`'s design.
>
> [IxJS](https://github.com/ReactiveX/IxJS)'s hyper-modular design also allows for bundles to be lots smaller (though using quite different syntax, either `.pipe(...)` or `ix/iterable`/`ix/add/...`).


## Installation

```sh
npm install functional-promise
```

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

Create function chains to handle the case where promises don't fit very naturally.

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

# [View API](http://fpromises.io/#api)





> Thanks to several influencial projects: [RxJS](https://github.com/ReactiveX/RxJS), [IxJS](https://github.com/ReactiveX/IxJS), [Bluebird](https://github.com/petkaantonov/bluebird), [asynquence](https://github.com/getify/asynquence), [FantasyLand](https://github.com/fantasyland/fantasy-land), [Gulp](https://github.com/gulpjs/gulp), [HighlandJS](https://github.com/caolan/highland), et al.
>
> Special thanks to [Kyle Simpson](https://github.com/getify), [Eric Elliot](https://medium.com/@_ericelliott), [MPJ](https://www.youtube.com/channel/UCO1cgjhGzsSYb1rsB4bFe4Q).
