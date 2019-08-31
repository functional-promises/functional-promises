---
title: Functional Promises - API Documentation

# language_tabs: # must be one of https://git.io/vQNgJ
#   - javascript

toc_footers:
  - <a class='social github' href='https://github.com/functional-promises/functional-promises'>Star on GitHub</a>
# - <a class='bottom' target='_blank' href='https://github.com/lord/slate'>Docs Powered by Slate</a>

includes:
  - stats
  - endorsements

search: true
---

# Functional Promises

```sh
# Install
npm install functional-promises
```

```javascript
//// Import into your app:
const FP = require('functional-promises').default
//  OR:
import FP from 'functional-promises'
```

###### [Star `Functional Promises` on Github](https://github.com/functional-promises/functional-promises)

> <p style='text-align: center;'><strong style='font-size: 24px;'>Examples &amp; Awesome Shit</strong></p>

> <p style='padding: 1.7em 28px;'>Array-style methods are built-in:</p>

```javascript
FP.resolve(['1', '2', '3', '4', '5'])
  .map(x => parseInt(x))
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

[![Build Status](https://travis-ci.org/functional-promises/functional-promises.svg?branch=master)](https://travis-ci.org/functional-promises/functional-promises)
[![GitHub package version](https://img.shields.io/github/package-json/v/functional-promises/functional-promises.svg?style=flat)](https://github.com/functional-promises/functional-promises)
[![GitHub stars](https://img.shields.io/github/stars/functional-promises/functional-promises.svg?label=Stars&style=flat)](https://github.com/functional-promises/functional-promises)

[![NPM](https://nodei.co/npm/functional-promises.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/functional-promises)

<aside class="success">
  Quotable
  <ul>
    <li> &quot;Small is beautiful.&quot; <a href='https://twitter.com/BrendanEich/status/957404602470510594' target='_blank'>Brendan Eich - co-inventor of JavaScript</a>
    <li> &quot;Duuuuude!&quot; <a href='https://github.com/sdras' target='_blank'>Sarah Drasner</a>
    <li> &quot;Nice, impressive!&quot; <a href='https://twitter.com/YDKJS' target='_blank'>Kyle Simpson</a>
  </ul>
</aside>

### Summary

The **Functional Promises** library is a Fluent **Function Chaining Interface and Pattern.**

**Core features:** Array Methods, Events, Array **AND Object** `FP.all()` Resolution, Re-usable Function Chains, Conditional/Branching Logic, Concurrency, Smart Error Handling.

<code>FP</code> features seamless support between synchronous code, `async`/`await`, and native Promises. The core <i>Functional Composition</i> is powered by the <a href="#fp-chain"><code>FP.chain()</code></a> construct.

**Why not simply use [library X]?**

`FP`'s **un-minified source** is **only ~370 lines** of code.
The **compressed+minified bundle** weighs in at a humble **~3Kb**. The **non-gzipped bundle** weighs in around **10Kb** (using Webpack+Babel+Rollup+UglifyJS).

<aside class="warning">
  Note: <code>functional-promises</code> is not a <code>Promise</code> replacement. It uses the native <code>Promise</code> API.
</aside>

### Library Comparison

| Library                     	                                    | Main deal | Files   | Lines of Code  | .min.js kB
|------------------------------	                                    |-----------|---------: |--------------: |-------------------:
| **Functional Promise v1.7.95**                                   	| Sync & Async Chains | 8 |           376	 | 10 Kb / 3 Kb gzipped
| [Bluebird](https://github.com/petkaantonov/bluebird) v3.5.1       | Promises Replacement |        38 |         5,188	 | 80 Kb
| [RxJS](https://github.com/ReactiveX/RxJS) v5.5.6                 	| Observables Chaining |     458 |        12,266  | 150 Kb
| [IxJS](https://github.com/ReactiveX/IxJS) v2.3.4                 	| \[Async\]Iterable Chaining |     521 |        12,366	 | 145 Kb


`FP` is roughly **1/30th** the lines of code in `IxJs`. And it's bundle size is about **1/9th** the size! However `IxJS`/`RxJS` features a far larger API with 100's of methods.

BluebirdJS and FP have roughly the same number (and type) of API methods, yet `FP` is far less code.

<p><b>To be clear:</b> Bluebird, RxJS and IxJS are amazing. Their patterns have been very influential on <code>FP</code>'s design.</p>

<small><p><b>Note:</b>&#160;<code>R/IxJS</code>'s modular design also allows for bundle sizes to be smaller (using different syntax).</p></small>

### API Outline

All `.then()`-powered methods are listed first.

* [Thenable Methods](https://www.fpromises.io/#thenable-methods)
    * [Arrays](https://www.fpromises.io/#array-methods)
        * [`.map(fn)`](https://www.fpromises.io/#fp-map)
        * [`.filter(fn)`](https://www.fpromises.io/#fp-filter)
        * [`.find(fn)`](https://www.fpromises.io/#fp-find)
        * [`.some(fn)`](https://www.fpromises.io/#fp-some)
        * [`.none(fn)`](https://www.fpromises.io/#fp-none)
        * [`.series(fn)`](https://www.fpromises.io/#fp-series)
    * [Errors](https://www.fpromises.io/#errors) _(WIP)_
        * [`.catch(fn)`](https://www.fpromises.io/#fp-catch)
        * [`.catchIf(filter, fn)`](https://www.fpromises.io/#fp-catch)
    * [Conditional](https://www.fpromises.io/#conditional)
        * [`.thenIf(fn, ifTrue, ifFalse)`](https://www.fpromises.io/#fp-thenif)
    * [Utilities](https://www.fpromises.io/#utilities)
        * [`.tap(fn)`](https://www.fpromises.io/#fp-tap)
        * [`.delay(msec)`](https://www.fpromises.io/#fp-delay)
    * [Properties](https://www.fpromises.io/#properties)
        * [`.get(keyName)`](https://www.fpromises.io/#fp-get)
        * [`.set(keyName, value)`](https://www.fpromises.io/#fp-set)
* [Specialty Methods](https://www.fpromises.io/#specialty-methods)
    * [Helpers](https://www.fpromises.io/#helpers)
        * [`FP.promisify(callback)`](https://www.fpromises.io/#fp-promisify)
        * [`FP.promisifyAll(callback)`](https://www.fpromises.io/#fp-promisifyall)
        * [`FP.resolve()`](https://www.fpromises.io/#fp-resolve)
        * [`FP.all(Object/Array)`](https://www.fpromises.io/#fp-all)
        * [`FP.unpack()`](https://www.fpromises.io/#fp-unpack)
    * [Events](https://www.fpromises.io/#events)
        * [`.listen(obj, ...eventNames)`](https://www.fpromises.io/#fp-listen)
    * [Composition Pipeline](https://www.fpromises.io/#composition-pipeline)
        * [`FP.chain(options)`](https://www.fpromises.io/#fp-chain-chainend)
        * [`.chainEnd()`](https://www.fpromises.io/#fp-chain-chainend)
    * [Modifiers](https://www.fpromises.io/#modifiers)
        * [`.quiet()` - prevents errors from stopping array methods mid-loop](https://www.fpromises.io/#fp-quiet)
        * [`.concurrency(threadLimit)` - limits parallel workers for array methods](https://www.fpromises.io/#fp-concurrency)

# Thenable Methods

> A `.catch()` is another type of `thenable`! It works because an Error in a Promise will cause it to skip or "surf" over `thenables` until it finds a special `thenable`: `.catch()`. It then takes that Error value and passes it into the function. `.catch(err=>{log(err.message)})`

> `Thenable` methods in `FP` include: Arrays, Errors, Conditional, Utilities, Properties, etc.

Most `FP` methods derive behavior from **Native Promise's `.then()`.**

For example, `.tap(fn)`'s function will receive the resolved value exactly like a `.then()`. Except the function's `return` value will be ignored - and the next `thenable` in the chain will get the original input.


<aside class='success'>
  Click the Edit/Test link above code samples to run them live! <span style='font-size: 28px;'>👉</span>
</aside>

# &#160;&#160; Array Methods

```javascript
const rawData = [-99, null, undefined, NaN, 0, '99']

