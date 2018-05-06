# Functional Promises

[![Build Status](https://travis-ci.org/functional-promises/functional-promises.svg?branch=master)](https://travis-ci.org/functional-promises/functional-promises)
[![GitHub package version](https://img.shields.io/github/package-json/v/functional-promises/functional-promises.svg?style=flat)](https://github.com/functional-promises/functional-promises)
[![GitHub stars](https://img.shields.io/github/stars/functional-promises/functional-promises.svg?label=Stars&style=flat)](https://github.com/functional-promises/functional-promises)

# [Updated Documentation: fpromises.io](http://www.fpromises.io/)

[![New Docs](docs-source/source/images/FunctionalPromises-Docs-Upgraded-960w.gif?raw=true)](http://www.fpromises.io/)

## Summary

The Functional Promises library is a [Fluent API](https://en.wikipedia.org/wiki/Fluent_interface#JavaScript) supporting a specific **Function Chaining technique** (using composition).

> Note: `FP` **doesn't replace or extend** Promises. It uses them.

There are many names for this general pattern. Including [Collection Pipeline](https://martinfowler.com/articles/collection-pipeline/) and Promise Chain.
The emphasis here is a seamless async/sync Developer Experience.

I call this pattern a `Functional River` - your `data` is the _water_, and your `functions` describe its _path_ or riverbed.

### Advantages

* Only 400 Lines of Source & 4Kb Gzipped
* Easily handle Sync, Async, Events, Promises, and Callbacks.
* Familiar methods, including `Array.prototype.map`, `[].filter()`, `[].find()`, `[].some()`, etc.
* Create Monads in JavaScript (so far as they contain side-effects to a sequence of instructions).
* Point-free code is easily achieved (no temp variables).
* Higher code test coverage w/ less repetitive code in tests.
* Use the best features from multiple programming styles: a little imperative, plenty functional, a pinch of OOP, yet still resembling declarative methods!!!

#### Library Comparison

Total Lines of Code (LoC) calculated using `cloc` CLI utility.

LoC #'s included because a smaller surface === fewer places bugs can hide.


| Library                                                       | Main deal                  | Files     | Lines of Code  | .min.js kB
|------------------------------                                 |-----------                 |---------: |--------------: |-------------------:
| **Functional Promise v1.5.3**                                 | Sync & Async Chains        |         8 |           375  | 16 Kb (4Kb gzip)
| [Bluebird](https://github.com/petkaantonov/bluebird) v3.5.1   | Promises Replacement       |        38 |         5,188  | 80 Kb
| [RxJS](https://github.com/ReactiveX/RxJS) v5.5.6              | Observables Chaining       |       458 |        12,266  | 150 Kb
| [IxJS](https://github.com/ReactiveX/IxJS) v2.3.4              | \[Async\]Iterable Chaining |       521 |        12,366  | 145 Kb

Admittedly `IxJS`/`RxJS` have a far larger API than `FP` also some behavior in `RxJS`/`IxJS` may never be added.
Currently however there is a lot of overlap with `FP` (plus more planned).

The table above show `FP` is roughly **1/30th** the LOC (lines of code) in `R/IxJs`.
`FP`'s bundle size is about **10%** the size of either `RxJS`/`IxJS`.

`BluebirdJS` and `FP` have roughly the same number of API methods, yet `Bluebird` has a **fair bit more code**.

> **To be clear: Bluebird and RxJS/IxJS are amazing.** Their interface/designs has been very influential on `FP`.
>
> Note: [R/IxJS](https://github.com/ReactiveX/IxJS)'s hyper-modular design also allows for bundles to be lots smaller (though using quite different syntax, either `.pipe(...)` or `ix/iterable`/`ix/add/...`).

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

# [API Outline](http://fpromises.io/)

* [Thenable Methods](http://www.fpromises.io/#thenable-methods)
    * [Arrays](http://www.fpromises.io/#array-methods)
        * [`.map(fn)`](http://www.fpromises.io/#fp-map)
        * [`.filter(fn)`](http://www.fpromises.io/#fp-filter)
        * [`.find(fn)`](http://www.fpromises.io/#fp-find)
        * [`.findIndex(fn)`](http://www.fpromises.io/#fp-findIndex)
        * [`.some(fn)`](http://www.fpromises.io/#fp-some)
        * [`.none(fn)`](http://www.fpromises.io/#fp-none)
        * [`.series(fn)`](http://www.fpromises.io/#fp-series)
    * [Errors](http://www.fpromises.io/#errors)
        * [`.catch(fn)`](http://www.fpromises.io/#fp-catch)
        * [`.catch(filter, fn)`](http://www.fpromises.io/#fp-catch)
    * [Conditional](http://www.fpromises.io/#conditional)
        * [`.thenIf(fn, ifTrue, ifFalse)`](http://www.fpromises.io/#fp-thenIf)
    * [Utilities](http://www.fpromises.io/#utilities)
        * [`.tap(fn)`](http://www.fpromises.io/#fp-tap)
        * [`.delay(msec)`](http://www.fpromises.io/#fp-delay)
    * [Properties](http://www.fpromises.io/#properties)
        * [`.get(keyName)`](http://www.fpromises.io/#fp-get)
        * [`.set(keyName, value)`](http://www.fpromises.io/#fp-set)
* [Specialty Methods](http://www.fpromises.io/#specialty-methods)
    * [Helpers](http://www.fpromises.io/#helpers)
        * [`FP.resolve()`](http://www.fpromises.io/#fp-resolve)
        * [`FP.all(Object/Array)`](http://www.fpromises.io/#fp-all)
        * [`FP.unpack()`](http://www.fpromises.io/#fp-unpack)
    * [Events](http://www.fpromises.io/#events)
        * [`.listen(obj, ...eventNames)`](http://www.fpromises.io/#fp-listen)
    * [Composition Pipelines](http://www.fpromises.io/#composition-pipelines)
        * [`FP.chain(options)`](http://www.fpromises.io/#fp-chain)
        * [`.chainEnd()`](http://www.fpromises.io/#fp-chainend)
    * [Modifiers](http://www.fpromises.io/#modifiers)
        * [`.quiet()` - prevents errors from stopping array methods mid-loop](http://www.fpromises.io/#fp-quiet)
        * [`.concurrency(threadLimit)` - limits parallel workers for array methods](http://www.fpromises.io/#fp-concurrency)



## Development

```sh
git clone git@github.com:functional-promises/functional-promises.git
cd functional-promises
npm install
npm test
```


> Thanks to several influencial projects: [RxJS](https://github.com/ReactiveX/RxJS), [IxJS](https://github.com/ReactiveX/IxJS), [Bluebird](https://github.com/petkaantonov/bluebird), [asynquence](https://github.com/getify/asynquence), [FantasyLand](https://github.com/fantasyland/fantasy-land), [Gulp](https://github.com/gulpjs/gulp), [HighlandJS](https://github.com/caolan/highland), et al.
>
> Special thanks to [Kyle Simpson](https://github.com/getify), [Eric Elliot](https://medium.com/@_ericelliott), and [Sarah Drasner](https://sarahdrasnerdesign.com/) for their work for the OSS community, as well as their advice & encouragement.
