---
title: Functional Promises - API Documentation

# language_tabs: # must be one of https://git.io/vQNgJ
#   - javascript

toc_footers:
  - <a class='social github' href='https://github.com/justsml/functional-promises'>Star on GitHub</a>
  - <a class='bottom' target='_blank' href='https://github.com/lord/slate'>Docs Powered by Slate</a>

# includes:
#   - errors

search: true
---

# Functional Promises

> **Installation**

```sh
npm install functional-promise
```

> **Getting Started**

```javascript
//// Use one of the following:
const FP = require('functional-promise')
//  OR:
import FP from 'functional-promise'
```

###### [View `Functional Promises` on Github](https://github.com/justsml/functional-promises)

> <p style='text-align: center;'><strong style='font-size: 24px;'>Examples &amp; Awesome Shit</strong></p>

> Array-style methods are built-in:

```javascript
FP.resolve(['1', '2', '3', '4', '5'])
  .map(Number)
  .filter(x => x % 2 === 0)
  .then(results => {
    console.log(results) // [2, 4
  })
```

> Create re-usable sequences of functions with `.chain()`.

```javascript
const squareAndFormatDecimal = FP
  .chain()
  .concurrency(4)
  .map(x => x * x)
  .concurrency(2)
  .map(x => parseFloat(x).toFixed(2))
  .chainEnd() // returns function

squareAndFormatDecimal([5, 10, 20])
  .then(num => console.log(num)) // ['25.00', '100.00', '400.00']
```

> Use [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) with `FP.thenIf()` to handle `response.ok === false` with custom response.

```javascript
//// Wrap `fetch()` with `FP.resolve()` to use `FP`'s methods
FP.resolve(fetch('/profile', {method: 'GET'}))
  .thenIf( // thenIf lets us handle branching logic
    res => res.ok, // Check if response is ok
    res => res.json(), // if true, return the parsed body
    res => ({avatar: '/no-photo.svg'})) // fail, use default object
  .get('avatar') // Get the resulting objects `avatar` value
  .then(avatarUrl => imgElement.src = avatarUrl)
```