// Async compatible (not needed in this simple example)
FP.resolve(rawData)
  .filter(x => x)         // truthiness check = [-99, "99"]
  .map(x => parseInt(x))  // convert to numeric [-99 99]
  .find(n => n >= 1) // is gte 1, idx = 1
  .then(num => {
    console.log(num)    // 99
  })
```

> Reuse functions, e.g. Native Array methods:

```javascript
const rawData = [-99, null, undefined, NaN, 0, '99']

// ... Compare w/ Native Array Method Usage:
rawData
  .filter(x => x)         // truthiness check = [-99, "99"]
  .map(x => parseInt(x))  // convert to numeric [-99, 99]
  .find(n => n >= 1)
```

Any `.then()` which would handle an array, may instead use one of the `FP` array methods.

1. map
1. filter
1. find
1. some
1. none



## `FP.map(iterable, fn)`

```javascript
FP.resolve([1, 2, 3, 4, 5])
// Native es6 example: (Synchronous)
//.then(nums => nums.map(x => x * 2))
  .map(x => x * 2)
  .then(results => {
    console.log(results) // [2, 4, 6, 8, 10]
  })
```

Similar to `Array.prototype.map((item[, index, array]) => {})`.

**Use to transforms an array of values, passing each through the given function.**

The return value will be a new array containing the result for each call to `fn(item)`.

For example, let's say you have to multiply a list of numbers by 2.

Using `FP.map()` to do this lets you focus on the important logic: `x => x * 2`

> Another neat trick w/ `FP` is auto-resolving nested Promises. Now you can ignore finickey details, like when AJAX data will be available.

```javascript
const dumbPromises = [Promise.resolve(25), Promise.resolve(50)]