[![Build Status](https://travis-ci.org/justsml/functional-promises.svg?branch=master)](https://travis-ci.org/justsml/functional-promises)
[![GitHub package version](https://img.shields.io/github/package-json/v/justsml/functional-promises.svg?style=flat)](https://github.com/justsml/functional-promises)
[![GitHub stars](https://img.shields.io/github/stars/justsml/functional-promises.svg?label=Stars&style=flat)](https://github.com/justsml/functional-promises)

[![NPM](https://nodei.co/npm/functional-promise.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/functional-promise)

### Summary

**Functional Promises** are an extension of the native Promises API (`.then()`/`.catch()`).

**Core features:** Array Methods, Events, Object & Array `FP.all()` Resolution, Re-usable Function Chains, Conditional/Branching Logic, Concurrency, Smart Error Handling.

**Why not simply use [library X]?**

* RxJS: `FP` is 1/5th the size. _Observable support still being evaluated._
* Bluebird: `FP` adds some key features: _events_, _conditionals_, _chains_, _quiet errors_.

`FP`'s **un-minified source** is **only ~400 lines** of code.
The **browser bundle** weighs in at **~20Kb** (using Webpack+Babel+Rollup+UglifyJS).

### Library Comparison

| Library                     	                                    | Main deal | Files   | Lines of Code  | .min.js kB
|------------------------------	                                    |-----------|---------: |--------------: |-------------------:
| **Functional Promise v1.4.30**                                  	| Sync & Async Chains | 8 |           384	 | 16 Kb
| [Bluebird](https://github.com/petkaantonov/bluebird) v3.5.1       | Promises Replacement |        38 |         5,188	 | 80 Kb
| [RxJS](https://github.com/ReactiveX/RxJS) v5.5.6                 	| Observables Chaining |     458 |        12,266  | 150 Kb
| [IxJS](https://github.com/ReactiveX/IxJS) v2.3.4                 	| \[Async\]Iterable Chaining |     521 |        12,366	 | 145 Kb


So `FP` is roughly **1/30th** the lines of code in `IxJs`. And it's bundle size is about **1/9th** the size. `IxJS`/`RxJS` do feature a far larger API.

BluebirdJS and FP have roughly the same number of API methods, yet Bluebird has a fair bit more code.

<p><b>To be clear:</b> Bluebird, RxJS and IxJS are amazing.</p>

<p>Their patterns have been quite influential on <code>FP</code>'s design.</p>

<b>Note:</b>&#160;<small><p><code>R/IxJS</code>'s modular design also allows for bundle sizes to <i>potentially</i> be smaller (using quite different syntax).</p></small>

### API Outline


All `.then()`-derived methods are listed first. It's the bulk of the API.

* [Thenable Methods](http://www.fpromises.io/#thenable-methods)
    * [Arrays](http://www.fpromises.io/#array-methods)
        * [`.map(fn)`](http://www.fpromises.io/#fp-map)
        * [`.filter(fn)`](http://www.fpromises.io/#fp-filter)
        * [`.find(fn)`](http://www.fpromises.io/#fp-find)
        * [`.findIndex(fn)`](http://www.fpromises.io/#fp-findindex)
        * [`.some(fn)`](http://www.fpromises.io/#fp-some)
        * [`.none(fn)`](http://www.fpromises.io/#fp-none)
        * [`.series(fn)`](http://www.fpromises.io/#fp-series)
    * [Errors](http://www.fpromises.io/#errors) _(WIP)_
        * [`.catch(fn)`](http://www.fpromises.io/#fp-catch)
        * [`.catch(filter, fn)`](http://www.fpromises.io/#fp-catch)
    * [Conditional](http://www.fpromises.io/#conditional)
        * [`.thenIf(fn, ifTrue, ifFalse)`](http://www.fpromises.io/#fp-thenif)
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
        * [`FP.chain(options)`](http://www.fpromises.io/#fp-chain-chainend)
        * [`.chainEnd()`](http://www.fpromises.io/#fp-chain-chainend)
    * [Modifiers](http://www.fpromises.io/#modifiers)
        * [`.quiet()` - prevents errors from stopping array methods mid-loop](http://www.fpromises.io/#fp-quiet)
        * [`.concurrency(threadLimit)` - limits parallel workers for array methods](http://www.fpromises.io/#fp-concurrency)

# Thenable Methods

> A `.catch()` is another type of `thenable`! It works because an Error in a Promise will cause it to skip or "surf" over `thenables` until it finds a special `thenable`: `.catch()`. It then takes that Error value and passes it into the function. `.catch(err=>{log(err.message)})`

> `Thenable` methods in `FP` include: Arrays, Errors, Conditional, Utilities, Properties, etc.

You can think of most `FP` methods as **wrappers derived from Native Promise's `.then()`.**

For example, `.tap(fn)`'s function will receive the resolved value exactly like a `.then()`. Except the function's `return` value will be ignored - and the next `thenable` in the chain will get the original input.


# &#160;&#160; Array Methods

```javascript
const rawData = [null, undefined, NaN, 0, '99']
FP.resolve(rawData)
  .filter(Boolean)        // truthiness check = ["99"]
  .map(Number)            // convert to numeric [99]
  .findIndex(n => n >= 1) // is gte 1, idx = 0
  .then(index => {
    console.log(index) // 0
  })
```

Any `.then()` which would handle an array, may instead use one of the `FP` array methods.

## `FP.map(iterable, fn)`

```javascript
FP.resolve([1, 2, 3, 4, Promise.resolve(5)])
  .map(x => x * 2)
  .then(results => {
    console.log(results)) // [2, 4, 6, 8, 10
  })
```

Similar to `Array.prototype.map((item[, index, array]) => {})`.

**Use to transforms an array of values, passing each through the given function.**

The return value will be a new array containing the result for each call to `fn(item)`.

For example, let's say you have to multiply a list of numbers by 2.

Using `FP.map()` to do this lets you focus on the important logic: `x => x * 2`

## `FP.filter(iterable, fn)`

```javascript
FP.resolve([1, null, 3, null, 5])
  .filter(Boolean)
  .then(results => console.log(results)) // [1, 3, 5]

// Or similarly:
FP.resolve([1, null, 3, null, 5])
  .filter(value => value ? true : false)
  .then(results => console.log(results)) // [1, 3, 5]
```

Use `.filter()` to omit items from the input array by passing through a given function. Items will be omitted if the function returns a falsey value.

<aside class="notice">
  The <code>Boolean</code> type can be used as a truthiness check. For example: <code>assert.equal(Boolean(1), true)</code>, <code>assert.equal(Boolean(false), false)</code>, <code>assert.equal(Boolean(null), false)</code>.
</aside>

## `FP.find(iterable, fn)`

```javascript
FP.resolve([1, 2, 3, 4, 5])
  .find(x => x % 2 === 0)
  .then(results => {
    console.log(results) // 2
  })
```

Returns first item to return truthy for `fn(item)`

If no match is found it will return `undefined`.

## `FP.findIndex(iterable, fn)`

```javascript
FP.resolve([1, 2, 3, 4, 5])
  .findIndex(x => x % 2 === 0)
  .then(results => {
    console.log(results) // 1
  })
```

Returns first **item's index** to return truthy for `fn(item)`

If no match is found it will return `-1`.

## `FP.some(iterable, fn)`

```javascript
FP.resolve([1, 2, 4])
  .some(x => x % 2 === 0)
  .then(results => {
    console.log(results, true)
  })
```

Returns `Promise<true>` on the first **item** to return truthy for `fn(item)`

If no truthy result is found, `.some()` returns `Promise<false>`.

## `FP.none(iterable, fn)`

```javascript
FP.resolve([1, 2, 4])
  .none(x => x % 2 === 0)
  .then(results => {
    console.log(results) // false
  })
```

`.none()` resolves to `Promise<false>` on the first **item** to return falsey for `fn(item)`

If no match is found it will return `Promise<true>`.

# &#160;&#160; Errors

## `FP.catch(fn)`
## `FP.catchIf(type, fn)`

> Catching errors by type

```javascript
FP.resolve()
  .then(() => {
    throw new TypeError('Oh noes')
  })
  .then(() => console.error('must skip this!'))
  .catch(ReferenceError, () => console.error('arg too specific for .catch(type)'))
  .catch(SyntaxError, () => console.error('arg too specific for .catch(type)'))
  .catch(TypeError, err => console.info('Success!!! filtered .catch(type)', err))
  .catch(err => console.error('Fallback, no error type matched'))
```

`.catch()` is analgous to native Promise error handling.

This example uses `TypeError` matching to print the 'success' message - ignoring the other `catch`'s.

# &#160;&#160; Conditional

## `FP.thenIf()`

> Email 'validator'

```javascript
let email = 'dan@danlevy.net'
FP.resolve(email)
  .thenIf(
    e => e.length > 5, // Conditional
    e => console.log('Valid: ', e), // ifTrue
    e => console.error('Bad Email: ', e)) // ifFalse
```

`.thenIf(condition(value), ifTrue(value), ifFalse(value))`

#### Arguments

> Functional Promise Login Flow

```javascript
//// Check if login successful, returning a token:
const authUser = (email, pass) => FP
  .resolve({email, pass})
  .then(({email, pass}) => svc.loginGetUser(email, pass))
  .thenIf(
    user => user.token, // is valid login
    user => user, // return user to next .then function
    () => {throw new Error('Login Failed!')}))
```

* `condition`, echo/truthy function: `(x) => x`
* `ifTrue`, echo function: `(x) => x`
* `ifFalse`, quiet function: `() => null`

The `condition` function should return either `true`/`false` or a promise that resolves to something `true`/`false`.

`ifTrue` function is called if the `condition` resulted in a truthy value. Conversely, `ifFalse` will be called if we got a false answer.

The return value of either `ifTrue`/`ifFalse` handler will be handed to the next `.then()`.

Default values let you call `.thenIf` with no args - if you simply want to exclude falsey values down the chain.


# &#160;&#160; Utilities

## `fp.tap(fn)`

```javascript
FP.resolve(fetch('http://jsonplaceholder.typicode.com/photos/11'))
  .tap(res => console.log(`ok:${res.ok}`))
  .then(res => res.json())
  .tap(data => console.log('Keys: ' + Object.keys(data).sort().join(',')))
  .then(data => `<img src='${data.url}' alt='${data.title}' />`)
  .tap(data => console.log('Image Url: ' + data.url))
```

```javascript
FP.resolve(fetch('https://api.github.com/users/justsml'))
  .tap(res => console.log(`github user req ok? ${res.ok}`))
  .then(res => res.json())
  .tap(data => console.log('Keys:', Object.keys(data)))
  .then(data => console.log(data))
```

The `.tap()` method is `FP`'s primary way to use the familiar `console.log()` - know it well.

It works just like `.then()` **except it's return value is ignored.** The next `thenable` will get the same input.

Perfect for logging or other background tasks (where results don't need to block).

## `fp.delay(ms)`

> Delay per-array item.

```javascript
const waitMs = 5
const started = Date.now()

FP.resolve([1, 2, 3])
  // 3 'main' ways to delay results
  // (examples to delay execution per-array-method)
  // #1: Shorthand w/ the static helper
  // .map(FP.delay(waitMs))
  // #2: Chaining off the static helper: FP.delay(waitMs)
  // .map(num => FP.delay(waitMs).then(() => num))
  // #3: With FP's instance method
  .map(num => FP.resolve(num).delay(waitMs))
  // and
  .then(() => {
    const measuredDelay = Date.now() - started
    console.log(`Delayed ${measuredDelay}ms.`)
    console.log(`Success: ${measuredDelay >= 15}`)
  })
```

> Single delay added mid-sequence.

```javascript
const started = Date.now()
FP.resolve([1, 2, 3])
  .delay(250)
  .map(num => num + num)
  .then(() => {
    const measuredDelay = Date.now() - started
    console.log(`Delayed ${measuredDelay}ms.`)
  })
```

`.delay(milliseconds)` is a helpful utility. It can help you avoid exceeding rate-limits in APIs. You can also use it to for simulated bottlenecks, adding 'slowdowns' exactly where needed can greatly assist in locating many kinds of complex bugs.

# &#160;&#160; Properties

These methods are particularly helpful for dealing with data extraction/transformation.

## `FP.get(keyName)`

```javascript
FP.resolve({foo: 42})
  .get('foo')
  .then(x => {
    console.log(x) // x === 42
  })
```

Use to get a single key's value from an object.

Returns the key value.

## `FP.set(keyName, value)`

> A common use-case includes dropping passwords or tokens.

```javascript
FP.resolve({username: 'dan', password: 'sekret'})
  .set('password', undefined)
  .then(obj => {
    console.log(obj.password) // obj.password === undefined
  })
```

Use to set a single key's value on an object.

Returns the **modified object.**

# Specialty Methods

# &#160;&#160; Helpers

## `FP.resolve(<anything>)`

> Promise like it's going out of style:

```javascript
FP.resolve()
FP.resolve(42)
FP.resolve(fetch(url))
FP.resolve(Promise.resolve(anything))
```

Turn anything into a `Functional Promise`!

Use to convert any Promise-like interface into an `FP`.

## `FP.all()`

```javascript
FP.all([
  Promise.resolve(1),
  Promise.resolve(2)
])
.then(results => console.log(results))

FP.all({
  one: Promise.resolve(1),
  two: Promise.resolve(2)
})
.then(results => console.log(results))
```

`FP.all()` provides an extended utility above the native `Promise.all()`, **supporting both Objects and Arrays.**

_Note:_ Non-recursive.

## `FP.unpack()`

```javascript
function edgeCase() {
  const { promise, resolve, reject } = FP.unpack()
  setTimeout(() => resolve('All done!'), 1000)
  return promise
}

edgeCase()
  .then(result => console.log(result))
```

Use sparingly. Stream &amp; event handling are exempt from this 'rule'. If using ES2015, destructuring helps to (more cleanly) achieve what `deferred` attempts.

`deferred` is an anti-pattern because it works against composition.

# &#160;&#160; Events

```javascript
//// Example DOM code:
const button = document.getElementById('submitBtn')
FP.chain()
  .get('target')
  .then(element => element.textContent = 'Clicked!')
  .listen(button, 'click')
```

<aside class='warning'>
  Promises can be awkward when dealing with events.
</aside>

<aside class='success'>
  The <code>Functional Promise</code> library seeks a harmonious balance.
</aside>

Key considerations:

Let's start with their **similarity**, both are (essentially) async...

And now for some **differences**:

* Promises are single-execution cached values. Memoized. Events can run many times per second with different arguments or data.
* Events have control flow to think about (`e.preventDefault()`). Promises flow in one direction.
* Promises depend on `return`'s everywhere. Event handlers which `return` may cause unexpected control-flow issues.

_Yikes._

Let's look at some code &amp; see how `FP` improves the situation:

## `FP.listen()` event helper

```javascript
FP.chain()
  .get('target')
  .set('textContent', 'Clicked!')
  .listen(button, 'click')
```

The `.listen()` method must be called after an `FP.chain()` sequence of `FP` methods.

**Note:** The `.chainEnd()` method is automatically called.

# &#160;&#160; Composition Pipelines

<!-- > *Non `.then()`-based Methods* -->

<aside class="notice">
  <i>Forgive me Haskell people, but I'm calling this a monad.</i>
</aside>

Chained Functional Promises unlock a powerful technique: **Reusable Async Composition Pipelines.**

**Enough jargon!** _Let's make some monads in JavaScript:_

<!-- **Examples and usage patterns below:** -->

## `FP.chain() / .chainEnd()`

The method `FP.chain()` starts 'recording' your functional chain.

All chain-based features (`FP.listen(el, ...events)`, `FP.run(opts)`, et. al.) use `.chainEnd()` to get a function to 'replay' the methods after `.chain()`.

Whether directly or indirectly `.chainEnd()` must be called.

```javascript
const getTarget = FP
  .chain()
  .get('target')
  .chainEnd()

const handler = event => getTarget(event)
  .then(target => {console.log('Event target: ', target)})
```

`FP.chain()` is a static method on `FP`.

## Re-usable Promise Chains

```javascript
const squareAndFormatDecimal = FP
  .chain()
  .map(x => x * x)
  .map(x => parseFloat(x).toFixed(2))
  .chainEnd()

squareAndFormatDecimal([5, 6])
  .then(num => console.log(num)) // ['25.00', '36.00']
```

Create a re-usable chain of 2 steps:

1. Create a chain, name it `squareAndFormatDecimal`.
1. When `squareAndFormatDecimal(nums)` is passed an `Array<Number>` it must:
  1. Square each number.
  1. Convert each number to a decimal, then format with [`float.toFixed(2)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed).
1. Execute named function `squareAndFormatDecimal` with array `[5, 6]`.

## Events + Promise Chain

```javascript
//// Example DOM Code
const form = document.querySelector('form')
const submitHandler = createTodoHandler()
form.addEventListener('submit', submitHandler)

function createTodoHandler() {
  const statusLbl = document.querySelector('label.status')
  const setStatus = s => statusLbl.textContent = s
  const setError  = err => setStatus(`ERROR: ${err}`)

  return FP
    .chain() // input arg will get 'passed' in here
    .get('target')
    .then(form => form.querySelector('input.todo-text').value)
    .then(todoText => ({id: null, complete: false, text: todoText}))
    .then(todoAPI.create)
    .tap(createResult => setStatus(createResult.message))
    .catch(setError)
    .chainEnd()
}
```

The method `createTodoHandler()` gives you a Functional chain to:

1. Define single-arg helper methods `setStatus()` & `setError()`
1. Start chain expression
1. Get element using `.get()` to extract `target` property (which will be a `<form></form>`)
1. Get value from contained `input.todo-text` element
1. Put todo's text into a JS Object shaped for service endpoint
1. Pass data along to `todoAPI.create()` method
1. Update UI with `setStatus()`
1. Handle any errors w/ `setError()`


## Controller + Events + Promise Chain


```javascript
//// using a more complete controller/component interface:
const todoCtrl = TodoController()

todoCtrl
  .add('new item')
  .then(result => {
    todoCtrl.update({id: 1, text: 'updated item', complete: true})
  })
```

> TodoController will return an object with `add` and `update` methods - based on FP.chain()

```javascript
//// example code:
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
      .then(input => {
        const {id, complete, text} = input
        return {id, complete, text}
      })
      .then(todoAPI.update)
      .tap(updateResult => setStatus(updateResult.message))
      .chainEnd(),
  }
}
```

Another 'class' like object.

Only simple un-bound functions needed:


# &#160;&#160; Modifiers

## `FP.quiet()`

```javascript
FP.resolve([2, 1, 0])
  .quiet()
  .map(x => 2 / x)
  .then(results => {
    console.log(results) // [1, 2, Error])
  })
```

Suppresses errors by converting them to return values.

**Only applies to subsequent Array thenables.**

## `FP.concurrency(threadLimit)`

```javascript
FP.resolve([1, 2, 3, 4, 5])
  .concurrency(2)
  .map(x => x * 2)
  .then(results => {
    console.log(results)// [2, 4, 6, 8, 10]
  })
```

Set `threadLimit` to constrain the amount of simultaneous tasks/promises can run.

**Only applies to subsequent thenable Array methods.**

> Thanks to several influencial projects: RxJS, IxJS, Bluebird, asynquence, FantasyLand, Gulp, HighlandJS, et al.