FP.resolve(dumbPromises)
  .concurrency(1)
  .map(num => FP.resolve(num).delay(num))
  .then(msec => `Delayed ${msec}`)
  .then(results => console.log(results))
```

## `FP.filter(iterable, fn)`

```javascript
FP.resolve([1, null, 3, null, 5])
  .filter(Boolean)
// Or similarly:
// .filter(value => value ? true : false)
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

## `FP.tap(fn)`

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

## `FP.delay(ms)`

> Delay per-array item.

```javascript
const started = Date.now()

FP.resolve([1, 2, 3, 4])
  .concurrency(1)
  // now only 1 map() callback happens at a time
  .map(num => {
    return FP
      .delay(50)
      .resolve(num)
  })
  .then(() => {
    const runtime = Date.now() - started
    console.log(`Delayed ${runtime}ms.`)
    console.log(`Success: ${runtime >= 200}`)
  })
```

> Single delay added mid-sequence.

```javascript
const started = Date.now()

FP.resolve([1, 2, 3])
  .delay(250)
  .map(num => num + num)
  .then(() => {
    const runtime = Date.now() - started
    console.log(`Delayed ${runtime}ms.`)
    console.log(`Success: ${runtime >= 250}`)
  })
```

`.delay(milliseconds)` is a helpful utility. It can help you avoid exceeding rate-limits in APIs. You can also use it to for simulated bottlenecks, adding 'slowdowns' exactly where needed can greatly assist in locating many kinds of complex bugs.

#### Usage

* Shorthand with static helper: `.then(FP.delay(waitMs))`
* Nesting with static helper: FP.delay(waitMs): `.then(num => FP.delay(waitMs).then(() => num))`
* Using FP's instance method. `FP.resolve([1, 2, 3]).delay(250)`

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

## `FP.promisify(function)`

```js
//// fs - file system module
const fs = require('fs')
const readFileAsync = FP.promisify(fs.readFile)

readFileAsync('/tmp/test.csv', 'utf8')
  .then(data => console.log(data))

```

Utility to get a Promise-enabled version of any NodeJS-style callback function `(err, result)`.



## `FP.promisifyAll()`

```js
//// Common promisifyAll Examples:

// fs - node's file system module
const fs = FP.promisifyAll(require('fs'))
/* USAGE:
fs.readFileAsync('/tmp/test.csv', 'utf8')
  .then(data => data.split('\n'))
  .map(line => line.split(','))
  .then(renderTable)
*/

// Redis
const redis = require('redis')
// FP.promisifyAll(redis) // 💩 wont work
FP.promisifyAll(redis.RedisClient.prototype) // 👍
FP.promisifyAll(redis.Multi.prototype) // 👍
/* USAGE:
client.getAsync('foo')
  .then(data => console.log('results', data)) */

// Mongodb (Note: use Monk, or Mongoose w/ native Promise support)
const MongoClient = require('mongodb').MongoClient;
FP.promisifyAll(MongoClient)
/* USAGE:
MongoClient.connectAsync('mongodb://localhost:27017')
  .then(db => db.collection('documents')) // get collection
  .then(FP.promisifyAll) // check to make sure we can use *Async methods
  .then(db => db.findAsync({})) // query w/ findAsync
  .catch(err => console.error('mongodb failed', err)) */

// mysql - Note: that mysql's classes are not properties of the main export
// Here's another way to `promisifyAll` prototypes directly
FP.promisifyAll(require('mysql/lib/Connection').prototype)
FP.promisifyAll(require('mysql/lib/Pool').prototype)

// pg - Note: postgres client is same as `node-postgres`
// - and pg supports promises natively now!

// Mongoose
const mongoose = FP.promisifyAll(require('mongoose'))
/* USAGE:
mongoose.Promise = FP
model.findAsync({})
  .then(results => {...}) */

// Request
FP.promisifyAll(require('request'))
/* USAGE:
request.getAsync(url)
request.postAsync(url, data)
// requestAsync(..) // will not return a promise */

// rimraf - The module is a single function, use `FP.promisify`
const rimrafAsync = Promise.promisify(require('rimraf'))

// Nodemailer
FP.promisifyAll(require('nodemailer'))

// xml2js
FP.promisifyAll(require('xml2js'))
```

`FP.promisifyAll(Object/Class/Prototype)` accepts an `Object/Class/Prototype-based-thing` and for every key of type `function` it adds a promisified version using the naming convention `obj.[functionName]Async()`.

Compared to `bluebird`, FP added a few tweaks to make it more versatile, specifically it works on any object - not limited to Classes and functions w/ a `prototype`.

> `promisifyAll` is inspired by Bluebird's API.


```js
//// edge case:
const AwkwardLib = require("...")
const tmpInstance = AwkwardLib.createInstance()
FP.promisifyAll(Object.getPrototypeOf(tmpInstance))
// All new instances (incl tmpInstance) will feature .*Async() methods
```

In all of the above cases the library made its classes available in one way or another. If this is not the case (factory functions, et al.), you can still promisify by creating a throwaway instance:


## `FP.resolve(<anything>)`

> Promise anything like it's going out of style:

```javascript
FP.resolve()
FP.resolve(42)
FP.resolve(fetch(url))
FP.resolve(Promise.resolve(anything))
```

Turn anything into a `Functional Promise` wrapped promise!

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

`deferred` is an anti-pattern because it doesn't align well with Functional Composition.

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

# &#160;&#160; Composition Pipeline

Composition Pipelines is a combination of ideas from [`Collection` Pipeline](https://martinfowler.com/articles/collection-pipeline/) and [Functional Composition](https://medium.com/javascript-scene/composing-software-an-introduction-27b72500d6ea).


<aside class="notice">
  <i>Forgive me Haskell people, but I'm calling this a monad builder.</i> Just <code>do</code> it! I mean work with me here.
</aside>

Chained Functional Promises unlock a powerful technique: **Reusable Async Composition Pipeline.**

**Enough jargon!** _Let's create some slick JavaScript:_

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

**HOW TO:** Create a re-usable chain with 2 `.map` steps:

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

> Usage Example: (see Class implementation below)

```javascript
//// usage example - standard promise code:
const todoApp = TodoApp()

todoApp.update({id: 1, text: 'updated item', complete: true})
  .then(console.warn.bind(console, 'update response:'))

todoApp.add('new item')
  .then(result => {
    console.log('Added item', result)
  })
```

> TodoApp will return an object with `add` and `update` methods - based on FP.chain()

```javascript
//// example code:
function TodoApp() {
  const statusLbl = document.querySelector('label.status')
  const setStatus = s => statusLbl.textContent = s

  return {
    add: FP.chain()
      .then(input => ({text: input, complete: false}))
      .then(todoAPI.create)
      .tap(createResult => setStatus(createResult.message))
      .chainEnd(),

    update: FP.chain()
      // in v1.5.0: .get('id', 'completed', 'text') // or:
      .then(input => {
        const {id, complete, text} = input
        return {id, complete, text}
      })
      .then(todoAPI.update)
      .tap(updateResult => setStatus(updateResult.message))
      .chainEnd()
  }
}
```

Example OOP style 'class' object/interface.

Here we implement the interface `{ add(item), update(item) }` **using chained function expressions**. It's implementation is hidden from the calling code.

<aside class="notice">
  <code>FP.chain()</code> is a powerful building block. Use with: events, streams, Observables (RxJS), AsyncIterables (IxJS), <code>for</code> loops, and basically anything that takes a function.
  <br/>
  <b>It returns a re-usable function, built out of a sequence of smaller functions.</b>
</aside>

This is a key differentiator between `functional-promises` and other chaining libraries. No lockin.

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

<blockquote style='text-align: right;'><p>
  <br />
  <a class='bottom' target='_blank' href='https://github.com/lord/slate'>Docs Powered by Slate</a>
</p></blockquote>

# Misc

